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
  prefix: {
    type: String,
    required: true,
    enum: ["Mr.", "Mrs.", "Ms.", "Prof.", "Dr.", ""],
    default: "",
  },
  loadL: {
    type: Number,
    required: true,
    default: 0,
  },
  loadT: {
    type: Number,
    required: true,
    default: 0,
  },
  loadedL: {
    type: Number,
    required: true,
    default: 0,
  },
  loadedT: {
    type: Number,
    required: true,
    default: 0,
  },
  loadPhd: {
    type: Number,
    required: true,
    default: 0,
  },
  loadedPhd: {
    type: Number,
    required: true,
    default: 0,
  },
});

export default teachersSchema;
