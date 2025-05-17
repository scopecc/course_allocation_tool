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
  orderInSlots: {
    type: Number,
    required: true,
  },
  slotType: {
    type: String,
  },
  theorySlot: {
    type: String,
  },
  labSlot: {
    type: String,
  },
});

export const CourseSlots = mongoose.model("CourseSlots", courseSlotsSchema);
