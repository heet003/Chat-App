import { useState, useCallback, useEffect } from "react";
import Cookies from "js-cookie";

let logoutTimer;

export const useAuth = () => {
  const [token, setToken] = useState(null);
  const [tokenExpirationDate, setTokenExpirationDate] = useState(null);
  const [role, setRole] = useState("");

  const login = useCallback((role, token, expirationDate) => {
    setToken(token);
    setRole(role);

    const tokenExpirationDate =
      expirationDate ||
      new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 7);
    setTokenExpirationDate(tokenExpirationDate);

    Cookies.set(
      "userData",
      JSON.stringify({
        role: role,
        token: token,
        expiration: tokenExpirationDate.toISOString(),
      }),
      { expires: 7 }
    );
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setTokenExpirationDate(null);
    setRole(null);
    Cookies.remove("userData");
  }, []);

  useEffect(() => {
    if (token && tokenExpirationDate) {
      const remainingTime =
        tokenExpirationDate.getTime() - new Date().getTime();
      logoutTimer = setTimeout(logout, remainingTime);
    } else {
      clearTimeout(logoutTimer);
    }
  }, [token, logout, tokenExpirationDate]);

  useEffect(() => {
    const storedData = Cookies.get("userData");
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      if (parsedData.token && new Date(parsedData.expiration) > new Date()) {
        login(
          parsedData.role,
          parsedData.token,
          new Date(parsedData.expiration)
        );
      }
    }
  }, [login]);

  return { token, login, logout, role };
};
