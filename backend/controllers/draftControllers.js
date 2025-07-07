import { Draft } from "../models/draftSchema.js";
import archiver from 'archiver';
import { extractRecords, extractFacultiesAndLoads } from "../utilities/extractFromSheet.js";
import { generateMainFile, generateAllocFile } from "../utilities/exportToSheet.js";

async function createDraft(req, res) {
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
    const records = extractRecords(consolidatedFile.path)
      .filter((row) => row !== null)
      .map((record) => ({
        ...record,
        forenoonTeachers: Array.from({ length: record.numOfForenoonSlots }, () => ({
          teacher: null,
          theorySlot: "",
          labSlot: "",
        })),
        afternoonTeachers: Array.from({ length: record.numOfAfternoonSlots }, () => ({
          teacher: null,
          theorySlot: "",
          labSlot: "",
        })),
      }));

    const newDraft = new Draft({
      name,
      consolidatedFileName: consolidatedFile.originalname,
      consolidatedFilePath: consolidatedFile.path,
      loadFileName: loadFile.originalname,
      loadFilePath: loadFile.path,
      records: records,
      recordCount: records.length,
      faculty: faculty,
      facultyCount: faculty.length,
    });

    const savedDraft = await newDraft.save();
    res.status(201).json({ draftId: savedDraft._id });
  } catch (error) {
    console.error("Error creating draft: ", error);
    res.status(500).json({ message: "Failed to create draft" });
  }
};


async function getAllDrafts(req, res) {
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
};

async function getDraftFromId(req, res) {
  try {
    const draft = await Draft.findById(req.params.id);
    if (!draft) {
      return res.status(404).json({ error: 'Draft not found!' });
    }
    return res.status(200).json({ draft: draft });
  } catch (error) {
    res.status(500).json({ error: 'API Error: Failed to fetch draft' });
  }
};

async function deleteDraftById(req, res) {
  try {
    const draft = await Draft.findById(req.params.id);
    if (!draft) {
      return res.status(404).json({ error: 'Draft not found! ' });
    }

    await draft.deleteOne();

    return res.status(200).json({ message: 'Draft deleted successfully.' });
  } catch (error) {
    console.error('Error while deleting draft: ', error);
    return res.status(500).json({ error: 'Server error while deleting draft.' });
  }

};

async function exportSheets(req, res) {
  const { selectedDept, mainFilename, allocationFilename } = req.body;
  try {
    const draftId = req.params.id;
    const draft = await Draft.findById(draftId)
      .populate('records.forenoonTeachers.teacher')
      .populate('records.afternoonTeachers.teacher');

    const mainFilePath = await generateMainFile(draftId, draft, selectedDept, mainFilename);
    const allocFilePath = await generateAllocFile(draftId, draft, allocationFilename);

    const archive = archiver('zip')

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=${mainFilename}-export.zip`);

    archive.pipe(res);
    archive.file(mainFilePath, { name: `${mainFilename}.xlsx` });
    archive.file(allocFilePath, { name: `${allocationFilename}.xlsx` });

    archive.finalize();

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to generate files' });
  }
}

export default {
  createDraft,
  getAllDrafts,
  getDraftFromId,
  deleteDraftById,
  exportSheets,
};
