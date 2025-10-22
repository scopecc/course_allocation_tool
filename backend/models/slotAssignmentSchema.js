import mongoose from "mongoose";

const slotAssignmentSchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
  theorySlot: {
    type: String,
  },
  labSlot: {
    type: String,
  },
}, {_id: true});

// exporting as schema to embed in records
export default slotAssignmentSchema;
