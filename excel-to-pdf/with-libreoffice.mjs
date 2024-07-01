// require: $ brew install --cask libreoffice
import { execSync } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";

/**
 * Convert an Excel file to a PDF file.
 * @param {string} inputPath - The path to the input Excel file.
 * @param {string} outputDir - The directory to save the output PDF file.
 * @returns {Promise<void>} - A promise that resolves when the conversion is complete.
 */
const convertExcelToPdf = async (inputPath, outputDir) => {
  try {
    // Check if the input file exists
    await fs.access(inputPath);

    // Construct the command to run LibreOffice in headless mode
    const command = `soffice --headless --convert-to pdf --outdir ${outputDir} ${inputPath}`;

    // Execute the command
    const result = execSync(command, { encoding: "utf-8" });

    console.log(result);

    // Verify if the output file has been created
    const outputPath = path.join(
      outputDir,
      `${path.parse(inputPath).name}.pdf`
    );
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
const outputDir = args[1] || process.cwd();

if (!inputPath || !outputDir) {
  console.error("Error: inputPath and outputDir are required");
  process.exit(1);
}

try {
  await convertExcelToPdf(inputPath, outputDir);
  console.log("Excel to PDF conversion complete!");
} catch (error) {
  console.error("Error converting Excel to PDF:", error);
}
