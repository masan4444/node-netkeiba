/* eslint-disable radix */
import path from "path";
import { parse as parseDate } from "date-fns";
import HtmlParser, { HTMLElement } from "fast-html-parser";
import { conditionRegExp, infoRegExp } from "../const";
import { parseTime } from "../lib";
import * as Bet from "../model/bet";
import Race, {
  RaceResult,
  RaceResultValidator,
  PayoffResult,
} from "../model/race";

const parseResult = (elements: HTMLElement[]): RaceResult => {
  const column = elements.map((e, i) =>
    [3, 6, 18, 19].includes(i) ? e.childNodes[1].attributes.href : e.rawText
  );

  const weight = /(\d+)\(((?:\+|-)?\d+)\)/.exec(column[14]);

  const raceResult: RaceResult = {
    ranking: parseInt(column[0]) || (column[0] as RaceResult["ranking"]),
    frameNumber: parseInt(column[1]),
    horseNumber: parseInt(column[2]),
    horseId: path.parse(column[3]).name,

    sex: column[4][0] as RaceResult["sex"],
    age: parseInt(column[4][1]),
    carryWeight: parseInt(column[5]),
    jockeyId: path.parse(column[6]).name,

    time: parseTime(column[7]),
    margin: column[8],
    timeFigure: parseInt(column[9]) || undefined,
    cornerRanking: column[10].split("-").map((n) => parseInt(n)),
    lastPhaseTime: parseTime(column[11]),

    odds: Number(column[12]) || undefined,
    popularity: parseInt(column[13]) || undefined,

    weight: weight ? parseInt(weight[1]) : (column[14] as RaceResult["weight"]),
    weightChange: weight
      ? parseInt(weight[2])
      : (column[14] as RaceResult["weight"]),
    trainerId: path.parse(column[18]).name,
    ownerId: path.parse(column[19]).name,
    prizeMoney: Number(column[20].replace(",", "")),
  };

  if (!RaceResultValidator.is(raceResult)) {
    throw new Error(`failed to parse race result`);
  }
  return raceResult;
};

const parsePayoff = (column: HTMLElement): PayoffResult => {
  const [, betType, , number, , earn, , popularity] = column.childNodes.map(
    (e) => e.childNodes?.filter((_, i) => i % 2 === 0).map((ee) => ee.rawText)
  );
  const type = Bet.fromJp(betType[0]);
  const payoffs = number.map((n, i) => ({
    bet: n.split(/-|→/).map((nn) => parseInt(nn)),
    earn: parseInt(earn[i].replace(",", "")),
    popularity: parseInt(popularity[i]),
  }));
  return {
    [type]: payoffs,
  };
};

const parseRace = (url: string, html: string): Race => {
  const id = path.parse(url).name;
  if (id === "200808020398" || id === "200808020399") {
    throw new Error(`BrokenHtmlData: ${url} is broken`);
  }

  const root = HtmlParser.parse(html);
  const intro = root.querySelector(".data_intro");
  if (!intro) {
    throw new Error(`NoRaceDataError: ${url}`);
  }

  const name = intro.querySelector("h1")?.firstChild?.rawText?.trim();
  const raceGrade = name?.match(/.*\(G(\d)\)/)?.[1];
  const raceNumber = intro.querySelector("dt")?.rawText?.trim()?.slice(0, -2);
  const condition = intro
    .querySelector("span")
    ?.firstChild.rawText.match(conditionRegExp)?.groups;
  const info = intro
    .querySelector(".smalltxt")
    ?.firstChild.rawText.match(infoRegExp)?.groups;
  if (!name || !raceNumber || !condition || !info) {
    throw new Error(`failed to parse intro ${url}`);
  }
  const trackCondFigure = root
    .querySelector(".result_table_02 td")
    ?.text?.match(/(\d+)\u00A0\(\?\)/)?.[1];

  const raceResult: RaceResult[] | undefined = root
    .querySelector(".race_table_01")
    ?.childNodes.slice(3, -1)
    .map((e) => e.querySelectorAll("td"))
    .map(parseResult);

  const payoffResult: PayoffResult = root
    .querySelectorAll(".pay_block tr")
    .map(parsePayoff)
    .reduce((acc, e) => ({ ...acc, ...e }), {});

  if (!raceResult?.length) {
    throw new Error(`no race result ${url}`);
  }

  const { steeple, surf, turn, line, dist, wether, trackCond, startTime } =
    condition;
  const { date, monthCnt, course, dayCnt, age, ageHigher, raceClass, detail } =
    info;

  return {
    id,
    course: course as Race["course"],
    raceNumber: parseInt(raceNumber),
    name,
    raceGrade: raceGrade ? parseInt(raceGrade) : undefined,
    steeple: steeple as Race["steeple"],
    surf: surf as Race["surf"],
    turn: turn as Race["turn"],
    line: line as Race["line"],
    dist: parseInt(dist),
    wether: wether as Race["wether"],
    trackCond: trackCond as Race["trackCond"],
    startTime: parseDate(`${date}${startTime}`, "y年M月d日HH:mm", new Date()),
    monthCnt: parseInt(monthCnt),
    dayCnt: parseInt(dayCnt),
    age: parseInt(age),
    ageHigher: ageHigher as Race["ageHigher"],
    raceClass: raceClass as Race["raceClass"],
    detail,
    trackCondFigure: trackCondFigure ? parseInt(trackCondFigure) : undefined,
    horseCnt: raceResult.length,
    entryCnt: raceResult.filter(
      (result) => !["取", "除"].includes(result.ranking as string)
    ).length,
    goalCnt: raceResult.filter(
      (result) => !["取", "除", "中"].includes(result.ranking as string)
    ).length,
    rankCnt: raceResult.filter((result) => typeof result.ranking === "number")
      .length,
    raceResult,
    payoffResult,
  };
};

export default parseRace;
