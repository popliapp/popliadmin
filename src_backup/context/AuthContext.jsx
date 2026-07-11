import { createContext, useState, useMemo, useEffect } from "react";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    if (token) {
      // NOTE: In a real app, you'd verify the token with a backend call
      // For now, we'll assume the token is valid if it exists.
      // You might decode the token to get user role and basic info if it's a JWT.
      // For this example, we'll need to fetch user data separately or store it.
      // Let's assume user data is fetched elsewhere or stored in localStorage too.
      const storedUser = localStorage.getItem("user");
      const storedRole = localStorage.getItem("role");
      if(storedUser && storedRole){
        setUser(JSON.parse(storedUser));
        setRole(storedRole);
        setIsAuth(true);
      }
    }
  }, [token]);

  const updateUser = (data) => {
    if (data) {
      const { accessToken, user: userData } = data;
      setToken(accessToken);
      setUser(userData);
      setRole(userData.role);
      setIsAuth(true);
      localStorage.setItem("token", accessToken);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("role", userData.role);
    } else {
      setToken(null);
      setUser(null);
      setRole(null);
      setIsAuth(false);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
    }
  };

  const value = useMemo(() => ({
    user,
    role,
    token,
    isAuth,
    updateUser,
  }), [user, role, token, isAuth]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
