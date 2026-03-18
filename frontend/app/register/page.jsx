"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import BackgroundBlobs from "@/components/BackgroundBlobs";
import AuthSidePanel from "@/components/AuthSidePanel";
import { bot } from "@/lib/bot";

const blob = (delay = 0) => ({
  duration: 8,
  repeat: Infinity,
  ease: "easeInOut",
  delay,
});

const steps = ["Personal Info", "Security", "Account Setup"];

export default function Register() {
  const [step, setStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone_no: "",
    password: "",
    confirmPassword: "",
    account_type: "savings",
    initial_balance: 0,
  });

  const router = useRouter();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const nextStep = () => {
    setError("");
    if (step === 0 && (!form.name || !form.email))
      return setError("Please fill all fields");

    if (step === 1) {
      if (!form.phone_no || !form.password)
        return setError("Please fill all fields");
      if (form.password !== form.confirmPassword)
        return setError("Passwords do not match");
    }

    setStep(step + 1);
  };

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const data = await bot.register({
        name: form.name,
        email: form.email,
        phone_no: form.phone_no,
        password: form.password,
        account_type: form.account_type,
        initial_balance: Number(form.initial_balance),
      });
      if (!data.success) throw new Error(data.error);
      localStorage.setItem("token", data.data.token);
      localStorage.setItem("user", JSON.stringify(data.data.user));
      localStorage.setItem("account", JSON.stringify(data.data.account));
      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div
      className="relative min-h-screen flex items-center justify-center bg-[#f7f9fc] overflow-hidden"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* BLOBS */}
      <BackgroundBlobs />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-5xl bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden grid grid-cols-1 md:grid-cols-2"
      >
        {/* LEFT */}
        <div className="p-10 flex flex-col justify-center">
          {/* PROGRESS BAR */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              {steps.map((s, i) => (
                <span
                  key={i}
                  className={`text-xs font-medium ${
                    i <= step ? "text-[#00baf2]" : "text-gray-300"
                  }`}
                >
                  {s}
                </span>
              ))}
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-[#00baf2] rounded-full"
                animate={{
                  width: `${((step + 1) / steps.length) * 100}%`,
                }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>

          <motion.h2
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-semibold text-[#010935] mb-1"
          >
            {step === 0 && "Personal Info"}
            {step === 1 && "Security"}
            {step === 2 && "Account Setup"}
          </motion.h2>

          <p className="text-sm text-gray-500 mb-6">
            {step === 0 && "Tell us who you are"}
            {step === 1 && "Keep your account safe"}
            {step === 2 && "Almost there!"}
          </p>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600"
            >
              {error}
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {/* STEP 0 */}
            {step === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00baf2] transition"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00baf2] transition"
                  />
                </div>
              </motion.div>
            )}

            {/* STEP 1 */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    name="phone_no"
                    type="tel"
                    placeholder="9876543210"
                    value={form.phone_no}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00baf2] transition"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={form.password}
                      onChange={handleChange}
                      className="w-full px-4 py-3 pr-10 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00baf2] transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <input
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00baf2] transition"
                  />
                </div>
              </motion.div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Type
                  </label>
                  <select
                    name="account_type"
                    value={form.account_type}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00baf2] transition"
                  >
                    <option value="savings">Savings</option>
                    <option value="current">Current</option>
                  </select>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Initial Deposit (₹)
                  </label>
                  <input
                    name="initial_balance"
                    type="number"
                    placeholder="0"
                    min="0"
                    value={form.initial_balance}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00baf2] transition"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* BUTTONS */}
          <div className="flex gap-3">
            {step > 0 && (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setStep(step - 1)}
                className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-50 transition"
              >
                Back
              </motion.button>
            )}

            <motion.button
              whileTap={{ scale: 0.97 }}
              whileHover={{ scale: 1.02 }}
              onClick={step < 2 ? nextStep : handleSubmit}
              disabled={loading}
              className="flex-1 bg-[#010935] text-white py-3 rounded-xl font-medium shadow-md hover:bg-[#020d4d] transition-colors disabled:opacity-60"
            >
              {step < 2
                ? "Continue"
                : loading
                  ? "Creating account..."
                  : "Create Account"}
            </motion.button>
          </div>

          <p className="text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-[#00baf2] font-medium hover:underline"
            >
              Sign in
            </a>
          </p>
        </div>

        {/* RIGHT */}
        <AuthSidePanel />
      </motion.div>
    </div>
  );
}
