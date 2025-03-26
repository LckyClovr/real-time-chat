export type User = {
  id: string;

  email: string;
  name: string | null;
  imageUrl: string | null;
  passwordHash: string | null;

  createdAt: string;
  updatedAt: string;
};
