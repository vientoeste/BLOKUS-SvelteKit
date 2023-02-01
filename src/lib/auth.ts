import { compare } from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from './database';

export const createUser = async (id: string, hashedPwd: string) => {
  const user = await db.collection('user').find({
    id: id,
  }).toArray();
  if (user.length !== 0) {
    return { error: 'ID already existing' }
  }

  try {
    const insertedId = await db.collection('user').insertOne({
      id: id,
      password: hashedPwd,
    }).then((res) => {
      if (!res) {
        throw new Error();
      }
      console.log('ok')
      return res.insertedId.toString();
    });
    return insertedId;
  } catch (e) {
    return { error: 'internal server error' }
  }
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

  const token = jwt.sign({
    _id: userInfo[0]._id,
    id: id,
  }, import.meta.env.VITE_JWT_SECRET, {
    expiresIn: '1h',
  });
  return token;
};

export const checkAuthFromToken = async (token: string) => {
  if (token.slice(0, 6) !== 'Bearer') {
    throw new Error('invalid token');
  }
  const jwtToken = token.split(' ')[1];
  try {
    const jwtUser = jwt.verify(jwtToken, import.meta.env.VITE_JWT_SECRET);
    if (typeof jwtUser === 'string') {
      throw new Error('internal server error');
    }

    const user = await db.collection('user').find({
      id: jwtUser.id
    }).toArray();
    if (!user) {
      throw new Error('User not found');
    }
    if (user.length !== 1) {
      throw new Error('')
    }
    return user[0].id;
  } catch (e) {
    console.error(e);
  }
};
