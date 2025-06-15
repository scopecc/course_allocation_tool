import mongoose from "mongoose";

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
  fileNameConsolidated: {
    type: String,
  },
  filePathConsolidated: {
    type: String,
  },
  fileNameLoad: {
    type: String,
  },
  filePathLoad: {
    type: String,
  }
})

export const Drafts = mongoose.model("Drafts", draftSchema);