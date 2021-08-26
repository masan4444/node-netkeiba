import { format, addMonths } from "date-fns";
import { client, logger, sleep } from "../lib";

async function* dayUrlGenerator(
  start: Date,
  end: Date
): AsyncGenerator<string, void, undefined> {
  for (let month = start; month < end; month = addMonths(month, 1)) {
    const url = `/?pid=race_top&date=${format(month, "yyyyMMdd")}`;
    // eslint-disable-next-line no-await-in-loop
    const html = await client.get(url).then((res) => res.data as string);
    const dayUrls = [...html.matchAll(/(\/race\/list\/\d+)\/">\d+/g)].map(
      (match) => match[1]
    );
    if (!dayUrls.length) {
      break;
    }
    logger.debug(`${format(month, "yyyy/MM")}: ${dayUrls.length} days`);
    logger.warn(`${format(month, "yyyy/MM")}: ${dayUrls.length} days`);
    yield* dayUrls;
  }
}

export default async function* raceUrlGenerator(
  start: Date,
  end: Date,
  interval: number
): AsyncGenerator<string, void, undefined> {
  // eslint-disable-next-line no-restricted-syntax
  for await (const dayUrl of dayUrlGenerator(start, end)) {
    await sleep(interval);
    const html = await client.get(dayUrl).then((res) => res.data as string);
    yield* [...html.matchAll(/\/race\/\d+\//g)].map((match) => match[0]);
  }
}
