import mongoose from "mongoose"
import slotAssignmentSchema from "./slotAssignmentSchema.js";

const recordSchema = new mongoose.Schema({
  sNo: {
    type: Number,
    required: true,
  },
  year: {
    type: String,
    required: true,
  },
  stream: {
    type: String,
    required: true,
  },
  courseCode: {
    type: String,
    required: true,
  },
  courseType: {
    type: String,
  },
  courseTitle: {
    type: String,
    required: true,
  },
  numOfForenoonSlots: {
    type: Number,
    required: true,
    default: 0,
  },
  forenoonTeachers: {
    type: [slotAssignmentSchema],
  },
  numOfAfternoonSlots: {
    type: Number,
    required: true,
    default: 0,
  },
  afternoonTeachers: {
    type: [slotAssignmentSchema],
  },
  L: {
    type: Number,
    required: true,
    default: 0,
  },
  T: {
    type: Number,
    required: true,
    default: 0,
  },
  P: {
    type: Number,
    required: true,
    default: 0,
  },
  C: {
    type: String,
    required: true,
    default: "0",
  },
  courseHandlingSchool: {
    type: String,
    default: "SCOPE",
  },
});

// exporting as schema to embed in drafts
export default recordSchema; 
