/* eslint-disable no-restricted-syntax */
import path from "path";
import { client, sleep } from "../lib";

export default async function* raceHtmlGenerator(
  urls: string[],
  interval: number
): AsyncGenerator<
  {
    url: string;
    id: string;
    html: string;
  },
  void,
  undefined
> {
  for await (const url of urls) {
    yield {
      url,
      id: path.parse(url).name,
      html: await client.get(url).then((res) => res.data as string),
    };
    await sleep(interval);
  }
}
