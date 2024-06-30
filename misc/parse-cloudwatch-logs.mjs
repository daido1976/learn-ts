import { writeFileSync } from "node:fs";
import { parseArgs } from "node:util";

// Labmda@Edge log data string retrieved by CloudWatch Logs
const logData = `
REPORT RequestId: 9c301e6d-41c2-41f2-8c1c-2150ef50a32b	Duration: 1571.59 ms	Billed Duration: 1572 ms	Memory Size: 256 MB	Max Memory Used: 115 MB	Init Duration: 403.28 ms
REPORT RequestId: ecd189d0-bca8-470d-b567-fa386315b93e	Duration: 1661.91 ms	Billed Duration: 1662 ms	Memory Size: 256 MB	Max Memory Used: 115 MB	Init Duration: 487.78 ms
REPORT RequestId: c2f2e5f3-2321-4049-9ee9-315c801fa2cc	Duration: 1020.00 ms	Billed Duration: 1020 ms	Memory Size: 256 MB	Max Memory Used: 118 MB
REPORT RequestId: 565ed356-1d1c-4a83-a252-06a75b6e197e	Duration: 854.94 ms	Billed Duration: 855 ms	Memory Size: 512 MB	Max Memory Used: 115 MB	Init Duration: 454.82 ms
REPORT RequestId: 3599f29b-5d56-4180-abc1-0bd045b98086	Duration: 688.88 ms	Billed Duration: 689 ms	Memory Size: 512 MB	Max Memory Used: 118 MB
REPORT RequestId: b334e159-0074-41fb-89f2-4f31d5fca431	Duration: 528.24 ms	Billed Duration: 529 ms	Memory Size: 512 MB	Max Memory Used: 118 MB
REPORT RequestId: 1ea18ca0-ac08-4949-9b84-7f54a41ad4cd	Duration: 507.82 ms	Billed Duration: 508 ms	Memory Size: 1024 MB	Max Memory Used: 117 MB	Init Duration: 471.88 ms
REPORT RequestId: c144063f-9cb9-4897-9836-87dc010639fe	Duration: 448.01 ms	Billed Duration: 449 ms	Memory Size: 1024 MB	Max Memory Used: 120 MB
REPORT RequestId: 2498c3b4-b850-40d3-9168-5e06782b38aa	Duration: 268.84 ms	Billed Duration: 269 ms	Memory Size: 1024 MB	Max Memory Used: 151 MB
`;

// Parse log data into an array of objects
const logEntries = logData
  .trim()
  .split("\n")
  .map((line) => {
    const parts = line.split("\t");

    const durationPart = parts.find((part) => part.includes("Duration"));
    const memorySizePart = parts.find((part) => part.includes("Memory Size"));
    const initDurationPart = parts.find((part) =>
      part.includes("Init Duration")
    );

    if (!durationPart || !memorySizePart) {
      throw new Error("Log line is missing required parts");
    }

    const duration = parseFloat(durationPart.split(" ")[1]);
    const memorySize = parseInt(memorySizePart.split(" ")[2]);
    const initDuration = initDurationPart
      ? parseFloat(initDurationPart.split(" ")[2])
      : 0;

    return { memorySize, duration, initDuration };
  });

// Convert to CSV format
const csvData = [
  "Memory Size,Duration,Init Duration",
  ...logEntries.map(
    (entry) => `${entry.memorySize},${entry.duration},${entry.initDuration}`
  ),
].join("\n");

// Convert to JSON format
const jsonData = JSON.stringify(logEntries, null, 2);

// Command line arguments using parseArgs
const {
  values: { file: outputFile, json: outputJson, help: showHelp },
} = parseArgs({
  options: {
    file: {
      type: "string",
      short: "f",
    },
    json: {
      type: "boolean",
      short: "j",
    },
    help: {
      type: "boolean",
      short: "h",
    },
  },
});

if (showHelp) {
  console.log(`Usage:
  -f, --file <outputFile>  Write data to a file (supports .csv and .json)
  -j, --json               Output data in JSON format to stdout
  -h, --help               Show this help message
  If no option is provided, the data is output in CSV format to stdout.`);
} else if (outputFile) {
  // Determine file extension
  const extension = outputFile.split(".").pop();

  if (extension === "csv") {
    // Write CSV data to a file
    writeFileSync(outputFile, csvData);
    console.log(`CSV file has been created at ${outputFile}.`);
  } else if (extension === "json") {
    // Write JSON data to a file
    writeFileSync(outputFile, jsonData);
    console.log(`JSON file has been created at ${outputFile}.`);
  } else {
    console.error("Unsupported file type. Please use .csv or .json.");
  }
} else {
  // Output format defaults to CSV if no file is specified
  if (outputJson) {
    console.log(jsonData);
  } else {
    console.log(csvData);
  }
}
