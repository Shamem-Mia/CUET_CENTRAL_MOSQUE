import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";

const LoginPage = () => {
  const { loading, error, login } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    login(email, password, navigate);
  };

  return (
    <div className="min-h-screen bg-emerald-50 flex justify-center items-center md:flex-row">
      {/* Left side - Login Form */}
      <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
        <div className="max-w-md w-full mx-auto">
          <h1 className="text-3xl font-bold text-emerald-700 mb-2">
            CUET CENTRAL MOSQUE
          </h1>
          <p className="text-emerald-600 mb-6 italic">
            "And pray for the believers"
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-emerald-700"
              >
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-emerald-300 rounded-md shadow-sm focus:ring-emerald-600 focus:border-emerald-600 hover:border-emerald-400 transition duration-200 bg-white"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-emerald-700"
              >
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-emerald-300 rounded-md shadow-sm focus:ring-emerald-600 focus:border-emerald-600 hover:border-emerald-400 transition duration-200 bg-white"
                placeholder="Enter your password"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-emerald-300 rounded hover:bg-emerald-100 transition duration-200"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-emerald-600"
                >
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className="font-medium text-emerald-600 hover:text-emerald-700 transition duration-200"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-700 hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600 transition duration-200 ${
                  loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Logging in..." : "Log in"}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-emerald-600">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-medium text-emerald-700 hover:text-emerald-800 transition duration-200 underline"
            >
              Register here
            </Link>
          </div>

          <div className="mt-4 text-center text-xs text-emerald-500">
            <span className="text-red-500">*</span> Required fields
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
