"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import axios, { AxiosResponse } from "axios";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import ComboBox from "./ComboBox";
import { Input } from "@/components/ui/input";

import { Draft } from "@/types/draft";
import { TeacherSelections } from "@/types/teacherSelection";
import { Record } from "@/types/record";
import { Faculty } from "@/types/faculty";
import { FieldKey } from "@/types/recordFieldKey";
import { ChevronsUpDown } from "lucide-react"; //TODO: add sorting

interface DraftViewProps {
  draftId: string;
}

type Field = {
  key: FieldKey;
  label: string;
};

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
    newValue: string
  ) => {
    const prevRecord = teacherSelections[recordId];
    if (!prevRecord) return;

    const updatedSlot = [...prevRecord[slotType]];
    const updatedAssignment = { ...updatedSlot[index], [field]: newValue };
    updatedSlot[index] = updatedAssignment;

    teacherSelections[recordId] = {
      ...prevRecord,
      [slotType]: updatedSlot,
    };

    //setUpdateCount((prev) => prev + 1);

    console.log('updated: ', newValue);
    console.log('teacherSelectionn: ', teacherSelections);
  }

  const handleTeacherChange = (
    recordId: string,
    recordP: number,
    slotType: "fn" | "an",
    index: number,
    newTeacherId: string,
  ) => {
    const oldTeacherId = teacherSelections?.[recordId]?.[slotType]?.[index]?.teacher;

    if (teacherSelections[recordId]?.[slotType]?.[index]) {
      teacherSelections[recordId][slotType][index].teacher = newTeacherId;
    }

    setUpdateCount(prev => prev + 1)

    setAvailableTeachers((prev) => {
      if (!prev) return undefined;

      const updatedTeachers = prev.map((teacher) => {
        if (teacher._id === oldTeacherId) {
          return {
            ...teacher,
            loadedT: teacher.loadedT - 1,
            loadedL: recordP > 0 ? teacher.loadedL - 1 : teacher.loadedL,
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

      <div className="mb-4 flex justify-end gap-x-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Select Columns</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="max-h-80 overflow-auto">
            {allFields.map((field) => (
              <DropdownMenuCheckboxItem
                key={field.key}
                checked={visibleFields.includes(field.key)}
                onCheckedChange={() => toggleField(field.key)}
                onSelect={(e) => e.preventDefault()}
              >
                {field.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

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
                          key={k}
                          options={filterTeachersAccordingToRecord(availableTeachers, rec, "fn")}
                          value={
                            availableTeachers?.find((teacher) => (teacher._id == teacherSelections[rec._id]?.fn[k].teacher)) || null
                          }
                          onChange={(val) => handleTeacherChange(rec._id, rec.P, "fn", k, val)}
                          placeHolder="Select FN Teacher..."
                        />

                        {rec.P > 0 && teacherSelections[rec._id]?.fn[k] !== undefined ?
                          (<Input
                            key={k}
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
                          key={k}
                          options={filterTeachersAccordingToRecord(availableTeachers, rec, "an")}
                          value={
                            availableTeachers?.find((teacher) => (teacher._id == teacherSelections[rec._id]?.an[k].teacher)) || null
                          }
                          onChange={(val) => handleTeacherChange(rec._id, rec.P, "an", k, val)}
                          placeHolder="Select AN Teacher..."
                        />

                        {rec.P > 0 && teacherSelections[rec._id]?.an[k] !== undefined ?
                          (<Input
                            key={k}
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
