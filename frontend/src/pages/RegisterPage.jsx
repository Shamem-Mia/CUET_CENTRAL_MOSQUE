import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";

const RegisterPage = () => {
  const { register, error, loading } = useAuthStore();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 4) {
      setError("Password must be at least 4 characters");
      return;
    }

    register(formData, navigate);
  };

  return (
    <div className="min-h-screen bg-emerald-50 flex items-center justify-center md:flex-row">
      {/* Form Section */}
      <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
        <div className="max-w-md w-full mx-auto">
          <h1 className="text-3xl font-bold text-emerald-700 mb-2">
            Join CUET CENTRAL MOSQUE
          </h1>
          <p className="text-emerald-600 mb-6 italic">
            "And establish prayer for My remembrance"
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Input */}
            <div>
              <label className="block text-sm font-medium text-emerald-700">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 border border-emerald-300 rounded-md shadow-sm focus:ring-emerald-600 focus:border-emerald-600 hover:border-emerald-400 transition duration-200 bg-white"
                placeholder="Enter your full name"
                required
              />
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-emerald-700">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 border border-emerald-300 rounded-md shadow-sm focus:ring-emerald-600 focus:border-emerald-600 hover:border-emerald-400 transition duration-200 bg-white"
                placeholder="Enter your email"
                required
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-emerald-700">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 border border-emerald-300 rounded-md shadow-sm focus:ring-emerald-600 focus:border-emerald-600 hover:border-emerald-400 transition duration-200 bg-white"
                placeholder="Create a password (min. 4 characters)"
                required
              />
            </div>

            {/* Confirm Password Input */}
            <div>
              <label className="block text-sm font-medium text-emerald-700">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 border border-emerald-300 rounded-md shadow-sm focus:ring-emerald-600 focus:border-emerald-600 hover:border-emerald-400 transition duration-200 bg-white"
                placeholder="Confirm your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 px-4 rounded-md shadow-sm text-white bg-emerald-700 hover:bg-emerald-800 focus:ring-2 focus:ring-emerald-600 transition duration-200 ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Creating account..." : "Register"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-emerald-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-emerald-700 hover:text-emerald-800 transition duration-200 underline"
            >
              Login here
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

export default RegisterPage;
