import type { ApiResponse, Block, BlockType, BoardMatrix, PlayerIdx, RoomCacheInf, Rotation, SlotIdx } from "$types";
import { json } from "@sveltejs/kit";
import { CustomError } from "./error";
import type { RoomCacheEntity } from "./database/redis";

export type Undefinedable<T> = {
  [K in keyof T]: T[K] | undefined;
};

export const getUserInfoFromLocalStorage = (localStorage: Storage) => {
  const id = localStorage.getItem('id');
  const userId = localStorage.getItem('userId');
  const username = localStorage.getItem('username');
  return { id, userId, username };
};

export const clearLocalStorageAuthStatus = (localStorage: Storage) => {
  localStorage.removeItem('id');
  localStorage.removeItem('username');
  const isSaved = Boolean(localStorage.getItem('save'));
  if (!isSaved) {
    localStorage.removeItem('userId');
  }
};

export const isFormDataFieldsValid = (formData: FormData, allowed: string[]) => {
  const disallowed = [];
  for (const field of formData.keys()) {
    if (!allowed.includes(field)) disallowed.push(field);
  }
  return disallowed.length === 0;
};

type ValidationResult = { message: string, isValid: false } | { message: null, isValid: true };

export const validateUserId = (userId: string): ValidationResult => {
  const minLength = 4;
  const maxLength = 20;

  if (userId.length < minLength) {
    return {
      isValid: false,
      message: `must be at least ${minLength} characters long`
    };
  }

  if (userId.length > maxLength) {
    return {
      isValid: false,
      message: `must not exceed ${maxLength} characters`
    };
  }

  const validFormat = /^[a-zA-Z0-9]+$/;
  if (!validFormat.test(userId)) {
    return {
      isValid: false,
      message: 'must contain only letters and numbers'
    };
  }

  const hasLetter = /[a-zA-Z]/.test(userId);
  if (!hasLetter) {
    return {
      isValid: false,
      message: 'must contain at least 1 english charater'
    };
  }

  const hasNumbers = /\d/.test(userId);
  if (!hasNumbers) {
    return {
      isValid: false,
      message: 'must contain at least 1 number'
    };
  }

  return { isValid: true, message: null };
};

export const validateUsername = (username: string): ValidationResult => {
  const minLength = 4;
  const maxLength = 12;

  if (username.length < minLength || username.length > maxLength) {
    return {
      isValid: false,
      message: 'length of username must be 4~12',
    };
  }

  const hasDisallowedChar = !/^[a-zA-Z0-9]+$/.test(username);
  if (hasDisallowedChar) {
    return {
      isValid: false,
      message: 'must contain only letters and numbers',
    }
  }

  return { isValid: true, message: null }
};

export const validatePassword = (password: string): ValidationResult => {
  const minLength = 8;
  const maxLength = 20;

  if (password.length < minLength) {
    return {
      isValid: false,
      message: `must be at least ${minLength} characters long`
    };
  }

  if (password.length > maxLength) {
    return {
      isValid: false,
      message: `must not exceed ${maxLength} characters`
    };
  }

  const hasUpperCase = /[A-Z]/.test(password);
  if (!hasUpperCase) {
    return {
      isValid: false,
      message: 'must contain at least 1 uppercase letter'
    };
  }

  const hasLowerCase = /[a-z]/.test(password);
  if (!hasLowerCase) {
    return {
      isValid: false,
      message: 'must contain at least 1 lowercase letter'
    };
  }

  const hasNumbers = /\d/.test(password);
  if (!hasNumbers) {
    return {
      isValid: false,
      message: 'must contain at least 1 number'
    };
  }

  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  if (!hasSpecialChar) {
    return {
      isValid: false,
      message: 'must contain at least 1 special character'
    };
  }

  return { isValid: true, message: null };
};

export const parseJson = <T>(str: string): T | string => {
  try {
    if (str === null) {
      throw new CustomError('cannot parse null', 400);
    }
    const result = JSON.parse(str);
    return result;
  } catch (e) {
    if (e instanceof SyntaxError) {
      return str;
    }
    throw new CustomError('parse failed', 500);
  }
};

