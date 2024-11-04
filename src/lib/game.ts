import type { Block, BlockMatrix, BlockType, PlaceBlockDTO, PutBlockDTO } from "./types";

/**
 * 디버깅용 함수들. 콘솔 출력 시 블록에 색 입히기
 */
const putColorOnBlocks = (rowOfBoard: (string | number)[]) => {
  let strToReturn = '';
  rowOfBoard.forEach((e: string | number, idx: number) => {
    switch (e) {
      case 'a':
        strToReturn += `${idx === 0 ? '│' : ' '}\x1b[44m\x1b[33ma \x1b[49m\x1b[37m${idx < 19 && rowOfBoard[idx + 1] === rowOfBoard[idx] ? '\x1b[44m' : ''}`;
        break;
      case 'b':
        strToReturn += `${idx === 0 ? '│' : ' '}\x1b[43m\x1b[30mb \x1b[49m\x1b[37m${idx < 19 && rowOfBoard[idx + 1] === rowOfBoard[idx] ? '\x1b[43m' : ''}`;
        break;
      case 'c':
        strToReturn += `${idx === 0 ? '│' : ' '}\x1b[41m\x1b[37mc \x1b[49m\x1b[37m${idx < 19 && rowOfBoard[idx + 1] === rowOfBoard[idx] ? '\x1b[41m' : ''}`;
        break;
      case 'd':
        strToReturn += `${idx === 0 ? '│' : ' '}\x1b[42m\x1b[37md \x1b[49m\x1b[37m${idx < 19 && rowOfBoard[idx + 1] === rowOfBoard[idx] ? '\x1b[42m' : ''}`;
        break;
      default:
        strToReturn += `${idx === 0 ? '│' : ' '}\x1b[49m\x1b[37m0 \x1b[49m\x1b[37m`;
        break;
    }
  });
  return strToReturn;
};
const strToPrint = (board: (string | number)[][]) => {
  let strToReturn = '';
  for (let i = 0; i < board.length; i += 1) {
    strToReturn += `│ ${i.toString().length === 1 ? `${i} ` : i} ${putColorOnBlocks(board[i])}│${i === 19 ? '' : '\n'}`;
  }
  return strToReturn;
};
export const printBoard = (board: (string | number)[][]): void => {
  global.console.log(`┌────┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┐
│idx │0 │1 │2 │3 │4 │5 │6 │7 │8 │9 │10│11│12│13│14│15│16│17│18│19│
├────┼──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┤
${strToPrint(board)}
└────┴───────────────────────────────────────────────────────────┘`);
};

const preset: Record<BlockType, BlockMatrix> = {
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

export const createNewBoard = (): (string | number)[][] => Array.from(Array(20), () => {
  const newArr: (string | number)[] = [];
  newArr.length = 20;
  return newArr.fill(0);
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

export const isFirstMoveValid = ({ block, playerIdx, turn, position }: PlaceBlockDTO) => {
  if (turn > 3) {
    return true;
  }
  const [row, col] = position;

  const blockHeight = block.length;
  const blockWidth = block[0].length;
  const cornerPositionsPreset = {
    0: { board: [0, 0], block: [0, 0] },
    1: { board: [0, 19], block: [0, blockWidth - 1] },
    2: { board: [19, 19], block: [blockHeight - 1, blockWidth - 1] },
    3: { board: [19, 0], block: [blockHeight - 1, 0] },
  };

  const { board: boardPosition, block: blockPosition } = cornerPositionsPreset[playerIdx];

  if (!block[blockPosition[0]][blockPosition[1]]) {
    return false;
  }
  return row + blockHeight - 1 === boardPosition[0]
    && col + blockWidth - 1 === boardPosition[1];
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

export const hasDiagonalConnection = ({ block, position, board, playerIdx }: PlaceBlockDTO) => {
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
            return board[rowOnBoard][colOnBoard] === playerIdx;
          })
        );
      }
    })
  );
};

export const hasEdgeConnection = ({ block, board, playerIdx, position }: PlaceBlockDTO) => {
  const [row, col] = position;
  const boardSize = 20;
  return block.some((blockLine, blockRow) =>
    blockLine.some((blockCell, blockCol) => {
      if (!blockCell) return false;
      const boardRow = blockRow + row;
      const boardCol = blockCol + col;
      return (
        (boardRow > 0 && board[boardRow - 1][boardCol] === playerIdx)
        || (boardRow < boardSize - 1 && board[boardRow + 1][boardCol] === playerIdx)
        || (boardCol > 0 && board[boardRow][boardCol - 1] === playerIdx)
        || (boardCol < boardSize - 1 && board[boardRow][boardCol + 1] === playerIdx)
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

export const isBlockPlaceable = ({ block, position, board, playerIdx, turn }: PlaceBlockDTO): { result: boolean, reason?: string } => {
  if (!isWithinBoardBounds({ block, position, board, playerIdx, turn })) {
    return { result: false, reason: 'bound' };
  }

  if (!isFirstMoveValid({ block, position, board, playerIdx, turn })) {
    return { result: false, reason: 'invalid first move' };
  }

  if (!hasDiagonalConnection({ block, position, board, playerIdx, turn })) {
    return { result: false, reason: 'no connection' };
  }

  if (hasEdgeConnection({ block, position, board, playerIdx, turn })) {
    return { result: false, reason: 'connected with other block' };
  }

  if (hasOverlap({ block, position, board, playerIdx, turn })) {
    return { result: false, reason: 'overlapped' };
  }

  return { result: true };
};

export const placeBlock = ({ block, position, board, playerIdx }: PlaceBlockDTO) => {
  const [row, col] = position;
  block.forEach((blockLine, rowIdx) => {
    blockLine.forEach((blockCell, colIdx) => {
      if (blockCell) {
        board[row + rowIdx][col + colIdx] = playerIdx;
      }
    });
  });
};

export const putBlockOnBoard = ({ board, blockInfo, position, playerIdx, turn }: PutBlockDTO) => {
  const block = getBlockMatrix(blockInfo);

  const { result, reason } = isBlockPlaceable({ block, position, board, playerIdx, turn })
  if (!result) {
    return reason;
  }

  placeBlock({ block, position, board, playerIdx, turn });
};