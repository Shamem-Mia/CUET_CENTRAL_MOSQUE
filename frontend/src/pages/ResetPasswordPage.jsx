import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuthStore } from "../stores/useAuthStore";

const ResetPasswordPage = () => {
  const { loading, resetPassword } = useAuthStore();
  const location = useLocation();
  const { email } = location.state || {};
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const navigate = useNavigate();

  if (!email) {
    navigate("/forgot-password");
    return null;
  }

  const checkPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 4) strength++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    setPasswordStrength(strength);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    if (passwordStrength < 2) {
      toast.error("Please choose a stronger password");
      return;
    }

    if (newPassword.length < 4) {
      toast.error("Password must be at least 4 characters");
      return;
    }

    resetPassword(email, newPassword, navigate);
  };

  return (
    <div className="min-h-screen bg-emerald-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md border border-emerald-100">
        <h1 className="text-2xl font-bold text-emerald-700 mb-2">
          Reset Password
        </h1>
        <p className="text-emerald-600 mb-2 italic text-sm">
          "And whoever fears Allah, He will make a way out for him"
        </p>
        <p className="text-gray-600 mb-6">
          Create a new password for{" "}
          <span className="font-medium text-emerald-700">{email}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-emerald-700"
            >
              New Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                checkPasswordStrength(e.target.value);
              }}
              className="mt-1 block w-full px-4 py-2 border border-emerald-300 rounded-md shadow-sm focus:ring-emerald-600 focus:border-emerald-600 hover:border-emerald-400 transition duration-200"
              placeholder="Create a strong password"
              required
              minLength={4}
            />
            <div className="mt-2">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-sm ${
                      i <= passwordStrength
                        ? passwordStrength >= 3
                          ? "bg-emerald-500"
                          : passwordStrength >= 2
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-emerald-600 mt-1">
                {passwordStrength === 0
                  ? ""
                  : passwordStrength === 1
                    ? "Weak"
                    : passwordStrength === 2
                      ? "Moderate"
                      : passwordStrength === 3
                        ? "Strong"
                        : "Very Strong"}
              </p>
            </div>
            <p className="text-xs text-emerald-500 mt-1">
              Password should be at least 4 characters with a mix of letters,
              numbers & symbols
            </p>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-emerald-700"
            >
              Confirm New Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-emerald-300 rounded-md shadow-sm focus:ring-emerald-600 focus:border-emerald-600 hover:border-emerald-400 transition duration-200"
              placeholder="Confirm your new password"
              required
              minLength={4}
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
              {loading ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>

        <div className="mt-4 text-center text-xs text-emerald-500">
          <span className="text-red-500">*</span> Required fields
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
