// tslint:disable:no-console

import chalk from "chalk";
import fs from "fs";
import glob from "glob";
import path from "path";
import { hrtime } from "process";
import { Subscription } from "rxjs";

import {
  Bundler, ErrorType, File, FileEventType, FileStore, FileValidator, FileWatcher, IFileEvent, IValidationResults,
} from "./core";

interface IOptions {
  entry?: string;
  output?: string;
  watch?: boolean;
}

export class Vbsb {

  public readonly options: Readonly<IOptions>;
  private readonly store = new FileStore();
  private fileWatcher: FileWatcher;
  private subscription: Subscription;

  /**
   * @param options Bundler options.
   */
  public constructor(options: IOptions) {
    this.options = {
      entry: options.entry || process.cwd(),
      output: options.output || path.resolve(process.cwd(), "bundle.vbs"),
      watch: options.watch || false,
    };

    Vbsb.validateOptions(options);
  }

  /**
   * Runs once.
   */
  public run() {
    const pattern = path.join(this.options.entry, "/**/*.vbs");
    const paths = Vbsb.getFiles(pattern);
    const files = paths.map((filePath) => new File(filePath));
    files.forEach((file) => this.store.add(file));
    this.processFiles();
  }

  /**
   * Start watching and bundling.
   */
  public start() {
    this.fileWatcher = new FileWatcher(this.options.entry);
    this.subscription = this.fileWatcher.subscribe(this.handleFileEvent);
  }

  /**
   * Stop watching and bundling.
   */
  public stop() {
    this.subscription.unsubscribe();
  }

  /**
   * Recursively gets all files in a directory.
   * @param source Source folder to scan.
   */
  private static getFiles(source: string): string[] {
    return glob.sync(source, {});
  }

  /**
   * Validates program options.
   * @param options The options to validate.
   */
  private static validateOptions(options: IOptions) {
    if (!fs.existsSync(options.entry)) {
      throw new Error(`Invalid path supplied for 'entry': ${options.entry}`);
    }
  }

  private bundle() {
    const files = this.store.files.filter((file) => !file.isTest);

    if (files.length === 0) {
      console.warn(chalk.yellow("No files to bundle"));
      return;
    }

    const hrStart = hrtime();
    const bundler = new Bundler(files);

    bundler.writeOut(this.options.output);

    const hrEnd = hrtime(hrStart);
    const ms = Math.round(hrEnd[1] / 1000000);

    const fileName = path.basename(this.options.output);

    console.log(chalk.green("Success"));
    console.log();
    console.log(`Output: ${this.options.output}`);
    console.log(`Built at: ${new Date().toLocaleString()}`);
    console.log(`Asset: ${chalk.green(fileName)}`);
    console.log(`Time: ${chalk.bold.whiteBright(`${ms}`)}ms`);
  }

  private handleFileEvent = (fileEvents: IFileEvent[]) => {
    fileEvents.forEach(this.processFile);
    this.processFiles();
  }

  private printError = (result: IValidationResults) => {
    console.log(chalk.red(`ERROR in ${result.relativePath}`));
    console.log(chalk.red(`Bundle failed: ${result.errorMessage} (${result.line}:${result.column})`));
    console.log();
    console.log(result.snippet);
    console.log();
  }

  private processFile = (event: IFileEvent) => {
    switch (event.event) {
      case FileEventType.Created:
        this.store.add(event.file);
        break;
      case FileEventType.Deleted:
        this.store.remove(event.file);
        break;
      case FileEventType.Renamed:
        // Renames appear as two events; created + deleted.
        break;
    }
  }

  private processFiles = async () => {
    const validationResults = this.store.files.map(async (file) => {
      return await FileValidator.validate(file.path);
    });

    const results = await Promise.all(validationResults);
    const isBundleable = results.every((result) => {

      if (result.isError) {
        this.printError(result);
      }

      return !result.isError;
    });

    if (isBundleable) {
      this.bundle();
    }
  }
}

export default Vbsb;
