import path from "path";

export interface IFile {
  path: string;
  isHeader: boolean;
  isFooter: boolean;
  isTest: boolean;
}

export class File implements IFile {

  public static FOOTER_PREFIX = "$";
  public static HEADER_PREFIX = "^";

  public readonly path: string;
  public readonly isHeader: boolean;
  public readonly isFooter: boolean;
  public readonly isTest: boolean;

  constructor(fullPath: string) {
    this.path = fullPath;
    this.isHeader = this.getIsHeaderFile(fullPath);
    this.isFooter = this.getIsFooterFile(fullPath);
    this.isTest = this.getIsTestFile(fullPath);
  }

  /**
   * Gets if a file is a footer file.
   * @param filePath The file path.
   * @returns True if is a footer file, otherwise false.
   */
  private getIsFooterFile(filePath: string) {
    return path.basename(filePath).startsWith(File.FOOTER_PREFIX);
  }

  /**
   * Gets if a file is a header file.
   * @param filePath The file path.
   * @returns True if is a header file, otherwise false.
   */
  private getIsHeaderFile(filePath: string) {
    return path.basename(filePath).startsWith(File.HEADER_PREFIX);
  }

  /**
   * Gets if a file is a test file.
   * @param filePath The file path.
   * @returns True if is a test file, otherwise false.
   */
  private getIsTestFile(filePath: string) {
    filePath = filePath.toLowerCase();
    return filePath.endsWith(".spec.vbs") || filePath.endsWith(".test.vbs");
  }
}

export default File;
