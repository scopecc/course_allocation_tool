import XLSX from "xlsx";

function isValidNumber(value) {
  if (typeof(value) == "number"){
    return true;
  }
  if (typeof value === "string") {
    return /^[0-9]+$/.test(value.trim());
  }
  return false;
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
    if (!isValidNumber(row["No of FN Slot"]) || !isValidNumber(row["No of AN Slot"])){
      return null;
    }

    return {
      sNo: parseInt(row["S.No"]),
      year: row["Year"],
      stream: row["Stream"],
      courseCode: row["Course code"] || "",
      courseTitle: row["Course title"],
      numOfForenoonSlots: parseInt(row["No of FN Slot"] || "0"),
      numOfAfternoonSlots: parseInt(row["No of AN Slot"] || "0"),
      L: parseInt(row["L"] || "0"),
      T: parseInt(row["T"] || "0"),
      P: parseInt(row["P"] || "0"),
      J: parseInt(row["J"] || "0"),
      C: parseInt(row["C"] || "0"),
      courseHandlingSchool: row["Course Handling School"] || "",
    }
  })
  .filter((row) => row !== null);

  return parsed;
}

function extractFacultiesAndLoads(filepath) {
  const workbook = XLSX.readFile(filepath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const json = XLSX.utils.sheet_to_json(sheet, { defval: "", raw: false  });

  const parsed = json.map((row) => {
    row = sanitizeRow(row);
    if (!row["Name of the Faculty"] || !row["Emp Id"]){
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