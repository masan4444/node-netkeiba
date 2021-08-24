/* eslint-disable no-restricted-syntax */
import fs from "fs/promises";
import { parseLastSegUrl, logger, sleep } from "./lib";
import login from "./net/login";
import raceUrlGenerator from "./net/crawler";
import raceHtmlGenerator from "./net/fetcher";
import parseRace from "./net/parser";
import { saveRace, initDB } from "./db/utils";
import Race from "./model/race";

export const crawl = async (
  startMonth: Date,
  endMonth: Date,
  urlfile: string,
  interval: number
): Promise<number> => {
  let count = 0;
  for await (const raceUrl of raceUrlGenerator(
    startMonth,
    endMonth,
    interval
  )) {
    await Promise.all([fs.appendFile(urlfile, `${raceUrl}\n`)]);
    count += 1;
  }
  return count;
};

export const fetch = async (
  urlFile: string,
  htmlDir: string,
  interval: number
): Promise<number> => {
  const raceUrls = await fs
    .readFile(urlFile)
    .then((buffer) => buffer.toString().split("\n").filter(Boolean));
  const { length } = raceUrls;
  let count = 0;
  let progress = 0;
  for await (const [id, html] of raceHtmlGenerator(raceUrls)) {
    await Promise.all([
      fs.writeFile(`${htmlDir}/${id}.html`, html),
      sleep(interval),
    ]);
    if (length > 100 && count === Math.ceil(progress)) {
      logger.debug(`progress: ${Math.ceil((progress / length) * 100)}%`);
      progress += length / 100;
    }
    count += 1;
  }
  return count;
};

export const parse = async (htmlDir: string): Promise<Race[]> => {
  await initDB();
  const htmlFiles = await fs
    .readdir(htmlDir)
    .then((paths) => paths.map((path) => `${htmlDir}/${path}`));
  return Promise.all(
    htmlFiles.map((path) =>
      fs
        .readFile(path)
        .then((buffer) => buffer.toString())
        .then((html) => parseRace(parseLastSegUrl(path).split(".")[0], html))
        .then(async (race) => {
          logger.debug(race);
          await saveRace(race);
          return race;
        })
    )
  );
};

const main = async (
  startMonth: Date,
  endMonth: Date,
  raceUrlFiles: string,
  htmlDir: string,
  interval: number
) => {
  logger.level = "all";

  logger.info("login");
  if (await login("loginid@example.com", "password")) {
    logger.info("success login");
  }

  logger.info("crawl race urls");
  const count = await crawl(startMonth, endMonth, raceUrlFiles, interval);
  logger.debug(`crawled ${count} races`);

  logger.info("fetch html files");
  await fetch(raceUrlFiles, htmlDir, interval);

  logger.info("parse html and save db");
  const races = await parse(htmlDir);
  logger.info(`${races.length}`);

  logger.info("complete");
};

main(
  new Date(2021, 7, 1),
  new Date(2022, 0, 1),
  "downloads/test/race_url.txt",
  "downloads/test/html",
  500
).catch((e) => logger.error(e));
