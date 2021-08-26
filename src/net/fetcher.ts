/* eslint-disable no-restricted-syntax */
import path from "path";
import { client, sleep } from "../lib";

export default async function* raceHtmlGenerator(
  urls: string[],
  interval: number
): AsyncGenerator<[string, string], void, undefined> {
  for await (const url of urls) {
    yield [
      path.parse(url).name,
      await client.get(url).then((res) => res.data as string),
    ];
    await sleep(interval);
  }
}
