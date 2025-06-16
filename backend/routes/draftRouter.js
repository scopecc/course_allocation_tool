import { Router } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { Draft } from "../models/draftSchema.js";
import { extractRecords, extractFacultiesAndLoads } from "../utilities/extractFromSheet.js";
import { fileURLToPath } from "url";

const draftRouter = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadFolder = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadFolder);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

draftRouter.post('/',
  upload.fields([
    { name: "consolidatedFile", maxCount: 1 },
    { name: "loadFile", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { name } = req.body;
      const consolidatedFile = req.files["consolidatedFile"]?.[0];
      const loadFile = req.files["loadFile"]?.[0];

      if (!name || !consolidatedFile || !loadFile) {
        if (consolidatedFile) fs.unlinkSync(consolidatedFile.path);
        if (loadFile) fs.unlinkSync(loadFile.path);
        return res.status(400).json({ message: "Missing name or files" });
      }

      const faculty = extractFacultiesAndLoads(loadFile.path).filter((row) => row !== null);
      const records = extractRecords(consolidatedFile.path).filter((row) => row !== null);
      const newDraft = new Draft({
        name,
        consolidatedFileName: consolidatedFile.originalname,
        consolidatedFilePath: consolidatedFile.path,
        loadFileName: loadFile.originalname,
        loadFilePath: loadFile.path,
        records: records,
        faculty: faculty,
      });

      const savedDraft = await newDraft.save();
      res.status(201).json({ draftId: savedDraft._id });
    } catch (error) {
      console.error("Error creating draft: ", error);
      res.status(500).json({ message: "Failed to create draft" });
    }
  }
);


draftRouter.get('/', async (req, res) => {
  try {
    const drafts = await Draft.find({}, 'name creationDate consolidatedFileName loadFileName records faculty');
    const summary = drafts.map(d => ({
      _id: d._id,
      name: d.name,
      creationDate: d.creationDate,
      consolidatedFileName: d.consolidatedFileName,
      loadFileName: d.loadFileName,
      recordCount: d.records.length,
      facultyCount: d.faculty.length, 
    }));
    res.status(200).json(summary);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch drafts' });
  }
});

export default draftRouter;


