import { useState, useCallback } from "react";
import axios from "axios";
import { API_BASE_URI } from "../Utils/Utils.js";

const usePayout = () => {
  const [payouts, setPayouts] = useState([]);
  const [payoutHistory, setPayoutHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});

  const createVendorPayout = useCallback(async (payoutData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.post(
        `${API_BASE_URI}/api/payout/vendor`,
        payoutData,
        { withCredentials: true }
      );
      return { success: true, data: data.data };
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to create vendor payout";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  const createStorePayout = useCallback(async (payoutData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.post(
        `${API_BASE_URI}/api/payout/store`,
        payoutData,
        { withCredentials: true }
      );
      return { success: true, data: data.data };
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to create store payout";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  const createDeliveryPartnerPayout = useCallback(async (payoutData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.post(
        `${API_BASE_URI}/api/payout/delivery-partner`,
        payoutData,
        { withCredentials: true }
      );
      return { success: true, data: data.data };
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Failed to create delivery partner payout";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPayouts = useCallback(
    async (entityType, page = 1, limit = 10, status) => {
      setLoading(true);
      setError(null);
      try {
        let url = `${API_BASE_URI}/api/payout/${entityType}?page=${page}&limit=${limit}`;
        if (status) url += `&status=${status}`;

        const { data } = await axios.get(url, { withCredentials: true });
        setPayouts(data.data || []);
        setPagination({
          totalPages: data.totalPages,
          currentPage: data.currentPage,
        });
        return { success: true, data: data.data };
      } catch (err) {
        const message =
          err.response?.data?.message ||
          `Failed to fetch ${entityType} payouts`;
        setError(message);
        return { success: false, message };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchPayoutHistory = useCallback(
    async (entityType, id, page = 1, limit = 10) => {
      setLoading(true);
      setError(null);
      try {
        const url = `${API_BASE_URI}/api/payout/${entityType}/${id}?page=${page}&limit=${limit}`;
        const { data } = await axios.get(url, { withCredentials: true });
        setPayoutHistory(data.data || []);
        setPagination({
          totalPages: data.totalPages,
          currentPage: data.currentPage,
        });
        return { success: true, data: data.data };
      } catch (err) {
        const message =
          err.response?.data?.message || "Failed to fetch payout history";
        setError(message);
        return { success: false, message };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updatePayoutStatus = useCallback(async (id, status) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.put(
        `${API_BASE_URI}/api/payout/${id}/status`,
        { status },
        { withCredentials: true }
      );
      setPayouts((prev) =>
        prev.map((item) => (item._id === id ? data.data : item))
      );
      setPayoutHistory((prev) =>
        prev.map((item) => (item._id === id ? data.data : item))
      );
      return { success: true, data: data.data };
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to update payout status";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  const getStorePayouts = useCallback(
    (page, limit, status) => fetchPayouts("stores", page, limit, status),
    [fetchPayouts]
  );
  const getVendorPayouts = useCallback(
    (page, limit, status) => fetchPayouts("vendors", page, limit, status),
    [fetchPayouts]
  );
  const getDeliveryPartnerPayouts = useCallback(
    (page, limit, status) =>
      fetchPayouts("delivery-partners", page, limit, status),
    [fetchPayouts]
  );

  const getStorePayoutHistory = useCallback(
    (id, page, limit) => fetchPayoutHistory("stores", id, page, limit),
    [fetchPayoutHistory]
  );
  const getVendorPayoutHistory = useCallback(
    (id, page, limit) => fetchPayoutHistory("vendors", id, page, limit),
    [fetchPayoutHistory]
  );
  const getDeliveryPartnerPayoutHistory = useCallback(
    (id, page, limit) =>
      fetchPayoutHistory("delivery-partners", id, page, limit),
    [fetchPayoutHistory]
  );

  return {
    payouts,
    payoutHistory,
    loading,
    error,
    pagination,
    createVendorPayout,
    createStorePayout,
    fetchPayouts,
    createDeliveryPartnerPayout,
    getStorePayouts,
    getVendorPayouts,
    getDeliveryPartnerPayouts,
    getStorePayoutHistory,
    getVendorPayoutHistory,
    getDeliveryPartnerPayoutHistory,
    updatePayoutStatus,
  };
};

export { usePayout };
