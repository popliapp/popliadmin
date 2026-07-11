import { useState, useCallback } from "react";
import axios from "axios";
import { API_BASE_URI } from "../Utils/Utils.js";

export const useStoreManager = () => {
  const [storeManagers, setStoreManagers] = useState([]);
  const [singleStoreManager, setSingleStoreManager] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createStoreManager = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.post(
        `${API_BASE_URI}/api/store-manager`,
        payload,
        { withCredentials: true }
      );
      return { success: true, data: data };
    } catch (err) {
      const message = err.response?.data?.message || "Failed to create store manager";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  const getStoreManagers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get(
        `${API_BASE_URI}/api/store-manager`,
        { withCredentials: true }
      );
      setStoreManagers(data || []);
      return { success: true, data: data };
    } catch (err) {
      const message = err.response?.data?.message || "Failed to fetch store managers";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  const getStoreManagerById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get(`${API_BASE_URI}/api/store-manager/${id}`, {
        withCredentials: true,
      });
      setSingleStoreManager(data);
      return { success: true, data: data };
    } catch (err) {
      const message = err.response?.data?.message || "Failed to fetch store manager details";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStoreManager = useCallback(async (id, payload) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.put(
        `${API_BASE_URI}/api/store-manager/${id}`,
        payload,
        { withCredentials: true }
      );
      setStoreManagers((prev) =>
        prev.map((item) => (item._id === id ? data : item))
      );
      if (singleStoreManager?._id === id) {
        setSingleStoreManager(data);
      }
      return { success: true, data: data };
    } catch (err) {
      const message = err.response?.data?.message || "Failed to update store manager";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, [singleStoreManager]);

  const deleteStoreManager = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await axios.delete(`${API_BASE_URI}/api/store-manager/${id}`, {
        withCredentials: true,
      });
      setStoreManagers((prev) => prev.filter((item) => item._id !== id));
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || "Failed to delete store manager";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    storeManagers,
    singleStoreManager,
    loading,
    error,
    createStoreManager,
    getStoreManagers,
    getStoreManagerById,
    updateStoreManager,
    deleteStoreManager,
  };
};
