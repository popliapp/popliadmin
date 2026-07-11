import React, { useEffect, useState } from "react";
import { Button, Chip, Stack, Avatar } from "@mui/material";
import { useNavigate } from "react-router-dom";

import CustomTable from "../../components/CustomTable";
import ConfirmDeleteDialog from "../../components/ConfirmDeleteDialog";
import { useProducts } from "../../api/product";

export default function ProductList() {
  const navigate = useNavigate();
  const {
	products,
	fetchProducts,
	deleteProduct,
	loading,
  } = useProducts();

  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
	fetchProducts().catch(() => {});
  }, []);


  const confirmDelete = async () => {
	if (!deleteTarget) return;
	await deleteProduct(deleteTarget._id);
	setDeleteTarget(null);
  };

  const rows = products?.length
	? products
	: [
		{
		  _id: "dummy-1",
		  name: "Organic Mango",
		  category: "Fruits",
		  pricing: { salePrice: 120 },
		  image:
			"https://img.freepik.com/free-photo/mango-isolated_93675-128626.jpg",
		  approval: { status: "APPROVED" },
		},
	  ];

  const columns = [
	{
	  key: "image",
	  label: "Image",
	  render: (row) => (
		<Avatar
		  src={row?.image[0] || row.images?.[0]}
		  variant="rounded"
		  sx={{ width: 48, height: 48 }}
		/>
	  ),
	},
	{ key: "name", label: "Product Name" },
	{ key: "category", label: "Category" },
	{
	  key: "salePrice",
	  label: "Price",
	  render: (row) => row.pricing?.salePrice || "-",
	},
	{
	  key: "approval",
	  label: "Status",
	  render: (row) => (
		<Chip size="small" label={row.approval?.status} color="success" />
	  ),
	},
  ];

  return (
	<div className="space-y-4">
	  <Stack direction="row" justifyContent="space-between" alignItems="center">
		<h2 className="text-xl font-semibold">Products List</h2>

		<Button
		  variant="contained"
		  onClick={() =>fetchProducts()}
		>
		  Refresh
		</Button>
	  </Stack>

	  <CustomTable 
		 columns={columns} 
		 rows={rows} 
		 actions={{ view: true,  delete: true }}
		 onView={(row) => navigate(`/product-details/${row._id}`)}
		//  onEdit={(row) => navigate(`/admin-edit-product/${row._id}`)}
		 onDelete={(row) => setDeleteTarget(row)}
	   />
			

	  <ConfirmDeleteDialog
		open={Boolean(deleteTarget)}
		title="Delete Product"
		description="Are you sure you want to delete this product?"
		onClose={() => setDeleteTarget(null)}
		onConfirm={confirmDelete}
	  />
	</div>
  );
}
