// @ts-check
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

// ファイル名、対象のコメント、挿入したい文字列をオブジェクトで指定
const entries = [
  { file: "file1.php", comment: "comment1", insert: "insert1" },
  { file: "file2.php", comment: "comment2", insert: "insert2" },
  { file: "file3.php", comment: "comment3", insert: "insert3" },
];

entries.forEach(async (entry) => {
  const filePath = path.resolve(process.cwd(), entry.file);
  const fileContent = await fs.promises.readFile(filePath, "utf8");
  const lines = fileContent.split("\n");

  const newLines = lines.flatMap((line) =>
    line.includes(entry.comment) ? [line, entry.insert] : [line]
  );

  await fs.promises.writeFile(filePath, newLines.join("\n"), "utf8");
});
