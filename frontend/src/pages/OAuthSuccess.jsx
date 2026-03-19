// pages/OAuthSuccess.jsx
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";
import { axiosInstance } from "../context/axiosInstance";
import toast from "react-hot-toast";

const OAuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setAuthUser } = useAuthStore();

  useEffect(() => {
    const handleOAuthSuccess = async () => {
      const token = searchParams.get("token");

      if (!token) {
        toast.error("Authentication failed");
        navigate("/login");
        return;
      }

      try {
        // Verify token and get user data
        const response = await axiosInstance.get("/auth/oauth-success", {
          params: { token },
        });

        if (response.data.success) {
          setAuthUser(response.data.user);
          toast.success("Successfully signed in with Google!");
          navigate("/");
        } else {
          toast.error("Authentication failed");
          navigate("/login");
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Authentication failed");
        navigate("/login");
      }
    };

    handleOAuthSuccess();
  }, [searchParams, navigate, setAuthUser]);

  return (
    <div className="min-h-screen bg-emerald-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-700 mx-auto"></div>
        <p className="mt-4 text-emerald-600">Completing authentication...</p>
      </div>
    </div>
  );
};

export default OAuthSuccess;
