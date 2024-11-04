import { getBlockMatrix } from '$lib/game';
import type { BlockMatrix, BoardMatrix } from '$lib/types';

describe('isBlockPlaceable 내부 로직 검사', () => {
  const createEmptyBoard = (): BoardMatrix =>
    Array(20).fill(undefined).map(() => Array(20).fill(false));
  let board = createEmptyBoard();
  beforeEach(() => {
    board = createEmptyBoard();
  });
  const singleCellBlock: BlockMatrix = getBlockMatrix({ type: '10', rotation: 0, flip: false });
  const complexBlock: BlockMatrix = getBlockMatrix({ type: '54', rotation: 0, flip: false });
});
