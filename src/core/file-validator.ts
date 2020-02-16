import { exec } from "child_process";
import * as syspath from "path";

import { SnippetGenerator } from "../core";

export enum ErrorType {
  Compilation,
  Runtime,
  Unknown,
}

interface IRunResults {
  message?: string;
  stderr: boolean;
}

interface IValidationDetails {
  column?: number;
  errorMessage: string;
  isError: boolean;
  line?: number;
  snippet?: string;
  type?: ErrorType;
}

export interface IValidationResults extends IValidationDetails {
  path: string;
  relativePath: string;
}

export class FileValidator {

  public static validate(path: string): Promise<IValidationResults> {
    // cscript.exe does not cause an exit code error on script failure.
    return new Promise(async (resolve, reject) => {
      const runResults = await FileValidator.run(path);
      if (runResults.stderr) {
        const details = FileValidator.processError(runResults.message);
        const snippetGenerator = new SnippetGenerator({
          columnNumber: details.column,
          lineNumber: details.line,
          path,
        });
        const snippet = await snippetGenerator.generate();
        resolve({
          ...details,
          path,
          relativePath: syspath.relative(process.cwd(), path),
          snippet,
        });
      } else {
        resolve({
          column: null,
          errorMessage: null,
          isError: false,
          line: null,
          path,
          relativePath: syspath.relative(process.cwd(), path),
          type: null,
        });
      }
    });
  }

  private static getErrorType(value: string): ErrorType {
    switch (value) {
      case "compilation": return ErrorType.Compilation;
      case "runtime": return ErrorType.Runtime;
      default: return ErrorType.Unknown;
    }
  }

  private static run(path: string): Promise<IRunResults> {
    return new Promise((resolve, reject) => {
      const results: IRunResults = {
        message: null,
        stderr: false,
      };

      const proc = exec(`cscript.exe //NoLogo "${path}"`, {
        windowsHide: true,
      });
      proc.stderr.once("data", (err: Error) => {
        results.message = err.toString().trim();
        results.stderr = true;
      });
      proc.once("exit", () => {
        resolve(results);
      });
    });
  }

  private static processError(errorMessage: string): IValidationDetails {
    // tslint:disable-next-line:max-line-length
    const matches = /(.*\.vbs)\((\d+),\s+(\d+)\)\s+?Microsoft VBScript (\w+) error:\s?(.*)\s?$/gmi.exec(errorMessage);

    if (matches == null || matches.length < 6) {
      throw new Error("Error processing file error.");
    }

    return {
      column: parseInt(matches[3], 10),
      errorMessage: matches[5],
      isError: true,
      line: parseInt(matches[2], 10),
      type: FileValidator.getErrorType(matches[4]),
    };
  }
}
