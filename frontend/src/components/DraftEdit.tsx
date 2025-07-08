"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import axios, { AxiosResponse } from "axios";
import { GetDraftResponse } from "@/types/response";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import ComboBox from "./ComboBox";
import { Input } from "@/components/ui/input";
import ColumnSelector from "@/components/ColumnSelector";
import { socket } from "@/lib/socket";

import { Draft } from "@/types/draft";
import { TeacherSelections } from "@/types/teacherSelection";
import { Record } from "@/types/record";
import { Faculty } from "@/types/faculty";
import { FieldKey } from "@/types/recordFieldKey";
import { Field } from "@/types/Field";
import { ChevronsUpDown, Edit } from "lucide-react"; //TODO: add sorting
import { DraftViewProps } from "@/types/props";
import { RowsPerPageDropdown } from "./RowsPerPageDropdown";
import { PaginationBar } from "./PaginationBar";


const allFields: Field[] = [
  { key: "sNo", label: "S.No" },
  { key: "year", label: "Year" },
  { key: "stream", label: "Course" },
  { key: "courseCode", label: "Course Code" },
  { key: "courseTitle", label: "Course Title" },
  { key: "L", label: "L" },
  { key: "T", label: "T" },
  { key: "P", label: "P" },
  { key: "C", label: "C" },
  { key: "courseHandlingSchool", label: "School" },
];

