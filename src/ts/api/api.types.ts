export type User = {
  id: string;

  email: string;
  name: string | null;
  imageUrl: string | null;
  passwordHash: string | null;

  createdAt: string;
  updatedAt: string;
};

export type ChatMembership = {
  id: string;
  userId: string;
  user: User;
  chat: Chat;
  chatId: string;

  createdAt: string;
  updatedAt: string;
};

export type Chat = {
  id: string;
  name: string;
  messages: Message[];
  chatMemberships: ChatMembership[];

  createdAt: string;
  updatedAt: string;
};

export type Message = {
  id: string;
  text: string;
  userId: string;
  user: User;
  chatId: string;
  chat: Chat;

  createdAt: string;
  updatedAt: string;
};
