export const baseUrl = "https://db.netkeiba.com";

export const courses = [
  "札幌",
  "函館",
  "福島",
  "中山",
  "東京",
  "新潟",
  "中京",
  "京都",
  "阪神",
  "小倉",
] as const;
export const surfs = ["芝", "ダ", "芝 ダート"] as const;
export const turns = ["右", "左"] as const;
export const wethers = ["晴", "曇", "雨", "小雨", "雪", "小雪"] as const;
export const trackConds = ["良", "稍重", "重", "不良"] as const;

export const threeWin = ["3勝クラス", "1600万下"] as const;
export const twoWin = ["2勝クラス", "1000万下"] as const;
export const oneWin = ["1勝クラス", "500万下"] as const;

export const conditionRegExp = RegExp(
  `(?<steeple>障)?(?<surf>${surfs.join("|")})(?<turn>${turns.join(
    "|"
  )})?(?<line>(?: 外)|(?:直線))?(?<dist>\\d+?)m&.*天候 : (?<wether>${wethers.join(
    "|"
  )})&.*: (?<trackCond>${trackConds.join(
    "|"
  )})&.*発走 : (?<startTime>\\d+:\\d+)`
);

export const infoRegExp = RegExp(
  `(?<date>\\d+?年\\d+?月\\d+?日) (?<monthCnt>\\d+?)回(?<course>${courses.join(
    "|"
  )})(?<dayCnt>\\d+?)日目 (?:障害)?(?<age>\\d)歳(?<ageHigher>(?:以上)?)(?<raceClass>.+?)&.*;(?<detail>.*)`
);
