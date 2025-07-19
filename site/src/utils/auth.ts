import { accounts, UserAccount } from "../data/accounts";

// Constants
const USER_INFO_KEY = "userInfo";
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Types
export interface UserInfo {
  username: string;
  role: string;
  isAuthenticated: boolean;
  timestamp: number;
}

export interface Credentials {
  username: string;
  password: string;
}

// Helper functions
const isValidSession = (timestamp: number): boolean => {
  return new Date().getTime() - timestamp < SESSION_DURATION;
};

export const validateCredentials = (
  username: string,
  password: string
): UserAccount | null => {
  return (
    accounts.find(
      (acc) => acc.username === username && acc.password === password
    ) || null
  );
};

export const getCurrentCredentials = (): Credentials => ({
  username: "demo",
  password: "demo123",
});

export const getUserInfo = (): UserInfo | null => {
  try {
    const data = localStorage.getItem(USER_INFO_KEY);
    if (!data) return null;

    const userInfo = JSON.parse(data) as UserInfo;
    return isValidSession(userInfo.timestamp) ? userInfo : null;
  } catch (error) {
    console.error("Error reading user info:", error);
    return null;
  }
};

export const setUserInfo = (userInfo: UserInfo): void => {
  try {
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
  } catch (error) {
    console.error("Error saving user info:", error);
  }
};

export const clearUserInfo = (): void => {
  localStorage.removeItem(USER_INFO_KEY);
};
