import React from 'react';
import { Record } from '@/types/record';
import ComboBox from "@/components/ComboBox";
import { TableRow, TableCell } from "@/components/ui/table";
import { Faculty } from '@/types/faculty';
import { TeacherSelections } from '@/types/teacherSelection';
import { Field } from '@/types/Field';
import { SlotInput } from './SlotInput';


const DraftTableRow = React.memo(function DraftTableRow({
  rec,
  allFields,
  visibleFields,
  teacherSelections,
  availableTeachers,
  filterTeachers,
  handleTeacherChange,
  handleSlotChange,
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
}) {

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
          value={teacherSelections[rec._id]?.fn[0]?.theorySlot || ""}
          className="max-w-36"
          placeholder="Enter Theory Slot"
          onCommit={(value) => handleSlotChange(rec._id, "fn", 0, "theorySlot", value, false)}
        />

      </TableCell>

      <TableCell>
        <div className="flex flex-col gap-3">
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
              {rec.P > 0 && teacherSelections[rec._id]?.fn[k] !== undefined ? (
                <SlotInput
                  className="max-w-48 mb-3"
                  value={teacherSelections[rec._id]?.fn[k].labSlot || ""}
                  placeholder="Enter Lab Slot"
                  onCommit={(value) => handleSlotChange(rec._id, "fn", k, "labSlot", value, false)}
                />
              ) : null}
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
              {rec.P > 0 && teacherSelections[rec._id]?.an[k] !== undefined ? (
                <SlotInput
                  placeholder='Enter Lab Slot'
                  value={teacherSelections[rec._id]?.an[k].labSlot || ""}
                  onCommit={(value) => handleSlotChange(rec._id, "an", k, "labSlot", value, false)}
                  className='max-w-48'
                />
              ) : null}
            </div>
          ))}
        </div>
      </TableCell>
    </TableRow>
  );
});

export default DraftTableRow;
