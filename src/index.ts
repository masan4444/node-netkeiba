import fs from "fs/promises";
import { taskInterval, entries, parseLastSegUrl } from "./lib";
import {
  fetchSaveRaceUrls,
  readRaceUrls,
  fetchHtml,
  getHtmlFilepath,
} from "./fetcher";
import parseRace from "./parser/race";
import Race from "./model/race";
import { BetType } from "./model/bet";
import { Payoff } from "./model/payoffResult";
import RaceResultTable from "./db/raceResultTable";
import RaceTable from "./db/raceTable";
import PayoffResultTable from "./db/payoffResultTable";

const saveRace = (race: Race) =>
  Promise.all([
    RaceTable.createOrUpdate([race]),
    RaceResultTable.createOrUpdate(
      race.raceResult.map((result) => ({ raceId: race.id, result }))
    ),
    PayoffResultTable.createOrUpdate(
      entries(race.payoffResult).flatMap(([betType, payoffs]) =>
        (payoffs as Payoff<BetType>[]).map((payoff) => ({
          raceId: race.id,
          betType,
          payoff,
        }))
      )
    ),
  ]);

const parseAndSave = (filepath: string) =>
  fs
    .readFile(filepath)
    .then((buffer) => buffer.toString())
    .then((html) => parseRace(parseLastSegUrl(filepath).split(".")[0], html))
    .then(async (race) => {
      // console.log(race);
      await saveRace(race);
      return race;
    });

const raceUrlsFile = "downloads/race_url.txt";
const htmlDir = "downloads/html";

const main = async () => {
  console.log("======== Fetch urllist =========");

  await fetchSaveRaceUrls(
    new Date(2021, 7, 1),
    new Date(2022, 0, 1),
    500,
    raceUrlsFile
  );

  const raceUrls = await readRaceUrls(raceUrlsFile);
  console.log(`${raceUrls.length} races`);

  console.log("======== Fetch htmlfile =========");
  await taskInterval(
    raceUrls,
    async (url: string) => {
      await fetchHtml(url, htmlDir);
    },
    500
  );

  const htmlFilepaths = await getHtmlFilepath(htmlDir);
  console.log(htmlFilepaths);

  console.log("======== Parse and Save =========");
  await Promise.all([
    RaceTable.init(),
    RaceResultTable.init(),
    PayoffResultTable.init(),
  ]);
  await taskInterval(htmlFilepaths, parseAndSave, 0);

  console.log("======== Complete =========");
};

main().catch((e) => console.log(e));
