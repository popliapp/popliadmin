import React, { useEffect, useState } from "react";
import { useStore } from "../../api/store";

const AdminEditStoreForm = ({ id, onSuccess }) => {
  const { fetchStoreById, updateStore, loading } = useStore();

  const [form, setForm] = useState(null);

  useEffect(() => {
    const load = async () => {
      const res = await fetchStoreById(id);
      if (!res.success || !res.data) {
        alert("Failed to load store");
        return;
      }

      const st = res.data;
      setForm({
        name: st.name,
        address: st.address || "",
        pincode: st.pincode || "",
        city: st.city || "",
        vendor: st.vendor || "",
        lat: st.geo?.coordinates?.[1] || "",
        lng: st.geo?.coordinates?.[0] || "",
      });
    };

    load();
  }, [id]);

  if (!form) return <div>Loading...</div>;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    const payload = {
      name: form.name,
      address: form.address,
      pincode: form.pincode,
      city: form.city,
      vendor: form.vendor || null,
      geo: {
        type: "Point",
        coordinates: [
          parseFloat(form.lng) || 0,
          parseFloat(form.lat) || 0,
        ],
      },
    };

    const res = await updateStore(id, payload);
    if (!res.success) {
      alert(res.message || "Update failed");
      return;
    }

    onSuccess?.(res.data);
  };

  return (
    <form className="flex flex-col gap-2 max-w-md" onSubmit={handleUpdate}>
      <input name="name" value={form.name} onChange={handleChange} />

      <input name="address" value={form.address} onChange={handleChange} />

      <input name="pincode" value={form.pincode} onChange={handleChange} />

      <input name="city" value={form.city} onChange={handleChange} />

      <input name="vendor" value={form.vendor} onChange={handleChange} />

      <div className="flex gap-2">
        <input name="lat" value={form.lat} onChange={handleChange} />
        <input name="lng" value={form.lng} onChange={handleChange} />
      </div>

	  	  <div>
				  <p className={labelStyle}><Store size={14} /> Store Status</p>
	  
				<div className="space-y-4">
					  <div className="relative">
					   
						<select
						  name="status"
						placeholder="Status"
						  className={`${inputStyle} appearance-none cursor-pointer`}
						value={form.status}
						onChange={handleChange}
						>
							<option value="INACTIVE">Inactive</option>
							<option value="ACTIVE">Active</option>
						</select>
			   
					  </div>
					</div>
				  </div>

      <button disabled={loading}>
        {loading ? "Updating..." : "Update Store"}
      </button>
    </form>
  );
};

export default AdminEditStoreForm;
