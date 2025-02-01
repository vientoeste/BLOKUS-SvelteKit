import type { ApiResponse } from "$types";
import { json } from "@sveltejs/kit";
import { CustomError } from "./error";

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
