import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import fs from "node:fs";
import path from "node:path";

/**
 * Convert an Excel file to a PDF file.
 * @param {string} inputPath - The path to the input Excel file.
 * @param {string} outputPath - The path to save the output PDF file.
 * @returns {Promise<void>} - A promise that resolves when the conversion is complete.
 */
const convertExcelToPdf = async (inputPath, outputPath) => {
  // Excelファイルの読み込み
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(inputPath);

  // PDFドキュメントの作成
  const pdfDoc = new PDFDocument();
  pdfDoc.pipe(fs.createWriteStream(outputPath));

  // フォントとマージン設定
  const fontSize = 12;
  const topMargin = 20;
  const leftMargin = 20;
  pdfDoc.fontSize(fontSize);

  // Excelの各シートをPDFに変換
  workbook.eachSheet((worksheet) => {
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell, colNumber) => {
        const cellWidth = 100; // 列の幅を固定値に設定
        const cellHeight = fontSize + 10; // セルの高さを固定値に設定
        const x = leftMargin + (colNumber - 1) * cellWidth;
        const y = topMargin + (rowNumber - 1) * cellHeight;

        // セルの内容を描画
        pdfDoc.text(cell.text, x + 5, y + 5, {
          width: cellWidth - 10,
          height: cellHeight - 10,
        });

        // セルの罫線を描画
        pdfDoc.rect(x, y, cellWidth, cellHeight).stroke();
      });
    });
    pdfDoc.addPage();
  });

  // PDFの書き込みを終了
  pdfDoc.end();
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
