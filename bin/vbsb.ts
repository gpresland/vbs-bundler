#!/usr/bin/env node

import * as pgk from "../package.json";

import { Command } from "commander";

import { start } from "./vbsb-start";

const program = new Command("vbsb");

program
  .usage("[command]")
  .version(pgk.version.toString());

start(program);

program.parse(process.argv);

program.emit("command:start");
