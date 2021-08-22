import axiosBase from "axios";
import iconv from "iconv-lite";
import Log4js from "log4js";

Log4js.configure("log-config.json");
export const logger = Log4js.getLogger("netkeiba");

export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const axios = axiosBase.create({
  responseType: "arraybuffer",
  transformResponse: (data) => iconv.decode(data, "euc-jp"),
});

export const entries = Object.entries as <T>(
  o: T
) => [Extract<keyof T, string>, T[keyof T]][];

export const taskInterval = <T, U>(
  array: T[],
  task: (src: T) => Promise<U>,
  interval: number
): Promise<U[]> => {
  const { length } = array;
  if (!length) {
    return new Promise(() => []);
  }
  let progress = 0;
  return array.slice(1).reduce(
    (promise, url, idx) =>
      promise.then(async (prev) => {
        await sleep(interval);
        if (length > 100 && idx === Math.ceil(progress)) {
          logger.debug(`progress: ${Math.ceil((progress / length) * 100)}%`);
          progress += length / 100;
        }
        return prev.concat(await task(url));
      }),
    task(array[0]).then((ret) => [ret])
  );
};

export const parseLastSegUrl = (url: string): string =>
  /([^/]+?)\/?$/.exec(url)?.[1] as string;

export const parseTime = (time: string): number | undefined => {
  const match = /(?:(?<hour>\d+):)?(?<min>.+)/?.exec(time)?.groups;
  return match
    ? parseInt(match.hour ?? "0", 10) * 60 + Number(match.min)
    : undefined;
};
