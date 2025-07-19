export interface UserAccount {
  username: string;
  password: string;
  role: string;
}

export const accounts: UserAccount[] = [
  { username: "demo", password: "demo123", role: "user" },
  { username: "admin", password: "admin123", role: "admin" },
  { username: "user1", password: "user123", role: "user" },
  { username: "user2", password: "user234", role: "user" },
];
