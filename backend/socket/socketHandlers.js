import { Draft } from "../models/draftSchema.js";   // weird bug that doesnt recognize index.js, look into this later
import { Types } from "mongoose";

const socketHandlers = (io, socket) => {

  socket.on("joinDraft", (draftId) => {
    console.log(`New user joined draft ${draftId} with id ${socket.id}`);
    socket.join(draftId);
    console.log(io.sockets.adapter.rooms.get(draftId));
  });

  socket.on("teacherUpdate", async ({ senderSocketId, senderDraftId, recordId, recordP, slotType, id, newTeacherId }) => {
    console.log("teacher updates received: ", newTeacherId, " from: ", senderSocketId, "with id: ", id);
    const draft = await Draft.findById(senderDraftId);
    if (!draft) {
      console.log('Error: Draft does not exist.');
      return;
    }

    // find record and update teacher for course
    const record = draft.records.id(recordId);
    if (!record) return;

    let slot;
    if (slotType === "fn") {
      slot = record.forenoonTeachers.id(id);
    } else if (slotType === "an") {
      slot = record.afternoonTeachers.id(id);
    }
    if (!slot) return;

    let oldTeacherId = slot.teacher;
    slot.teacher = newTeacherId;

    // find teacher and update teacher's load values
    if (oldTeacherId) {
      const oldFaculty = draft.faculty.find((fac) => fac._id.toString() === oldTeacherId);
      if (oldFaculty) {
        oldFaculty.loadedT = Math.max(0, oldFaculty.loadedT - 1);
        if (recordP > 0) {
          oldFaculty.loadedL = Math.max(0, oldFaculty.loadedL - 1);
        }
      }
    }

    const newFaculty = slot.teacher;
    if (newFaculty) {
      newFaculty.loadedT += 1;
      if (recordP > 0) {
        newFaculty.loadedL += 1;
      }
    }

    await draft.save();

    socket.to(senderDraftId).emit("teacherUpdated", {
      senderSocketId,
      senderDraftId,
      recordId,
      recordP,
      slotType,
      id,
      newTeacherId
    });
  });

  socket.on("slotUpdate", async ({ senderSocketId, senderDraftId, recordId, slotType, id, field, newSelection }) => {
    console.log("slot updates received: ", newSelection);
    const draft = await Draft.findById(senderDraftId);

    if (!draft) {
      console.log('Error: Draft does not exist!');
      return;
    }

    const record = draft.records.id(recordId);
    if (!record) return;

    if (field === "theorySlot") {
      // Update theorySlot for ALL slots (FN + AN)
      record.forenoonTeachers.forEach((slot) => {
        slot.theorySlot = newSelection;
      })
      const updatedValue = newSelection.replaceAll('1', '2');
      record.afternoonTeachers.forEach((slot) => {
        slot.theorySlot = updatedValue;
      })
    } else if (field === "labSlot") {
      // Update only this specific slot
      let slot;
      if (slotType === "fn"){
        slot = record.forenoonTeachers.id(id);
      } else if (slotType === "an"){
        slot = record.afternoonTeachers.id(id);
      }
      if (slot) slot.labSlot = newSelection;
    }

    await draft.save();

    socket.to(senderDraftId).emit("slotUpdated", {
      senderSocketId,
      senderDraftId,
      recordId,
      slotType,
      id,
      field,
      newSelection,
    });
  });

  socket.on("addSlot", async ({ senderSocketId, senderDraftId, recordId, slotType }) => {
    console.log("Adding a new slot: ", { senderDraftId, recordId, slotType });
    try {
      const draft = await Draft.findById(senderDraftId);
      if (!draft) return;

      const record = draft.records.find(r => r._id.toString() === recordId);
      if (!record) return;

      if (slotType === "fn") {
        record.numOfForenoonSlots += 1;
        record.forenoonTeachers.push({ teacher: null, theorySlot: "", labSlot: "" });
      } else if (slotType === "an") {
        record.numOfAfternoonSlots += 1;
        record.afternoonTeachers.push({ teacher: null, theorySlot: "", labSlot: "" });
      } else {
        return;
      }

      await draft.save();

      socket.to(senderDraftId).emit("slotAdded", {
        senderSocketId,
        senderDraftId,
        recordId,
        slotType,
      });
    } catch (err) {
      console.error(err);
    }
  });

  socket.on("removeSlot", async({ senderSocketId, senderDraftId, recordId, slotType, id }) => {
    console.log("Removing slot:", { senderDraftId, recordId, slotType});

    try {
      const draft = await Draft.findById(senderDraftId);
      if (!draft) return;

      const record = draft.records.find(r => r._id.toString() === recordId);
      if (!record) return;

      if (slotType === "fn") {
        record.forenoonTeachers.id(id)?.deleteOne();
        record.numOfForenoonSlots -= 1;
      } else if (slotType === "an") {
        record.afternoonTeachers.id(id)?.deleteOne();
        record.numOfAfternoonSlots -= 1;
      }

      await draft.save();

      socket.to(senderDraftId).emit("slotRemoved", {
        senderSocketId,
        senderDraftId,
        recordId,
        slotType,
        id,
      });
    } catch (err) {
      console.error("Error removing slot:", err);
    }
  });

  socket.on("createCourse", async({ senderSocketId, senderDraftId, newCourseData }) => {
    console.log("Creating course:", { senderDraftId, newCourseData });

    try {
      const draft = await Draft.findById(senderDraftId);
      if (!draft) return;

      const newRecord = ({
        sNo: Number(newCourseData.sNo),
        year: newCourseData.year,
        courseTitle: newCourseData.courseTitle,
        courseCode: newCourseData.courseCode,
        stream: newCourseData.stream,
        courseHandlingSchool: newCourseData.courseHandlingSchool,
        L: Number(newCourseData.L),
        P: Number(newCourseData.P),
        T: Number(newCourseData.T),
        C: Number(newCourseData.C),
        numOfForenoonSlots: Number(newCourseData.numOfForenoonSlots),
        numOfAfternoonSlots: Number(newCourseData.numOfAfternoonSlots),
        forenoonTeachers: Array.from({ length: Number(newCourseData.numOfForenoonSlots) }, () => ({
          _id: new Types.ObjectId(),
          teacher: null,
          theorySlot: "",
          labSlot: "",
        })),
        afternoonTeachers: Array.from({ length: Number(newCourseData.numOfAfternoonSlots) }, () => ({
          _id: new Types.ObjectId(),
          teacher: null,
          theorySlot: "",
          labSlot: "",
        })),
      })

      draft.records.push(newRecord);
      await draft.save();

      socket.to(senderDraftId).emit("courseCreated", {
        senderSocketId,
        senderDraftId,
        newRecord,
      });
    } catch (err) {
      console.error("Error creating course:", err);
    }
  });

  socket.on("deleteCourse", async ({ senderSocketId, senderDraftId, recordId }) => {
    console.log("Deleting course:", { senderDraftId, recordId });

    try {
      const draft = await Draft.findById(senderDraftId);
      if (!draft) return;

      const record = draft.records.id(recordId);
      if (!record) return;

      const teachersInRecord = [
        ...record.forenoonTeachers,
        ...record.afternoonTeachers,
      ];

      for (const slot of teachersInRecord) {
        if (slot.teacher) {
          const teacherId = slot.teacher.toString();
          const facultyMember = draft.faculty.find(
            (fac) => fac._id.toString() === teacherId
          );
          if (facultyMember) {
            facultyMember.loadedT = Math.max(0, facultyMember.loadedT - 1);
            if (record.P > 0) {
              facultyMember.loadedL = Math.max(0, facultyMember.loadedL - 1);
            }
          }
        }
      }

      record.deleteOne();

      await draft.save();

      io.in(senderDraftId).emit("courseDeleted", {
        senderSocketId,
        senderDraftId,
        recordId,
      });
    } catch (err) {
      console.error("Error deleting course:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected: ", socket.id);
  });

};


export default socketHandlers;
