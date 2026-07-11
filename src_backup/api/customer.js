import { useState, useCallback } from "react";
import axios from "axios";
import { API_BASE_URI } from "../Utils/Utils.js";

export const useCustomer = () => {
  const [customers, setCustomers] = useState([]);
  const [singleCustomer, setSingleCustomer] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createCustomer = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.post(
        `${API_BASE_URI}/api/customer/admin/create-customer`,
        payload,
        { withCredentials: true }
      );
      return { success: true, data: data.data };
    } catch (err) {
      const message = err.response?.data?.message || "Failed to create customer";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  const getAllCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get(
        `${API_BASE_URI}/api/customer/admin/customers`,
        { withCredentials: true }
      );
      setCustomers(data.data || []);
      return { success: true, data: data.data };
    } catch (err) {
      const message = err.response?.data?.message || "Failed to fetch customers";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  const getCustomerById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get(`${API_BASE_URI}/api/customer/${id}`, {
        withCredentials: true,
      });
      setSingleCustomer(data.data);
      return { success: true, data: data.data };
    } catch (err) {
      const message = err.response?.data?.message || "Failed to fetch customer details";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  const editCustomer = useCallback(async (id, payload) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.put(
        `${API_BASE_URI}/api/customer/admin/update-customer/${id}`,
        payload,
        { withCredentials: true }
      );
      setCustomers((prev) =>
        prev.map((item) => (item._id === id ? data.data : item))
      );
      if (singleCustomer?._id === id) {
        setSingleCustomer(data.data);
      }
      return { success: true, data: data.data };
    } catch (err) {
      const message = err.response?.data?.message || "Failed to update customer";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, [singleCustomer]);

  const deleteCustomer = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await axios.delete(`${API_BASE_URI}/api/customer/${id}`, {
        withCredentials: true,
      });
      setCustomers((prev) => prev.filter((item) => item._id !== id));
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || "Failed to delete customer";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);
const blockUnblockCustomer = useCallback(async (id) => {
  setLoading(true);
  setError(null);

  try {
    const { data } = await axios.put(
      `${API_BASE_URI}/api/customer/is-blocked/${id}`,
      {}, 
      { withCredentials: true }
    );

    setCustomers((prev) =>
      prev.map((item) =>
        item._id === id ? { ...item, isBlocked: data.data.isBlocked } : item
      )
    );

    return { success: true };
  } catch (err) {
    const message =
      err.response?.data?.message || "Failed to block/unblock customer";
    setError(message);
    return { success: false, message };
  } finally {
    setLoading(false);
  }
}, []);


  const getCustomersByStatus = useCallback(async (status) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get(
        `${API_BASE_URI}/api/customer/admin/customers-status`,
        {
          params: { status },
          withCredentials: true,
        }
      );
      setCustomers(data.data || []);
      return { success: true, data: data.data };
    } catch (err) {
      const message = err.response?.data?.message || "Failed to fetch customers by status";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  const getCustomerOrders = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get(`${API_BASE_URI}/api/customer/${id}/orders`, {
        withCredentials: true,
      });
      setCustomerOrders(data.data || []);
      return { success: true, data: data.data };
    } catch (err) {
      const message = err.response?.data?.message || "Failed to fetch customer orders";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    customers,
    singleCustomer,
    customerOrders,
    loading,
    error,
    createCustomer,
    getAllCustomers,
    getCustomerById,
    editCustomer,
    deleteCustomer,
    getCustomersByStatus,
    getCustomerOrders,
    blockUnblockCustomer,
  };
};