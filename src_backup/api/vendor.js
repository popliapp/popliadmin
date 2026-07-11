import { useState, useCallback, useRef } from "react";
import axios from "axios";
import { API_BASE_URI } from "../Utils/Utils.js";

 const useVendor = () => {
  const [vendors, setVendors] = useState([]);
  const [vendor, setVendor] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);

  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null); // vendor id
  const [error, setError] = useState(null);

  const mounted = useRef(true);

  const safeSet = (fn) => {
    if (mounted.current) fn();
  };

  const run = async (fn) => {
    safeSet(() => setLoading(true));
    safeSet(() => setError(null));

    try {
      return await fn();
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Something went wrong";

      safeSet(() => setError(message));
      return { success: false, message };
    } finally {
      safeSet(() => setLoading(false));
    }
  };

  const adminCreateVendor = useCallback(async (data) => {
    if (!data) return { success: false, message: "Vendor data required" };

    try {
      const res = await axios.post(
        `${API_BASE_URI}/api/vendor/admin/create-vendor`,
        data,
        { withCredentials: true }
      );

      return { success: true, data: res.data.data };
    } catch (err) {
      return {
        success: false,
        message:
          err?.response?.data?.message ||
          err?.message ||
          "Failed to create vendor",
      };
    }
  }, []);

  const getVendors = useCallback(
    (params = {}) =>
      run(async () => {
        const res = await axios.get(`${API_BASE_URI}/api/vendor/admin/vendors-status`, {
          params,
          withCredentials: true,
        });

        const list = Array.isArray(res.data.data) ? res.data.data : [];

        safeSet(() => setVendors(list));

        return {
          success: true,
          data: list,
          count: res.data.count || list.length,
          pagination: res.data.pagination || null,
        };
      }),
    []
  );

  const getVendorById = useCallback(
    (id) =>
      run(async () => {
        if (!id) return { success: false, message: "Id required" };

        const res = await axios.get(`${API_BASE_URI}/api/vendor/${id}`, {
          withCredentials: true,
        });

        safeSet(() => setVendor(res.data.data));

        return { success: true, data: res.data.data };
      }),
    []
  );
  
  const getAllVendors = useCallback(
  () =>
    run(async () => {
      const res = await axios.get(
        `${API_BASE_URI}/api/vendor/admin/vendors`,
        { withCredentials: true }
      );

      const list = Array.isArray(res.data.data) ? res.data.data : [];

      safeSet(() => setVendors(list));

      return {
        success: true,
        data: list,
        count: res.data.count || list.length,
        pagination: res.data.pagination || null,
      };
    }),
  []
);

  const getVendorList = useCallback(
    () =>
      run(async () => {
        const res = await axios.get(
          `${API_BASE_URI}/api/vendor/admin/vendor-list`,
          { withCredentials: true }
        );

         setVendors(res.data.data);
      }),
    []
  );

  const approveVendor = useCallback(
    async (id) => {
      if (!id) return { success: false, message: "Id required" };

      safeSet(() => setActionLoading(id));

      try {
        const res = await axios.put(
          `${API_BASE_URI}/api/vendor/admin/approve-vendor/${id}`,
          {},
          { withCredentials: true }
        );

        // Update list state immutably
        safeSet(() =>
          setVendors((prev) =>
            prev.map((v) =>
              v._id === id || v.id === id
                ? { ...v, vendorApproved: true, vendorRejected: false }
                : v
            )
          )
        );

        return { success: true, data: res.data.data };
      } catch (err) {
        return {
          success: false,
          message: err?.response?.data?.message || err.message,
        };
      } finally {
        safeSet(() => setActionLoading(null));
      }
    },
    []
  );

  const rejectVendor = useCallback(
    async (id, reason) => {
      if (!id) return { success: false, message: "Id required" };

      safeSet(() => setActionLoading(id));

      try {
        const res = await axios.patch(
          `${API_BASE_URI}/api/vendor/admin/reject-vendor/${id}`,
          { reason },
          { withCredentials: true }
        );

        safeSet(() =>
          setVendors((prev) =>
            prev.map((v) =>
              v._id === id || v.id === id
                ? { ...v, vendorRejected: true, vendorApproved: false }
                : v
            )
          )
        );

        return { success: true, data: res.data.data };
      } catch (err) {
        return {
          success: false,
          message: err?.response?.data?.message || err.message,
        };
      } finally {
        safeSet(() => setActionLoading(null));
      }
    },
    []
  );

  const updateVendor = useCallback(async (id, data) => {
    if (!id) return { success: false, message: "Id required" };

    safeSet(() => setActionLoading(id));

    try {
      const res = await axios.put(
        `${API_BASE_URI}/api/vendor/admin/update-vendor/${id}`,
        data,
        { withCredentials: true }
      );

      safeSet(() =>
        setVendors((prev) =>
          prev.map((v) =>
            v._id === id || v.id === id ? res.data.data : v
          )
        )
      );

      safeSet(() =>
        setVendor((prev) =>
          prev && (prev._id === id || prev.id === id) ? res.data.data : prev
        )
      );

      return { success: true, data: res.data.data };
    } catch (err) {
      return {
        success: false,
        message: err?.response?.data?.message || err.message,
      };
    } finally {
      safeSet(() => setActionLoading(null));
    }
  }, []);

  const getVendorDashboard = useCallback(
    (id) =>
      run(async () => {
        if (!id) return { success: false, message: "Id required" };

        const res = await axios.get(`${API_BASE_URI}/api/vendor/dashboard/${id}`, {
          withCredentials: true,
        });

        safeSet(() => setDashboardData(res.data.data));

        return { success: true, data: res.data.data };
      }),
    []
  );

  const vendorCreateStore = useCallback(async (storeData) => {
    try {
      const res = await axios.post(
        `${API_BASE_URI}/api/vendor/store`,
        storeData,
        { withCredentials: true }
      );
      return { success: true, data: res.data.data };
    } catch (err) {
      return {
        success: false,
        message:
          err?.response?.data?.message ||
          err?.message ||
          "Failed to create store",
      };
    }
  }, []);

  // Cleanup on unmount
  safeSet(() => {
    return () => {
      mounted.current = false;
    };
  });

  return {
    loading,
    actionLoading,
    error,

    vendors,
    setVendors,
    setVendor,
    vendor,
    dashboardData,

    getVendors,
    getVendorById,
    adminCreateVendor,
    approveVendor,
    rejectVendor,
    getAllVendors,
    updateVendor,
    getVendorList,
    getVendorDashboard,
    vendorCreateStore,
  };
};

export { useVendor };