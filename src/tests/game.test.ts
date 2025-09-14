import { getBlockMatrix, hasDiagonalConnection, hasEdgeConnection, hasOverlap, isFirstMoveValid, isWithinBoardBounds, placeBlock } from '$lib/game/core';
import type { BlockMatrix, BoardMatrix, PlaceBlockDTO, SlotIdx } from '$types';

describe('isBlockPlaceableAt 내부 로직 검사', () => {
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
        const dto: PlaceBlockDTO = { block, position: [9, 9], board, slotIdx: 0, turn: 0 };

        const result = isWithinBoardBounds(dto);

        expect(result).toBe(true);
      });

      test('작은 기역자 블록을 보드 경계에 배치하면 보드 내부에 완전히 들어가 true를 반환', () => {
        [[0, 0], [0, 18], [18, 18], [18, 0]].forEach((position) => {
          const dto: PlaceBlockDTO = { block, position, board, slotIdx: 0, turn: 0 };

          const result = isWithinBoardBounds(dto);

          expect(result).toBe(true);
        });
      });
    });

    describe('블록이 보드 경계를 넘어가는 경우', () => {
      test('블록이 보드 상하 경계를 넘으면 false를 반환', () => {
        const upwardTestDTO: PlaceBlockDTO = { block, position: [-1, 0], board, slotIdx: 0, turn: 0 };
        const downwardTestDTO: PlaceBlockDTO = { block, position: [19, 0], board, slotIdx: 0, turn: 0 };

        const upwardResult = isWithinBoardBounds(upwardTestDTO);
        const downwardResult = isWithinBoardBounds(downwardTestDTO);

        expect(upwardResult).toBe(false);
        expect(downwardResult).toBe(false);
      });

      test('블록이 보드 좌우 경계를 넘으면 false를 반환', () => {
        const leftwardTestDTO: PlaceBlockDTO = { block, position: [0, -1], board, slotIdx: 0, turn: 0 };
        const rightwardTestDTO: PlaceBlockDTO = { block, position: [0, 19], board, slotIdx: 0, turn: 0 };

        const leftwardResult = isWithinBoardBounds(leftwardTestDTO);
        const rightwardResult = isWithinBoardBounds(rightwardTestDTO);

        expect(leftwardResult).toBe(false);
        expect(rightwardResult).toBe(false);
      });
    });
  });

  describe('isFirstMoveValid', () => {
    describe('첫 턴인 경우', () => {
      test('코너에 블록을 놓으면 true를 반환', () => {
        const cornerPositions = [[0, 0], [0, 19], [19, 19], [19, 0]];
        cornerPositions.forEach((position, idx) => {
          const dto: PlaceBlockDTO = {
            block: singleCellBlock,
            board,
            position,
            slotIdx: idx as SlotIdx,
            turn: idx,
          };

          const result = isFirstMoveValid(dto);

          expect(result).toBe(true);
        });
      });

      test('코너가 아닌 곳에 블록을 놓으면 false를 반환', () => {
        const dto: PlaceBlockDTO = {
          block: singleCellBlock,
          position: [1, 1],
          board,
          slotIdx: 0,
          turn: 0,
        };

        const result = isFirstMoveValid(dto);

        expect(result).toBe(false);
      });
    });

    test('첫 턴이 아닐 때는 코너가 아니어도 true를 반환', () => {
      const dto: PlaceBlockDTO = {
        block: singleCellBlock,
        position: [1, 1],
        board,
        slotIdx: 0,
        turn: 4,
      };

      const result = isFirstMoveValid(dto);

      expect(result).toBe(true);
    });
  });

  describe('hasDiagonalConnection', () => {
    describe('대각 연결이 유효하지 않는 경우', () => {
      test('주변에 블록이 없는 경우 false를 반환', () => {
        const dto: PlaceBlockDTO = {
          block: complexBlock,
          position: [5, 5],
          board,
          slotIdx: 0,
          turn: 4,
        };

        const result = hasDiagonalConnection(dto);

        expect(result).toBe(false);
      });

      test('다른 플레이어의 블록과 대각선으로 연결된 경우 false를 반환', () => {
        placeBlock({ board, block: singleCellBlock, slotIdx: 1, position: [0, 0], turn: 0 });
        const dto: PlaceBlockDTO = {
          block: singleCellBlock,
          position: [1, 1],
          board,
          slotIdx: 0,
          turn: 1,
        };

        const result = hasDiagonalConnection(dto);

        expect(result).toBe(false);
      });

      test('대각선이 아닌 방향으로만 블록이 있는 경우 false를 반환', () => {
        placeBlock({ block: singleCellBlock, position: [0, 1], board, slotIdx: 0, turn: 0 });
        placeBlock({ block: singleCellBlock, position: [1, 0], board, slotIdx: 0, turn: 0 });
        const dto: PlaceBlockDTO = {
          block: singleCellBlock,
          position: [0, 0],
          board,
          slotIdx: 0,
          turn: 0,
        };

        const result = hasDiagonalConnection(dto);

        expect(result).toBe(false);
      });
    });

    describe('대각 연결이 유효한 경우', () => {
      test('좌상단 연결이 유효한 경우 true를 반환', () => {
        placeBlock({
          block: singleCellBlock,
          board,
          slotIdx: 0,
          position: [0, 0],
          turn: 0
        });
        const dto: PlaceBlockDTO = {
          block: singleCellBlock,
          board,
          slotIdx: 0,
          position: [1, 1],
          turn: 1,
        };

        const result = hasDiagonalConnection(dto);

        expect(result).toBe(true);
      });
      test('우상단 연결이 유효한 경우 true를 반환', () => {
        placeBlock({
          block: singleCellBlock,
          board,
          slotIdx: 0,
          position: [0, 19],
          turn: 0
        });
        const dto: PlaceBlockDTO = {
          block: singleCellBlock,
          board,
          slotIdx: 0,
          position: [1, 18],
          turn: 1,
        };

        const result = hasDiagonalConnection(dto);

        expect(result).toBe(true);
      });

      test('우하단 연결이 유효한 경우 true를 반환', () => {
        placeBlock({
          block: singleCellBlock,
          board,
          slotIdx: 0,
          position: [19, 19],
          turn: 0,
        });
        const dto: PlaceBlockDTO = {
          block: singleCellBlock,
          board,
          slotIdx: 0,
          position: [18, 18],
          turn: 1,
        };

        const result = hasDiagonalConnection(dto);

        expect(result).toBe(true);
      });

      test('좌하단 연결이 유효한 경우 true를 반환', () => {
        placeBlock({
          block: singleCellBlock,
          board,
          slotIdx: 0,
          position: [19, 0],
          turn: 0
        });
        const dto: PlaceBlockDTO = {
          block: singleCellBlock,
          board,
          slotIdx: 0,
          position: [18, 1],
          turn: 1,
        };

        const result = hasDiagonalConnection(dto);

        expect(result).toBe(true);
      });
    });

    describe('복잡한 모양(type 54)의 블록 테스트', () => {
      test('(-1, -1)', () => {
        placeBlock({
          block: singleCellBlock,
          board,
          slotIdx: 0,
          position: [0, 0],
          turn: 0,
        });
        const dto: PlaceBlockDTO = {
          block: complexBlock,
          position: [1, 1],
          board,
          slotIdx: 0,
          turn: 0,
        };

        const result = hasDiagonalConnection(dto);

        expect(result).toBe(true);
      });

      test('(1, -1)', () => {
        placeBlock({
          block: singleCellBlock,
          board,
          slotIdx: 0,
          position: [0, 1],
          turn: 0,
        });
        const dto: PlaceBlockDTO = {
          block: complexBlock,
          position: [1, 0],
          board,
          slotIdx: 0,
          turn: 0,
        };

        const result = hasDiagonalConnection(dto);

        expect(result).toBe(true);
      });

      test('(2, -1)', () => {
        placeBlock({
          block: singleCellBlock,
          board,
          slotIdx: 0,
          position: [2, 0],
          turn: 0,
        });
        const dto: PlaceBlockDTO = {
          block: complexBlock,
          position: [0, 1],
          board,
          slotIdx: 0,
          turn: 0,
        };

        const result = hasDiagonalConnection(dto);

        expect(result).toBe(true);
      });

      test('(3, 0)', () => {
        placeBlock({
          block: singleCellBlock,
          board,
          slotIdx: 0,
          position: [3, 0],
          turn: 0,
        });
        const dto: PlaceBlockDTO = {
          block: complexBlock,
          position: [0, 0],
          board,
          slotIdx: 0,
          turn: 0,
        };

        const result = hasDiagonalConnection(dto);

        expect(result).toBe(true);
      });


      test('(3, 2)', () => {
        placeBlock({
          block: singleCellBlock,
          board,
          slotIdx: 0,
          position: [3, 2],
          turn: 0,
        });
        const dto: PlaceBlockDTO = {
          block: complexBlock,
          position: [0, 0],
          board,
          slotIdx: 0,
          turn: 0,
        };

        const result = hasDiagonalConnection(dto);

        expect(result).toBe(true);
      });

      test('(2, 3)', () => {
        placeBlock({
          block: singleCellBlock,
          board,
          slotIdx: 0,
          position: [2, 3],
          turn: 0,
        });
        const dto: PlaceBlockDTO = {
          block: complexBlock,
          position: [0, 0],
          board,
          slotIdx: 0,
          turn: 0,
        };

        const result = hasDiagonalConnection(dto);

        expect(result).toBe(true);
      });

      test('(0, 3)', () => {
        placeBlock({
          block: singleCellBlock,
          board,
          slotIdx: 0,
          position: [0, 3],
          turn: 0,
        });
        const dto: PlaceBlockDTO = {
          block: complexBlock,
          position: [0, 0],
          board,
          slotIdx: 0,
          turn: 0,
        };

        const result = hasDiagonalConnection(dto);

        expect(result).toBe(true);
      });

      test('(-1, 1)', () => {
        placeBlock({
          block: singleCellBlock,
          board,
          slotIdx: 0,
          position: [0, 1],
          turn: 0,
        });
        const dto: PlaceBlockDTO = {
          block: complexBlock,
          position: [1, 0],
          board,
          slotIdx: 0,
          turn: 0,
        };

        const result = hasDiagonalConnection(dto);

        expect(result).toBe(true);
      });
    });
  });

  describe('hasEdgeConnection', () => {
    describe('다른 블록과 맞닿아있는 경우', () => {
      test('주변에 다른 블록이 전혀 없으면 false를 반환', () => {
        const dto: PlaceBlockDTO = {
          block: singleCellBlock,
          board,
          slotIdx: 0,
          position: [1, 1],
          turn: 0,
        };

        const result = hasEdgeConnection(dto);

        expect(result).toBe(false);
      });

      test('주변에 다른 플레이어 블록만 있으면 false를 반환', () => {
        placeBlock({
          block: singleCellBlock,
          position: [1, 0],
          board,
          slotIdx: 1,
          turn: 0,
        });
        placeBlock({
          block: singleCellBlock,
          position: [0, 1],
          board,
          slotIdx: 1,
          turn: 0,
        });
        placeBlock({
          block: singleCellBlock,
          position: [1, 2],
          board,
          slotIdx: 1,
          turn: 0,
        });
        placeBlock({
          block: singleCellBlock,
          position: [2, 1],
          board,
          slotIdx: 1,
          turn: 0,
        });
        const dto: PlaceBlockDTO = {
          block: singleCellBlock,
          board,
          slotIdx: 0,
          position: [1, 1],
          turn: 0,
        };

        const result = hasEdgeConnection(dto);

        expect(result).toBe(false);
      });

      test('대각 위치에만 해당 플레이어의 블록이 있으면 false를 반환', () => {
        placeBlock({
          block: singleCellBlock,
          position: [0, 0],
          board,
          slotIdx: 0,
          turn: 0,
        });
        placeBlock({
          block: singleCellBlock,
          position: [0, 2],
          board,
          slotIdx: 0,
          turn: 0,
        });
        placeBlock({
          block: singleCellBlock,
          position: [2, 0],
          board,
          slotIdx: 0,
          turn: 0,
        });
        placeBlock({
          block: singleCellBlock,
          position: [2, 2],
          board,
          slotIdx: 0,
          turn: 0,
        });
        const dto: PlaceBlockDTO = {
          block: singleCellBlock,
          board,
          slotIdx: 0,
          position: [1, 1],
          turn: 0,
        };

        const result = hasEdgeConnection(dto);

        expect(result).toBe(false);
      });
    });

    describe('다른 블록과 맞닿아있지 않는 경우', () => {
      test('블록 상단에 해당 플레이어의 블록이 있으면 true 반환', () => {
        placeBlock({
          block: singleCellBlock,
          board,
          slotIdx: 0,
          position: [0, 0],
          turn: 0,
        });
        const dto: PlaceBlockDTO = {
          block: singleCellBlock,
          board,
          slotIdx: 0,
          position: [1, 0],
          turn: 0,
        };

        const result = hasEdgeConnection(dto);

        expect(result).toBe(true);
      });

      test('블록 우측에 해당 플레이어의 블록이 있으면 true 반환', () => {
        placeBlock({
          block: singleCellBlock,
          board,
          slotIdx: 0,
          position: [0, 1],
          turn: 0,
        });
        const dto: PlaceBlockDTO = {
          block: singleCellBlock,
          board,
          slotIdx: 0,
          position: [0, 0],
          turn: 0,
        };

        const result = hasEdgeConnection(dto);

        expect(result).toBe(true);
      });

      test('블록 하단에 해당 플레이어의 블록이 있으면 true 반환', () => {
        placeBlock({
          block: singleCellBlock,
          board,
          slotIdx: 0,
          position: [1, 0],
          turn: 0,
        });
        const dto: PlaceBlockDTO = {
          block: singleCellBlock,
          board,
          slotIdx: 0,
          position: [0, 0],
          turn: 0,
        };

        const result = hasEdgeConnection(dto);

        expect(result).toBe(true);
      });

      test('블록 좌측에 해당 플레이어의 블록이 있으면 true 반환', () => {
        placeBlock({
          block: singleCellBlock,
          board,
          slotIdx: 0,
          position: [0, 0],
          turn: 0,
        });
        const dto: PlaceBlockDTO = {
          block: singleCellBlock,
          board,
          slotIdx: 0,
          position: [0, 1],
          turn: 0,
        };

        const result = hasEdgeConnection(dto);

        expect(result).toBe(true);
      });
    });

    describe('복잡한 모양(type 54)의 블록 테스트', () => {
      test('(-1, 0)', () => {
        placeBlock({
          block: complexBlock,
          board,
          slotIdx: 0,
          position: [0, 0],
          turn: 0,
        });
        const dto: PlaceBlockDTO = {
          block: complexBlock,
          board,
          slotIdx: 0,
          position: [1, 0],
          turn: 0,
        };

        const result = hasEdgeConnection(dto);

        expect(result).toBe(true);
      });

      test('(0, 1)', () => {
        placeBlock({
          block: complexBlock,
          board,
          slotIdx: 0,
          position: [0, 1],
          turn: 0,
        });
        const dto: PlaceBlockDTO = {
          block: complexBlock,
          board,
          slotIdx: 0,
          position: [0, 0],
          turn: 0,
        };

        const result = hasEdgeConnection(dto);

        expect(result).toBe(true);
      });

      test('(0, 2)', () => {
        placeBlock({
          block: complexBlock,
          board,
          slotIdx: 0,
          position: [0, 2],
          turn: 0,
        });
        const dto: PlaceBlockDTO = {
          block: complexBlock,
          board,
          slotIdx: 0,
          position: [0, 0],
          turn: 0,
        };

        const result = hasEdgeConnection(dto);

        expect(result).toBe(true);
      });

      test('(1, 3)', () => {
        placeBlock({
          block: complexBlock,
          board,
          slotIdx: 0,
          position: [1, 3],
          turn: 0,
        });
        const dto: PlaceBlockDTO = {
          block: complexBlock,
          board,
          slotIdx: 0,
          position: [0, 0],
          turn: 0,
        };

        const result = hasEdgeConnection(dto);

        expect(result).toBe(true);
      });

      test('(2, 2)', () => {
        placeBlock({
          block: complexBlock,
          board,
          slotIdx: 0,
          position: [2, 2],
          turn: 0,
        });
        const dto: PlaceBlockDTO = {
          block: complexBlock,
          board,
          slotIdx: 0,
          position: [0, 0],
          turn: 0,
        };

        const result = hasEdgeConnection(dto);

        expect(result).toBe(true);
      });

      test('(3, 1)', () => {
        placeBlock({
          block: complexBlock,
          board,
          slotIdx: 0,
          position: [3, 1],
          turn: 0,
        });
        const dto: PlaceBlockDTO = {
          block: complexBlock,
          board,
          slotIdx: 0,
          position: [0, 0],
          turn: 0,
        };

        const result = hasEdgeConnection(dto);

        expect(result).toBe(true);
      });

      test('(2, 0)', () => {
        placeBlock({
          block: complexBlock,
          board,
          slotIdx: 0,
          position: [2, 0],
          turn: 0,
        });
        const dto: PlaceBlockDTO = {
          block: complexBlock,
          board,
          slotIdx: 0,
          position: [0, 0],
          turn: 0,
        };

        const result = hasEdgeConnection(dto);

        expect(result).toBe(true);
      });

      test('(1, -1)', () => {
        placeBlock({
          block: complexBlock,
          board,
          slotIdx: 0,
          position: [1, 0],
          turn: 0,
        });
        const dto: PlaceBlockDTO = {
          block: complexBlock,
          board,
          slotIdx: 0,
          position: [0, 1],
          turn: 0,
        };

        const result = hasEdgeConnection(dto);

        expect(result).toBe(true);
      });

      test('(0, -1)', () => {
        placeBlock({
          block: complexBlock,
          board,
          slotIdx: 0,
          position: [0, 0],
          turn: 0,
        });
        const dto: PlaceBlockDTO = {
          block: complexBlock,
          board,
          slotIdx: 0,
          position: [0, 1],
          turn: 0,
        };

        const result = hasEdgeConnection(dto);

        expect(result).toBe(true);
      });
    });
  });

  describe('hasOverlap', () => {
    describe('1x1 블록의 충돌 테스트', () => {
      test('셀에 다른 블록이 존재하면 true 반환', () => {
        placeBlock({
          block: singleCellBlock,
          board,
          slotIdx: 0,
          position: [1, 1],
          turn: 0,
        });
        const dto: PlaceBlockDTO = {
          block: singleCellBlock,
          board,
          slotIdx: 0,
          position: [1, 1],
          turn: 1,
        };

        const result = hasOverlap(dto);

        expect(result).toBe(true);
      });

      test('셀에 다른 블록이 존재하지 않으면 false 반환', () => {
        const dto: PlaceBlockDTO = {
          block: singleCellBlock,
          board,
          slotIdx: 0,
          position: [1, 1],
          turn: 1,
        };

        const result = hasOverlap(dto);

        expect(result).toBe(false);
      });
    });

    describe('복잡한 모양(type 54)의 블록 테스트', () => {
      test('블록의 빈 공간에만 다른 블록이 존재하면 false 반환', () => {
        placeBlock({
          block: singleCellBlock,
          board,
          slotIdx: 0,
          position: [1, 2],
          turn: 0,
        });
        placeBlock({
          block: singleCellBlock,
          board,
          slotIdx: 0,
          position: [1, 3],
          turn: 0,
        });
        placeBlock({
          block: singleCellBlock,
          board,
          slotIdx: 0,
          position: [3, 1],
          turn: 0,
        });
        placeBlock({
          block: singleCellBlock,
          board,
          slotIdx: 0,
          position: [3, 3],
          turn: 0,
        });
        const dto: PlaceBlockDTO = {
          block: complexBlock,
          board,
          slotIdx: 0,
          position: [1, 1],
          turn: 0,
        };

        const result = hasOverlap(dto);

        expect(result).toBe(false);
      });

      test('블록의 셀에만 다른 블록이 존재하면 true 반환', () => {
        placeBlock({
          block: singleCellBlock,
          board,
          slotIdx: 0,
          position: [1, 1],
          turn: 0,
        });
        placeBlock({
          block: singleCellBlock,
          board,
          slotIdx: 0,
          position: [2, 1],
          turn: 0,
        });
        placeBlock({
          block: singleCellBlock,
          board,
          slotIdx: 0,
          position: [2, 2],
          turn: 0,
        });
        placeBlock({
          block: singleCellBlock,
          board,
          slotIdx: 0,
          position: [2, 3],
          turn: 0,
        });
        placeBlock({
          block: singleCellBlock,
          board,
          slotIdx: 0,
          position: [3, 2],
          turn: 0,
        });
        const dto: PlaceBlockDTO = {
          block: complexBlock,
          board,
          slotIdx: 0,
          position: [1, 1],
          turn: 0,
        };

        const result = hasOverlap(dto);

        expect(result).toBe(true);
      });

      test('블록의 빈 공간과 셀 모두에 다른 블록이 존재하면 true 반환', () => {
        const randomBlock = getBlockMatrix({
          type: '58',
          rotation: 1,
          flip: false,
        });
        placeBlock({
          block: randomBlock,
          board,
          slotIdx: 0,
          position: [1, 1],
          turn: 0,
        });
        const dto: PlaceBlockDTO = {
          block: complexBlock,
          board,
          slotIdx: 0,
          position: [1, 1],
          turn: 0,
        };

        const result = hasOverlap(dto);

        expect(result).toBe(true);
      });
    });
  });
});
