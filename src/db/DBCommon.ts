import sqlite3 from "sqlite3";

let DBFile: string | undefined;
let DB: sqlite3.Database | undefined;

export const setDB = (filename: string): void => {
  DBFile = filename;
};

export default abstract class DBCommon {
  static readonly DB = (): sqlite3.Database => {
    if (DB) {
      return DB;
    }
    if (DBFile) {
      DB = new sqlite3.Database(DBFile);
      return DB;
    }
    throw new Error("no database setting, use setDB()");
  };

  static readonly tableName: string;

  static readonly firstQuerys: string[];

  static init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const db = this.DB();
      db.get(
        `SELECT COUNT(*) FROM sqlite_master WHERE TYPE='table' AND
            name='${this.tableName}'`,
        (err, row: { "COUNT(*)": number }) => {
          if (err) {
            reject(err);
          }

          if (row["COUNT(*)"] !== 1) {
            db.serialize(() => {
              this.firstQuerys.slice(0, -1).forEach((query) => {
                db.run(query);
              });
              db.run(this.firstQuerys[this.firstQuerys.length - 1], (e) => {
                if (e) {
                  reject(e);
                }
                resolve();
              });
            });
          } else {
            resolve();
          }
        }
      );
    });
  }
}
