import { compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import db from './database';

export const createUser = async (id: string, hashedPwd: string) => {
  const user = await db.collection('user').find({
    id: id,
  }).toArray();
  if (user.length !== 0) {
    return { error: 'ID already existing' }
  }

  try {
    await db.collection('user').insertOne({
      id: id,
      password: hashedPwd,
    }).then((res) => {
      if (!res) {
        throw new Error();
      }
    });
  } catch (e) {
    return { error: 'internal server error' }
  }
  return 'ok';
};

export const loginAndGetToken = async (id: string, hashedPwd: string) => {
  const userInfo = await db.collection('user').find({
    id: id,
  }).toArray();
  if (userInfo.length !== 1) {
    return { error: userInfo.length === 0 ? 'no matched user' : 'internal server error' };
  }

  if (!await compare(hashedPwd, userInfo[0].password)) {
    return { error: 'invalid password' };
  }

  return sign({
    _id: userInfo[0]._id,
    id: id,
  }, import.meta.env.VITE_JWT_SECRET, {
    expiresIn: '1h',
  });
};
