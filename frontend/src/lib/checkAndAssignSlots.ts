import { FacultyMap } from "@/types/FacultyMap";

export default function checkAndAssignSlots(
  teachersMap: FacultyMap | null,
  recordId: string,
  teacherId: string,
  newValue: string,
  onConflict: (teacherName: string, conflictSlots: string[]) => void
) {
  if (!teachersMap || !teacherId || !teachersMap[teacherId]) return;

  const teacher = teachersMap[teacherId];

  // this is not necessary because the slots are always initialized,
  // but we dont want a runtime erorr just in case;
  if (!teacher.slots) {
    teacher.slots = {}
  }

  const newSlots = newValue.split(" + ");
  const otherSlots = new Set<string>();

  // collect slots assigned in records other than this one 
  for (const [rid, set] of Object.entries(teacher.slots ?? {})) {
    if (rid !== recordId) {
      set.forEach((s) => otherSlots.add(s));
    }
  }

  // detect conflicts
  const conflictSlots: string[] = [];
  for (const newSlot of newSlots) {
    if (otherSlots.has(newSlot)) {
      conflictSlots.push(newSlot);
    }
  }

  if (conflictSlots.length > 0) {
    onConflict(teacher.name, conflictSlots);
  }

  // update slots
  teacher.slots[recordId] = new Set(newSlots);
}

