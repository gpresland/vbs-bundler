import { File } from "./";

export class FileStore {

  /**
   * Files to bundle.
   */
  public readonly files: File[] = [];

  /**
   * Bundler.
   */
  public constructor() {
    //
  }

  /**
   * Adds a file.
   * @param file The file to add.
   */
  public add(file: File) {
    this.files.push(file);
  }

  /**
   * Removes a file.
   * @param file The file to remove.
   */
  public remove(file: File) {
    const index = this.files
      .findIndex((f) => f.path === file.path);

    if (index === -1) {
      throw new Error(`Cannot remove file ${file.path}.`);
    }

    this.files.splice(index, 1);
  }
}

export default FileStore;
