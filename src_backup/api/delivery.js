import { useState, useCallback } from "react";
import axios from "axios";
import { API_BASE_URI } from "../Utils/Utils.js";

export const useDeliveryPartner = () => {
  const [availableOrders, setAvailableOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getAvailableOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get(
        `${API_BASE_URI}/api/delivery-partner/orders/available`,
        { withCredentials: true }
      );
      setAvailableOrders(data.data || []);
      return { success: true, data: data.data };
    } catch (err) {
      const message = err.response?.data?.message || "Failed to fetch available orders";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  const acceptOrder = useCallback(async (orderRequestId) => {
    setLoading(true);
    setError(null);
    try {
      await axios.post(
        `${API_BASE_URI}/api/delivery-partner/orders/accept/${orderRequestId}`,
        {},
        { withCredentials: true }
      );
      setAvailableOrders((prev) => prev.filter((req) => req._id !== orderRequestId));
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || "Failed to accept order";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  const rejectOrder = useCallback(async (orderRequestId) => {
    setLoading(true);
    setError(null);
    try {
      await axios.post(
        `${API_BASE_URI}/api/delivery-partner/orders/reject/${orderRequestId}`,
        {},
        { withCredentials: true }
      );
      setAvailableOrders((prev) => prev.filter((req) => req._id !== orderRequestId));
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || "Failed to reject order";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateLocation = useCallback(async (latitude, longitude) => {
    setLoading(true);
    setError(null);
    try {
      await axios.post(
        `${API_BASE_URI}/api/delivery-partner/location`,
        { latitude, longitude },
        { withCredentials: true }
      );
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || "Failed to update location";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  const markOrderPickedUp = useCallback(async (orderId) => {
    setLoading(true);
    setError(null);
    try {
      await axios.post(
        `${API_BASE_URI}/api/delivery-partner/orders/pickup/${orderId}`,
        {},
        { withCredentials: true }
      );
      return { success: true, message: "Order marked as picked up." };
    } catch (err) {
      const message = err.response?.data?.message || "Failed to mark order as picked up";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

    const markOrderDelivered = useCallback(async (orderId) => {

      setLoading(true);

      setError(null);

      try {

        await axios.post(

          `${API_BASE_URI}/api/delivery-partner/orders/deliver/${orderId}`,

          {},

          { withCredentials: true }

        );

        return { success: true, message: "Order marked as delivered." };

      } catch (err) {

        const message = err.response?.data?.message || "Failed to mark order as delivered";

        setError(message);

        return { success: false, message };

      } finally {

        setLoading(false);

      }

    }, []);

  

    // CRUD Operations for Delivery Partners

    const createDeliveryPartner = useCallback(async (partnerData) => {

      setLoading(true);

      setError(null);

      try {

        const { data } = await axios.post(

          `${API_BASE_URI}/api/delivery-partner`,

          partnerData,

          { withCredentials: true }

        );

        return { success: true, data: data.data };

      } catch (err) {

        const message = err.response?.data?.message || "Failed to create delivery partner";

        setError(message);

        return { success: false, message };

      } finally {

        setLoading(false);

      }

    }, []);

  

    const getAllDeliveryPartners = useCallback(async () => {

      setLoading(true);

      setError(null);

      try {

        const { data } = await axios.get(

          `${API_BASE_URI}/api/delivery-partner`,

          { withCredentials: true }

        );

        return { success: true, data: data.data };

      } catch (err) {

        const message = err.response?.data?.message || "Failed to fetch delivery partners";

        setError(message);

        return { success: false, message };

      } finally {

        setLoading(false);

      }

    }, []);

  

    const getDeliveryPartnerById = useCallback(async (id) => {

      setLoading(true);

      setError(null);

      try {

        const { data } = await axios.get(

          `${API_BASE_URI}/api/delivery-partner/${id}`,

          { withCredentials: true }

        );

        return { success: true, data: data.data };

      } catch (err) {

        const message = err.response?.data?.message || "Failed to fetch delivery partner details";

        setError(message);

        return { success: false, message };

      } finally {

        setLoading(false);

      }

    }, []);

  

    const updateDeliveryPartner = useCallback(async (id, partnerData) => {

      setLoading(true);

      setError(null);

      try {

        const { data } = await axios.put(

          `${API_BASE_URI}/api/delivery-partner/${id}`,

          partnerData,

          { withCredentials: true }

        );

        return { success: true, data: data.data };

      } catch (err) {

        const message = err.response?.data?.message || "Failed to update delivery partner";

        setError(message);

        return { success: false, message };

      } finally {

        setLoading(false);

      }

    }, []);

  

      const deleteDeliveryPartner = useCallback(async (id) => {

  

        setLoading(true);

  

        setError(null);

  

        try {

  

          await axios.delete(

  

            `${API_BASE_URI}/api/delivery-partner/${id}`,

  

            { withCredentials: true }

  

          );

  

          return { success: true, message: "Delivery Partner deleted successfully." };

  

        } catch (err) {

  

          const message = err.response?.data?.message || "Failed to delete delivery partner";

  

          setError(message);

  

          return { success: false, message };

  

        } finally {

  

          setLoading(false);

  

        }

  

      }, []);

  

    

  

      // NEW: Verification related API calls

  

      const getPendingDeliveryPartners = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
          const { data } = await axios.get(`${API_BASE_URI}/api/delivery-partner/pending`,
            { withCredentials: true }
          );
          return { success: true, data: data.data };
        } catch (err) {
          const message = err.response?.data?.message || "Failed to fetch pending delivery partners";
          setError(message);
          return { success: false, message }
        } finally {
          setLoading(false)

        }
      }, []);

  

    

  

      const approveDeliveryPartner = useCallback(async (userId) => {
        setLoading(true);
        setError(null);
        try {
          await axios.post(`${API_BASE_URI}/api/delivery-partner/${userId}/approve`,{},
            { withCredentials: true }
          );

          return { success: true, message: "Delivery Partner approved successfully." };
        } catch (err) {
          const message = err.response?.data?.message || "Failed to approve delivery partner";
          setError(message);
          return { success: false, message }

        } finally {
          setLoading(false)
        }
      }, []);

      const rejectDeliveryPartner = useCallback(async (userId, reason) => {  

        setLoading(true);
        setError(null);
        try {
          await axios.post(`${API_BASE_URI}/api/delivery-partner/${userId}/reject`, { reason },

            { withCredentials: true }

  

          );

  

          return { success: true, message: "Delivery Partner rejected successfully." };

  

        } catch (err) {

  

          const message = err.response?.data?.message || "Failed to reject delivery partner";

  

          setError(message);

  

          return { success: false, message };

  

        } finally {

  

          setLoading(false);

  

        }

  

      }, []);

  

    

  

      const uploadDeliveryPartnerDocument = useCallback(async (userId, documentType, documentUrl) => {

  

        setLoading(true);

  

        setError(null);

  

        try {

  

          await axios.post(

  

            `${API_BASE_URI}/api/delivery-partner/${userId}/document`,

  

            { type: documentType, url: documentUrl },

  

            { withCredentials: true }

  

          );

  

          return { success: true, message: "Document uploaded successfully." };

  

        } catch (err) {

  

          const message = err.response?.data?.message || "Failed to upload document";

  

          setError(message);

  

          return { success: false, message };

  

        } finally {

  

          setLoading(false);

  

        }

  

      }, []);

  

    

  

    

  

      return {

  

        availableOrders,

  

        loading,

  

        error,

  

        getAvailableOrders,

  

        acceptOrder,

  

        rejectOrder,

  

        updateLocation,

  

        markOrderPickedUp,

  

        markOrderDelivered,

  

        createDeliveryPartner,

  

        getAllDeliveryPartners,

  

        getDeliveryPartnerById,

  

        updateDeliveryPartner,

  

        deleteDeliveryPartner,

  

        getPendingDeliveryPartners, // NEW

  

        approveDeliveryPartner,     // NEW

  

        rejectDeliveryPartner,      // NEW

  

        uploadDeliveryPartnerDocument, // NEW

  

      };

  

    };
