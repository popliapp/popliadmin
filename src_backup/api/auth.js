import { useContext, useState, useCallback } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext.jsx";
import {API_BASE_URI} from "../Utils/Utils.js";


const useAuth = () => {
  const { updateUser, user, role, isAuth } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);

  const handleLogin = useCallback(async (identifier, password) => {
    setLoading(true);
    try {
      const { data } = await axios.post(`${API_BASE_URI}/api/auth/login`, { identifier, password },{
        withCredentials:true,
      });

      if (data.success) {
        updateUser({
          token: data.data.accessToken,
          role: data.data.user.role,
          userId: data.data.user._id,
          user: data.data.user,
        });
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Login failed" };
    } finally {
      setLoading(false);
    }
  }, [updateUser]);

  const handleLogout = useCallback(async () => {
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URI}/api/auth/logout`, {}, { withCredentials: true });
    } finally {
      updateUser(null);
      setLoading(false);
    }
  }, [updateUser]);

  const getAllUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_BASE_URI}/api/auth/users`, { withCredentials: true });
      if (data.success) {
        setUsers(data.data);
      }
      return { success: data.success, data: data.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Failed to fetch users" };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    handleLogin,
    handleLogout,
    user,
    users,
    role,
    isAuth,
    loading,
    getAllUsers,
  };
};

export { useAuth};
