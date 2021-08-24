import fs from "fs/promises";
import { format, addMonths } from "date-fns";
import { client, taskInterval, parseLastSegUrl, logger } from "./lib";

const fetchDayUrlsInMonth = async (date: Date): Promise<string[]> => {
  const url = `/?pid=race_top&date=${format(date, "yyyyMMdd")}`;
  const html = await client.get(url).then((res) => res.data as string);
  const dayUrls = [...html.matchAll(/(\/race\/list\/\d+)\/">\d+/g)].map(
    (match) => match[1]
  );
  return dayUrls;
};

/**
 * fetch race urls in a one day
 * @param dayUrl ex) "https://db.netkeiba.com/race/list/20210206/"
 * @returns ex) ["https://db.netkeiba.com/race/202105010301/", ]
 */
const fetchRaceUrlsInDay = async (dayUrl: string): Promise<string[]> => {
  const html = await client.get(dayUrl).then((res) => res.data as string);
  const raceUrls = [...html.matchAll(/\/race\/\d+\//g)].map(
    (match) => match[0]
  );
  return raceUrls;
};

export const fetchSaveRaceUrls = async (
  start: Date,
  end: Date,
  interval: number,
  filename: string
): Promise<void> => {
  /* eslint-disable no-await-in-loop */
  for (let month = start; month < end; month = addMonths(month, 1)) {
    const dayUrls = await fetchDayUrlsInMonth(month);
    if (!dayUrls.length) {
      break;
    }

    const raceCnt = await taskInterval(
      dayUrls,
      async (dayUrl) => {
        const raceUrl = await fetchRaceUrlsInDay(dayUrl);
        await fs.appendFile(filename, `${raceUrl.join("\n")}\n`);
        return raceUrl.length;
      },
      interval
    );
    logger.info(
      `${format(month, "yyyy/MM")}: ${dayUrls.length} days: ${raceCnt.reduce(
        (acc, cur) => acc + cur
      )} races`
    );
  }
};

export const readRaceUrls = (filename: string): Promise<string[]> =>
  fs
    .readFile(filename)
    .then((buffer) => buffer.toString().split("\n").filter(Boolean));

export const fetchHtml = async (url: string, dir: string): Promise<void> => {
  const id = parseLastSegUrl(url);
  const html = await client.get(url).then((res) => res.data as string);
  await fs.writeFile(`${dir}/${id}.html`, html);
};

export const getHtmlFilepath = (dir: string): Promise<string[]> =>
  fs.readdir(dir).then((paths) => paths.map((path) => `${dir}/${path}`));
