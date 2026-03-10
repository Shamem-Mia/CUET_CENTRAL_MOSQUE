import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";
import { LoaderCircle } from "lucide-react";

const AdminRoute = ({ children }) => {
  const { authUser, isCheckingAuth } = useAuthStore();

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoaderCircle className="size-10 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!authUser) {
    return <Navigate to="/login" replace />;
  }

  if (authUser.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
