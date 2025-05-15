import mongoose from "mongoose";

const teachersSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  employeeId: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
    enum: ["teacher", "admin"],
    default: "teacher",
  },
});

export const Teachers = mongoose.model("Teachers", teachersSchema);
