"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import BackgroundBlobs from "@/components/BackgroundBlobs";
import AuthSidePanel from "@/components/AuthSidePanel";
import { bot } from "@/lib/bot";

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

  // 🔒 VALIDATION FUNCTION (STRICT)
  const validateStep = () => {
    if (step === 0) {
      if (!form.name.trim() || !form.email.trim()) {
        return "All fields are required";
      }
      if (form.name.trim().length < 2) {
        return "Name must be at least 2 characters";
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        return "Invalid email format";
      }
    }

    if (step === 1) {
      if (!form.phone_no || !form.password || !form.confirmPassword) {
        return "All fields are required";
      }
      if (!/^\d{10}$/.test(form.phone_no)) {
        return "Phone must be exactly 10 digits";
      }
      if (form.password.length < 8) {
        return "Password must be at least 8 characters";
      }
      if (form.password !== form.confirmPassword) {
        return "Passwords do not match";
      }
    }

    if (step === 2) {
      if (!["savings", "current"].includes(form.account_type)) {
        return "Invalid account type";
      }
      if (Number(form.initial_balance) < 0) {
        return "Balance cannot be negative";
      }
    }

    return null;
  };

  const isStepValid = () => !validateStep();

  const nextStep = () => {
    const err = validateStep();
    if (err) return setError(err);

    setError("");
    setStep((prev) => prev + 1);
  };

  const handleSubmit = async () => {
    const err = validateStep();
    if (err) return setError(err);

    setLoading(true);
    setError("");

    try {
      const data = await bot.register({
        name: form.name.trim(),
        email: form.email.trim(),
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
    <div className="relative min-h-screen flex items-center justify-center bg-[#f7f9fc] overflow-hidden">
      <BackgroundBlobs />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-5xl bg-white rounded-2xl shadow-xl border overflow-hidden grid md:grid-cols-2"
      >
        {/* LEFT */}
        <div className="p-10 flex flex-col justify-center">
          {/* PROGRESS */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              {steps.map((s, i) => (
                <span
                  key={i}
                  className={`text-xs ${
                    i <= step ? "text-[#00baf2]" : "text-gray-300"
                  }`}
                >
                  {s}
                </span>
              ))}
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded">
              <div
                className="h-full bg-[#00baf2]"
                style={{ width: `${((step + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* ERROR FIX HEIGHT */}
          <div className="mb-4 min-h-[50px]">
            {error && (
              <div className="px-4 py-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                {error}
              </div>
            )}
          </div>

          {/* FORM FIX HEIGHT */}
          <div className="min-h-[300px]">
            <AnimatePresence mode="wait" initial={false}>
              {/* STEP 0 */}
              {step === 0 && (
                <motion.div key="0">
                  <input
                    placeholder="Full Name"
                    value={form.name}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        name: e.target.value.replace(/[^a-zA-Z\s]/g, ""),
                      })
                    }
                    className="w-full mb-4 p-3 border rounded"
                  />

                  <input
                    placeholder="Email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    className="w-full p-3 border rounded"
                  />
                </motion.div>
              )}

              {/* STEP 1 */}
              {step === 1 && (
                <motion.div key="1">
                  <input
                    placeholder="Phone"
                    maxLength={10}
                    value={form.phone_no}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        phone_no: e.target.value.replace(/\D/g, ""),
                      })
                    }
                    className="w-full mb-4 p-3 border rounded"
                  />

                  <input
                    type="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    className="w-full mb-4 p-3 border rounded"
                  />

                  <input
                    type="password"
                    placeholder="Confirm Password"
                    value={form.confirmPassword}
                    onChange={(e) =>
                      setForm({ ...form, confirmPassword: e.target.value })
                    }
                    className="w-full p-3 border rounded"
                  />
                </motion.div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <motion.div key="2">
                  <select
                    value={form.account_type}
                    onChange={(e) =>
                      setForm({ ...form, account_type: e.target.value })
                    }
                    className="w-full mb-4 p-3 border rounded"
                  >
                    <option value="savings">Savings</option>
                    <option value="current">Current</option>
                  </select>

                  <input
                    type="number"
                    min="0"
                    value={form.initial_balance}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        initial_balance: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full p-3 border rounded"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* BUTTON */}
          <button
            onClick={step < 2 ? nextStep : handleSubmit}
            disabled={!isStepValid() || loading}
            className="mt-6 bg-black text-white py-3 rounded disabled:opacity-50"
          >
            {step < 2 ? "Continue" : "Create Account"}
          </button>
        </div>

        {/* RIGHT */}
        <AuthSidePanel />
      </motion.div>
    </div>
  );
}
