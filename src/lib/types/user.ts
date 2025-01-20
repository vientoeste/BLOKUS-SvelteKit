export type PlayerId = string;

export interface UserInf {
  id: PlayerId;
  userId: string;
  username: string;
  password: string;
}

export type UserInfo = Omit<UserInf, 'password'>;

export interface UserDocumentInf {
  _id: PlayerId;
  userId: string;
  username: string;
  password: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateUserDTO = Omit<UserInf, 'id'>;

export type UpdateUserDTO = Partial<Omit<UserInf, 'id'>>;

export interface SignInDTO {
  userId: string;
  password: string;
}

export interface ParticipantInf {
  id: PlayerId;
  name: string;
  ready: boolean;
}
