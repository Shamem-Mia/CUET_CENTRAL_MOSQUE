import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";

const ForgotPasswordPage = () => {
  const { loading, forgetPassword } = useAuthStore();
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    forgetPassword(email, navigate);
  };

  return (
    <div className="min-h-screen bg-emerald-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md border border-emerald-100">
        <h1 className="text-2xl font-bold text-emerald-700 mb-2">
          Forgot Password
        </h1>
        <p className="text-emerald-600 mb-2 italic text-sm">
          "And remember your Lord within yourself"
        </p>
        <p className="text-gray-600 mb-6">
          Enter your email address and we'll send you a verification code to
          reset your password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-emerald-700"
            >
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-emerald-300 rounded-md shadow-sm focus:ring-emerald-600 focus:border-emerald-600 hover:border-emerald-400 transition duration-200"
              placeholder="Enter your registered email"
              required
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-700 hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600 transition duration-200 ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Sending OTP..." : "Send Verification Code"}
            </button>
          </div>
        </form>

        <div className="mt-4 text-center text-sm text-emerald-600">
          Remember your password?{" "}
          <a
            href="/login"
            className="font-medium text-emerald-700 hover:text-emerald-800 underline transition duration-200"
          >
            Sign in
          </a>
        </div>

        <div className="mt-4 text-center text-xs text-emerald-500">
          <span className="text-red-500">*</span> Required field
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
