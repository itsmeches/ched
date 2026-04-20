import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import SuperAdminDashboard from './pages/superadmin/Dashboard'
import CHEDDashboard from './pages/ched/Dashboard'
import HEIDashboard from './pages/hei/Dashboard'
import Layout from './components/Layout'

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth()

  if (loading) return <div className="loading">Loading...</div>
  if (!user) return <Navigate to="/login" />
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />
  }

  return children
}

function DashboardRouter() {
  const { user } = useAuth()
  
  switch (user?.role) {
    case 'super_admin':
      return <SuperAdminDashboard />
    case 'ched':
      return <CHEDDashboard />
    case 'hei':
      return <HEIDashboard />
    default:
      return <div>Invalid role</div>
  }
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={
          <ProtectedRoute allowedRoles={['super_admin', 'ched', 'hei']}>
            <DashboardRouter />
          </ProtectedRoute>
        } />
        
        {/* Super Admin Routes */}
        <Route path="users" element={
          <ProtectedRoute allowedRoles={['super_admin']}>
            <SuperAdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="settings" element={
          <ProtectedRoute allowedRoles={['super_admin']}>
            <SuperAdminDashboard />
          </ProtectedRoute>
        } />
        
        {/* CHED Routes */}
        <Route path="proposals" element={
          <ProtectedRoute allowedRoles={['ched']}>
            <CHEDDashboard />
          </ProtectedRoute>
        } />
        <Route path="approvals" element={
          <ProtectedRoute allowedRoles={['ched']}>
            <CHEDDashboard />
          </ProtectedRoute>
        } />
        <Route path="reports" element={
          <ProtectedRoute allowedRoles={['ched']}>
            <CHEDDashboard />
          </ProtectedRoute>
        } />
        
        {/* HEI Routes */}
        <Route path="my-research" element={
          <ProtectedRoute allowedRoles={['hei']}>
            <HEIDashboard />
          </ProtectedRoute>
        } />
        <Route path="submit-proposal" element={
          <ProtectedRoute allowedRoles={['hei']}>
            <HEIDashboard />
          </ProtectedRoute>
        } />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
