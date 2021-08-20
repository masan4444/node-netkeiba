import * as t from "io-ts";

const HorseSex = t.union([t.literal("牡"), t.literal("牝"), t.literal("セ")]);

export const RaceResultValidator = t.type({
  ranking: t.union([
    t.number,
    t.literal("失"),
    t.literal("中"),
    t.literal("除"),
    t.literal("取"),
  ]),

  frameNumber: t.number,
  horseNumber: t.number,
  horseId: t.string,

  sex: HorseSex,
  age: t.number,
  carryWeight: t.number,
  jockeyId: t.string,

  time: t.union([t.number, t.undefined]),
  margin: t.string,
  timeFigure: t.union([t.number, t.undefined]),
  cornerRanking: t.array(t.number),
  lastPhaseTime: t.union([t.number, t.undefined]),

  odds: t.union([t.number, t.undefined]),
  popularity: t.union([t.number, t.undefined]),

  weight: t.union([t.number, t.literal("計不")]),
  weightChange: t.union([t.number, t.literal("計不")]),
  trainerId: t.string,
  ownerId: t.string,
  prizeMoney: t.number,
});

type RaceResult = t.TypeOf<typeof RaceResultValidator>;

export default RaceResult;
