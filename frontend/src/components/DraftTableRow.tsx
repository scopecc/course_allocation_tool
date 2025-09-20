import React, { useMemo } from 'react';
import { Record } from '@/types/record';
import ComboBox from "@/components/ComboBox";
import { TableRow, TableCell } from "@/components/ui/table";
import { Faculty } from '@/types/faculty';
import { TeacherSelections } from '@/types/teacherSelection';
import { Field } from '@/types/Field';
import { SlotInput } from './SlotInput';
import { LabSlotOptions, TheorySlotOptions } from '@/types/SlotOptions';
import { FacultyMap } from '@/types/FacultyMap';


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
}: {
  rec: Record,
  allFields: Field[],
  visibleFields: string[],
  teacherSelections: TeacherSelections,
  availableTeachers: Faculty[] | undefined,
  filterTeachers: (
    availableTeachers: Faculty[] | undefined,
    rec: Record,
    slotType: "fn" | "an") => Faculty[],
  handleTeacherChange: (
    recordId: string,
    recordP: number,
    slotType: "fn" | "an",
    index: number,
    newTeacherId: string,
    fromSocket: boolean,
  ) => void,
  handleSlotChange: (
    recordId: string,
    slotType: "fn" | "an",
    index: number,
    field: "theorySlot" | "labSlot",
    newValue: string,
    fromSocket: boolean,
  ) => void,
  facultyMap: FacultyMap | null
}) {


  function getAvailableSlots(teacherId?: string) {
    const teachers = new Set<string>();

    if (teacherId) {
      teachers.add(teacherId);
    } else {

      teacherSelections?.[rec._id]?.fn?.forEach(forenoonTeacher => {
        if (forenoonTeacher.teacher) {
          teachers.add(forenoonTeacher.teacher);
        }
      });
      teacherSelections?.[rec._id]?.an?.forEach(afternoonTeacher => {
        if (afternoonTeacher.teacher) {
          teachers.add(afternoonTeacher.teacher);
        }
      });
    }

    const slotsToTeachers: { [slot: string]: Set<string> } = {}

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
    defaultOptions: { value: string, label: string }[],
    slotsToTeachers: { [slot: string]: Set<string> },
  ) {
    return defaultOptions.map(option => {
      const teachers = slotsToTeachers[option.value];
      return {
        ...option,
        disabled: !!teachers,
        teachers: teachers ? Array.from(teachers) : []
      }
    })
  }


  // common theory slot options for entire row
  const theorySlotOptions = useMemo(
    () => buildSlotOptions(TheorySlotOptions, getAvailableSlots()),
    [teacherSelections, facultyMap]
  );

  return (
    <TableRow key={rec._id}>
      {allFields.map((field) =>
        visibleFields.includes(field.key)
          ? (
            <TableCell className="max-w-[180px] whitespace-normal break-words" key={field.key}>
              {rec[field.key]}
            </TableCell>
          )
          : null
      )}

      <TableCell>
        <SlotInput
          value={teacherSelections[rec._id]?.fn[0]?.theorySlot.split(" + ") || []}
          options={theorySlotOptions || []}
          placeholder="Enter Theory Slot"
          onCommit={(value) => handleSlotChange(rec._id, "fn", 0, "theorySlot", value.join(" + "), false)}
          autoSize={false}
        />
      </TableCell>

      <TableCell>
        <div className="flex flex-col gap-y-2">
          {Array.from({ length: rec.numOfForenoonSlots }).map((_, k) => (
            <div key={k} className="flex flex-col gap-y-2">
              <ComboBox
                options={filterTeachers(availableTeachers, rec, "fn")}
                value={
                  availableTeachers?.find(
                    (teacher) =>
                      teacher._id == teacherSelections[rec._id]?.fn[k].teacher
                  ) || null
                }
                onChange={(val) =>
                  handleTeacherChange(rec._id, rec.P, "fn", k, val, false)
                }
                placeHolder="Select FN Teacher..."
              />
              {rec.P > 0 && teacherSelections[rec._id]?.fn[k] !== undefined ? (() => {
                // separate lab slot options specific to each teacher
                const teacherId = teacherSelections[rec._id]?.fn[k]
                const labSlotsForFNTeacher = buildSlotOptions(LabSlotOptions, getAvailableSlots(teacherId.teacher || ""))
                return (
                  <SlotInput
                    className="max-w-48"
                    value={teacherSelections[rec._id]?.fn[k].labSlot?.split(" + ") || []}
                    options={labSlotsForFNTeacher}
                    placeholder="Enter Lab Slot"
                    onCommit={(value) => handleSlotChange(rec._id, "fn", k, "labSlot", value.join(" + "), false)}
                  />
                );
              })() : null}
            </div>
          ))}
        </div>
      </TableCell>

      <TableCell>
        <div className="flex flex-col py-5 gap-y-2">
          {Array.from({ length: rec.numOfAfternoonSlots }).map((_, k) => (
            <div key={k} className="flex flex-col gap-y-2">
              <ComboBox
                options={filterTeachers(availableTeachers, rec, "an")}
                value={
                  availableTeachers?.find(
                    (teacher) =>
                      teacher._id == teacherSelections[rec._id]?.an[k].teacher
                  ) || null
                }
                onChange={(val) =>
                  handleTeacherChange(rec._id, rec.P, "an", k, val, false)
                }
                placeHolder="Select AN Teacher..."
              />
              {rec.P > 0 && teacherSelections[rec._id]?.an[k] !== undefined ? (() => {
                // separate lab slot options specific to each teacher
                const teacherId = teacherSelections[rec._id]?.an[k]
                const labSlotsForANTeacher = buildSlotOptions(LabSlotOptions, getAvailableSlots(teacherId.teacher || ""))
                return (
                  <SlotInput
                    placeholder='Enter Lab Slot'
                    value={teacherSelections[rec._id]?.an[k].labSlot?.split(" + ") || []}
                    options={labSlotsForANTeacher}
                    onCommit={(value) => handleSlotChange(rec._id, "an", k, "labSlot", value.join(" + "), false)}
                    className='max-w-48'
                  />
                );
              })() : null}
            </div>
          ))}
        </div>
      </TableCell>
    </TableRow>
  );
});

export default DraftTableRow;
