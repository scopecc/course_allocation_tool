import fs from "fs"

export function deleteFile(filePath) {
  fs.unlink(filePath, (err) => {
    if (err) {
      console.log(`Error while deleting ${filePath}: `, err);
    }
    console.log(`Deleted file ${filePath} successfully.`);
  })
}
