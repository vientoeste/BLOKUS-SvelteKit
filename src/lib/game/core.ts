import { convertBoardToArr } from "$lib/utils";
import type { Block, BlockMatrix, BlockType, BoardMatrix, PlaceBlockDTO, PutBlockDTO, Rotation, SlotIdx, SubmitMoveDTO } from "../types";

export const preset: Record<BlockType, BlockMatrix> = {
  '50': [[true, true, true, true, true]],
  '51': [
    [true, true, true],
    [true, false, false],
    [true, false, false],
  ],
  '52': [
    [false, true, false],
    [true, true, true],
    [false, true, false],
  ],
  '53': [
    [false, false, true],
    [false, true, true],
    [true, true, false],
  ],
  '54': [
    [true, false, false],
    [true, true, true],
    [false, true, false],
  ],
  '55': [
    [true, true, true],
    [false, true, false],
    [false, true, false],
  ],
  '56': [
    [true, true, true, true],
    [true, false, false, false],
  ],
  '57': [
    [false, false, true],
    [true, true, true],
    [true, false, false],
  ],
  '58': [
    [true, false],
    [true, true],
    [true, true],
  ],
  '59': [
    [true, true, false, false],
    [false, true, true, true],
  ],
  '5a': [
    [true, true],
    [true, false],
    [true, true],
  ],
  '5b': [
    [false, true, false, false],
    [true, true, true, true],
  ],
  '40': [[true, true, true, true]],
  '41': [
    [true, true, true],
    [true, false, false],
  ],
  '42': [
    [true, true, true],
    [false, true, false],
  ],
  '43': [
    [true, true, false],
    [false, true, true],
  ],
  '44': [
    [true, true],
    [true, true],
  ],
  '30': [[true, true, true]],
  '31': [
    [true, true],
    [true, false],
  ],
  '20': [[true, true]],
  '10': [[true]],
};

export const createNewBoard = (): BoardMatrix => Array.from(Array(20), () => {
  const newArr: (number | false)[] = [];
  newArr.length = 20;
  return newArr.fill(false);
});

const createBlock = (type: BlockType) => preset[type].map(row => Array.from(row)) as BlockMatrix;

const flipBlock = (blockMatrix: BlockMatrix) =>
  blockMatrix.reverse();

const rotateBlock = (blockMatrix: BlockMatrix) => {
  const rotatedBlock: boolean[][] = Array.from({ length: blockMatrix[0].length }, () => {
    const newArr: boolean[] = [];
    newArr.length = blockMatrix.length;
    newArr.fill(false);
    return newArr;
  });

  blockMatrix.forEach((blockLine, xIdx) => {
    blockLine.forEach((blockSpace, yIdx) => {
      if (blockSpace) {
        rotatedBlock[yIdx][blockMatrix.length - xIdx - 1] = true;
      }
    });
  });

  blockMatrix.length = rotatedBlock.length;
  rotatedBlock.forEach((blockLine, idx) => {
    blockMatrix[idx] = [...blockLine];
  });
};

export const getBlockMatrix = (blockInfo: Block): BlockMatrix => {
  const block = createBlock(blockInfo.type);
  if (blockInfo.rotation !== 0) {
    for (let rotationTime = 1; rotationTime <= blockInfo.rotation; rotationTime += 1) {
      rotateBlock(block);
    }
  }
  if (blockInfo.flip === true) {
    flipBlock(block);
  }
  return block;
};

export const isWithinBoardBounds = ({ block, position }: PlaceBlockDTO) => {
  const [row, col] = position;
  const boardHeight = 20;
  const boardWidth = 20;
  const blockHeight = block.length;
  const blockWidth = block[0].length;

  return !(
    row < 0 ||
    row + blockHeight > boardHeight ||
    col < 0 ||
    col + blockWidth > boardWidth
  );
};

export const isFirstMoveValid = ({ block, slotIdx, position }: PlaceBlockDTO) => {
  const [row, col] = position;

  const blockHeight = block.length;
  const blockWidth = block[0].length;
  const cornerPositionsPreset = {
    0: { board: [0, 0], block: [0, 0] },
    1: { board: [0, 19], block: [0, blockWidth - 1] },
    2: { board: [19, 19], block: [blockHeight - 1, blockWidth - 1] },
    3: { board: [19, 0], block: [blockHeight - 1, 0] },
  };

  const { board: boardPosition, block: blockPosition } = cornerPositionsPreset[slotIdx];

  if (!block[blockPosition[0]][blockPosition[1]]) {
    return false;
  }
  return row + blockPosition[0] === boardPosition[0]
    && col + blockPosition[1] === boardPosition[1];
};

export const getDiagonalCellsToCheck = ({ block, row, col }: { block: BlockMatrix, row: number, col: number }) => {
  const diagonalCells = [[true, true], [true, true]];
  if (col < block[0].length - 1 && block[row][col + 1] === true) {
    diagonalCells[0][1] = false;
    diagonalCells[1][1] = false;
  }
  if (col > 0 && block[row][col - 1] === true) {
    diagonalCells[0][0] = false;
    diagonalCells[1][0] = false;
  }
  if (row > 0 && block[row - 1][col] === true) {
    diagonalCells[0][0] = false;
    diagonalCells[0][1] = false;
  }
  if (row < block.length - 1 && block[row + 1][col] === true) {
    diagonalCells[1][0] = false;
    diagonalCells[1][1] = false;
  }
  return diagonalCells;
};