const createApiResponse = {
  failure: (status: number, message: string): ApiResponse => ({
    type: 'failure',
    status,
    error: { message }
  })
};

/**
 * handles catched errors on API
 * @param e catched error object
 * @returns Response object containing ApiResponse
 */
export const handleApiError = (e: unknown): Response => {
  console.error(e);

  const response = e instanceof CustomError
    ? createApiResponse.failure(e.status ?? 500, e.message)
    : createApiResponse.failure(500, 'internal error');

  return json(response, { status: response.status });
};

export const extractPlayerCountFromCache_LEGACY = (roomCache: RoomCacheInf) => 1 + (+(roomCache.p1 !== undefined)) + (+(roomCache.p2 !== undefined)) + (+(roomCache.p3 !== undefined));
export const extractPlayerCountFromCache = (roomCache: RoomCacheEntity) => 1 + (+(roomCache.p1_id !== undefined)) + (+(roomCache.p2_id !== undefined)) + (+(roomCache.p3_id !== undefined));

export const isRightTurn = ({ turn, playerIdx, activePlayerCount }: { turn: number, playerIdx: PlayerIdx, activePlayerCount: 2 | 3 | 4 }) => ({
  2: turn % 2 === playerIdx,
  3: turn % 4 === 3 ? (turn % 12) === (playerIdx * 4 + 3) : turn % 4 === playerIdx,
  4: turn % 4 === playerIdx,
}[activePlayerCount]);

// [TODO] in 2p game, fix playerIdx to 0/1
export const getPlayersSlot = ({
  players, playerIdx
}: {
  players: ({ id: string; username: string; } | undefined)[], playerIdx: PlayerIdx,
}): SlotIdx[] => (({
  2: playerIdx === 0 ? [0, 2] : [1, 3],
  3: [playerIdx, players.findIndex(e => e === undefined)],
  4: [playerIdx]
}[players.filter(e => e !== undefined).length]) as SlotIdx[]);

export const convertBlockToStr = ({ flip, rotation, type }: Block): string => `t${type}r${rotation}${flip ? 'f' : ''}`;

export const convertBlockToObj = (blockInfo: string): Block => {
  const type = blockInfo.split('r')[0].replace('t', '') as BlockType;
  const rotation = parseInt(blockInfo[blockInfo.indexOf('r') + 1]) as Rotation;
  const flip = blockInfo.indexOf('f') !== -1;
  return { flip, rotation, type };
};

export const convertBoardToStr = (board: BoardMatrix) =>
  board.map((boardLine) =>
    boardLine.map((cell) => cell === false ? 4 : cell).join(''))
    .join('');

export const convertBoardToArr = (board: string): BoardMatrix =>
  Array.from({ length: 20 }, (_, i) =>
    board.slice(i * 20, i * 20 + 20).split('').map(cell => (cell === '4' ? false : parseInt(cell)))
  );

export const compressMove = ({
  playerIdx,
  type,
  position,
  rotation,
  flip,
}: {
  playerIdx: PlayerIdx,
  type: BlockType,
  position: [number, number],
  rotation: Rotation,
  flip: boolean,
}) =>
  `${playerIdx}:${type}[${position[0]},${position[1]}]r${rotation}${flip ? 'f' : ''}`;

export const decompressMove = (compressedMove: string) => {
  const [playerIdx, ...rest1] = compressedMove.split(':');
  const [type, ...rest2] = rest1[0].split('[');
  const [position0, ...rest3] = rest2[0].split(',');
  const [position1, ...rest4] = rest3[0].split(']');
  const [, rotation, ...flip] = rest4[0].split('');
  return {
    playerIdx: parseInt(playerIdx) as PlayerIdx,
    type: type as BlockType,
    position: [parseInt(position0), parseInt(position1)],
    rotation: parseInt(rotation) % 4 as Rotation,
    flip: flip.length !== 0,
  };
};
