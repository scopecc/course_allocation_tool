import { SlotAssignment } from "./slotAssignment";

export interface Record {
  _id: string;
  sNo: number;
  year: string;
  stream: string;
  courseCode: string;
  courseType: string;
  courseTitle: string;
  numOfForenoonSlots: number;
  forenoonTeachers: SlotAssignment[];
  numOfAfternoonSlots: number;
  afternoonTeachers: SlotAssignment[];
  L: number;
  T: number;
  P: number;
  C: string;
  courseHandlingSchool: string;
}
