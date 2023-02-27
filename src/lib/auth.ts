import { redirect } from '@sveltejs/kit';
import { compare } from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';
import db from './database';

interface User {
  _id: ObjectId,
  id: string,
}

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

  if (userInfo.length === 0) {
    return {
      error: 'no matched user',
    }
  }
  if (userInfo.length !== 1) {
    return { error: 'internal server error' };
  }

  if (!await compare(hashedPwd, userInfo[0].password)) {
    return { error: 'invalid password' };
    // throw redirect(303, '/')
  }

  const token = jwt.sign({
    _id: userInfo[0]._id,
    id: id,
  }, import.meta.env.VITE_JWT_SECRET, {
    expiresIn: import.meta.env.VITE_JWT_EXPTIME.concat('s'),
  });
  return {
    token, error: ''
  };
};

export const extractUserIdFromToken = (token: string): string => {
  try {
    const jwtUser = jwt.verify(token, import.meta.env.VITE_JWT_SECRET);
    if (typeof jwtUser === 'string') {
      throw new Error('internal server error');
    }
    return jwtUser.id.toString();
  } catch (e) {
    console.error(e);
    if (e.message.includes('jwt must be provided')) {
      throw redirect(304, '/');
    }
    return '';
  }
};

export const checkAuthFromToken = async (token: string): Promise<User | undefined> => {
  const jwtToken = token.split(' ')[1];
  try {
    const userId = extractUserIdFromToken(jwtToken);
    const user = await db.collection('user').find({
      id: userId,
    }).toArray();
    if (!user || user.length === 0) {
      throw new Error('User not found');
    }
    if (user.length !== 1 || user[0].id !== userId) {
      throw new Error('internal server error');
    }
    return {
      id: user[0].id,
      _id: user[0]._id,
    };
  } catch (e) {
    console.error(e);
    throw redirect(303, '/');
  }
};

export const signUp = async (id: string, password: string) => {
  const salt = await bcrypt.genSalt(12);
  const hashed = await bcrypt.hash(password, salt);

  const res = await createUser(id, hashed);
  if (typeof res !== 'string') {
    return new Response(res.error, { status: 500 });
  }
  return jwt.sign({
    _id: res,
    id: id,
  }, import.meta.env.VITE_JWT_SECRET, {
    expiresIn: parseInt(import.meta.env.VITE_JWT_EXPTIME),
  });
};
