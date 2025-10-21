import { Draft } from "../models/draftSchema.js";   // weird bug that doesnt recognize index.js, look into this later

const socketHandlers = (io, socket) => {

  socket.on("joinDraft", (draftId) => {
    console.log(`New user joined draft ${draftId} with id ${socket.id}`);
    socket.join(draftId);
    console.log(io.sockets.adapter.rooms.get(draftId));
  });

  socket.on("teacherUpdate", async ({ senderSocketId, senderDraftId, recordId, recordP, slotType, index, newTeacherId }) => {
    console.log("teacher updates received: ", newTeacherId, " from: ", senderSocketId);
    const draft = await Draft.findById(senderDraftId);

    if (!draft) {
      console.log('Error: Draft does not exist!');
      return;
    }

    // find record and update teacher for course
    const record = draft.records.find((r) => r._id.toString() === recordId);
    if (!record) return;

    let oldTeacherId = null;

    if (slotType === 'fn') {
      oldTeacherId = record.forenoonTeachers[index].teacher?.toString();
      record.forenoonTeachers[index].teacher = newTeacherId;
    } else if (slotType === 'an') {
      const teacherObj = record.afternoonTeachers[index];
      oldTeacherId = teacherObj?.teacher?.toString() || null;
      record.afternoonTeachers[index].teacher = newTeacherId;
    }

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

    const newFaculty = draft.faculty.find((fac) => fac._id.toString() === newTeacherId);
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
      index,
      newTeacherId
    });
  });

  socket.on("slotUpdate", async ({ senderSocketId, senderDraftId, recordId, slotType, index, field, newSelection }) => {
    console.log("slot updates received: ", newSelection);
    const draft = await Draft.findById(senderDraftId);

    if (!draft) {
      console.log('Error: Draft does not exist!');
      return;
    }

    const record = draft.records.find((record) => record._id.toString() === recordId);
    if (!record) return;

    if (field === 'theorySlot') {
      for (let i = 0; i < record.forenoonTeachers.length; ++i) {
        record.forenoonTeachers[i].theorySlot = newSelection;
      }

      const updatedValue = newSelection.replaceAll('1', '2');
      for (let i = 0; i < record.afternoonTeachers.length; ++i) {
        record.afternoonTeachers[i].theorySlot = updatedValue;
      }

    } else if (field === 'labSlot') {
      const teacherList = slotType === "fn" ? record.forenoonTeachers : record.afternoonTeachers;
      if (teacherList[index]) {
        teacherList[index].labSlot = newSelection;
      } else {
        console.log('Error: Draft not initialized properly.');
        return;
      }

      if (slotType === 'fn') {
        record.forenoonTeachers = teacherList;
      } else if (slotType === 'an') {
        record.afternoonTeachers = teacherList;
      }
    }

    await draft.save();

    socket.to(senderDraftId).emit("slotUpdated", {
      senderSocketId,
      senderDraftId,
      recordId,
      slotType,
      index,
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

  socket.on("removeSlot", async({ senderSocketId, senderDraftId, recordId, slotType, key }) => {
    console.log("Removing slot:", { senderDraftId, recordId, slotType});

    try {
      const draft = await Draft.findById(senderDraftId);
      if (!draft) return;

      const record = draft.records.find(r => r._id.toString() === recordId);
      if (!record) return;

      if (slotType === "fn") {
        record.forenoonTeachers.splice(key, 1);
        record.numOfForenoonSlots -= 1
      } else if (slotType === "an") {
        record.afternoonTeachers.splice(key, 1);
        record.numOfAfternoonSlots -= 1
      }

      await draft.save();

      socket.to(senderDraftId).emit("slotRemoved", {
        senderSocketId,
        senderDraftId,
        recordId,
        slotType,
        key,
      });
    } catch (err) {
      console.error("Error removing slot:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected: ", socket.id);
  });

};


export default socketHandlers;
