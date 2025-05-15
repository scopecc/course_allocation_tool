import mongoose from "mongoose";

const courseSlotsSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Courses",
    required: true,
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teachers",
    required: true,
  },
  slotNumber: {
    type: String,
    required: true,
  },
  slotType: {
    type: String,
    required: true,
  },
});

export const CourseSlots = mongoose.model("CourseSlots", courseSlotsSchema);
