import { CustomError } from "$lib/error";
import type { ApiResponse } from "$types";
import { json } from "@sveltejs/kit";

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
