import type { CreateUserDTO, UpdateUserDTO, UserInf } from '$lib/types';
import { handleMongoError, Users } from './mongo';
import { CustomError } from '$lib/error';

export const getUserInfoByUserId = async (userId: string): Promise<UserInf> => {
  if (!userId?.trim()) {
    throw new CustomError('invalid userId', 400);
  }

  const user = await Users.findOne({
    userId,
    isDeleted: false,
  }).catch(handleMongoError);

  if (!user) {
    throw new CustomError('not found', 404);
  }

  if (!user.username || !user.password) {
    throw new CustomError('invalid data', 500);
  }

  return {
    id: user._id,
    userId: user.userId,
    username: user.username,
    password: user.password
  };
};

export const updateUserInfo = async (userId: string, updateUserDTO: UpdateUserDTO) => {
  if (!userId?.trim()) {
    throw new CustomError('invalid userId', 400);
  }

  if (!updateUserDTO || Object.keys(updateUserDTO).length === 0) {
    throw new CustomError('no data provided', 400);
  }

  const { ok, value } = await Users.findOneAndUpdate(
    { userId, isDeleted: false },
    { $set: { ...updateUserDTO, updatedAt: new Date() } },
    { returnDocument: 'after' }
  ).catch(handleMongoError);

  if (!value) {
    throw new CustomError('not found', 404);
  }

  if (ok === 0) {
    throw new CustomError('update failed', 500);
  }

  return value;
};

export const deleteUserInfo = async (userId: string) => {
  if (!userId?.trim()) {
    throw new CustomError('invalid userId', 400);
  }

  const { value, ok } = await Users.findOneAndUpdate(
    { userId, isDeleted: false },
    { $set: { isDeleted: true, updatedAt: new Date() } },
    { returnDocument: 'after' }
  ).catch(handleMongoError);

  if (!value) {
    throw new CustomError('not found', 404);
  }

  if (ok === 0) {
    throw new CustomError('delete failed', 500);
  }

  return;
};

export const insertUser = async (userId: string, createUserDTO: CreateUserDTO) => {
  if (!userId?.trim()) {
    throw new CustomError('Invalid userId', 400);
  }

  if (!createUserDTO || Object.keys(createUserDTO).length === 0) {
    throw new CustomError('Invalid user data', 400);
  }

  const existingUser = await Users.findOne({ userId, isDeleted: false })
    .catch(handleMongoError);

  if (existingUser) {
    throw new CustomError('User already exists', 409);
  }

  const { insertedId, acknowledged } = await Users.insertOne({
    _id: userId,
    ...createUserDTO,
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  }).catch(handleMongoError);

  if (!acknowledged) {
    throw new CustomError('Insertion failed', 500);
  }

  return insertedId;
};
