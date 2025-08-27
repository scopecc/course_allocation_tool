export interface Faculty {
  _id: string;
  name: string;
  employeeId: string;
  prefix: "Mr." | "Mrs." | "Ms." | "Prof." | "Dr." | "";
  loadL: number;
  loadT: number;
  loadedL: number;
  loadedT: number;
  loadPhd: number;
  loadedPhd: number;
}
