import type { BlockPlaceabilityCalculator } from "./blockPlaceabilityCalculator";

export class GameDomainLayer {
  private blockPlaceabilityCalculator: BlockPlaceabilityCalculator;

  constructor({
    blockPlaceabilityCalculator,
  }: {
    blockPlaceabilityCalculator: BlockPlaceabilityCalculator;
  }) {
    this.blockPlaceabilityCalculator = blockPlaceabilityCalculator;
  }
}
