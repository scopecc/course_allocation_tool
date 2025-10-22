import React, { useMemo } from "react";
import { Record } from "@/types/record";
import ComboBox from "@/components/ComboBox";
import { TableRow, TableCell } from "@/components/ui/table";
import { Faculty } from "@/types/faculty";
import { TeacherSelections } from "@/types/teacherSelection";
import { Field } from "@/types/Field";
import { SlotInput } from "./SlotInput";
import { LabSlotOptions, TheorySlotOptions } from "@/types/SlotOptions";
import { FacultyMap } from "@/types/FacultyMap";
import { Button } from "./ui";
import { PlusIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import DeleteSlotButton from "./DeleteSlotButton";

const DraftTableRow = React.memo(function DraftTableRow({
  rec,
  allFields,
  visibleFields,
  teacherSelections,
  availableTeachers,
  filterTeachers,
  handleTeacherChange,
  handleSlotChange,
  facultyMap,
  onAddSlot,
  onRemoveSlot,
}: {
  rec: Record;
  allFields: Field[];
  visibleFields: string[];
  teacherSelections: TeacherSelections;
  availableTeachers: Faculty[] | undefined;
  filterTeachers: (
    availableTeachers: Faculty[] | undefined,
    rec: Record,
    slotType: "fn" | "an"
  ) => Faculty[];
  handleTeacherChange: (
    recordId: string,
    recordP: number,
    slotType: "fn" | "an",
    id: string,
    newTeacherId: string,
    fromSocket: boolean
  ) => void;
  handleSlotChange: (
    recordId: string,
    slotType: "fn" | "an",
    id: string,
    field: "theorySlot" | "labSlot",
    newValue: string,
    fromSocket: boolean
  ) => void;
  facultyMap: FacultyMap | null;
  onAddSlot: (recordId: string, slotType: "fn" | "an", fromSocket: boolean) => void;
  onRemoveSlot: (
    recordId: string,
    slotType: "fn" | "an",
    id: string,
    fromSocket: boolean
  ) => void;
}) {
  const forenoonSlots = teacherSelections[rec._id]?.fn || [];
  const afternoonSlots = teacherSelections[rec._id]?.an || [];

  function getAvailableSlots(teacherId?: string) {
    const teachers = new Set<string>();

    if (teacherId) {
      teachers.add(teacherId);
    } else {
      teacherSelections?.[rec._id]?.fn?.forEach((forenoonTeacher) => {
        if (forenoonTeacher.teacher) {
          teachers.add(forenoonTeacher.teacher);
        }
      });
      teacherSelections?.[rec._id]?.an?.forEach((afternoonTeacher) => {
        if (afternoonTeacher.teacher) {
          teachers.add(afternoonTeacher.teacher);
        }
      });
    }

    const slotsToTeachers: { [slot: string]: Set<string> } = {};

    teachers.forEach((teacher) => {
      const teacherSlots = facultyMap?.[teacher]?.slots ?? {};

      Object.entries(teacherSlots).forEach(([recordId, set]) => {
        if (recordId !== rec._id) {
          set.forEach((s) => {
            if (!slotsToTeachers[s]) {
              slotsToTeachers[s] = new Set();
            }
            slotsToTeachers[s].add(facultyMap?.[teacher].name || "test");
          });
        }
      });
    });

    return slotsToTeachers;
  }

  function buildSlotOptions(
    defaultOptions: { value: string; label: string }[],
    slotsToTeachers: { [slot: string]: Set<string> }
  ) {
    return defaultOptions.map((option) => {
      const teachers = slotsToTeachers[option.value];
      return {
        ...option,
        disabled: !!teachers,
        teachers: teachers ? Array.from(teachers) : [],
      };
    });
  }

  // common theory slot options for entire row
  const theorySlotOptions = useMemo(
    () => buildSlotOptions(TheorySlotOptions, getAvailableSlots()),
    [teacherSelections, facultyMap, getAvailableSlots]
  );

  return (
    <TableRow key={rec._id}>
      {allFields.map((field) =>
        visibleFields.includes(field.key) ? (
          <TableCell className="max-w-[180px] whitespace-normal break-words" key={field.key}>
            {rec[field.key]}
          </TableCell>
        ) : null
      )}

      {/* Main Theory Slot Input (Common for all teachers) */}
      <TableCell>
        <SlotInput
          value={teacherSelections[rec._id]?.fn[0]?.theorySlot.split(" + ") || []}
          options={theorySlotOptions || []}
          placeholder="Enter Theory Slot"
          onCommit={(value) =>
            handleSlotChange(rec._id, "fn", "", "theorySlot", value.join(" + "), false)
          }
          autoSize={false}
        />
      </TableCell>
      <TableCell>{rec.numOfForenoonSlots + rec.numOfAfternoonSlots}</TableCell>

      {/* Forenoon Teacher Selection Inputs */}
      <TableCell>
        <div className="flex flex-col gap-y-2">
          <div className="flex flex-row justify-center items-center">
            <div className="items-center text-muted-foreground border-2 px-2 rounded-md">
              {forenoonSlots.length} {forenoonSlots.length === 1 ? "slot" : "slots"}
            </div>
            <Tooltip>
              <TooltipTrigger>
                <Button
                  variant="secondary"
                  className="mx-2 rounded-md size-6 flex items-center justify-center"
                  onClick={() => onAddSlot(rec._id, "fn", false)}
                >
                  <PlusIcon size={12} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add a new Slot</TooltipContent>
            </Tooltip>
          </div>
          {/*{Array.from({ length: rec.numOfForenoonSlots }).map((_, k) => (*/}
          {teacherSelections[rec._id]?.fn.map((slot) => (
            <div key={slot._id} className="relative group flex flex-col gap-y-2">
              <DeleteSlotButton onConfirm={() => onRemoveSlot(rec._id, "fn", slot._id, false)} />
              <ComboBox
                options={filterTeachers(availableTeachers, rec, "fn")}
                value={availableTeachers?.find((teacher) => teacher._id == slot.teacher) || null}
                onChange={(val) => handleTeacherChange(rec._id, rec.P, "fn", slot._id, val, false)}
                placeHolder="Select FN Teacher..."
              />
              {rec.P > 0 && slot.teacher
                ? (() => {
                    // separate lab slot options specific to each teacher
                    const labSlotsForFNTeacher = buildSlotOptions(
                      LabSlotOptions,
                      getAvailableSlots(slot.teacher || "")
                    );
                    return (
                      <SlotInput
                        className="max-w-48"
                        value={slot.labSlot?.split(" + ") || []}
                        options={labSlotsForFNTeacher}
                        placeholder="Enter Lab Slot"
                        onCommit={(value) =>
                          handleSlotChange(
                            rec._id,
                            "fn",
                            slot._id,
                            "labSlot",
                            value.join(" + "),
                            false
                          )
                        }
                      />
                    );
                  })()
                : null}
            </div>
          ))}
        </div>
      </TableCell>

      {/* Afternoon Teacher Selection Inputs */}
      <TableCell>
        <div className="flex flex-col py-5 gap-y-2">
          <div className="flex flex-row justify-center items-center">
            <div className="items-center text-muted-foreground border-2 px-2 rounded-md">
              {afternoonSlots.length} {afternoonSlots.length === 1 ? "slot" : "slots"}
            </div>
            <Tooltip>
              <TooltipTrigger>
                <Button
                  variant="secondary"
                  className="mx-2 rounded-md size-6 flex items-center justify-center"
                  onClick={() => onAddSlot(rec._id, "an", false)}
                >
                  <PlusIcon size={12} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add a new Slot</TooltipContent>
            </Tooltip>
          </div>
          {teacherSelections[rec._id]?.an.map((slot) => (
            <div key={slot._id} className="relative group flex flex-col gap-y-2">
              <DeleteSlotButton
                className="-right-2"
                onConfirm={() => onRemoveSlot(rec._id, "an", slot._id, false)}
              />
              <ComboBox
                options={filterTeachers(availableTeachers, rec, "an")}
                value={
                  availableTeachers?.find(
                    (teacher) => teacher._id == slot.teacher
                  ) || null
                }
                onChange={(val) => handleTeacherChange(rec._id, rec.P, "an", slot._id, val, false)}
                placeHolder="Select AN Teacher..."
              />
              {rec.P > 0 && slot.teacher
                ? (() => {
                    // separate lab slot options specific to each teacher
                    const labSlotsForANTeacher = buildSlotOptions(
                      LabSlotOptions,
                      getAvailableSlots(slot.teacher || "")
                    );
                    return (
                      <SlotInput
                        placeholder="Enter Lab Slot"
                        value={slot.labSlot?.split(" + ") || []}
                        options={labSlotsForANTeacher}
                        onCommit={(value) =>
                          handleSlotChange(rec._id, "an", slot._id, "labSlot", value.join(" + "), false)
                        }
                        className="max-w-48"
                      />
                    );
                  })()
                : null}
            </div>
          ))}
        </div>
      </TableCell>
    </TableRow>
  );
});

export default DraftTableRow;
