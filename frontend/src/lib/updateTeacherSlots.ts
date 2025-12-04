import { FacultyMap } from "@/types/FacultyMap";

export default function updateTeacherSlots(
  teachersMap: FacultyMap | null,
  recordId: string,
  oldTeacherId: string | undefined | null,
  newTeacherId: string | null,
  slotAssignment: { theorySlot?: string; labSlot?: string }
) {
  if (!teachersMap) return;

  // build the slots set for this teacher
  const assignedSlots = new Set<string>();
  if (slotAssignment.theorySlot) {
    slotAssignment.theorySlot.split(" + ").forEach((s) => assignedSlots.add(s));
  }
  if (slotAssignment.labSlot) {
    slotAssignment.labSlot.split(" + ").forEach((s) => assignedSlots.add(s));
  }

  // remove from old teacher
  if (oldTeacherId && teachersMap[oldTeacherId]) {
    delete teachersMap[oldTeacherId].slots?.[recordId];
  }

  // add to new teacher
  if (newTeacherId && teachersMap[newTeacherId]) {
    if (!teachersMap[newTeacherId].slots) {
      teachersMap[newTeacherId].slots = {};
    }
    teachersMap[newTeacherId].slots[recordId] = assignedSlots;
  }
}
