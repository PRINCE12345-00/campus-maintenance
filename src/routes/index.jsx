import { createBrowserRouter } from 'react-router-dom'
import AppLayout from '../layouts/AppLayout'
import LandingPage from '../pages/LandingPage'
import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage'
import StudentDashboard from '../pages/student/StudentDashboard'
import StudentComplaintsPage from '../pages/student/StudentComplaintsPage'
import StudentPermissionsPage from '../pages/student/StudentPermissionsPage'
import StudentNotificationsPage from '../pages/student/StudentNotificationsPage'
import StudentProfilePage from '../pages/student/StudentProfilePage'
import AdminDashboard from '../pages/admin/AdminDashboard'
import AdminComplaintsPage from '../pages/admin/AdminComplaintsPage'
import AdminPermissionsPage from '../pages/admin/AdminPermissionsPage'
import AdminAnalyticsPage from '../pages/admin/AdminAnalyticsPage'
import AdminProfilePage from '../pages/admin/AdminProfilePage'
import ComplaintDetailPage from '../pages/ComplaintDetailPage'
import PermissionReviewPage from '../pages/PermissionReviewPage'

export const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  {
    path: '/student',
    element: <AppLayout role="student" />,
    children: [
      { index: true, element: <StudentDashboard /> },
      { path: 'complaints', element: <StudentComplaintsPage /> },
      { path: 'permissions', element: <StudentPermissionsPage /> },
      { path: 'notifications', element: <StudentNotificationsPage /> },
      { path: 'profile', element: <StudentProfilePage /> },
      { path: 'complaint/:id', element: <ComplaintDetailPage /> },
    ],
  },
  {
    path: '/admin',
    element: <AppLayout role="admin" />,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'complaints', element: <AdminComplaintsPage /> },
      { path: 'permissions', element: <AdminPermissionsPage /> },
      { path: 'analytics', element: <AdminAnalyticsPage /> },
      { path: 'profile', element: <AdminProfilePage /> },
      { path: 'notifications', element: <StudentNotificationsPage /> },
      { path: 'complaint/:id', element: <ComplaintDetailPage /> },
      { path: 'permission/:id', element: <PermissionReviewPage /> },
    ],
  },
])
