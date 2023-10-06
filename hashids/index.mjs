// @ts-check
import Hashids from "hashids";
import minimist from "minimist";

const args = minimist(process.argv.slice(2), {
  boolean: ["e", "d", "h"],
  string: ["s"],
  default: { s: "", l: 0 },
  alias: { e: "encode", d: "decode", s: "salt", l: "length", h: "help" },
});

if (args.h) {
  console.log(`usage: command (-e|-d) [-s SALT -l MIN_LENGTH]  (id)
    -e <encode>
    -d <decode>
    -s SALT (default: "")
    -l MIN_LENGTH (default: 0)`);
  process.exit(0);
}

const hashids = new Hashids(args.s, args.l);

if (args.e) {
  console.log(hashids.encode(parseInt(args._[0])));
} else if (args.d) {
  console.log(hashids.decode(args._[0]));
}
