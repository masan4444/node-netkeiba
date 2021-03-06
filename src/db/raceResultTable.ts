import RaceResult from "../model/raceResult";
import DBCommon from "./DBCommon";

export default class RaceResultTable extends DBCommon {
  static tableName = "race_results" as const;

  static readonly firstQuerys = [
    `CREATE TABLE if not exists ${RaceResultTable.tableName}(
      race_id TEXT NOT NULL,

      ranking INTEGER,
      ranking_detail TEXT,

      frame_number INTEGER NOT NULL,
      horse_number INTEGER NOT NULL,
      horse_id TEXT NOT NULL,

      sex TEXT NOT NULL,
      age INTEGER NOT NULL,
      carry_weight INTEGER NOT NULL,
      jockey_id TEXT NOT NULL,

      time REAL,
      margin TEXT NOT NULL,
      time_figure INTEGER,
      corner_ranking1 INTEGER,
      corner_ranking2 INTEGER,
      corner_ranking3 INTEGER,
      corner_ranking4 INTEGER,
      last_phase_time REAL,

      odds REAL,
      popularity INTEGER,

      weight REAL,
      weight_change REAL,
      trainer_id TEXT NOT NULL,
      owner_id TEXT NOT NULL,
      prize_money REAL,

      PRIMARY KEY(race_id, horse_number)
    )`,
    `CREATE INDEX ranking_index ON ${RaceResultTable.tableName}(race_id, ranking)`,
    `CREATE INDEX popularity_index ON ${RaceResultTable.tableName}(race_id, popularity)`,
    `CREATE INDEX frame_number_index ON ${RaceResultTable.tableName}(race_id, frame_number)`,
    `CREATE UNIQUE INDEX horse_id_index ON ${RaceResultTable.tableName}(race_id, horse_id)`,
  ];

  static column_cnt = 25 as const;

  static async createOrUpdate(
    data: { raceId: string; result: RaceResult }[],
    update?: boolean
  ): Promise<void> {
    const db = this.DB();
    db.exec("BEGIN TRANSACTION");
    const stmt = db.prepare(
      `INSERT ${update ? "or REPLACE" : ""} into ${
        this.tableName
      } VALUES (${new Array(this.column_cnt).fill("?").join(",")})`
    );
    data.forEach((datus) => {
      const { raceId, result } = datus;
      stmt.run(
        raceId,

        typeof result.ranking === "number" ? result.ranking : undefined,
        typeof result.ranking === "number" ? undefined : result.ranking,

        result.frameNumber,
        result.horseNumber,
        result.horseId,

        result.sex,
        result.age,
        result.carryWeight,
        result.jockeyId,

        result.time,
        result.margin,
        result.timeFigure,
        result.cornerRanking[0],
        result.cornerRanking[1],
        result.cornerRanking[2],
        result.cornerRanking[3],
        result.lastPhaseTime,

        result.odds,
        result.popularity,

        typeof result.weight === "number" ? result.weight : undefined,
        typeof result.weightChange === "number"
          ? result.weightChange
          : undefined,
        result.trainerId,
        result.ownerId,
        result.prizeMoney
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
