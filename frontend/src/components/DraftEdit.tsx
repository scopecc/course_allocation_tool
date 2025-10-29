"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios, { AxiosResponse } from "axios";
import { GetDraftResponse } from "@/types/response";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Table, TableHeader, TableBody } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import ColumnSelector from "@/components/ColumnSelector";
import { Draft } from "@/types/draft";
import { Checkbox } from "./ui/checkbox";
import { TeacherSelections } from "@/types/teacherSelection";
import { Record } from "@/types/record";
import { Faculty } from "@/types/faculty";
import { FieldKey } from "@/types/recordFieldKey";
import { Field } from "@/types/Field";
import { Edit } from "lucide-react";
import { DraftViewProps } from "@/types/props";
import { PaginationBar } from "./PaginationBar";
import DraftTableRow from "./DraftTableRow";
import { DraftTableHeader } from "./DraftTableHeader";
import { FilterComponent } from "./FilterComponent";
import { FacultyMap } from "@/types/FacultyMap";
import updateTeacherSlots from "@/lib/updateTeacherSlots";
import checkAndAssignSlots from "@/lib/checkAndAssignSlots";
import { v4 as uuidv4 } from "uuid";
import { NewCourseModal } from "./NewCourseModal";
import useSocket from "@/hooks/useSocket";

