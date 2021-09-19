import {
  courses,
  oneWin,
  surfs,
  threeWin,
  trackConds,
  turns,
  lines,
  twoWin,
  wethers,
} from "../const";
import PayoffResult from "./payoffResult";
import RaceResult, { RaceResultValidator } from "./raceResult";

type Course = typeof courses[number];
type Surf = typeof surfs[number];
type Turn = typeof turns[number];
type Line = typeof lines[number];
type Wether = typeof wethers[number];
type TrackCond = typeof trackConds[number];
type RaceClass =
  | "オープン"
  | typeof threeWin[number]
  | typeof twoWin[number]
  | typeof oneWin[number]
  | "未勝利"
  | "新馬";

type Race = {
  id: string; // 201509030811

  course: Course; // 阪神
  raceNumber: number; // 11
  name: string; // 第56回宝塚記念(G1)
  raceGrade?: number; // 1

  steeple?: "障";
  surf: Surf; // 芝
  turn?: Turn; // 右
  line?: Line;
  dist: number; // 2200
  wether: Wether; // 晴
  trackCond: TrackCond; // 良

  startTime: Date; // 2015/06/28 15:40
  monthCnt: number; // 3
  dayCnt: number; // 8

  age: number; // 3
  ageHigher?: "以上"; // true (以上)
  raceClass: RaceClass; // オープン
  detail: string; // (国際)(指)(定量)
  trackCondFigure?: number; // 5

  horseCnt: number; // 出走予定馬数
  entryCnt: number; // 出走馬数
  goalCnt: number; // ゴールした馬数
  rankCnt: number; // ゴールが認定された馬数

  raceResult: RaceResult[];
  payoffResult: PayoffResult;
};

export { Race as default, RaceResult, RaceResultValidator, PayoffResult };
