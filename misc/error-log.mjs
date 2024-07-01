// 通常の Error オブジェクトでは JSON シリアライズ時に何も出力されないので、error を出力する必要あり
try {
  throw new Error("This is an error");
} catch (error) {
  console.error(error);
  console.error(
    `error.name = ${error.name}, error.message = ${error.message}, error.stack = ${error.stack}`
  );
  // ちなみに %j は util.format() で使われるフォーマット指定子で、node.js でしか使えない
  console.error("error with j: %j", error);
  console.error("error with json", JSON.stringify(error));
}

console.log("------");

// Error オブジェクトではない通常のオブジェクトを throw する例（これだとJSONシリアライズした時にもログが出せるが、非推奨）
try {
  throw { message: "This is an error" };
} catch (error) {
  console.error(error);
  console.error(
    `error.name = ${error.name}, error.message = ${error.message}, error.stack = ${error.stack}`
  );
  console.error("error with j: %j", error);
  console.error("error with json", JSON.stringify(error));
}

// console.log("------");

// try {
// jsconfig で target を esnext にする必要がある
//   throw new Error("This is an error", { cause: "unknown" });
// } catch (error) {
//   console.error(error);
//   console.error(
//     `error.name = ${error.name}, error.message = ${error.message}, error.stack = ${error.stack}`
//   );
//   console.error("error with j: %j", error);
//   console.error("error with json", JSON.stringify(error));
// }
