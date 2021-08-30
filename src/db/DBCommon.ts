/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import sqlite3 from "sqlite3";

declare module "sqlite3/" {
  interface Database {
    runAsync: (sql: string, ...params: unknown[]) => Promise<unknown>;
  }
}
sqlite3.Database.prototype.runAsync = function runAsync(
  sql: string,
  ...params: unknown[]
) {
  return new Promise((resolve, reject) => {
    this.run(sql, params, (err) => {
      if (err) return reject(err);
      return resolve(this);
    });
  });
};

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
      db.exec("BEGIN TRANSACTION");
      db.get(
        `SELECT COUNT(*) FROM sqlite_master WHERE TYPE='table' AND
            name='${this.tableName}'`,
        (err, row: { "COUNT(*)": number }) => {
          if (err) {
            reject(err);
            return;
          }
          if (row["COUNT(*)"] !== 1) {
            (async () => {
              for (const [i, query] of this.firstQuerys.entries()) {
                await db.runAsync(query);
                if (i === this.firstQuerys.length - 1) {
                  db.exec("COMMIT");
                  resolve();
                }
              }
            })().catch((e) => {
              db.exec("ROLLBACK");
              reject(e);
            });
          } else {
            resolve();
          }
        }
      );
    });
  }
}
