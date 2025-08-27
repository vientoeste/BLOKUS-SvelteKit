import type { Score } from "$lib/domain/score";

export interface IGameResultReader {
  getScore(): Score | undefined;
}
