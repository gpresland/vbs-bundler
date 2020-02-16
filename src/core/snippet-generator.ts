import chalk from "chalk";
import fs from "fs";
import readline from "readline";

import { padStart } from "../utils";

interface IOptions {
  columnNumber: number;
  lineNumber: number;
  path: string;
}

export class SnippetGenerator {

  private readonly columnNumber: number;
  private readonly lineNumberAfter: number;
  private readonly lineNumberBefore: number;
  private readonly lineNumberLength: number;
  private readonly path: string;
  private readonly targetLineNumber: number;

  private snippet = "";

  /**
   * Gets a block of text surrounding a line.
   * @param options.path The file to read.
   * @param options.lineNumber The target line.
   * @param options.columnNumber The target column.
   */
  public constructor(options: IOptions) {
    this.columnNumber = options.columnNumber;
    this.targetLineNumber = options.lineNumber;
    this.path = options.path;

    this.lineNumberAfter = this.targetLineNumber + 2;
    this.lineNumberBefore = this.targetLineNumber - 2;
    this.lineNumberLength = this.lineNumberAfter.toString().length;
  }

  public async generate(): Promise<string> {
    return new Promise((resolve, reject) => {
      const fileStream = fs.createReadStream(this.path);
      const rl = readline.createInterface({
        crlfDelay: Infinity,
        input: fileStream,
      });
      let lineCount = 0;
      rl.on("line", (line) => {
        lineCount += 1;

        if (lineCount >= this.lineNumberBefore && lineCount <= this.lineNumberAfter) {
          const gutter = this.getGutter(lineCount);

          if (lineCount === this.targetLineNumber) {
            this.snippet += chalk.whiteBright(`${gutter} ${line}\n`);
            this.snippet += this.getPointer();
          } else {
            this.snippet += chalk.gray(`${gutter} ${line}\n`);
          }
        }

        if (lineCount > this.targetLineNumber) {
          rl.close();
          rl.removeAllListeners();
          return;
        }
      });
      rl.on("close", () => {
        resolve(this.snippet);
      });
    });
  }

  private getGutter(lineNumber: number): string {
    const lineNumberString = padStart(lineNumber.toString(), this.lineNumberLength, " ");
    return (lineNumber === this.targetLineNumber)
      ? chalk.red(">") + chalk.whiteBright(` ${lineNumberString} `) + chalk.gray("|")
      : chalk.gray(`  ${lineNumberString} |`);
  }

  private getPointer(): string {
    const gutter = chalk.gray(`  ${padStart("", this.lineNumberLength, " ")} |`);
    const spacing = padStart("", this.columnNumber, " ");
    const carret = chalk.red("^");
    return `${gutter}${spacing}${carret}\n`;
  }
}

export default SnippetGenerator;
