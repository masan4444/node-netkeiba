/* eslint-disable no-restricted-syntax */
import { PathLike } from "fs";
import fs from "fs/promises";
import path from "path";
import { saveRace, initDB } from "./db/utils";
import { logger, setCookie, setLogger } from "./lib";
import Race from "./model/race";
import raceUrlGenerator from "./net/crawler";
import raceHtmlGenerator from "./net/fetcher";
import login from "./net/login";
import parseRace from "./net/parser";

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
  ).filter(Boolean) as Race[];
  await fs.mkdir(path.dirname(parsedFile.toString()), { recursive: true });
  await fs.writeFile(parsedFile, JSON.stringify(races));
  return races;
};

export const save = async (parsedFile: PathLike): Promise<void> => {
  const races = JSON.parse(
    await fs.readFile(parsedFile).then((buffer) => buffer.toString())
  ) as Race[];
  await initDB();
  await saveRace(races);
};

// const main = async (
//   startMonth: Date,
//   endMonth: Date,
//   urlFile: PathLike,
//   htmlDir: PathLike,
//   parsedFile: PathLike,
//   interval: number
// ) => {
//   logger.level = "all";

//   logger.info("login");
//   if (await login("loginid@example.com", "password")) {
//     logger.info("success login");
//   }

//   logger.info(`crawl race urls to ${urlFile.toLocaleString()}`);
//   const count = await crawl(startMonth, endMonth, urlFile, interval);
//   logger.debug(`crawled ${count} races`);

//   logger.info(
//     `fetch html files from ${urlFile.toLocaleString()} to ${htmlDir.toLocaleString()}`
//   );
//   await fetch(urlFile, htmlDir, interval);

//   logger.info(
//     `parse html and save db from ${htmlDir.toLocaleString()} to ${parsedFile.toLocaleString()}`
//   );
//   const races = await parse(htmlDir, parsedFile);
//   logger.info(`parsed ${races.length} races`);

//   logger.info(`save db from ${parsedFile.toLocaleString()}`);
//   await save(parsedFile);

//   logger.info("complete");
// };

// main(
//   new Date(2021, 7, 1),
//   new Date(2022, 0, 1),
//   "tmp/test/race_url.txt",
//   "tmp/test/html",
//   "tmp/test/parsed.json",
//   500
// ).catch((e) => logger.error(e));

export {
  setLogger,
  raceUrlGenerator,
  raceHtmlGenerator,
  parseRace,
  login,
  setCookie,
};
