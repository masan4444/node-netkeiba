import { entries } from "../lib";
import { BetType } from "../model/bet";
import { Payoff } from "../model/payoffResult";
import Race from "../model/race";
import { setDB } from "./DBCommon";
import PayoffResultTable from "./payoffResultTable";
import RaceResultTable from "./raceResultTable";
import RaceTable from "./raceTable";

export const saveRace = (races: Race[]): Promise<[void, void, void]> =>
  Promise.all([
    RaceTable.createOrUpdate(races),
    RaceResultTable.createOrUpdate(
      races.flatMap((race) =>
        race.raceResult.map((result) => ({ raceId: race.id, result }))
      )
    ),
    PayoffResultTable.createOrUpdate(
      races.flatMap((race) =>
        entries(race.payoffResult).flatMap(([betType, payoffs]) =>
          (payoffs as Payoff<BetType>[]).map((payoff) => ({
            raceId: race.id,
            betType,
            payoff,
          }))
        )
      )
    ),
  ]);

export const initDB = async (filename: string): Promise<void> => {
  setDB(filename);
  await RaceTable.init();
  await RaceResultTable.init();
  await PayoffResultTable.init();
};
