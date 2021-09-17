import Log4js from "@log4js-node/log4js-api";
import axiosBase from "axios";
import iconv from "iconv-lite";
import { domain } from "./const";

// eslint-disable-next-line import/no-mutable-exports
export let logger = Log4js.getLogger("netkeiba");
export const setLogger = (customLogger: Log4js.Logger): void => {
  logger = customLogger;
};

export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const client = axiosBase.create({
  responseType: "arraybuffer",
  transformResponse: (data) => iconv.decode(data, "euc-jp"),
  baseURL: `https://db.${domain}/`,
});

export const setCookie = (cookie: string): void => {
  client.defaults.headers = { common: { Cookie: cookie } };
};

export const { baseURL } = client.defaults;

export const entries = Object.entries as <T>(
  o: T
) => [Extract<keyof T, string>, T[keyof T]][];

export const parseTime = (time: string): number | undefined => {
  const match = /(?:(?<hour>\d+):)?(?<min>.+)/?.exec(time)?.groups;
  return match
    ? parseInt(match.hour ?? "0", 10) * 60 + Number(match.min)
    : undefined;
};
