import { Draft } from "../models/draftSchema.js";   // weird bug that doesnt recognize index.js, look into this later

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

  socket.on("disconnect", () => {
    console.log("Client disconnected: ", socket.id);
  });

};


export default socketHandlers;
