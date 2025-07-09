"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios, { AxiosResponse } from "axios";
import { GetDraftResponse } from "@/types/response";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
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
import { PaginationBar } from "./PaginationBar";
import DraftTableRow from "./DraftTableRow";


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
  const [editingName, setEditingName] = useState(false);
  const [teacherSelections, setTeacherSelections] = useState<TeacherSelections>({});
  const draftNameRef = useRef<HTMLInputElement>(null);
  const teacherSelectionsRef = useRef(teacherSelections);

  useEffect(() => {
    teacherSelectionsRef.current = teacherSelections;
  }, [teacherSelections]);

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
    if (socket.connected) {
      socket.emit("joinDraft", draftId);
    } else {
      socket.on("connect", () => socket.emit("joinDraft", draftId));
    }

    const handleSlotUpdate = ({ senderSocketId, senderDraftId, recordId, slotType, index, field, newSelection }): void => {
      if (senderSocketId === socket.id) return;
      if (draftId === senderDraftId) {
        handleSlotChange(recordId, slotType, index, field, newSelection, true);
      }
    };

    const handleTeacherUpdate = ({ senderSocketId, senderDraftId, recordId, recordP, slotType, index, newTeacherId }): void => {
      if (senderSocketId === socket.id) return;
      if (draftId === senderDraftId) {
        handleTeacherChange(recordId, recordP, slotType, index, newTeacherId, true);
      }
    };


    socket.on("slotUpdated", handleSlotUpdate);
    socket.on("teacherUpdated", handleTeacherUpdate);

    return () => {
      socket.off("slotUpdated", handleSlotUpdate);
      socket.off("teacherUpdated", handleTeacherUpdate);
    };
  }, []);

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
      setTeacherSelections(initialSelections);
      availableTeachersRef.current = draft.faculty;
    }
  }, [draft])

  const handleSlotChange = useCallback((
    recordId: string,
    slotType: "fn" | "an",
    index: number,
    field: "theorySlot" | "labSlot",
    newValue: string,
    fromSocket: boolean,
  ) => {
    const prevRecord = teacherSelectionsRef.current[recordId];
    if (!prevRecord) return;

    const updatedSlot = [...prevRecord[slotType]];
    if (field === "theorySlot") {       // for theory slots, update the theory slot for all the teachers
      for (let i = 0; i < updatedSlot.length; i++) {
        updatedSlot[i] = { ...updatedSlot[i], theorySlot: newValue };
      }
    } else if (field === "labSlot") {                            // for lab slots, update just the one teacher 
      const updatedAssignment = { ...updatedSlot[index], labSlot: newValue };
      updatedSlot[index] = updatedAssignment;
    }

    setTeacherSelections((prev) => ({
      ...prev,
      [recordId]: {
        ...prev[recordId],
        [slotType]: updatedSlot,
      }
    }));

    if (!fromSocket) {
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
  }, [teacherSelections, draftId]);


  const handleTeacherChange = useCallback((
    recordId: string,
    recordP: number,
    slotType: "fn" | "an",
    index: number,
    newTeacherId: string,
    fromSocket: boolean,
  ) => {
    setTeacherSelections((prev) => {
      const recordSlot = prev[recordId]?.[slotType] || [];
      const updatedSlot = [...recordSlot];
      const oldTeacherId = updatedSlot[index]?.teacher;

      if (!updatedSlot[index] || oldTeacherId === newTeacherId) return prev;

      updatedSlot[index] = {
        ...updatedSlot[index],
        teacher: newTeacherId,
      };

      return {
        ...prev,
        [recordId]: {
          ...prev[recordId],
          [slotType]: updatedSlot,
        },
      };
    });


    // efficiently update teacher load counts
    const teachersMap = new Map(availableTeachersRef.current?.map(t => [t._id, { ...t }]));
    const oldTeacherId = teacherSelections[recordId]?.[slotType]?.[index]?.teacher;

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


    if (!fromSocket) {
      socket.emit('teacherUpdate', ({
        senderSocketId: socket.id,
        senderDraftId: draftId,
        recordId: recordId,
        recordP: recordP,
        slotType: slotType,
        index: index,
        newTeacherId: newTeacherId
      }));
    }
  }, [teacherSelections, draftId]);


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
        <Table className="border rounded-sm">
          <TableHeader>
            <TableRow>
              {allFields.map((field) => visibleFields.includes(field.key) ? (<TableHead key={field.key}>{field.label}</TableHead>) : null)}
              <TableCell>Slot</TableCell>
              <TableCell>FN Teachers</TableCell>
              <TableCell>AN Teachers</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedRecords?.map((rec) => (
              <DraftTableRow
                key={rec._id}
                rec={rec}
                allFields={allFields}
                visibleFields={visibleFields}
                teacherSelections={teacherSelections}
                availableTeachers={availableTeachersRef.current}
                filterTeachers={filterTeachersAccordingToRecord}
                handleTeacherChange={handleTeacherChange}
                handleSlotChange={handleSlotChange}
              />
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
