import * as commander from "commander";

import { Vbsb } from "../src/vbsb";

// work-around for:
// TS4023: Exported variable 'command' has or is using name 'local.Command'
// from external module "node_modules/commander/typings/index" but cannot be named.
// tslint:disable-next-line: no-empty-interface
export interface ICommand extends commander.Command { }

export const start = (program: ICommand) => {
  program
    .description("Start VBScript Bundler")
    .option("--entry <entry>", "entry point directory of source vbs files")
    .option("--output <output>", "bundled file output path")
    .option("--watch", "watch files for changes")
    .action(action);
};

function action(this: any) {
  const vbsb = new Vbsb({
    entry: this.entry,
    output: this.output,
    watch: this.watch
  });

  if (this.watch) {
    vbsb.start();
  } else {
    vbsb.run();
  }

  process.once("SIGTERM", () => {
    vbsb.stop();
  });
}
