import { LabSlot } from "./labSlot";

export interface Record{
  _id: string;
  sNo: number;
  year: string;
  stream: string;
  courseCode: string;
  courseTitle: string;
  numOfForenoonSlots: number;
  forenoonTeachers: string[];
  numOfAfternoonSlots: number;
  afternoonTeachers: string[];
  L: number;
  T: number;
  P: number;
  C: string;
  courseHandlingSchool: string;
  labSlots?: LabSlot[];
}