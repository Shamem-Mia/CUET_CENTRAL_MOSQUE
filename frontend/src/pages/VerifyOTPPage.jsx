import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { axiosInstance } from "../context/axiosInstance";
import toast from "react-hot-toast";
import { useAuthStore } from "../stores/useAuthStore";

const VerifyOTPPage = () => {
  const { loading, verifyResetOtp } = useAuthStore();
  const { state } = useLocation();
  const email = state?.email;
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (otp.length !== 6) {
      toast.error("Please enter a 6-digit code");
      return;
    }

    verifyResetOtp(email, otp, navigate);
  };

  const handleResend = async () => {
    try {
      await axiosInstance.post("/auth/send-reset-otp", { email });
      toast.success("New code sent");
      setOtp("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resend code");
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md border border-emerald-100">
        <h1 className="text-2xl font-bold text-emerald-700 mb-2">
          Verify Code
        </h1>
        <p className="text-emerald-600 mb-2 italic text-sm">
          "Verily, with every hardship comes ease"
        </p>
        <p className="text-gray-600 mb-6">
          Enter the 6-digit code sent to{" "}
          <span className="font-medium text-emerald-700">{email}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-emerald-700 mb-2">
              Verification Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              className="w-full text-center text-2xl tracking-widest border border-emerald-300 rounded focus:ring-emerald-600 focus:border-emerald-600 hover:border-emerald-400 transition duration-200 p-2"
              maxLength={6}
              autoFocus
              placeholder="000000"
              required
            />
            <p className="text-xs text-emerald-500 mt-1">
              Enter the 6-digit code sent to your email
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className={`w-full py-2 px-4 rounded-md text-white bg-emerald-700 hover:bg-emerald-800 focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600 transition duration-200 ${
              loading || otp.length !== 6 ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Verifying..." : "Verify Code"}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-emerald-600">
          Didn't receive code?{" "}
          <button
            onClick={handleResend}
            className="text-emerald-700 hover:text-emerald-800 underline font-medium transition duration-200"
          >
            Resend
          </button>
        </div>

        <div className="mt-4 text-center text-xs text-emerald-500">
          <span className="text-red-500">*</span> Required field
        </div>
      </div>
    </div>
  );
};

export default VerifyOTPPage;
