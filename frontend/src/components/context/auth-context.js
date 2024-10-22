import { createContext } from "react";

export const AuthContext = createContext({
  isLoggedIn: false,
  role: null,
  token: null,
  login: () => {},
  logout: () => {},
});
