import XLSX from "xlsx";
import ExcelJS from "exceljs";
import path from "path";
import fs from "fs";

function getYearLabel(batchYear) {
  const currentYear = new Date().getFullYear();
  const diff = currentYear - batchYear;
  if (diff === 0) return "I Year";
  if (diff === 1) return "II Year";
  if (diff === 2) return "III Year";
  if (diff === 3) return "IV Year";
  return `${diff + 1} Year`;
}

function getTeacherNameById(facultyList, teacherId) {
  if (!teacherId) return "";
  const teacher = facultyList.find(
    (t) => t._id.toString() === teacherId.toString(),
  );
  return teacher
    ? `${teacher.employeeId} ${teacher.prefix} ${teacher.name}`.trim()
    : "";
}

function autoSizeColumns(worksheet, maxColumnCount = 150) {
  if (!worksheet || !worksheet.columns) {
    console.warn("Worksheet is not loaded properly.");
    return;
  }

  worksheet.columns.slice(0, maxColumnCount).forEach((column, colIndex) => {
    if (!column) return;

    let maxLength = 10;
    let totalLength = 0;
    let count = 0;

    try {
      column.eachCell({ includeEmpty: false }, (cell) => {
        cell.alignment = { wrapText: true };
        const cellValue = cell.value?.toString();
        if (cellValue) {
          const length = cellValue.length;
          maxLength = Math.max(maxLength, length);
          totalLength += length;
          count++;
        }
      });

      const avgLength = count > 0 ? totalLength / count : 10;
      column.width = Math.min(Math.ceil(avgLength + 2), 40); // cap width to prevent OOM
    } catch (err) {
      console.error(`Column ${colIndex} failed:`, err);
      column.width = 15;
    }
  });
}

async function generateMainFile(draftId, draft, selectedDept, mainFilename) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Allotment");

  worksheet.addRow([
    "S.No.",
    "Year",
    "Stream",
    "Course Type",
    "Course Title",
    "Course Code",
    "L",
    "T",
    "P",
    "C",
    "Course Handling School",
    "FN",
    "AN",
    "Total Slots",
    "Remarks",
    "SLOT",
    "FACULTY",
  ]);

  worksheet.views = [
    {
      state: "frozen",
      ySplit: 1,
    },
  ];

  let serial = 1;
  let currentYear = null;
  let separatorIndexes = [];

  console.log("selectedDept: ", selectedDept);
  const filteredRecords = draft.records
    .filter((record) => record.stream === selectedDept)
    .sort((a, b) => a.year - b.year);

  for (const record of filteredRecords) {
    const yearLabel = getYearLabel(parseInt(record.year));
    const isNewYear = currentYear !== record.year;
    currentYear = record.year;

    if (isNewYear && currentYear !== null) {
      const separatorRow = worksheet.addRow(new Array(25).fill(" "));

      separatorIndexes.push(serial);

      separatorRow.height = 15;
      separatorRow.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFF99" }, //TODO: let the user choose the color
        };
        cell.border = {};
        cell.font = { color: { argb: "FFFFFF" }, size: 1 }; // make text invisible for the separator row
      });
    }

    const baseRow = worksheet.addRow([
      serial++,
      isNewYear ? yearLabel : "",
      isNewYear ? record.stream : "",
      record.courseType || "",
      record.courseTitle,
      record.courseCode,
      record.L || "",
      record.T || "",
      record.P || "",
      record.C || "",
      record.courseHandlingSchool,
      record.numOfForenoonSlots,
      record.numOfAfternoonSlots,
      record.numOfForenoonSlots + record.numOfAfternoonSlots,
      "", // remarks empty
    ]);

    const baseColStart = 16; // because 16 rows before

    // FORENOON TEACHERS
    const numOfForenoonTeachers = record.forenoonTeachers.length;
    const forenoonNameRow = worksheet.addRow([]);
    const forenoonTheoryRow = worksheet.addRow([]);
    const forenoonLabRow = worksheet.addRow([]);

    for (let i = 0; i < numOfForenoonTeachers; ++i) {
      const teacher = record.forenoonTeachers[i];
      const baseIndex = baseColStart + 1 + i;

      const tname = getTeacherNameById(draft.faculty, teacher.teacher);
      forenoonNameRow.getCell(baseIndex).value = tname;
      forenoonTheoryRow.getCell(baseIndex).value = teacher.theorySlot || "";
      forenoonLabRow.getCell(baseIndex).value = teacher.labSlot || "";
    }

    // AFTERNOON TEACHERS
    const numOfAfternoonTeachers = record.afternoonTeachers.length;
    const afternoonNameRow = worksheet.addRow([]);
    const afternoonTheoryRow = worksheet.addRow([]);
    const afternoonLabRow = worksheet.addRow([]);

    for (let i = 0; i < numOfAfternoonTeachers; ++i) {
      const teacher = record.afternoonTeachers[i];
      const baseIndex = baseColStart + 1 + i;

      afternoonNameRow.getCell(baseIndex).value = getTeacherNameById(
        draft.faculty,
        teacher.teacher,
      );
      afternoonTheoryRow.getCell(baseIndex).value = teacher.theorySlot || "";
      afternoonLabRow.getCell(baseIndex).value = teacher.labSlot || "";
    }
  }

  // change default font size to 15, add borders to all cells
  worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
    if (rowNumber in separatorIndexes) return;

    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.alignment = {
        wrapText: true,
      };

      cell.font = {
        name: "Times New Roman",
        size: 12,
        bold: false,
      };

      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
  });

  // make the first row big and bold
  worksheet.getRow(1).font = {
    name: "Times New Roman",
    bold: true,
    size: 15,
  };

  autoSizeColumns(worksheet);

  const exportDir = path.join("exports", draftId);
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
  }

  const filePath = path.join(exportDir, `${mainFilename}.xlsx`);
  await workbook.xlsx.writeFile(filePath);

  return filePath;
}

