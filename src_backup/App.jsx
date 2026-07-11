import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './layout/AppLayout'
import {lazy,Suspense} from 'react'
import DashboardData from './dashboard/pages/Dashboard'
import Login from './pages/Login'
import ProtectedRoute from './routes/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import { Toaster } from 'react-hot-toast'

const CreateVender = lazy(() => import('./vendors/pages/CreateVender'))
const Vendor=lazy(() => import('./vendors/pages/Vendor'))
const VendorDetails = lazy(() => import('./vendors/pages/VendorDetails'))
const PendingVendors = lazy(() => import('./vendors/pages/PendingVendors'))
const ApprovedVendors = lazy(() => import('./vendors/pages/ApproveVendor'))
const VenderDashboard = lazy(() => import('./vendors/pages/VenderDashboard'))
const EditVendor=lazy(()=>import('./vendors/pages/EditVendor'))
const VendorCreateStore = lazy(() => import('./vendors/pages/VendorCreateStore'));

const AdminCreateStore = lazy(() => import('./store/pages/AdminCreateStore'))
const AdminEditStore = lazy(() => import('./store/pages/AdminEditStore'))
const PendingStore = lazy(() => import('./store/pages/PendingStore'))
const ApprovedStore = lazy(() => import('./store/pages/ApprovedStore'))
const Stores=lazy(() => import('./store/pages/Stores'))
const ActiveStore=lazy(()=>import('./store/pages/ActiveStore'))
const StoreDeatails=lazy(()=>import('./store/pages/StoreDeatails'))


const PendingProducts = lazy(() => import('./products/pages/PendingProducts'))
const ApprovedProducts=lazy(() => import('./products/pages/ApprovedProducts'))
const ProductDetails=lazy(()=>import("./products/pages/ProductDetails"))
const Products=lazy(()=>import("./products/pages/Products"))

const Orders=lazy(()=>import("./orders/pages/Orders"))
const OrderDeatils=lazy(()=>import("./orders/pages/OrderDeatils"))

const CustomersPage = lazy(() => import('./customer/pages/Customers'))
const CreateCustomer = lazy(() => import('./customer/pages/CreateCustomer'))
const EditCustomer = lazy(() => import('./customer/pages/EditCustomer'))
const CustomerDetails = lazy(() => import('./customer/pages/CustomerDetails'))

const CreatePayout = lazy(() => import('./payouts/pages/CreatePayout'))
const StorePayouts = lazy(() => import('./payouts/pages/StorePayouts'))
const VendorPayouts = lazy(() => import('./payouts/pages/VendorPayouts'))
const DeliveryPartnerPayouts = lazy(() => import('./payouts/pages/DeliveryPartnerPayouts'))
const PayoutHistory = lazy(() => import('./payouts/pages/PayoutHistory'))

const AllDrivers = lazy(() => import('./driver/pages/AllDrivers'));
const PendingDrivers = lazy(() => import('./driver/pages/PendingDrivers'));
const DriverDetails = lazy(() => import('./driver/pages/DriverDetails'));
const CreateDriver = lazy(() => import('./driver/pages/CreateDriver'));
const EditDriver = lazy(() => import('./driver/pages/EditDriver'));
const ApprovedDrivers = lazy(() => import('./driver/pages/ApprovedDrivers'));


const StoreManagers = lazy(() => import('./store.manager/pages/StoreManagers'));
const CreateStoreManager = lazy(() => import('./store.manager/pages/CreateStoreManager'));
const EditStoreManager = lazy(() => import('./store.manager/pages/EditStoreManager'));
const StoreManagerDetails = lazy(() => import('./store.manager/pages/StoreManagerDetails'));


function App() {

  return (
    <BrowserRouter>
    <Toaster/>
      <AuthProvider>
      <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/login" element={<Login/>} />
        <Route path="/" element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardData/>} />
          <Route path="/create-vendor" element={<CreateVender/>} />
          <Route path="/vendors" element={<Vendor/>} />
          <Route path="/vendor/:id" element={<VendorDetails/>} />
          <Route path="/admin-edit-vendor/:id" element={<EditVendor/>} />
          <Route path="/pending-vendors" element={<PendingVendors/>} />
          <Route path="/approved-vendors" element={<ApprovedVendors/>} />
          <Route path="/vendor-dashboard" element={<VenderDashboard/>} />
          <Route path="/vendor/create-store" element={<VendorCreateStore />} />

          <Route path="/admin-create-store" element={<AdminCreateStore/>} />
          <Route path="/admin-edit-store/:id" element={<AdminEditStore/>} />
          <Route path="/pending-store" element={<PendingStore/>} />
          <Route path="/approve-store" element={<ApprovedStore/>} />
          <Route path="/stores" element={<Stores/>} />
          <Route path="/active-store" element={<ActiveStore/>} />
          <Route path="/store/:id" element={<StoreDeatails/>} />



          <Route path="/pending-products" element={<PendingProducts/>} />
          <Route path="/approve-products" element={<ApprovedProducts/>} />
          <Route path="/product-details/:id" element={<ProductDetails/>}/>
          <Route path='/products' element={<Products/>} />

          <Route path="/orders" element={<Orders/>}/>
          <Route path="/order/:id" element={<OrderDeatils/>}/>

          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/admin/customers/create" element={<CreateCustomer />} />
          <Route path="/admin/customers/edit/:id" element={<EditCustomer />} />
          <Route path="/admin/customers/details/:id" element={<CustomerDetails />} />

          <Route path="/admin/payouts/create" element={<CreatePayout />} />
          <Route path="/payouts/stores" element={<StorePayouts />} />
          <Route path="/payouts/vendors" element={<VendorPayouts />} />
          <Route path="/payouts/delivery-partners" element={<DeliveryPartnerPayouts />} />
          <Route path="/payouts/:entityType/:id" element={<PayoutHistory />} />
          
          {/* NEW Driver Management Routes */}
          <Route path="/drivers" element={<AllDrivers />} />
          <Route path="/drivers/pending" element={<PendingDrivers />} />
          <Route path="/drivers/approved" element={<ApprovedDrivers />} />
          <Route path="/drivers/edit/:id" element={<EditDriver />} />
          <Route path="/drivers/:id" element={<DriverDetails />} />
          <Route path="/drivers/create" element={<CreateDriver />} />
          
          <Route path="/store-managers" element={<StoreManagers />} />
          <Route path="/store-managers/create" element={<CreateStoreManager />} />
          <Route path="/store-manager/edit/:id" element={<EditStoreManager />} />
          <Route path="/store-manager/:id" element={<StoreManagerDetails />} />

          {/* Add your other routes here matching MenuContent paths */}
        </Route>
         <Route element={<ProtectedRoute roles={["DELIVERY_PARTNER"]} />}>
        {/* <Route path="/delivery" element={<DeliveryDashboard />} />
        <Route path="/delivery/earnings" element={<DeliveryEarnings />} /> */}
      </Route>

      </Routes>
      </Suspense>
      </AuthProvider>

    </BrowserRouter>
  )
}


export default App
