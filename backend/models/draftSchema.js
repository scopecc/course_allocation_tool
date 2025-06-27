import mongoose from "mongoose";
import recordSchema from "./recordSchema.js";
import teachersSchema from "./teachersSchema.js";

const draftSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  creationDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  consolidatedFileName: {
    type: String,
    required: true,
  },
  consolidatedFilePath: {
    type: String,
    required: true,
  },
  loadFileName: {
    type: String,
    required: true,
  },
  loadFilePath: {
    type: String,
    required: true,
  },
  records: {
    type: [recordSchema],
  },
  faculty: {
    type: [teachersSchema],
  },
});

export const Draft = mongoose.model("Draft", draftSchema);
