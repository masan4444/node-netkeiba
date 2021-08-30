/* eslint-disable no-console */
/* eslint-disable no-restricted-syntax */
import { PathLike } from "fs";
import fs from "fs/promises";
import path from "path";
import { parse as parseDate } from "date-fns";
import { logger } from "./lib";
import {
  raceUrlGenerator,
  raceHtmlGenerator,
  parseRace,
  login,
  setCookie,
  initDB,
  saveRace,
  Race,
} from "./index";

export const crawl = async (
  startMonth: Date,
  endMonth: Date,
  urlFile: PathLike,
  interval: number
): Promise<number> => {
  let count = 0;
  await fs.mkdir(path.dirname(urlFile.toString()), { recursive: true });
  for await (const raceUrl of raceUrlGenerator(
    startMonth,
    endMonth,
    interval
  )) {
    await fs.appendFile(urlFile, `${raceUrl}\n`);
    count += 1;
  }
  return count;
};

export const fetch = async (
  urlFile: PathLike,
  htmlDir: PathLike,
  interval: number
): Promise<number> => {
  const raceUrls = await fs
    .readFile(urlFile)
    .then((buffer) => buffer.toString().split("\n").filter(Boolean));
  const { length } = raceUrls;
  let count = 0;
  let progress = 0;
  await fs.mkdir(htmlDir, { recursive: true });
  for await (const { id, html } of raceHtmlGenerator(raceUrls, interval)) {
    await fs.writeFile(path.join(htmlDir.toString(), `${id}.html`), html);
    if (length > 100 && count === Math.ceil(progress)) {
      logger.debug(`progress: ${Math.ceil((progress / length) * 100)}%`);
      progress += length / 100;
    }
    count += 1;
  }
  return count;
};

export const parse = async (
  htmlDir: PathLike,
  parsedFile: PathLike
): Promise<Array<Race>> => {
  const htmlFiles = await fs.readdir(htmlDir);
  const races = (
    await Promise.all(
      htmlFiles.map((filepath) =>
        fs
          .readFile(path.join(htmlDir.toString(), filepath))
          .then((buffer) => buffer.toString())
          .then((html) => parseRace(filepath, html))
          .catch((e) => {
            logger.error(e);
            return undefined;
          })
      )
    )
  ).filter((race): race is Race => Boolean(race));
  await fs.mkdir(path.dirname(parsedFile.toString()), { recursive: true });
  await fs.writeFile(parsedFile, JSON.stringify(races));
  return races;
};

export const save = async (parsedFile: PathLike): Promise<void> => {
  const races = JSON.parse(
    await fs.readFile(parsedFile).then((buffer) => buffer.toString())
  ) as Race[];
  await initDB("tmp/db.sqlite3");
  await saveRace(races);
};

const main = async (
  startMonth: Date,
  endMonth: Date,
  urlFile: PathLike,
  htmlDir: PathLike,
  parsedFile: PathLike,
  interval: number
) => {
  logger.level = "all";

  logger.info("Login");
  const cookies = await login("loginid", "password");

  if (
    cookies.find((c) => c.key === "nkauth") &&
    cookies.find((c) => c.key === "netkeiba")
  ) {
    const cookie = cookies
      .filter((c) => ["netkeiba", "nkauth"].includes(c.key))
      .map(({ key, value }) => `${key}=${value}`)
      .join("; ");
    setCookie(cookie);
    logger.info("Login succeeded");
  } else {
    logger.warn("Login failed");
  }

  // logger.info(`Crawl race urls to ${urlFile.toLocaleString()}`);
  // const count = await crawl(startMonth, endMonth, urlFile, interval);
  // logger.debug(`Crawled ${count} races`);

  logger.info(
    `Fetch html files from ${urlFile.toLocaleString()} to ${htmlDir.toLocaleString()}`
  );
  await fetch(urlFile, htmlDir, interval);

  logger.info(
    `Parse html from ${htmlDir.toLocaleString()} to ${parsedFile.toLocaleString()}`
  );
  const races = await parse(htmlDir, parsedFile);

  logger.info(`Parsed ${races.length} races`);

  logger.info(`Save db from ${parsedFile.toLocaleString()}`);
  await save(parsedFile);

  logger.info("complete");
};

main(
  parseDate("2021/08", "yyyy/MM", new Date()),
  parseDate("2021/09", "yyyy/MM", new Date()),
  "tmp/race_url.txt",
  "tmp/html",
  "tmp/parsed.json",
  500
).catch((e) => logger.error(e));
