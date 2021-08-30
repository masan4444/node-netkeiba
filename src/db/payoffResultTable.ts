import { BetType } from "../model/bet";
import { Payoff } from "../model/payoffResult";
import DBCommon from "./DBCommon";

export default class PayoffResultTable extends DBCommon {
  static tableName = "payoff_results" as const;

  static readonly firstQuerys = [
    `CREATE TABLE if not exists ${PayoffResultTable.tableName}(
      race_id TEXT NOT NULL,

      bet_type TEXT NOT NULL,
      number0 INTEGER NOT NULL,
      number1 INTEGER,
      number2 INTEGER,
      earn INTEGER NOT NULL,
      popularity INTEGER NOT NULL
    )`,
    `CREATE INDEX race_id_index ON ${PayoffResultTable.tableName}(race_id)`,
  ];

  static column_cnt = 7 as const;

  static async createOrUpdate(
    data: { raceId: string; betType: string; payoff: Payoff<BetType> }[],
    update?: boolean
  ): Promise<void> {
    const stmt = this.DB().prepare(
      `INSERT ${update ? "or REPLACE" : ""} into ${
        this.tableName
      } VALUES (${new Array(this.column_cnt).fill("?").join(",")})`
    );
    data.forEach((datus) => {
      const { raceId, betType, payoff } = datus;
      stmt.run(
        raceId,

        betType,
        payoff.bet[0],
        payoff.bet[1],
        payoff.bet[2],
        payoff.earn,
        payoff.popularity
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
