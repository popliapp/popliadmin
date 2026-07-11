import { useState, useCallback } from "react";
import axios from "axios";
import { API_BASE_URI } from "../Utils/Utils";

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [single, setSingle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get(`${API_BASE_URI}/api/product/admin/products`,{
		withCredentials:true
	  });
      setProducts(data.data || []);
      return data.data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch products");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProductById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get(`${API_BASE_URI}/api/product/${id}`,{
		withCredentials:true
	  });
      setSingle(data.data || null);
      return data.data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch product");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createProduct = useCallback(async (payload) => {
    setError(null);
    try {
      const { data } = await axios.post(`${API_BASE_URI}/api/product/admin/create-product`, payload,{
		withCredentials:true
	  });
      setProducts((prev) => [...prev, data.data]);
      return data.data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create product");
      throw err;
    }
  }, []);

  const updateProduct = useCallback(async (id, payload) => {
    setError(null);
    try {
      const { data } = await axios.put(`${API_BASE_URI}/api/product/admin/update-product/${id}`, payload,{
		withCredentials:true
	  });
      setProducts((prev) =>
        prev.map((p) => (p._id === id ? data.data : p))
      );
      return data.data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update product");
      throw err;
    }
  }, []);

  const deleteProduct = useCallback(async (id) => {
    setError(null);
    try {
      await axios.delete(`${API_BASE_URI}/api/product/${id}`,{
		withCredentials:true
	  });
      setProducts((prev) => prev.filter((p) => p._id !== id));
      return true;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete product");
      throw err;
    }
  }, []);

  const approveProduct = useCallback(async (id) => {
    setError(null);
    try {
      const { data } = await axios.put(`${API_BASE_URI}/api/product/admin/approve-product/${id}`, {}, {
        withCredentials: true
      });
      setProducts((prev) =>
        prev.map((p) => (p._id === id ? data.data : p))
      );
      return data.data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to approve product");
      throw err;
    }
  }, []);

  const rejectProduct = useCallback(async (id, reason) => {
    if (!reason || reason.trim() === "") {
      throw new Error("Reject reason is required");
    }

    setError(null);
    try {
      const { data } = await axios.put(`${API_BASE_URI}/api/product/admin/reject-product/${id}`, { reason },{
		withCredentials:true
	  });
      setProducts((prev) =>
        prev.map((p) => (p._id === id ? data.data : p))
      );
      return data.data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reject product");
      throw err;
    }
  }, []);

  const fetchProductsByStatus = useCallback(async (status) => {
  setLoading(true);
  setError(null);
  try {
    const { data } = await axios.get(`${API_BASE_URI}/api/product/admin/products-status`, {
      params: { status },
      withCredentials: true
    });
    setProducts(data.data || []);
    return data.data;
  } catch (err) {
    setError(err.response?.data?.message || "Failed to fetch products by status");
    throw err;
  } finally {
    setLoading(false);
  }
}, []);


  return {
    products,
    single,
    loading,
    error,
    setProducts,

    fetchProducts,
    fetchProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    approveProduct,
    rejectProduct,
	fetchProductsByStatus
  };
}
