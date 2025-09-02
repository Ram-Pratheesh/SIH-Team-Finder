import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "./config";
import { Eye, EyeOff } from "lucide-react"; // 👁 icons

function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    otp: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [otpVerified, setOtpVerified] = useState(false); // ✅ safeguard
  const [otpMessage, setOtpMessage] = useState(""); // ✅ for spam check note
  const [showPassword, setShowPassword] = useState(false); // 👁 toggle

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateEmail = () => {
    const errs = {};
    if (!form.email.endsWith("rajalakshmi.edu.in")) {
      errs.email = "Use your college email (@rajalakshmi.edu.in)";
    }
    return errs;
  };

  const validatePassword = () => {
    const errs = {};
    if (form.password.length < 6) {
      errs.password = "Password must be at least 6 characters";
    }
    return errs;
  };

  const requestOTP = async () => {
    const v = validateEmail();
    setErrors(v);
    if (Object.keys(v).length) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "OTP request failed");

      setOtpMessage(
        "OTP sent to your email. Please also check your Spam/Junk folder."
      ); // ✅ spam check note
      setOtpVerified(false); // reset OTP status if re-requested
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!form.otp) {
      setErrors({ otp: "Enter the OTP sent to your email" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, otp: form.otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "OTP verification failed");

      alert("OTP verified successfully.");
      setOtpVerified(true); // ✅ allow signup
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const completeSignup = async () => {
    const v = validatePassword();
    setErrors(v);
    if (Object.keys(v).length) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Signup failed");

      alert("Signup successful! Please log in.");
      navigate("/login");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#0D0D0D]">
      <div className="w-full max-w-md bg-[#1A1A1A] p-8 rounded-2xl shadow-xl">
        <h1 className="text-3xl font-bold mb-6 text-gray-100 text-center">
          Welcome to <br />
          <span className="text-purple-400 font-extrabold tracking-wide">
            SIH-Team Finder
          </span>
        </h1>

        {/* Email */}
        <label className="text-sm text-gray-300">College Email</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="yourid@rajalakshmi.edu.in"
          className="w-full p-3 bg-[#0F0F0F] border border-gray-700 text-white rounded-lg mb-2"
        />
        {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}

        {/* Request OTP */}
        <button
          onClick={requestOTP}
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 text-black font-bold py-2 rounded-lg mb-3"
        >
          {loading ? "Sending OTP..." : "Request OTP"}
        </button>
        {otpMessage && (
          <p className="text-xs text-yellow-400 mb-3">
            OTP sent to your email. Please also check your{" "}
            <span className="animate-spam text-yellow-400 font-bold">
              Spam/Junk
            </span>{" "}
            in the mail
          </p>
        )}

        {/* OTP */}
        <label className="text-sm text-gray-300">OTP</label>
        <input
          type="text"
          name="otp"
          value={form.otp}
          onChange={handleChange}
          placeholder="Enter OTP"
          className="w-full p-3 bg-[#0F0F0F] border border-gray-700 text-white rounded-lg mb-2"
        />
        {errors.otp && <p className="text-xs text-red-500">{errors.otp}</p>}

        {/* Verify OTP */}
        <button
          onClick={verifyOTP}
          disabled={loading}
          className="w-full bg-green-500 hover:bg-green-600 text-black font-bold py-2 rounded-lg mb-3"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>

        {/* Password */}
        <label className="text-sm text-gray-300">Password</label>
        <div className="relative mb-2">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Set your password"
            className="w-full p-3 bg-[#0F0F0F] border border-gray-700 text-white rounded-lg pr-10"
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
          <p className="text-xs text-red-500">{errors.password}</p>
        )}

        {/* Complete Signup */}
        <button
          onClick={completeSignup}
          disabled={!otpVerified || loading} // ✅ blocked until verified
          className={`w-full font-bold py-2 rounded-lg ${
            otpVerified
              ? "bg-purple-500 hover:bg-purple-600 text-black"
              : "bg-gray-500 text-gray-300 cursor-not-allowed"
          }`}
        >
          {loading ? "Creating Account..." : "Complete Signup"}
        </button>

        {/* Login link */}
        <p className="text-center text-sm text-gray-400 mt-5">
          Already have an account?{" "}
          <span
            className="text-purple-400 underline cursor-pointer"
            onClick={() => navigate("/login")}
          >
            Log in
          </span>
        </p>
      </div>
    </div>
  );
}

export default SignupPage;
