import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../components/Login";
import Dashboard from "../pages/Dashboard";
import Overview from "../pages/Overview";
import Users from "../pages/Users";
import Registration from "../pages/Registration";
// import AdminProfile from "../pages/AdminProfile";
import ProtectedRoute from "../components/ProtectedRoute";
import TodayScanned from "../pages/TodayScanned";
import Report from "../pages/Report";
import ErrorPage from "../pages/ErrorPage";
import NewCluster from "../pages/NewCluster";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} /> */}
        <Route path="/login" element={<Login />}>
          <Route
            path="*"
            element={
              <ProtectedRoute>
                <Navigate to="/login" replace />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Navigate to="/dashboard" replace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<Overview />} />
          <Route path="users" element={<Users />} />
          <Route path="userManagment" element={<Registration />} />
          <Route path="userManagment/:id" element={<Registration />} />
          <Route path="today-scanned" element={<TodayScanned />} />
          <Route path="report" element={<Report />} />
          <Route path="cluster" element={<NewCluster />} />
          {/* <Route path="*" element={<ErrorPage />} /> */}
          {/* <Route path="*" element={<Navigate to="/dashboard" replace />} /> */}
        </Route>
        <Route path="*" element={<ErrorPage />} />
        {/* <Route
          path="*"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        ></Route> */}
      </Routes>
    </BrowserRouter>
  );
}
