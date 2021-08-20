import * as Bet from "./bet";

export interface Payoff<B extends Bet.BetType> {
  bet: B;
  earn: number;
  popularity: number;
}

export default interface PayoffResult {
  win?: [Payoff<Bet.Win>]; // 単勝
  place?: [Payoff<Bet.Place>, Payoff<Bet.Place>, Payoff<Bet.Place>]; // 複勝
  bracketQuinella?: [Payoff<Bet.BracketQuinella>]; // 枠連
  quinella?: [Payoff<Bet.Quinella>]; // 馬連
  quinellaPlace?: [
    Payoff<Bet.QuinellaPlace>,
    Payoff<Bet.QuinellaPlace>,
    Payoff<Bet.QuinellaPlace>
  ]; // ワイド
  exacta?: [Payoff<Bet.Exacta>]; // 馬単
  trio?: [Payoff<Bet.Trio>]; // 3連複
  trifecta?: [Payoff<Bet.Trifecta>]; // 3連単
}
