import { Record } from "./record";
import { Faculty } from "./faculty";

export interface Draft {
  _id: string;
  name: string;
  creationDate: string;
  consolidatedFileName: string;
  loadFileName: string;
  recordCount: number;
  facultyCount: number;
  records: Array<Record>;
  faculty: Array<Faculty>;
}
