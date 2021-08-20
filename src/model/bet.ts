export type Win = [number]; // 単勝
export type Place = [number]; // 複勝
export type BracketQuinella = [number, number]; // 枠連
export type Quinella = [number, number]; // 馬連
export type QuinellaPlace = [number, number]; // ワイド
export type Exacta = [number, number]; // 馬単
export type Trio = [number, number, number]; // 三連複
export type Trifecta = [number, number, number]; // 三連単
export type BetType =
  | Win
  | Place
  | BracketQuinella
  | Quinella
  | QuinellaPlace
  | Exacta
  | Trio
  | Trifecta;

export const fromJp = (betTypeJp: string): string => {
  switch (betTypeJp) {
    case "単勝":
      return "win";
    case "複勝":
      return "place";
    case "枠連":
      return "bracketQuinella";
    case "馬連":
      return "quinella";
    case "ワイド":
      return "quinellaPlace";
    case "馬単":
      return "exacta";
    case "三連複":
      return "trio";
    case "三連単":
      return "trifecta";
    default:
      throw new Error("BetTypeParseError");
  }
};
