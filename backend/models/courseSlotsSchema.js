import mongoose from "mongoose";

const courseSlotsSchema = new mongoose.Schema({
  course_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Courses",
    required: true,
  },
  teacher_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teachers",
    required: true,
  },
  slot_number: {
    type: String,
    required: true,
  },
  slot_type: {
    type: String,
    required: true,
  },
});

export const CourseSlots = mongoose.model("CourseSlots", courseSlotsSchema);
