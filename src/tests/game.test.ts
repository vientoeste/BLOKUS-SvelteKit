import { getBlockMatrix, isWithinBoardBounds } from '$lib/game';
import type { BlockMatrix, BoardMatrix, PlaceBlockDTO } from '$lib/types';

describe('isBlockPlaceable 내부 로직 검사', () => {
  const createEmptyBoard = (): BoardMatrix =>
    Array(20).fill(undefined).map(() => Array(20).fill(false));
  let board = createEmptyBoard();
  beforeEach(() => {
    board = createEmptyBoard();
  });
  const singleCellBlock: BlockMatrix = getBlockMatrix({ type: '10', rotation: 0, flip: false });
  const complexBlock: BlockMatrix = getBlockMatrix({ type: '54', rotation: 0, flip: false });

  describe('isWithinBoardBounds', () => {
    const block: BlockMatrix = getBlockMatrix({ type: '31', rotation: 0, flip: false });

    describe('블록이 보드 경계를 넘지 않는 경우', () => {
      test('작은 기역자 블록을 중앙에 배치하면 보드 내부에 완전히 들어가 true를 반환', () => {
        const dto: PlaceBlockDTO = { block, position: [9, 9], board, playerIdx: 0, turn: 0 };

        const result = isWithinBoardBounds(dto);

        expect(result).toBe(true);
      });

      test('작은 기역자 블록을 보드 경계에 배치하면 보드 내부에 완전히 들어가 true를 반환', () => {
        [[0, 0], [0, 18], [18, 18], [18, 0]].forEach((position) => {
          const dto: PlaceBlockDTO = { block, position, board, playerIdx: 0, turn: 0 };

          const result = isWithinBoardBounds(dto);

          expect(result).toBe(true);
        });
      });
    });

    describe('블록이 보드 경계를 넘어가는 경우', () => {
      test('블록이 보드 상하 경계를 넘으면 false를 반환', () => {
        const upwardTestDTO: PlaceBlockDTO = { block, position: [-1, 0], board, playerIdx: 0, turn: 0 }
        const downwardTestDTO: PlaceBlockDTO = { block, position: [19, 0], board, playerIdx: 0, turn: 0 }

        const upwardResult = isWithinBoardBounds(upwardTestDTO);
        const downwardResult = isWithinBoardBounds(downwardTestDTO);

        expect(upwardResult).toBe(false);
        expect(downwardResult).toBe(false);
      });

      test('블록이 보드 좌우 경계를 넘으면 false를 반환', () => {
        const leftwardTestDTO: PlaceBlockDTO = { block, position: [0, -1], board, playerIdx: 0, turn: 0 }
        const rightwardTestDTO: PlaceBlockDTO = { block, position: [0, 19], board, playerIdx: 0, turn: 0 }

        const leftwardResult = isWithinBoardBounds(leftwardTestDTO);
        const rightwardResult = isWithinBoardBounds(rightwardTestDTO);

        expect(leftwardResult).toBe(false);
        expect(rightwardResult).toBe(false);
      });
    });
  });
});
