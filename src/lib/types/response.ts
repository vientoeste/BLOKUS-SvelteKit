import type { PlayerId, RoomId, RoomPreviewInf, UserInfo } from ".";

interface ApiResponseBase {
  status: number;
}

export type ApiResponse<T = void> = ApiResponseBase & ({
  type: 'success';
  data: T;
} | {
  type: 'failure';
  error: {
    message: string;
  };
});

export type SignInResponse = UserInfo;

export interface CreateRoomResponse {
  roomId: RoomId;
}

export interface CreateUserResponse {
  id: PlayerId;
}

export interface FetchRoomPreviewsResponse {
  rooms: RoomPreviewInf[];
}

export type SignOutResponse = null;
