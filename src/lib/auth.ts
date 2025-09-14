import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from '@oslojs/encoding';
import { sha256 } from '@oslojs/crypto/sha2';
import { compare, genSalt, hash } from 'bcrypt';
import { uuidv7 } from 'uuidv7';
import { getUserInfoByUserId, insertUser } from '$lib/database/user';
import { CustomError } from '$lib/error';
import { redis } from '$lib/database/redis';
import type { CreateUserDTO, Session, SessionToken, SignInDTO, UserInfo } from '$types';
import { type Cookies } from '@sveltejs/kit';

export const signUp = async ({ userId, username, password }: CreateUserDTO) => {
  const id = uuidv7();
  const salt = await genSalt(12);
  const hashedPw = await hash(password, salt);

  const insertedId = await insertUser(id, { userId, username, password: hashedPw });
  return insertedId;
};

export const signIn = async ({ userId, password }: SignInDTO): Promise<{ token: SessionToken } & UserInfo> => {
  const user = await getUserInfoByUserId(userId);

  const signInResult = await compare(password, user.password);
  if (!signInResult) {
    throw new CustomError('authentication failed');
  }

  const token = generateSessionToken();
  await createSession({
    token,
    id: user.id,
    userId: user.userId,
    username: user.username,
  });

  return { token, id: user.id, userId, username: user.username };
};

const extractSessionId = (token: string) => encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

export const signOut = async (token: string) => {
  const sessionId = extractSessionId(token);
  const result = await invalidateSession(sessionId);
  if (!result) {
    throw new CustomError('session id not found', 404);
  }
};


export const generateSessionToken = (): string => {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  const token = encodeBase32LowerCaseNoPadding(bytes);
  return token;
};

export const createSession = async ({ token, id, userId, username }: { token: string, id: string, userId: string, username: string }): Promise<Session> => {
  const sessionId = extractSessionId(token);
  const session: Session = {
    id,
    uid: userId,
    uname: username,
  };
  await redis.hSet(`session:${sessionId}`, {
    ...session
  });
  await redis.expire(`session:${sessionId}`, 2592000);
  return session;
};

/**
 * @example
 * const { id, userId, username } = await validateSessionToken(token);
 * @param token session token
 * @returns {UserInfo}
 */
export const validateSessionToken = async (token: string) => {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const item = await redis.hGetAll(`session:${sessionId}`);
  if (Object.keys(item).length === 0 || !item.uid || !item.uname || !item.id) {
    throw new CustomError('session not found. please sign in again', 401);
  }
  const { id, uid, uname } = item;

  await redis.expire(`session:${sessionId}`, 2592000);
  return { id, userId: uid, username: uname };
};

/**
 * @example
 * const { id, userId, username } = await validateSessionCookie(cookies);
 * @param cookies cookies of request
 * @returns {UserInfo}
 */
export const validateSessionCookie = async (cookies: Cookies): Promise<UserInfo> => {
  const token = cookies.get('token');
  if (!token) {
    throw new CustomError('sign in first', 401);
  }
  return validateSessionToken(token);
};

export const invalidateSession = async (sessionId: string): Promise<boolean> => {
  const isRemoved = await redis.expire(`session:${sessionId}`, 0);
  return isRemoved;
};