/* eslint-disable no-restricted-syntax */
import { client, parseLastSegUrl } from "../lib";

export default async function* raceHtmlGenerator(
  urls: string[]
): AsyncGenerator<[string, string], void, undefined> {
  for await (const url of urls) {
    yield [
      parseLastSegUrl(url),
      await client.get(url).then((res) => res.data as string),
    ];
  }
}
