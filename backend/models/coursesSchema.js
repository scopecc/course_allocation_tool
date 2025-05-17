import mongoose from "mongoose";

const coursesSchema = new mongoose.Schema({
  courseTitle: {
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
    default: 0,
  },
  numOfEveningSlots: {
    type: Number,
    required: true,
    default: 0,
  },
  filledMorningSlots: {
    type: Number,
    required: true,
    default: 0,
  },
  filledEveningSlots: {
    type: Number,
    required: true,
    default: 0,
  },
  year: {
    type: String,
    required: true,
  },
  stream: {
    type: String,
    required: true,
  },
  courseType: {
    type: String,
  },
  domain: {
    type: String,
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
  J: {
    type: Number,
    required: true,
    default: 0,
  },
  C: {
    type: Number,
    required: true,
    default: 0,
  },
  courseHandlingSchool: {
    type: String,
    required: true,
    default: "SCOPE",
  },
});

export const Courses = mongoose.model("Courses", coursesSchema);
