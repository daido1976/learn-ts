import { execSync } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";

/**
 * Convert an Excel file to a PDF file.
 * @param {string} inputPath - The path to the input Excel file.
 * @param {string} outputPath - The path to save the output PDF file.
 * @returns {Promise<void>} - A promise that resolves when the conversion is complete.
 */
const convertExcelToPdf = async (inputPath, outputPath) => {
  try {
    // Check if the input file exists
    await fs.access(inputPath);

    // Construct the command to run LibreOffice in headless mode
    const command = `soffice --headless --convert-to pdf --outdir ${path.dirname(
      outputPath
    )} ${inputPath}`;

    // Execute the command
    const result = execSync(command, { encoding: "utf-8" });

    console.log(result);

    // Verify if the output file has been created
    await fs.access(outputPath);

    console.log(`Conversion successful: ${outputPath}`);
  } catch (error) {
    console.error(`Error during conversion: ${error.message}`);
    throw error;
  }
};

// コマンドライン引数の処理
const args = process.argv.slice(2);
const inputPath = args[0];

if (!inputPath) {
  console.error("Error: inputPath is required");
  process.exit(1);
}

// 出力パスが指定されていない場合は、現在のディレクトリに保存
const outputPath =
  args[1] || path.join(process.cwd(), `${path.parse(inputPath).name}.pdf`);

try {
  await convertExcelToPdf(inputPath, outputPath);
  console.log("Excel to PDF conversion complete!");
} catch (error) {
  console.error("Error converting Excel to PDF:", error);
}