export default function DraftEdit({ draftId }: DraftViewProps) {

  const [draft, setDraft] = useState<Draft | null>(null);
  const [loading, setLoading] = useState(true);
  const [visibleFields, setVisibleFields] = useState<FieldKey[]>(allFields.map(f => f.key));
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);  //  TODO: change this later to be editable
  const availableTeachersRef = useRef<Faculty[] | undefined>(undefined);
  const [updateCount, setUpdateCount] = useState(0);
  const [editingName, setEditingName] = useState(false);
  const teacherSelectionsRef = useRef<TeacherSelections>({});
  const draftNameRef = useRef<HTMLInputElement>(null);
  const teacherSelections = teacherSelectionsRef.current;


  const fetchDraft = async () => {
    setLoading(true);
    try {
      const res: AxiosResponse<GetDraftResponse> = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/draft/${draftId}`, { withCredentials: true });
      if (res.status === 200) {
        setDraft(res.data.draft);
      } else {
        toast.error(res.data.error);
      }
    } catch (err) {
      console.log("Error fetching draft: ", err);
      toast.error("Failed to fetch draft.");
    } finally {
      setLoading(false);
    }
  };

  const paginatedRecords = useMemo(() => {
    return draft?.records.slice(
      (currentPage - 1) * rowsPerPage,
      currentPage * rowsPerPage
    );
  }, [draft?.records, currentPage, rowsPerPage]);

  const totalPages = useMemo(() => {
    if (draft) {
      return Math.ceil(draft.records.length / rowsPerPage);
    }
    return 0
  }, [draft, rowsPerPage])

  // socket updates useEffect
  useEffect(() => {
    socket.emit("joinDraft", draftId);
    console.log("Join draft request sent from client");

    const handleSlotUpdate = ({ senderSocketId, senderDraftId, recordId, slotType, index, field, newSelection }): void => {
      if (senderSocketId === socket.id) return;
      if (draftId === senderDraftId) {
        handleSlotChange(recordId, slotType, index, field, newSelection);
      }
    };

    const handleTeacherUpdate = ({ senderSocketId, senderDraftId, recordId, recordP, slotType, index, newTeacherId }): void => {
      if (senderSocketId === socket.id) return;
      if (draftId === senderDraftId) {
        handleTeacherChange(recordId, recordP, slotType, index, newTeacherId, false);
      }
    };


    socket.on("slotUpdated", handleSlotUpdate);
    socket.on("teacherUpdated", handleTeacherUpdate);

    return () => {
      socket.off("slotUpdated", handleSlotUpdate);
      socket.off("teacherUpdated", handleTeacherUpdate);
    };
  }, [draftId])

  useEffect(() => {

    const refreshPage = async () => {
      await fetchDraft();
    };
    refreshPage();
  }, []);

  useEffect(() => {
    if (draft) {
      const initialSelections: typeof teacherSelections = {};
      draft?.records.forEach((rec) => {
        initialSelections[rec._id] = {
          // this is just to make sure the forenoon & afternoon teachers arrays
          // arent empty or undefined.
          // but the backend already does this so 
          // need to remove this redundant code later
          fn: rec.forenoonTeachers.length > 0
            ? rec.forenoonTeachers
            : Array.from({ length: rec.numOfForenoonSlots }).map(() => ({ teacher: "", theorySlot: "", labSlot: "" })),
          an: rec.afternoonTeachers.length > 0
            ? rec.afternoonTeachers
            : Array.from({ length: rec.numOfAfternoonSlots }).map(() => ({ teacher: "", theorySlot: "", labSlot: "" })),
        };
      });
      teacherSelectionsRef.current = initialSelections;
      setUpdateCount((prev) => prev + 1)
      availableTeachersRef.current = draft.faculty;
    }
  }, [draft])

  const handleSlotChange = (
    recordId: string,
    slotType: "fn" | "an",
    index: number,
    field: "theorySlot" | "labSlot",
    newValue: string,
  ) => {
    const prevRecord = teacherSelections[recordId];
    if (!prevRecord) return;

    const updatedSlot = [...prevRecord[slotType]];
    if (field === "theorySlot") {       // for theory slots, update the theory slot for all the teachers
      for (let i = 0; i < updatedSlot.length; i++) {
        updatedSlot[i] = { ...updatedSlot[i], theorySlot: newValue };
      }
    } else if (field === "labSlot") {                            // for lab slots, update just the one teacher 
      const updatedAssignment = { ...updatedSlot[index], labSlot: newValue };
      updatedSlot[index] = updatedAssignment;
      console.log(updatedSlot[index])
    }

    teacherSelections[recordId] = {
      ...prevRecord,
      [slotType]: updatedSlot,
    };

    // setUpdateCount((prev) => prev + 1);

    socket.emit("slotUpdate", {
      senderSocketId: socket.id,
      senderDraftId: draftId,
      recordId: recordId,
      slotType: slotType,
      index: index,
      field: field,
      newSelection: newValue,
    });

  }


  const handleTeacherChange = (
    recordId: string,
    recordP: number,
    slotType: "fn" | "an",
    index: number,
    newTeacherId: string,
    updateRender: boolean,
  ) => {
    console.time("handleTeacherChange");
    const recordSelections = teacherSelections[recordId]?.[slotType];
    if (!recordSelections || !recordSelections[index]) return;

    const oldTeacherId = recordSelections[index].teacher;
    if (oldTeacherId === newTeacherId) return;

    recordSelections[index].teacher = newTeacherId;

    if (updateRender) setUpdateCount(prev => prev + 1);

    // efficiently update teacher load counts
    const teachersMap = new Map(availableTeachersRef.current?.map(t => [t._id, { ...t }]));

    if (oldTeacherId && teachersMap.has(oldTeacherId)) {
      const t = teachersMap.get(oldTeacherId)!;
      t.loadedT = Math.max(0, t.loadedT - 1);
      if (recordP > 0) t.loadedL = Math.max(0, t.loadedL - 1);
    }

    if (newTeacherId && teachersMap.has(newTeacherId)) {
      const t = teachersMap.get(newTeacherId)!;
      t.loadedT += 1;
      if (recordP > 0) t.loadedL += 1;
    }

    availableTeachersRef.current = Array.from(teachersMap.values());


    socket.emit('teacherUpdate', ({
      senderSocketId: socket.id,
      senderDraftId: draftId,
      recordId: recordId,
      recordP: recordP,
      slotType: slotType,
      index: index,
      newTeacherId: newTeacherId
    }));

    console.timeEnd("handleTeacherChange")

  };


  if (loading) return <div> Loading... </div>;    // TODO: replace with loading icon
  if (!draft) return <div> Error: Draft Not Found! </div>;

  const toggleField = (field: FieldKey) => {
    setVisibleFields((prev) =>
      prev.includes(field)
        ? prev.filter((f) => f !== field)
        : [...prev, field]
    );
  };

  function filterTeachersAccordingToRecord(
    availableTeachers: Faculty[] | undefined,
    rec: Record,
    slotType: "fn" | "an"
  ): Faculty[] {
    console.time("filterTeachersAccordingToRecord");
    if (!availableTeachers) return [];

    const assignedTeacherIds = (teacherSelections[rec._id]?.[slotType] || [])
      .map((assignment) => assignment.teacher)
      .filter(Boolean);


    return availableTeachers
      .filter(
        (teacher) => !assignedTeacherIds.includes(teacher._id)
      )
      .filter(
        (teacher) => teacher.loadT - teacher.loadedT > 0
      )
      .filter(
        (teacher) => (rec.P > 0 ? teacher.loadL - teacher.loadedL > 0 : true)
      );

  }


  async function setDraftName(newName: string): Promise<void> {
    setEditingName(false);
    if (newName === draft?.name) {
      return;
    }
    try {
      const res: AxiosResponse<GetDraftResponse> = await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/draft/${draftId}`, {
        name: newName,
      }, { withCredentials: true, });
      if (res.status === 200) {
        toast.success(res.data.message);
        setDraft(prev => prev ? ({ ...prev, name: newName }) : prev);
        // updating just the draft's name here after success because
        // we dont want screen flickering & unecessary  re-renders
      } else {
        toast.error(res.data.error);
      }
    } catch (error) {
      console.log('APIError: Could not change draft name: ', error);
      toast.error('Error: Could not update name.');
    }
  }

  return (

    <div className="flex flex-col items-center my-2">

      <div className="flex flex-row gap-x-4 my-2">
        {
          editingName ?
            (
              <Input
                defaultValue={draft.name}
                ref={draftNameRef}
                placeholder="Edit Draft Name"
                onBlur={() => {
                  const newValue = draftNameRef.current?.value || draft.name;
                  setDraftName(newValue);
                }}
                size={10}
                className="sm:text-4xl md:text-4xl font-bold px-3 py-6 max-h-30 mb-2 border-none shadow-none focus-visible:ring-0 focus-visible:outline-none"
              />
            ) : (
              <div className="flex flex-row gap-x-2">
                <h1 className="text-4xl font-bold mb-2 "> {draft.name}</h1>
                <Button variant='ghost' size='sm' onClick={() => setEditingName((prev) => !prev)}><Edit /></Button>
              </div>
            )
        }
      </div>

      <ColumnSelector
        allFields={allFields}
        visibleFields={visibleFields}
        toggleField={toggleField}
      />

      <div className="w-full">
        <Table className="rounded-md border rounded-sm">
          <TableHeader>
            <TableRow>
              {allFields.map((field) => visibleFields.includes(field.key) ? (<TableHead key={field.key}>{field.label}</TableHead>) : null)}
              <TableCell>Slot</TableCell>
              <TableCell>FN Teachers</TableCell>
              <TableCell>AN Teachers</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedRecords?.map((rec, i) => (
              <TableRow key={i}>
                {allFields.map((field) =>
                  visibleFields.includes(field.key)
                    ? (<TableCell className="max-w-50 whitespace-normal" key={field.key}> {rec[field.key]} </TableCell>)
                    : null
                )}
                <TableCell>
                  <Input
                    key={i}
                    type="text"
                    defaultValue={teacherSelections[rec._id]?.fn[0]?.theorySlot || ""}
                    placeholder="Enter Theory Slot"
                    className="w-38"
                    onBlur={(e) => handleSlotChange(rec._id, "fn", 0, "theorySlot", e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-3">
                    {Array.from({ length: rec.numOfForenoonSlots }).map((_, k) => (
                      <div key={k} className="flex flex-col gap-y-2" >
                        <ComboBox
                          options={filterTeachersAccordingToRecord(availableTeachersRef.current, rec, "fn")}
                          value={
                            availableTeachersRef.current?.find((teacher) => (teacher._id == teacherSelections[rec._id]?.fn[k].teacher)) || null
                          }
                          onChange={(val) => handleTeacherChange(rec._id, rec.P, "fn", k, val, true)}
                          placeHolder="Select FN Teacher..."
                        />

                        {rec.P > 0 && teacherSelections[rec._id]?.fn[k] !== undefined ?
                          (<Input
                            type="text"
                            placeholder="Enter Lab Slot"
                            defaultValue={teacherSelections[rec._id]?.fn[k]?.labSlot || ""}
                            className="w-50 mb-3"
                            onBlur={(e) => handleSlotChange(rec._id, "fn", k, "labSlot", e.target.value)}
                          />
                          )
                          : null
                        }
                      </div>
                    ))}

                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex flex-col my-5 gap-y-2">
                    {Array.from({ length: rec.numOfAfternoonSlots }).map((_, k) => (
                      <div key={k} className="flex flex-col gap-y-2" >
                        <ComboBox
                          options={filterTeachersAccordingToRecord(availableTeachersRef.current, rec, "an")}
                          value={
                            availableTeachersRef.current?.find((teacher) => (teacher._id == teacherSelections[rec._id]?.an[k].teacher)) || null
                          }
                          onChange={(val) => handleTeacherChange(rec._id, rec.P, "an", k, val, true)}
                          placeHolder="Select AN Teacher..."
                        />

                        {rec.P > 0 && teacherSelections[rec._id]?.an[k] !== undefined ?
                          (<Input
                            type="text"
                            defaultValue={teacherSelections[rec._id]?.an[k]?.labSlot || ""}
                            placeholder="Enter Lab Slot"
                            className="w-50"
                            onBlur={(e) => handleSlotChange(rec._id, "an", k, "labSlot", e.target.value)}
                          />
                          )
                          : null
                        }
                      </div>
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <PaginationBar
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
          rowsPerPage={rowsPerPage}
          setRowsPerPage={setRowsPerPage}
          totalRecords={draft.recordCount}
        />
      </div>
    </div >
  );
}
