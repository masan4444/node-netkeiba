import Race from "../model/race";
import DBCommon from "./DBCommon";

export default class RaceTable extends DBCommon {
  static tableName = "races" as const;

  static readonly firstQuerys = [
    `CREATE TABLE if not exists ${RaceTable.tableName}(
      id TEXT NOT NULL,

      course TEXT NOT NULL,
      raceNumber INTEGER NOT NULL,
      name TEXT NOT NULL,
      steeple TEXT,
      surf TEXT NOT NULL,
      turn TEXT,
      outer TEXT,
      dist INTEGER NOT NULL,
      wether TEXT NOT NULL,
      trackCond TEXT NOT NULL,
      startTime NOT NULL,
      monthCnt INTEGER NOT NULL,
      dayCnt INTEGER NOT NULL,
      age INTEGER NOT NULL,
      ageHigher TEXT NOT NULL,
      raceClass TEXT NOT NULL,
      detail TEXT,

      PRIMARY KEY(id)
    )`,
    `CREATE INDEX id_index ON ${RaceTable.tableName}(id)`,
  ];

  static column_cnt = 18;

  static async createOrUpdate(races: Race[], update?: boolean): Promise<void> {
    const stmt = this.DB().prepare(
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
        race.startTime,
        race.monthCnt,
        race.dayCnt,
        race.age,
        race.ageHigher,
        race.raceClass,
        race.detail
      );
    });
    return new Promise((resolve, reject) => {
      stmt.finalize((err) => (err ? reject(err) : resolve()));
    });
  }

  // read(id: string[]): { raceId: string; result: RaceResult }[] {
  //   this.db.all(`SELECT * FROM ${this.tableName} WHERE ra`);
  // }
}
