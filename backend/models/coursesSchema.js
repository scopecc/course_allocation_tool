import mongoose from "mongoose";

const coursesSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  course_name: {
    type: String,
    required: true,
  },
  course_code: {
    type: String,
    required: true,
  },
  num_of_morning_slots: {
    type: Number,
    required: true,
  },
  num_of_evening_slots: {
    type: Number,
    required: true,
  },
});

export const Courses = mongoose.model("Courses", coursesSchema);
