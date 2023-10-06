// @ts-check
import Hashids from "hashids";
import { parseArgs } from "node:util";

const args = parseArgs({
  args: process.argv.slice(2),
  allowPositionals: true,
  options: {
    encode: {
      type: "boolean",
      short: "e",
    },
    decode: {
      type: "boolean",
      short: "d",
    },
    salt: {
      type: "string",
      short: "s",
      default: "",
    },
    length: {
      type: "string",
      short: "l",
      default: "0",
    },
    help: {
      type: "boolean",
      short: "h",
    },
  },
});

if (args.values.help) {
  console.log(`usage: command (-e|-d) [-s SALT -l MIN_LENGTH] (id)
    -e <encode>
    -d <decode>
    -s SALT (default: "")
    -l MIN_LENGTH (default: 0)`);
  process.exit(0);
}

const hashids = new Hashids(
  args.values.salt,
  parseInt(args.values.length ?? "0", 10)
);

if (args.values.encode) {
  console.log(hashids.encode(parseInt(args.positionals[0])));
} else if (args.values.decode) {
  console.log(hashids.decode(args.positionals[0]));
}
