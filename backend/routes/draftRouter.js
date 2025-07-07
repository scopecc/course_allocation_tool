import { Router } from "express";
import upload from "../utilities/saveToStorage.js";
import { draftControllers } from "../controllers/index.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const draftRouter = Router();

draftRouter.post('/',
  upload.fields([
    { name: "consolidatedFile", maxCount: 1 },
    { name: "loadFile", maxCount: 1 },
  ]),
  authMiddleware,
  draftControllers.createDraft
);

draftRouter.get('/', authMiddleware, draftControllers.getAllDrafts);

draftRouter.post('/export/:id', draftControllers.exportSheets);

draftRouter.get('/:id', authMiddleware, draftControllers.getDraftFromId);

draftRouter.delete('/:id', authMiddleware, draftControllers.deleteDraftById);

export default draftRouter;