async function generateAllocFile(draftId, draft, allocFilename) {
  const workbook = new ExcelJS.Workbook();
  const filePath = path.resolve(draft.loadFilePath);
  await workbook.xlsx.readFile(filePath);
  console.log(
    "Allocation Workbook loaded. Sheets:",
    workbook.worksheets.map((ws) => ws.name),
  );
  const worksheet = workbook.getWorksheet(1);
  if (!worksheet) {
    console.error("Worksheet not found!");
    return;
  }

  const facultyMap = {};
  draft.faculty.forEach((teacher) => {
    facultyMap[teacher._id.toString()] = teacher;
  });

  const teacherCourseMap = {};

  draft.records.forEach((record) => {
    const addAssignment = (teacherObj) => {
      const teacherId = teacherObj.teacher?.toString();
      if (!teacherId || !facultyMap[teacherId]) return;

      if (!teacherCourseMap[teacherId]) {
        teacherCourseMap[teacherId] = [];
      }

      teacherCourseMap[teacherId].push({
        program: `${record.year.slice(-2)}${record.stream.slice(-3)} `,
        course: `${record.courseCode} - ${record.courseTitle}`,
        slot: [teacherObj.theorySlot, teacherObj.labSlot]
          .filter(Boolean)
          .join(" + "),
        loadedT: facultyMap[teacherObj.teacher.toString()].loadedT,
        loadedL: facultyMap[teacherObj.teacher.toString()].loadedL,
      });
    };

    record.forenoonTeachers.forEach(addAssignment);
    record.afternoonTeachers.forEach(addAssignment);
  });

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) {
      return;
    }
    const empId = row.getCell(2).value?.toString().trim();
    const teacher = draft.faculty.find((t) => t.employeeId === empId);
    if (!teacher) return;

    const assignments = teacherCourseMap[teacher._id.toString()] || [];

    let colStart = 9; // after remark column
    assignments.forEach((a) => {
      row.getCell(colStart).value = `${a.loadedT}T + ${a.loadedL}L`;
      row.getCell(colStart + 1).value = a.program;
      row.getCell(colStart + 2).value = a.course;
      row.getCell(colStart + 3).value = a.slot;

      colStart += 4;
    });
  });

  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.alignment = {
        wrapText: true,
      };

      cell.border = {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      };
    });
  });

  console.log("autosizing columns");
  autoSizeColumns(worksheet);

  const exportDir = path.join("exports", draftId);
  console.log("exporting file...");
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
  }

  const outputPath = path.join(exportDir, `${allocFilename}.xlsx`);
  await workbook.xlsx.writeFile(outputPath);
  console.log("exported");

  return outputPath;
}

export { generateAllocFile, generateMainFile };
