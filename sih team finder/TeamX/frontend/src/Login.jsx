import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "./config";
import { Loader as LoaderIcon, Eye, EyeOff } from "lucide-react";

// Loader Component as in Dashboard.jsx
function Loader() {
  return (
    <div
      className="flex flex-col items-center justify-center py-10"
      aria-label="Loading..."
    >
      <LoaderIcon
        className="animate-spin text-[#A259FF]"
        size={48}
        strokeWidth={3}
      />
      <span className="mt-4 text-[#B3B3B3] text-base font-medium">
        Loading...
      </span>
    </div>
  );
}

function LoginPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false); // loader state
  const [showPassword, setShowPassword] = useState(false); // password visibility toggle

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const validate = () => {
    const errs = {};
    if (!form.email.endsWith("rajalakshmi.edu.in")) {
      errs.email = "Use your college email (@rajalakshmi.edu.in)";
    }
    if (!form.password) {
      errs.password = "Password is required";
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length) return;

    setLoading(true); // Show Loader
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Login failed");
        setLoading(false); // Hide Loader
        return;
      }

      // Save token + email + userId in sessionStorage
      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("email", data.user.email);
      sessionStorage.setItem("userId", data.user.id);

      alert("Login successful!");

      // Keep loader shown during navigation
      if (data.user.isProfileComplete) {
        navigate("/dashboard");
      } else {
        navigate("/ProfileSetUp");
      }
      // No setLoading(false) here — loader stays until route changes
    } catch (error) {
      console.error("Login error:", error);
      alert("Something went wrong. Try again.");
      setLoading(false); // Hide Loader on error
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#0B0B0B]">
      <div className="w-full max-w-md bg-[#141414] p-8 rounded-xl shadow-lg border border-gray-800">
        {/* Loader */}
        {loading && <Loader />}

        {!loading && (
          <>
            {/* Heading */}
            <h1 className="text-3xl font-bold mb-6 text-center text-purple-400">
              Welcome Back 👋
            </h1>
            <h2 className="text-lg text-gray-300 text-center mb-6">
              Login in to{" "}
              <span className="font-extrabold text-white">FIND YOUR TEAM</span>
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label className="text-sm text-gray-400">College Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="yourid@rajalakshmi.edu.in"
                  className="w-full p-3 bg-[#0F0F0F] border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="text-sm text-gray-400">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="w-full p-3 bg-[#0F0F0F] border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500 mt-1">{errors.password}</p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-black font-bold py-3 rounded-xl shadow-lg transition"
              >
                Log In
              </button>

              {/* Signup link */}
              <p className="text-center text-sm text-gray-400 mt-3">
                Don’t have an account?{" "}
                <span
                  className="text-purple-400 underline cursor-pointer"
                  onClick={() => navigate("/signup")}
                >
                  Sign up
                </span>
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default LoginPage;
