import sqlite3 from "sqlite3";

export default abstract class DBCommon {
  static dbFileName = "netkeiba.sqlite3" as const;

  static readonly db: sqlite3.Database = new sqlite3.Database(
    DBCommon.dbFileName
  );

  static readonly tableName: string;

  static readonly firstQuerys: string[];

  static init(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.get(
        `SELECT COUNT(*) FROM sqlite_master WHERE TYPE='table' AND
          name='${this.tableName}'`,
        (err, row: { "COUNT(*)": number }) => {
          if (err) {
            reject(err);
          }

          if (row["COUNT(*)"] !== 1) {
            this.db.serialize(() => {
              this.firstQuerys.slice(0, -1).forEach((query) => {
                this.db.run(query);
              });
              this.db.run(
                this.firstQuerys[this.firstQuerys.length - 1],
                (e) => {
                  if (e) {
                    reject(e);
                  }
                  resolve();
                }
              );
            });
          } else {
            resolve();
          }
        }
      );
    });
  }
}
