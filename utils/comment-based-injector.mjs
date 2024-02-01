// @ts-check
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

// ファイル名、対象のコメント、挿入したい文字列をオブジェクトで指定
const entries = [
  {
    file: "your/file/path",
    pairs: [
      {
        comment: "comment",
        insert: "inserted text",
      },
    ],
  },
];

entries.forEach((entry) => {
  const filePath = path.resolve(process.cwd(), entry.file);
  const fileContent = fs.readFileSync(filePath, "utf8");
  const lines = fileContent.split("\n");

  const newLines = lines.flatMap((line) => {
    const pair = entry.pairs.find((pair) => line.includes(pair.comment));
    return pair ? [line, pair.insert] : [line];
  });

  fs.writeFileSync(filePath, newLines.join("\n"), "utf8");
});
