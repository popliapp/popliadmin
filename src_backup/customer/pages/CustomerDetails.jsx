import React ,{useEffect,useCallback,useState}from 'react'
import { useCustomer } from '../../api/customer'
import { useParams } from 'react-router-dom'

function CustomerDetails() {
	const { singleCustomer, getCustomerById } = useCustomer();
	const { id } = useParams();
	useEffect(() => {
		getCustomerById(id);

	},getCustomerById,[id])
  console.log("Single Customer:", singleCustomer);
  return (
	<div>CustomerDetails</div>
  )
}

export default CustomerDetails