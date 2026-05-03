import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Root from "./pages/Root";
import React from "react";
import './App.css'
import Splash from "./pages/Splash";
import ErrorPage from "./components/error/ErrorPage";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Dashboard from "./pages/dashboard/Dashboard";
import { useAuth } from "./context/AuthContext";
import { Navigate } from "react-router-dom";
import SetupKeys from "./pages/setup/SetupKeys";



  const ProtectedRoute = ({ children }: { children: React.JSX.Element }) => {
    const { isAuthenticated } = useAuth();
      return isAuthenticated ? children : <Navigate to="/login" />;
  };

  const Router = createBrowserRouter([
    { path: '/', element: <Root />, errorElement: <ErrorPage />, children: [
      {index: true, element: <Splash />},
      {path: 'login', element: <Login />},
      {path: 'signup', element: <Signup />},
      {path: 'setup', element: <ProtectedRoute><SetupKeys /></ProtectedRoute>},
      { path: 'dashboard', element: <ProtectedRoute><Dashboard /></ProtectedRoute> },
    ]},

  ]);
export default function App() {
  return <RouterProvider router={Router} />;
}
