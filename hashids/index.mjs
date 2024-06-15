import Hashids from "hashids";
import { parseArgs } from "node:util";

const args = parseArgs({
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
  console.log(`usage: command (-e|-d) [-s SALT -l MIN_LENGTH] (hashid|int)
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
const hashidOrInt = args.positionals[0];

if (args.values.encode) {
  console.log(hashids.encode(parseInt(hashidOrInt)));
} else if (args.values.decode) {
  console.log(hashids.decode(hashidOrInt));
}
