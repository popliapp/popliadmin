import { useState, useCallback } from "react";
import axios from "axios";
import { API_BASE_URI } from "../Utils/Utils";

export function useOrders() {
  const [orders, setOrders] = useState([]);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get(
        `${API_BASE_URI}/api/orders/admin/orders`,
        {
          params,
          withCredentials: true,
        }
      );
      setOrders(data?.data || []);
      return data?.data;
    } catch (err) {
      setError(err?.response?.data || err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOrderById = useCallback(async (id) => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get(`${API_BASE_URI}/api/orders/${id}`, {
        withCredentials: true,
      });
      setOrder(data?.data || null);
      return data?.data;
    } catch (err) {
      setError(err?.response?.data || err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createOrder = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.post(
        `${API_BASE_URI}/api/orders/admin/create-order`,
        payload,
        {
          withCredentials: true,
        }
      );
      return data?.data;
    } catch (err) {
      setError(err?.response?.data || err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateOrder = useCallback(async (id, payload) => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.put(
        `${API_BASE_URI}/api/orders/admin/update-order/${id}`,
        payload,
        {
          withCredentials: true,
        }
      );
      return data?.data;
    } catch (err) {
      setError(err?.response?.data || err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteOrder = useCallback(async (id) => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.delete(`${API_BASE_URI}/api/orders/${id}`, {
        withCredentials: true,
      });
      return data?.success || true;
    } catch (err) {
      setError(err?.response?.data || err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelOrder = useCallback(
    async (id, reason) => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const { data } = await axios.put(
          `${API_BASE_URI}/api/orders/admin/update-order-status/${id}`,
          {
            status: "CANCELLED",
            cancellation: { reason, cancelledBy: "CUSTOMER" },
          },
          {
            withCredentials: true,
          }
        );
        return data?.data;
      } catch (err) {
        setError(err?.response?.data || err.message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchOrdersByStatus = useCallback(async (status, params = {}) => {
    if (!status) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get(
        `${API_BASE_URI}/api/orders/admin/order-status`,
        {
          params: { status, ...params },
          withCredentials: true,
        }
      );
      setOrders(data?.data || []);
      return data?.data;
    } catch (err) {
      setError(err?.response?.data || err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateOrderStatus = useCallback(async (id, status) => {
    if (!id || !status) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.put(
        `${API_BASE_URI}/api/orders/admin/update-order-status/${id}`,
        { status },
        {
          withCredentials: true,
        }
      );
      return data?.data;
    } catch (err) {
      setError(err?.response?.data || err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    orders,
    setOrders,
    setOrder,
    order,
    loading,
    error,
    fetchOrders,
    fetchOrderById,
    createOrder,
    updateOrder,
    deleteOrder,
    cancelOrder,
    fetchOrdersByStatus,
    updateOrderStatus,
  };
}