const allFields: Field[] = [
  { key: "sNo", label: "S.No" },
  { key: "year", label: "Year" },
  { key: "stream", label: "Stream" },
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
  const [visibleFields, setVisibleFields] = useState<FieldKey[]>(allFields.map((f) => f.key));
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const availableTeachersRef = useRef<Faculty[] | undefined>(undefined);
  const facultyMapRef = useRef<FacultyMap | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [teacherSelections, setTeacherSelections] = useState<TeacherSelections>({});
  const draftNameRef = useRef<HTMLInputElement>(null);
  const teacherSelectionsRef = useRef(teacherSelections);

  const [filterActive, setFilterActive] = useState(false);
  const [filterBy, setFilterBy] = useState<FieldKey>("sNo");
  const [filterValue, setFilterValue] = useState("");
  const [sortBy, setSortBy] = useState<keyof Record>("courseTitle");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const teachersMap = facultyMapRef.current;

  const socket = useSocket();
  const connectedToDraft = useRef(false);

  useEffect(() => {
    teacherSelectionsRef.current = teacherSelections;
  }, [teacherSelections]);

  const fetchDraft = async () => {
    setLoading(true);
    try {
      const res: AxiosResponse<GetDraftResponse> = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/draft/${draftId}`,
        { withCredentials: true }
      );
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

  // sort, filter, search records
  const processedRecords = useMemo(() => {
    let records: Record[] = draft?.records || [];

    if (filterActive && filterValue !== "") {
      records = records.filter((record) => {
        const value = String(record[filterBy] ?? "").toLowerCase();
        return value.includes(filterValue.toLowerCase());
      });
    }

    if (sortBy) {
      records = [...records].sort((a, b) => {
        const aValue = a[sortBy];
        const bValue = b[sortBy];

        if (sortDirection === "asc") {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    }

    return records;
  }, [draft?.records, sortBy, sortDirection, filterBy, filterValue, filterActive]);

  // paginate records
  const paginatedRecords = useMemo(() => {
    return processedRecords.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  }, [draft?.records, currentPage, rowsPerPage, processedRecords]);

  const totalPages = useMemo(() => {
    if (draft) {
      return Math.ceil(processedRecords.length / rowsPerPage);
    }
    return 0;
  }, [draft, rowsPerPage, processedRecords]);

  const handleSlotChange = useCallback(
    (
      recordId: string,
      slotType: "fn" | "an",
      id: string,
      field: "theorySlot" | "labSlot",
      newValue: string,
      fromSocket: boolean
    ) => {
      console.log("received handleslotchange with params: ", newValue, field);
      const prevRecord = teacherSelectionsRef.current[recordId];
      if (!prevRecord) return;

      const updatedSlot = [...prevRecord[slotType]];

      if (field === "theorySlot") {
        // for theory slots, update the theory slot for all the teachers
        for (let i = 0; i < updatedSlot.length; i++) {
          updatedSlot[i] = { ...updatedSlot[i], theorySlot: newValue };
        }
      } else if (field === "labSlot") {
        // for lab slots, update just the one teacher
        const slotIndex = updatedSlot.findIndex((slot) => slot._id === id);
        if (slotIndex === -1) return;

        updatedSlot[slotIndex] = {
          ...updatedSlot[slotIndex],
          labSlot: newValue,
        };
      }

      setTeacherSelections((prev) => ({
        ...prev,
        [recordId]: {
          ...prev[recordId],
          [slotType]: updatedSlot,
        },
      }));

      // Check if the slot already exists (in another record) for the teacher
      console.log(teacherSelections);
      console.log(teachersMap);
      const oldTeacherId = teacherSelections[recordId]?.[slotType]?.find(
        (s) => s._id === id
      )?.teacher;
      if (oldTeacherId) {
        checkAndAssignSlots(
          facultyMapRef.current,
          recordId,
          oldTeacherId,
          newValue,
          (teacherName, conflicts) => {
            toast.error(`${teacherName} already has slot(s) ${conflicts.join(" ")} assigned.`);
          }
        );
      }

      console.log("done without errors");

      if (!fromSocket) {
        socket.emit("slotUpdate", {
          senderSocketId: socket.id,
          senderDraftId: draftId,
          recordId: recordId,
          slotType: slotType,
          id: id,
          field: field,
          newSelection: newValue,
        });
      }
    },
    [teacherSelections, draftId]
  );

  /*
   * add a slots set to faculty[]
   * initialize it to empty
   * store teachers as a map
   * check for each slot created if the teacher exists there
   * and that teacher has the same slot in their set
   */

  const handleTeacherChange = useCallback(
    (
      recordId: string,
      recordP: number,
      slotType: "fn" | "an",
      id: string,
      newTeacherId: string,
      fromSocket: boolean
    ) => {
      setTeacherSelections((prev) => {
        const recordSlot = prev[recordId]?.[slotType] || [];
        const updatedSlot = [...recordSlot];
        const slotIndex = updatedSlot.findIndex((slot) => slot._id === id);
        if (slotIndex === -1) return prev;

        const oldTeacherId = updatedSlot[slotIndex]?.teacher;
        if (oldTeacherId === newTeacherId) return prev;

        if (!updatedSlot[slotIndex] || oldTeacherId === newTeacherId) return prev;

        updatedSlot[slotIndex] = {
          ...updatedSlot[slotIndex],
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

      // add the set of slots to the newly selected teacher, remove the set of slots from the old teacher (if any)
      const recordSlot = teacherSelections[recordId]?.[slotType] || [];
      const currentSlot = recordSlot.find((slot) => slot._id === id) ?? null;
      const oldTeacher = currentSlot?.teacher;
      if (currentSlot) {
        updateTeacherSlots(teachersMap, recordId, oldTeacher, newTeacherId, currentSlot);
      }

      // efficiently update teacher load counts
      const teachersLoadMap = new Map(availableTeachersRef.current?.map((t) => [t._id, { ...t }]));

      if (oldTeacher && teachersLoadMap.has(oldTeacher)) {
        const t = teachersLoadMap.get(oldTeacher)!;
        t.loadedT = Math.max(0, t.loadedT - 1);
        if (recordP > 0) t.loadedL = Math.max(0, t.loadedL - 1);
      }

      if (newTeacherId && teachersLoadMap.has(newTeacherId)) {
        const t = teachersLoadMap.get(newTeacherId)!;
        t.loadedT += 1;
        if (recordP > 0) t.loadedL += 1;
      }

      availableTeachersRef.current = Array.from(teachersLoadMap.values());

      if (!fromSocket) {
        socket.emit("teacherUpdate", {
          senderSocketId: socket.id,
          senderDraftId: draftId,
          recordId: recordId,
          recordP: recordP,
          slotType: slotType,
          id: id,
          newTeacherId: newTeacherId,
        });
      }
    },
    [draftId]
  );

  // function to add a slot to a record using the + button
  const handleAddSlot = useCallback(
    (recordId: string, slotType: "fn" | "an", fromSocket: boolean) => {
      console.log("teacherSelections: ", teacherSelections);
      setTeacherSelections((prev) => {
        const updated = structuredClone(prev);

        if (!updated[recordId]) {
          updated[recordId] = { fn: [], an: [] };
        }

        if (slotType === "fn") {
          updated[recordId].fn.push({
            _id: uuidv4(),
            teacher: "",
            theorySlot: "",
            labSlot: "",
          });
        } else {
          updated[recordId].an.push({
            _id: uuidv4(),
            teacher: "",
            theorySlot: "",
            labSlot: "",
          });
        }
        return updated;
      });

      if (!fromSocket) {
        socket.emit("addSlot", {
          senderSocketId: socket.id,
          senderDraftId: draftId,
          recordId: recordId,
          slotType: slotType,
        });
      }
    },
    [draftId, teacherSelections]
  );

  const handleRemoveSlot = useCallback(
    (recordId: string, slotType: "fn" | "an", id: string, fromSocket: boolean) => {
      const slotToRemove = teacherSelections[recordId]?.[slotType].find((slot) => slot._id === id);
      const teacherId = slotToRemove?.teacher;

      if (teacherId) {
        const record = draft?.records.find((r) => r._id === recordId);
        const teachersLoadMap = new Map(
          availableTeachersRef.current?.map((t) => [t._id, { ...t }])
        );

        const teacherToUpdate = teachersLoadMap.get(teacherId);
        if (teacherToUpdate) {
          teacherToUpdate.loadedT = Math.max(0, teacherToUpdate.loadedT - 1);
          if (record && record.P > 0) {
            teacherToUpdate.loadedL = Math.max(0, teacherToUpdate.loadedL - 1);
          }
          teachersLoadMap.set(teacherId, teacherToUpdate);
        }
        availableTeachersRef.current = Array.from(teachersLoadMap.values());

        if (slotToRemove) {
          updateTeacherSlots(facultyMapRef.current, recordId, teacherId, "", slotToRemove);
        }
      }

      setTeacherSelections((prev) => {
        const updated = structuredClone(prev);

        if (!updated[recordId]) return prev;
        if (!updated[recordId][slotType]) return prev;

        const slots = updated[recordId][slotType] || [];
        const filteredSlots = slots.filter((slot) => slot._id !== id);
        updated[recordId] = {
          ...updated[recordId],
          [slotType]: filteredSlots,
        };

        return updated;
      });

      if (!fromSocket) {
        socket.emit("removeSlot", {
          senderSocketId: socket.id,
          senderDraftId: draftId,
          recordId: recordId,
          slotType: slotType,
          id: id,
        });
      }
    },
    [draftId, teacherSelections, draft?.records]
  );

  const handleDeleteCourse = useCallback(
    (recordId: string) => {
      socket.emit("deleteCourse", {
        senderSocketId: socket.id,
        senderDraftId: draftId,
        recordId: recordId,
      });
      fetchDraft();
    },
    [draftId, socket]
  );

  // socket updates useEffect
  useEffect(() => {
    if (!connectedToDraft.current) {
      socket.emit("joinDraft", draftId);
      console.log("joined draft websocket");
      connectedToDraft.current = true;
    } else {
      console.log("already connected to draft websocket");
    }

    const handleSlotUpdate = ({
      senderSocketId,
      senderDraftId,
      recordId,
      slotType,
      id,
      field,
      newSelection,
    }: {
      senderSocketId: string;
      senderDraftId: string;
      recordId: string;
      slotType: "fn" | "an";
      id: string;
      field: "labSlot" | "theorySlot";
      newSelection: string;
    }): void => {
      if (senderSocketId === socket.id) return;
      if (draftId === senderDraftId) {
        handleSlotChange(recordId, slotType, id, field, newSelection, true);
      }
    };

    const handleTeacherUpdate = ({
      senderSocketId,
      senderDraftId,
      recordId,
      recordP,
      slotType,
      id,
      newTeacherId,
    }: {
      senderSocketId: string;
      senderDraftId: string;
      recordId: string;
      recordP: number;
      slotType: "fn" | "an";
      id: string;
      newTeacherId: string;
    }): void => {
      if (senderSocketId === socket.id) return;
      if (draftId === senderDraftId) {
        handleTeacherChange(recordId, recordP, slotType, id, newTeacherId, true);
      }
    };

    const handleAddSlotUpdate = ({
      senderSocketId,
      senderDraftId,
      recordId,
      slotType,
    }: {
      senderSocketId: string;
      senderDraftId: string;
      recordId: string;
      recordP: number;
      slotType: "fn" | "an";
    }): void => {
      if (senderSocketId === socket.id) return;
      if (draftId === senderDraftId) {
        handleAddSlot(recordId, slotType, true);
      }
    };

    const handleRemoveSlotUpdate = ({
      senderSocketId,
      senderDraftId,
      recordId,
      slotType,
      id,
    }: {
      senderSocketId: string;
      senderDraftId: string;
      recordId: string;
      slotType: "fn" | "an";
      id: string;
    }): void => {
      if (senderSocketId === socket.id) return;
      if (draftId === senderDraftId) {
        handleRemoveSlot(recordId, slotType, id, true);
      }
    };

    const handleCourseCreate = ({
      senderSocketId,
      senderDraftId,
      newRecord,
    }: {
      senderSocketId: string;
      senderDraftId: string;
      newRecord: Record;
    }): void => {
      if (senderSocketId === socket.id) {
        fetchDraft();
      }
      if (draftId === senderDraftId) {
        setDraft((prev) => (prev ? { ...prev, records: [...prev.records, newRecord] } : prev));
        fetchDraft();
      }
    };

    const handleCourseDelete = ({
      senderSocketId,
      recordId,
    }: {
      senderSocketId: string;
      recordId: string;
    }): void => {
      if (senderSocketId === socket.id) return;
      setDraft((prev) => {
        if (!prev) return prev;
        const updatedRecords = prev.records.filter((record) => record._id !== recordId);
        return { ...prev, records: updatedRecords };
      });
    };

    socket.on("slotUpdated", handleSlotUpdate);
    socket.on("teacherUpdated", handleTeacherUpdate);
    socket.on("slotAdded", handleAddSlotUpdate);
    socket.on("slotRemoved", handleRemoveSlotUpdate);
    socket.on("courseCreated", handleCourseCreate);
    socket.on("courseDeleted", handleCourseDelete);

    return () => {
      socket.off("slotUpdated", handleSlotUpdate);
      socket.off("teacherUpdated", handleTeacherUpdate);
      socket.off("slotAdded", handleAddSlotUpdate);
      socket.off("slotRemoved", handleRemoveSlotUpdate);
      socket.off("courseCreated", handleCourseCreate);
      socket.off("courseDeleted", handleCourseDelete);
    };
  }, [draftId, handleAddSlot, handleRemoveSlot, handleSlotChange, handleTeacherChange]);

  useEffect(() => {
    const refreshPage = async () => {
      await fetchDraft();
    };
    refreshPage();
  }, []);

  useEffect(() => {
    if (draft) {
      const initialSelections: typeof teacherSelections = {};
      const facultySlotMap: {
        [teacherId: string]: { [recordId: string]: Set<string> };
      } = {};
      draft?.records.forEach((rec) => {
        initialSelections[rec._id] = {
          // this is just to make sure the forenoon & afternoon teachers arrays
          // arent empty or undefined.
          // but the backend already does this so
          // need to remove this redundant code later
          fn:
            rec.forenoonTeachers.length > 0
              ? rec.forenoonTeachers
              : Array.from({ length: rec.numOfForenoonSlots }).map(() => ({
                  _id: uuidv4(),
                  teacher: "",
                  theorySlot: "",
                  labSlot: "",
                })),
          an:
            rec.afternoonTeachers.length > 0
              ? rec.afternoonTeachers
              : Array.from({ length: rec.numOfAfternoonSlots }).map(() => ({
                  _id: uuidv4(),
                  teacher: "",
                  theorySlot: "",
                  labSlot: "",
                })),
        };
        [...rec.forenoonTeachers, ...rec.afternoonTeachers].forEach((t) => {
          if (!t.teacher) return;
          if (!facultySlotMap[t.teacher]) {
            facultySlotMap[t.teacher] = {};
          }
          if (!facultySlotMap[t.teacher][rec._id]) {
            facultySlotMap[t.teacher][rec._id] = new Set<string>();
          }

          if (t.theorySlot !== "")
            t.theorySlot
              .split(" + ")
              .forEach((tslot) => facultySlotMap[t.teacher][rec._id].add(tslot));
          if (t.labSlot && t.labSlot !== "")
            t.labSlot
              ?.split(" + ")
              .forEach((lslot) => facultySlotMap[t.teacher][rec._id].add(lslot));
        });
      });
      setTeacherSelections(initialSelections);

      availableTeachersRef.current = draft.faculty;
      facultyMapRef.current = draft.faculty.reduce((map, faculty) => {
        const slots = facultySlotMap[faculty._id] ?? new Set<string>();
        map[faculty._id] = { ...faculty, slots };
        return map;
      }, {} as FacultyMap);
    }
  }, [draft]);

  if (loading) return <div> Loading... </div>; // TODO: replace with loading icon
  if (!draft) return <div> Error: Draft Not Found! </div>;

  const toggleField = (field: FieldKey) => {
    setVisibleFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]
    );
  };

  // Gets the possible teachers for a given record and slot type
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
      .filter((teacher) => !assignedTeacherIds.includes(teacher._id))
      .filter((teacher) => teacher.loadT - teacher.loadedT > 0)
      .filter((teacher) => (rec.P > 0 ? teacher.loadL - teacher.loadedL > 0 : true));
  }

  function handleSortChange(field: keyof Record, direction: "asc" | "desc") {
    setSortBy(field);
    setSortDirection(direction);
  }

  function handleFilterChange(column: FieldKey | null, value: string) {
    if (column === null) {
      alert("Error: Select a valid column");
    }
    setFilterBy(column ?? "sNo");
    setFilterValue(value);
  }

  async function setDraftName(newName: string): Promise<void> {
    setEditingName(false);
    if (newName === draft?.name) {
      return;
    }
    try {
      const res: AxiosResponse<GetDraftResponse> = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/draft/${draftId}`,
        {
          name: newName,
        },
        { withCredentials: true }
      );
      if (res.status === 200) {
        toast.success(res.data.message);
        setDraft((prev) => (prev ? { ...prev, name: newName } : prev));
        // updating just the draft's name here after success because
        // we dont want screen flickering & unecessary re-renders
      } else {
        toast.error(res.data.error);
      }
    } catch (error) {
      console.log("APIError: Could not change draft name: ", error);
      toast.error("Error: Could not update name.");
    }
  }

  return (
    <div className="flex flex-col items-center my-2 mx-2 w-full max-w-screen overflow-x-auto">
      <div className="flex flex-row gap-x-4 my-2">
        {editingName ? (
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
            <Button variant="ghost" size="sm" onClick={() => setEditingName((prev) => !prev)}>
              <Edit />
            </Button>
          </div>
        )}
      </div>

      <div className="flex flex-row items-center gap-x-4 mb-4 justify-between w-full px-4">
        <div className="flex flex-row items-center gap-x-2">
          <Checkbox
            checked={filterActive}
            onCheckedChange={() => setFilterActive((prev) => !prev)}
          />

          <FilterComponent columns={allFields} onFilterSubmit={handleFilterChange} />
        </div>

        <div className="flex flex-row items-center gap-x-2">
          <NewCourseModal draftId={draft._id} onSubmit={fetchDraft} />
          <ColumnSelector
            allFields={allFields}
            visibleFields={visibleFields}
            toggleField={toggleField}
          />
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <Table className="border rounded-sm w-full">
          <TableHeader>
            <DraftTableHeader
              allFields={allFields}
              visibleFields={visibleFields}
              sortBy={sortBy}
              sortDirection={sortDirection}
              onSortChange={handleSortChange}
            />
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
                facultyMap={facultyMapRef.current}
                onAddSlot={handleAddSlot}
                onRemoveSlot={handleRemoveSlot}
                onDeleteCourse={handleDeleteCourse}
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
          totalRecords={processedRecords.length}
        />
      </div>
    </div>
  );
}
