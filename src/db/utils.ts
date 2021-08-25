import { entries } from "../lib";
import Race from "../model/race";
import { BetType } from "../model/bet";
import { Payoff } from "../model/payoffResult";
import RaceResultTable from "./raceResultTable";
import RaceTable from "./raceTable";
import PayoffResultTable from "./payoffResultTable";

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

export const initDB = async (): Promise<void> => {
  await Promise.all([
    RaceTable.init(),
    RaceResultTable.init(),
    PayoffResultTable.init(),
  ]);
};
