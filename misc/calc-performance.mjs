// Sample data in JSON format
const jsonData = [
  { "Memory Size": 256, Duration: 1571.59, "Init Duration": 403.28 },
  { "Memory Size": 256, Duration: 1661.91, "Init Duration": 487.78 },
  { "Memory Size": 256, Duration: 1020.0, "Init Duration": 0 },
  { "Memory Size": 512, Duration: 854.94, "Init Duration": 454.82 },
  { "Memory Size": 512, Duration: 688.88, "Init Duration": 0 },
  { "Memory Size": 512, Duration: 528.24, "Init Duration": 0 },
  { "Memory Size": 1024, Duration: 507.82, "Init Duration": 471.88 },
  { "Memory Size": 1024, Duration: 448.01, "Init Duration": 0 },
  { "Memory Size": 1024, Duration: 268.84, "Init Duration": 0 },
];

// Process the data to calculate processing duration
/**
 * @type {{[x: number]: number[]}}
 */
const memoryGroups = jsonData.reduce((acc, record) => {
  const memorySize = record["Memory Size"];
  const duration = record["Duration"];
  const initDuration = record["Init Duration"];
  const processingDuration = duration - (initDuration || 0);

  return {
    ...acc,
    [memorySize]: [...(acc[memorySize] || []), processingDuration],
  };
}, {});
console.log("Memory Groups:", memoryGroups);

// Calculate average processing duration for each memory size
/**
 * @type {{[x: number]: number}}
 */
const avgProcessingDuration = Object.keys(memoryGroups).reduce((acc, key) => {
  const memorySize = Number(key);
  const durations = memoryGroups[memorySize];
  const avgDuration =
    durations.reduce((sum, dur) => sum + dur, 0) / durations.length;
  return {
    ...acc,
    [memorySize]: avgDuration,
  };
}, {});

// Calculate performance improvement
const performance256to512 =
  ((avgProcessingDuration[256] - avgProcessingDuration[512]) /
    avgProcessingDuration[256]) *
  100;
const performance512to1024 =
  ((avgProcessingDuration[512] - avgProcessingDuration[1024]) /
    avgProcessingDuration[512]) *
  100;
console.log("Average Processing Duration:", avgProcessingDuration);
console.log(
  "Performance Improvement 256MB to 512MB:",
  performance256to512.toFixed(2),
  "%"
);
console.log(
  "Performance Improvement 512MB to 1024MB:",
  performance512to1024.toFixed(2),
  "%"
);
