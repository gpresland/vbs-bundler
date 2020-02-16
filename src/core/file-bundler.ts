import fs from "fs";

import { File } from "core";

export class Bundler {

  /**
   * The files to bundle.
   */
  public readonly files: File[] = [];

  /**
   *
   * @param files The files to bundle.
   */
  public constructor(files: File[]) {
    files.forEach((f) => this.files.push(f));
  }

  /**
   * Writes out a bundle to disk.
   * @param outPath The out file path.
   */
  public writeOut(outPath: string) {
    const headers: File[] = [];
    const standards: File[] = [];
    const footers: File[] = [];
    const out = fs.openSync(outPath, "w");
    this.files.forEach((file) => {
      if (file.isHeader) {
        headers.push(file);
      } else if (file.isFooter) {
        footers.push(file);
      } else {
        standards.push(file);
      }
    });
    const orderedFiles = [
      ...headers,
      ...standards,
      ...footers,
    ];
    orderedFiles.forEach((file) => {
      const data = fs.readFileSync(file.path);
      fs.writeSync(out, data);
    });
    fs.closeSync(out);
  }
}

export default Bundler;
