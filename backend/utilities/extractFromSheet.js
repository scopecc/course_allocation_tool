import XLSX from "xlsx";

function parseCleanNumber(value) {
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "string") {
    const noSpaces = value.replace(/\s+/g, "");
    if (noSpaces === "") return 0;
    if (/^[0-9]+$/.test(noSpaces)) return parseInt(noSpaces, 10);
  }
  return null;
}

function sanitizeRow(row) {
  const cleanedRow = {};
  Object.keys(row).forEach((key) => {
    const trimmedKey = key.trim();
    cleanedRow[trimmedKey] = row[key];
  });
  return cleanedRow;
}

function extractRecords(filePath) {
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const json = XLSX.utils.sheet_to_json(sheet, { defval: "", raw: false });

  const parsed = json.map((row) => {
    row = sanitizeRow(row);

    if (!row["S.No"] || !row["Course code"] || !row["Course title"]) {
      return null;
    }

    const fn = parseCleanNumber(row["No of FN Slot"]);
    const an = parseCleanNumber(row["No of AN Slot"]);

    if (fn == null || an == null) {
      return null;
    }


    return {
      sNo: parseInt(row["S.No"]),
      year: row["Year"],
      stream: row["Stream"],
      courseCode: row["Course code"] || "",
      courseTitle: row["Course title"],
      courseType: row["Course Type"] || "",
      numOfForenoonSlots: fn,
      numOfAfternoonSlots: an,
      L: parseInt(row["L"] || "0"),
      T: parseInt(row["T"] || "0"),
      P: parseInt(row["P"] || "0"),
      C: row["C"] || "0",
      courseHandlingSchool: row["Course Handling School"] || "",
      forenoonTeachers: [],
      afternoonTeachers: [],
    }
  })
    .filter((row) => row !== null);

  return parsed;
}

function extractFacultiesAndLoads(filepath) {
  const workbook = XLSX.readFile(filepath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const json = XLSX.utils.sheet_to_json(sheet, { defval: "", raw: false });

  const parsed = json.map((row) => {
    row = sanitizeRow(row);
    if (!row["Name of the Faculty"] || !row["Emp Id"]) {
      return null;
    }

    const load = row["Load"] || "";
    const parts = load.split("+");

    let loadL = 0;
    let loadT = 0;
    let loadPhD = 0;

    parts.forEach((part) => {
      if (part.includes("L")) loadL = parseInt(part.trim() || "0");
      if (part.includes("T")) loadT = parseInt(part.trim() || "0");
      if (part.includes("PhD")) loadPhD = 1;
    });

    return {
      name: row["Name of the Faculty"],
      employeeId: row["Emp Id"],
      prefix: row["Pfix"] || "Prof.",
      loadL,
      loadT,
      loadPhD,
    };
  })
    .filter((row) => row !== null);

  return parsed;
}

export { extractRecords, extractFacultiesAndLoads };
