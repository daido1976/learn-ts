import sharp from "sharp";
import path from "node:path";

const args = process.argv.slice(2);
const inputPath = args[0];
if (!inputPath) {
  console.error("Usage: node resize.js <inputPath> [outputPath]");
  process.exit(1);
}

// 出力パスが指定されていない場合は、現在のディレクトリに保存（ファイル名は inputPath のものを利用）
const outputPath =
  args[1] || path.join(process.cwd(), path.basename(inputPath));

try {
  await sharp(inputPath, { animated: true }).resize(150).toFile(outputPath);
  console.log(`Image resized and saved to ${outputPath}`);
} catch (err) {
  console.error("Error resizing image:", err);
}
