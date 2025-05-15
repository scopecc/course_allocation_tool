import mongoose from "mongoose";

const coursesSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  courseName: {
    type: String,
    required: true,
  },
  courseCode: {
    type: String,
    required: true,
  },
  numOfMorningSlots: {
    type: Number,
    required: true,
  },
  numOfEveningSlots: {
    type: Number,
    required: true,
  },
});

export const Courses = mongoose.model("Courses", coursesSchema);
