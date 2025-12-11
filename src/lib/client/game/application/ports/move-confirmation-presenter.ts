import type { Block, BoardMatrix, SlotIdx } from "$types";

export interface IMoveConfirmationPresenter {
  getConfirmPreviewData: (p: {
    board: BoardMatrix;
    block: Block;
    position: [number, number];
    slotIdx: SlotIdx;
  }) => Promise<HTMLCanvasElement>;
}
