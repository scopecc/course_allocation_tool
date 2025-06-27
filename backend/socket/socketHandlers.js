import { Draft } from "../models/draftSchema.js";   // weird bug that doesnt recognize index.js, look into this later

const socketHandlers = (io, socket) => {
  socket.on("joinDraft", (draftId) => {
    console.log(`New user joined ${draftId}`)
    socket.join("draftId")
  });

  socket.on("updateDraft", async ({ draftId, recordUpdates, facultyUpdates }) => {
    console.log("updates received: ", recordUpdates, facultyUpdates);
    const draft = await Draft.findById(draftId);

    if (!draftId) return;

    recordUpdates.forEach(({ recordId, field, value }) => {
      const record = draft.records.id(recordId);
      if (record) {
        record[field] = value;
      }
    });

    facultyUpdates.forEach(({ facultyId, field, value }) => {
      const faculty = draft.faculty.id(facultyId);
      if (faculty) {
        faculty[field] = value;
      }
    })

    await draft.save();
    socket.to(draftId).emit("draftUpdated", recordUpdates, facultyUpdates);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected: ", socket.id);
  });

};

export default socketHandlers;
