import { FSWatcher, watch } from "chokidar";
import EventEmitter from "eventemitter3";
import path from "path";
import { Observable, Subscription, timer } from "rxjs";
import { buffer, debounce } from "rxjs/operators";

import { File } from "./";

export enum FileEventType {
  Created,
  Deleted,
  Renamed,
}

export interface IFileEvent {
  event: FileEventType;
  file: File;
}

export class FileWatcher extends EventEmitter {

  private static DEBOUNCE_TIME = 250;

  /**
   * Directory to watch.
   */
  private readonly dir: string;

  /**
   * File watcher observer.
   */
  private readonly observer: Observable<IFileEvent>;

  /**
   * File watcher process.
   */
  private readonly watcher: FSWatcher;

  /**
   *
   * @param dir The directory to watch.
   */
  public constructor(dir: string) {
    super();

    this.dir = dir;
    this.watcher = watch(`${dir}/**/*.vbs`, {
      ignored: /(^|[\/\\])\../,
      persistent: true,
    });

    this.observer = new Observable((subscriber) => {
      this.watcher.on("add", (relativePath) => {
        const filePath = this.getFullPath(relativePath);
        subscriber.next({
          event: FileEventType.Created,
          file: new File(filePath),
        });
      });
      this.watcher.on("change", (relativePath) => {
        const filePath = this.getFullPath(relativePath);
        subscriber.next({
          event: FileEventType.Renamed,
          file: new File(filePath),
        });
      });
      this.watcher.on("unlink", (relativePath: string) => {
        const filePath = this.getFullPath(relativePath);
        subscriber.next({
          event: FileEventType.Deleted,
          file: new File(filePath),
        });
      });
    });
  }

  /**
   * Subscribe to changes.
   * @param next File change handler.
   * @param error File error handler.
   */
  public subscribe(
    next?: (value: IFileEvent[]) => void,
    error?: (error: any) => void): Subscription {
    return this.observer
      .pipe(buffer(this.observer
        .pipe(debounce(() => timer(FileWatcher.DEBOUNCE_TIME)))))
      .subscribe(next, error);
  }

  /**
   * Gets the full path of a file.
   * @param relativePath The relative file path.
   */
  private getFullPath(relativePath: string): string {
    const fullPath = path.resolve(relativePath);
    return fullPath;
  }
}

export default FileWatcher;