export const hasDiagonalConnection = ({ block, position, board, slotIdx }: PlaceBlockDTO) => {
  const [row, col] = position;
  return block.some((blockLine, rowIdx) =>
    blockLine.some((blockCell, colIdx) => {
      if (blockCell === true) {
        const diagonalCells = getDiagonalCellsToCheck({ block, row: rowIdx, col: colIdx });
        return diagonalCells.some((diagonalCellLine, diagonalCellRow) =>
          diagonalCellLine.some((cell, diagonalCellCol) => {
            if (!cell) {
              return false;
            }
            const rowOnBoard = row + rowIdx + 2 * diagonalCellRow - 1;
            const colOnBoard = col + colIdx + 2 * diagonalCellCol - 1;
            if (rowOnBoard < 0 || colOnBoard < 0 || rowOnBoard > 19 || colOnBoard > 19) {
              return false;
            }
            return board[rowOnBoard][colOnBoard] === slotIdx;
          })
        );
      }
    })
  );
};

export const hasEdgeConnection = ({ block, board, slotIdx, position }: PlaceBlockDTO) => {
  const [row, col] = position;
  const boardSize = 20;
  return block.some((blockLine, blockRow) =>
    blockLine.some((blockCell, blockCol) => {
      if (!blockCell) return false;
      const boardRow = blockRow + row;
      const boardCol = blockCol + col;
      return (
        (boardRow > 0 && board[boardRow - 1][boardCol] === slotIdx)
        || (boardRow < boardSize - 1 && board[boardRow + 1][boardCol] === slotIdx)
        || (boardCol > 0 && board[boardRow][boardCol - 1] === slotIdx)
        || (boardCol < boardSize - 1 && board[boardRow][boardCol + 1] === slotIdx)
      );
    })
  );
};

export const hasOverlap = ({ block, board, position }: PlaceBlockDTO) => {
  const [row, col] = position;
  return block.some((blockLine, blockRow) =>
    blockLine.some((cell, blockCol) => {
      if (!cell) return false;
      const boardRow = blockRow + row;
      const boardCol = blockCol + col;
      return board[boardRow][boardCol] !== false;
    })
  );
};

export const hasPlayerMadeFirstMove = ({
  board, slotIdx,
}: PlaceBlockDTO) => {
  const cornerPosition = {
    0: [0, 0],
    1: [0, 19],
    2: [19, 19],
    3: [19, 0],
  }[slotIdx];
  const cornerCell = board[cornerPosition[0]][cornerPosition[1]];
  return cornerCell === slotIdx;
};

export const isBlockPlaceableAt = ({ block, position, board, slotIdx, turn }: PlaceBlockDTO): { result: boolean, reason?: string } => {
  if (!isWithinBoardBounds({ block, position, board, slotIdx, turn })) {
    return { result: false, reason: 'bound' };
  }

  // [TODO] test must be updated
  const isFirstMoveMade = hasPlayerMadeFirstMove({ block, board, position, slotIdx, turn });
  if (
    !isFirstMoveMade
    && !isFirstMoveValid({ block, position, board, slotIdx, turn })
  ) {
    return { result: false, reason: 'invalid first move' };
  }

  if (
    isFirstMoveMade
    && !hasDiagonalConnection({ block, position, board, slotIdx, turn })
  ) {
    return { result: false, reason: 'no connection' };
  }

  if (hasEdgeConnection({ block, position, board, slotIdx, turn })) {
    return { result: false, reason: 'connected with other block' };
  }

  if (hasOverlap({ block, position, board, slotIdx, turn })) {
    return { result: false, reason: 'overlapped' };
  }

  return { result: true };
};

export const placeBlock = ({ block, position, board, slotIdx }: PlaceBlockDTO) => {
  const [row, col] = position;
  block.forEach((blockLine, rowIdx) => {
    blockLine.forEach((blockCell, colIdx) => {
      if (blockCell) {
        board[row + rowIdx][col + colIdx] = slotIdx;
      }
    });
  });
};

export const rollbackMove = ({ board, blockInfo, position: [row, col] }: SubmitMoveDTO & { board: BoardMatrix }) => {
  const block = getBlockMatrix(blockInfo);
  block.forEach((blockLine, rowIdx) => {
    blockLine.forEach((blockCell, colIdx) => {
      if (blockCell) {
        board[row + rowIdx][col + colIdx] = false;
      }
    })
  })
};

export const putBlockOnBoard = ({ board, blockInfo, position, slotIdx, turn }: PutBlockDTO) => {
  const block = getBlockMatrix(blockInfo);

  const { result, reason } = isBlockPlaceableAt({ block, position, board, slotIdx, turn })
  if (!result) {
    return reason;
  }

  placeBlock({ block, position, board, slotIdx, turn });
};

export const hasValidPlacement = ({ board, slotIdx, blockType }: {
  board: BoardMatrix,
  slotIdx: SlotIdx,
  blockType: BlockType,
}) => {
  for (let rotation = 0; rotation < 4; rotation += 1) {
    for (let flip = 0; flip <= 1; flip += 1) {
      const rotatedBlock = getBlockMatrix({ type: blockType, rotation: rotation as Rotation, flip: flip === 1 });
      for (let row = 0; row < 20; row += 1) {
        for (let col = 0; col < 20; col += 1) {
          const result = isBlockPlaceableAt({ block: rotatedBlock, position: [row, col], board, slotIdx, turn: 0 });
          if (result.result) {
            return true;
          }
        }
      }
    }
  }
};

// [TODO] add last-monomino-rule
export const calculatePlayerScores = (board: BoardMatrix): Record<SlotIdx, number> => {
  const scores: Record<SlotIdx, number> = { 0: 0, 1: 0, 2: 0, 3: 0 };

  board.forEach(row => {
    row.forEach(cell => {
      if (cell !== false) {
        scores[cell as SlotIdx] += 1;
      }
    });
  });

  return scores;
};
