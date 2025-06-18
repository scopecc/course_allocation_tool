import { Router } from "express";
import upload from "../utilities/saveToStorage.js";
import { draftControllers } from "../controllers/index.js";

const draftRouter = Router();

draftRouter.post('/',
  upload.fields([
    { name: "consolidatedFile", maxCount: 1 },
    { name: "loadFile", maxCount: 1 },
  ]),
  draftControllers.createDraft 
);

draftRouter.get('/', draftControllers.getAllDrafts);

draftRouter.get('/:id', draftControllers.getDraftFromId);

export default draftRouter;


