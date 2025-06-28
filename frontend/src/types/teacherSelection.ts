import { SlotAssignment } from "./slotAssignment";

export type TeacherSelections = {
  [recordId: string]: {
    fn: SlotAssignment[],
    an: SlotAssignment[],
  };
};
