import { CustomError } from "$lib/error";
import type { BoardDocumentInf, RoomDocumentInf, UserDocumentInf } from "$lib/types";
import { MongoClient, MongoError } from "mongodb";

export const client = await new MongoClient(import.meta.env.VITE_MONGO_URL).connect();

const db = client.db('blokus');

export const handleMongoError = (error: MongoError) => {
  console.error(error);
  switch (error.code) {
    case 2:
      throw new CustomError('BadValue');
    case 13:
      throw new CustomError('Unauthorzed');
    case 26:
      throw new CustomError('NamespaceNotFound');
    case 50:
      throw new CustomError('MaxTimeMSExpired');
    case 80:
      throw new CustomError('ServerSelectionFailed', 500);
    case 121:
      throw new CustomError('DocumentValidationFailure');
    case 211:
      throw new CustomError('KeyNotFound');
    case 262:
      throw new CustomError('ExceededTimeLimit');
    case 301:
      throw new CustomError('DataCorruptionDetected');
    case 11000:
      throw new CustomError('DuplicateKey');
    default:
      throw new CustomError('unknown mongo error');
  }
};

export const Users = db.collection<UserDocumentInf>('users');
export const Rooms = db.collection<RoomDocumentInf>('rooms');
export const Boards = db.collection<BoardDocumentInf>('boards');
