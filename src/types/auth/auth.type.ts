export type PublicUser = {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = LoginInput;

export type AuthResult = {
  user: PublicUser;
};

export type CurrentUserResult = {
  user: PublicUser;
};

export type LogoutResult = {
  loggedOut: true;
};

export type AuthStatus = 'idle' | 'authenticated' | 'unauthenticated';
