import { useState, useCallback } from "react";
import axios from "axios";
import { API_BASE_URI } from "../Utils/Utils.js";


 const useStore = () => {
  const [data, setData] = useState([]);
  const [single, setSingle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const safe = (fn) => {
    try { fn(); } catch {}
  };

  const fetchAllStore = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE_URI}/api/store/admin/stores`, { withCredentials: true });
      safe(() => setData(res.data.data || []));
      return { success: true, data: res.data.data };
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load stores");
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStoreByStatus = useCallback(async (status, page = 1, limit = 20) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE_URI}/api/store/admin/stores-status`, {
        params: { status, page, limit },
        withCredentials: true,
      });
      safe(() => setData(res.data.data || []));
      return { success: true, ...res.data };
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to fetch by status");
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStoreById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE_URI}/api/store/${id}`, { withCredentials: true });
      safe(() => setSingle(res.data.data || null));
      return { success: true, data: res.data.data };
    } catch (err) {
      setError(err?.response?.data?.message || "Store not found");
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, []);

  const adminCreateStore = useCallback(async (payload) => {
    setError(null);
    try {
      const res = await axios.post(`${API_BASE_URI}/api/store/admin/create-store`, payload, { withCredentials: true });
      return { success: true, data: res.data.data };
    } catch (err) {
      return {
        success: false,
        message: err?.response?.data?.message || "Create failed",
      };
    }
  }, []);

  const updateStore = useCallback(async (id, payload) => {
    setError(null);
    try {
      const res = await axios.put(`${API_BASE_URI}/api/store/admin/update-store/${id}`, payload, { withCredentials: true });
      return { success: true, data: res.data.data };
    } catch (err) {
      return {
        success: false,
        message: err?.response?.data?.message || "Update failed",
      };
    }
  }, []);

  const DeleteStore = useCallback(async (id) => {
    setError(null);
    try {
      await axios.delete(`${API_BASE_URI}/api/store/${id}`, { withCredentials: true });
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err?.response?.data?.message || "Delete failed",
      };
    }
  }, []);

  const approveStore = useCallback(async (id) => {
    setError(null);
    try {
      const res = await axios.put(`${API_BASE_URI}/api/store/admin/approve-store/${id}`, {}, { withCredentials: true });
      return { success: true, data: res.data.data };
    } catch (err) {
      return {
        success: false,
        message: err?.response?.data?.message || "Approve failed",
      };
    }
  }, []);

  const rejectStore = useCallback(async (id, reason) => {
    setError(null);
    try {
      const res = await axios.put(`${API_BASE_URI}/api/store/admin/reject-store/${id}`, { reason }, { withCredentials: true });
      return { success: true, data: res.data.data };
    } catch (err) {
      return {
        success: false,
        message: err?.response?.data?.message || "Reject failed",
      };
    }
  }, []);

  return {
    data,
    single,
    loading,
    error,
	setData,
    fetchAllStore,
    fetchStoreById,
    fetchStoreByStatus,
    adminCreateStore,
    updateStore,
    DeleteStore,
    approveStore,
    rejectStore,
  };
};
export {useStore}