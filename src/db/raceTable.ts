import { utcToZonedTime, format as formatTZ } from "date-fns-tz";
import Race from "../model/race";
import DBCommon from "./DBCommon";

const timeZone = "Asia/Tokyo";

export default class RaceTable extends DBCommon {
  static tableName = "races" as const;

  static readonly firstQuerys = [
    `CREATE TABLE if not exists ${RaceTable.tableName}(
      id TEXT NOT NULL,

      course TEXT NOT NULL,
      race_number INTEGER NOT NULL,
      name TEXT NOT NULL,
      steeple TEXT,
      surf TEXT NOT NULL,
      turn TEXT,
      line TEXT,
      dist INTEGER NOT NULL,
      wether TEXT NOT NULL,
      track_cond TEXT NOT NULL,
      start_time NOT NULL,
      month_cnt INTEGER NOT NULL,
      day_cnt INTEGER NOT NULL,
      age INTEGER NOT NULL,
      age_higher TEXT,
      race_class TEXT NOT NULL,
      detail TEXT,
      horse_cnt INTEGER NOT NULL,
      entry_cnt INTEGER NOT NULL,
      goal_cnt INTEGER NOT NULL,
      rank_cnt INTEGER NOT NULL,

      PRIMARY KEY(id)
    )`,
    `CREATE INDEX id_index ON ${RaceTable.tableName}(id)`,
  ];

  static column_cnt = 22;

  static async createOrUpdate(races: Race[], update?: boolean): Promise<void> {
    const db = this.DB();
    db.exec("BEGIN TRANSACTION");
    const stmt = db.prepare(
      `INSERT ${update ? "or REPLACE" : ""} into ${
        this.tableName
      } VALUES (${new Array(this.column_cnt).fill("?").join(",")})`
    );
    races.forEach((race) => {
      stmt.run(
        race.id,

        race.course,
        race.raceNumber,
        race.name,
        race.steeple,
        race.surf,
        race.turn,
        race.line,
        race.dist,
        race.wether,
        race.trackCond,
        formatTZ(
          utcToZonedTime(race.startTime, timeZone),
          "yyyy-MM-dd'T'HH:mm:ssXXX",
          { timeZone }
        ),
        race.monthCnt,
        race.dayCnt,
        race.age,
        race.ageHigher,
        race.raceClass,
        race.detail,
        race.horseCnt,
        race.entryCnt,
        race.goalCnt,
        race.rankCnt
      );
    });
    stmt.finalize();
    return new Promise((resolve, reject) => {
      db.run("COMMIT", (err) => (err ? reject(err) : resolve()));
    });
  }

  // read(id: string[]): { raceId: string; result: RaceResult }[] {
  //   this.db.all(`SELECT * FROM ${this.tableName} WHERE ra`);
  // }
}
