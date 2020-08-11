#!/usr/bin/env ts-node-script

/* eslint-disable no-console */
import { Root } from "protobufjs";
import * as fs from "fs";
import * as path from "path";
import * as yargs from "yargs";

const argv = yargs.option("ignore", {
  alias: "i",
  type: "string"
}).argv;

const ignore = typeof argv.ignore === "string" ? [argv.ignore] : argv.ignore;

let rootPath = argv._[0];
const outFile = argv._[1] || "genproto/proto.json";
if (rootPath === undefined) {
  console.info("usage: generate.js proto-path");
  process.exit(1);
}
rootPath = path.resolve(rootPath);
if (!fs.existsSync(rootPath) || !fs.statSync(rootPath).isDirectory()) {
  console.error(`${rootPath}: no such directory exists`);
  process.exit(1);
}

const walk = (dir: string, files: string[] = []): string[] => {
  fs.readdirSync(dir).forEach((file) => {
    const path = dir + file;
    if (fs.statSync(path).isDirectory()) {
      walk(path + "/", files);
    } else if (path.endsWith(".proto")) {
      files.push(path);
    }
  });
  return files;
};

const sources = [
  ...walk(rootPath + "/"),
  ...walk(__dirname + "/../node_modules/protobufjs/")
];

const parseOptions = {
  keepCase: true,
  alternateCommentMode: true // Important so that it parses trailing comments and non-doc-blocks
};

const root = new Root();
root.resolvePath = (_, include) => {
  if (ignore) {
    for (let i = 0; i < ignore.length; i++) {
      if (include.endsWith(ignore[i])) {
        return null;
      }
    }
  }

  if (!fs.existsSync(include)) {
    include = rootPath + "/" + include;
  }

  console.log(path.relative(rootPath, include));
  return include;
};

root.loadSync(sources, parseOptions);

try {
  root.resolveAll();
} catch (err) {
  console.error(`fatal: could not resolve root: ${err}`);
  process.exit(1);
}

// TODO possibly consider serialising filenames alongside root JSON?
// The JSON descriptor format does not include support for filenames, so it would need to be a side channel.
// e.g. { root: JSON.stringify(root), filenames: {} }
const json = root.toJSON({ keepComments: true });
fs.writeFileSync(outFile, JSON.stringify(json));
console.log("saved", outFile);
