"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import axios, { AxiosResponse } from "axios";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
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
import { ChevronsUpDown } from "lucide-react"; //TODO: add sorting

interface DraftViewProps {
  draftId: string;
}


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

export default function DraftView({ draftId }: DraftViewProps) {

  const [draft, setDraft] = useState<Draft | null>(null);
  const [loading, setLoading] = useState(true);
  const [visibleFields, setVisibleFields] = useState<FieldKey[]>(allFields.map(f => f.key));
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);  //  TODO: change this later to be editable
  const [availableTeachers, setAvailableTeachers] = useState<Faculty[] | undefined>(undefined);
  const [updateCount, setUpdateCount] = useState(0);
  const teacherSelectionsRef = useRef<TeacherSelections>({});
  const teacherSelections = teacherSelectionsRef.current;


  const fetchDraft = async () => {
    setLoading(true);
    try {
      const res: AxiosResponse<Draft> = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/draft/${draftId}`, { withCredentials: true });
      setDraft(res.data);
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

  useEffect(() => {
    socket.emit("joinDraft", draftId);
    console.log("Join draft request sent from client");

    const handleSlotUpdate = ({ senderSocketId, senderDraftId, recordId, slotType, index, field, newSelection }) => {
      if (senderSocketId === socket.id) return;
      if (draftId === senderDraftId) {
        handleSlotChange(recordId, slotType, index, field, newSelection);
      }
    };

    const handleTeacherUpdate = ({ senderSocketId, senderDraftId, recordId, recordP, slotType, index, newTeacherId }) => {
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
      setAvailableTeachers(draft.faculty);
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

    console.log('updated: ', newValue);
    console.log('teacherSelectionn: ', teacherSelections);
  }

  const handleTeacherChange = (
    recordId: string,
    recordP: number,
    slotType: "fn" | "an",
    index: number,
    newTeacherId: string,
    updateRender: boolean,
  ) => {
    const oldTeacherId = teacherSelections?.[recordId]?.[slotType]?.[index]?.teacher;

    if (teacherSelections[recordId]?.[slotType]?.[index]) {
      teacherSelections[recordId][slotType][index].teacher = newTeacherId;
    }

    if (updateRender) setUpdateCount(prev => prev + 1);

    // TODO: make available teachers useRef
    setAvailableTeachers((prev) => {
      if (!prev) return undefined;

      const updatedTeachers = prev.map((teacher) => {
        if (teacher._id === oldTeacherId) {
          return {
            ...teacher,
            loadedT: Math.max(0, teacher.loadedT - 1),
            loadedL: recordP > 0 ? Math.max(0, teacher.loadedL - 1) : teacher.loadedL,
          }
        } else if (teacher._id === newTeacherId) {
          return {
            ...teacher,
            loadedT: teacher.loadedT + 1,
            loadedL: recordP > 0 ? teacher.loadedL + 1 : teacher.loadedL,
          }
        } else {
          return teacher;
        }
      });
      return updatedTeachers;
    });

    socket.emit('teacherUpdate', ({
      senderSocketId: socket.id,
      senderDraftId: draftId,
      recordId: recordId,
      recordP: recordP,
      slotType: slotType,
      index: index,
      newTeacherId: newTeacherId
    }));

    console.log('teacher selections: ', teacherSelections);

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

  return (

    <div className="flex flex-col items-center my-2">

      <div className="flex flex-row gap-x-4 my-2">
        <h1 className="text-3xl">Editing: </h1> <h1 className="text-4xl font-bold mb-2 "> {draft.name}</h1>
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
                          options={filterTeachersAccordingToRecord(availableTeachers, rec, "fn")}
                          value={
                            availableTeachers?.find((teacher) => (teacher._id == teacherSelections[rec._id]?.fn[k].teacher)) || null
                          }
                          onChange={(val) => handleTeacherChange(rec._id, rec.P, "fn", k, val, false)}
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
                          options={filterTeachersAccordingToRecord(availableTeachers, rec, "an")}
                          value={
                            availableTeachers?.find((teacher) => (teacher._id == teacherSelections[rec._id]?.an[k].teacher)) || null
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
        <div className="flex justify-center gap-2 mt-4">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            Previous
          </Button>

          {Array.from({ length: totalPages }, (_, i) => (
            <Button
              key={i}
              variant={currentPage === i + 1 ? "default" : "outline"}
              className="max-w-2"
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </Button>
          ))}

          <Button
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div >
  );
}
