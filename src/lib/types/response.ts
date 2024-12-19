import type { UserInfo } from ".";

interface ApiResponseBase {
  status: number;
}

export type ApiResponse<T = void>  = ApiResponseBase & ({
  type: 'success';
  data: T;
} | {
  type: 'failure';
  error: {
    message: string;
  };
});

export type SignInResponse = UserInfo;
