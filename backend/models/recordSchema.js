import mongoose from "mongoose"

const recordSchema = new mongoose.Schema({
  sNo: {
    type: Number,
    required: true,
  },
  year: {
    type: String,
    required: true,
  },
  stream: {
    type: String,
    required: true,
  },
  courseCode: {
    type: String,
    required: true,
  },
  courseTitle: {
    type: String,
    required: true,
  },
  numOfForenoonSlots: {
    type: Number,
    required: true,
    default: 0,
  },
  forenoonTeachers: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' }],
  },
  numOfAfternoonSlots: {
    type: Number,
    required: true,
    default: 0,
  },
  afternoonTeachers: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' }],
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
  C: {
    type: String,
    required: true,
    default: "0",
  },
  courseHandlingSchool: {
    type: String,
    default: "SCOPE",
  },
  theorySlot: {
    type: String,
    required: true,
    default: ""
  },
  labSlots: {
    type: [
      {
        teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' },
        labSlot: String,
      },
    ],
    required: function () {
      return this.L > 0;
    },
    default: [],
  }
});

// exporting as schema to embed in drafts
export default recordSchema; 
