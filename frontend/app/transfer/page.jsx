"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import BackgroundBlobs from "@/components/BackgroundBlobs";
import { bot } from "@/lib/bot";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut", delay },
});

function formatINR(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));
}

export default function Transfer() {
  const router = useRouter();
  const [step, setStep] = useState("form");
  const [user, setUser] = useState(null);
  const [account, setAccount] = useState(null);
  const [currentBalance, setCurrentBalance] = useState(0);

  const [recipientAcc, setRecipientAcc] = useState("");
  const [resolvedRecipient, setResolvedRecipient] = useState(null); // ✅ was missing
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [accError, setAccError] = useState("");
  const [amountError, setAmountError] = useState("");
  const [loading, setLoading] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [txnId, setTxnId] = useState(null);

  const numAmount = parseFloat(amount) || 0;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    bot
      .me()
      .then((res) => {
        if (!res.success) {
          router.push("/login");
          return;
        }
        const acc = res.data.accounts?.[0];
        setUser(res.data.user);
        setAccount(acc);
        setCurrentBalance(Number(acc?.balance ?? 0));
      })
      .catch(() => router.push("/login"));
  }, []);

  const handleAccChange = (val) => {
    setRecipientAcc(val.toUpperCase());
    setResolvedRecipient(null); // clear on every change
    setAccError("");
  };

  const handleAccBlur = async () => {
    const val = recipientAcc.trim();
    if (!val || val.length < 10) return; // ← don't lookup partial input

    if (account && val === account.account_number) {
      setAccError("Cannot transfer to your own account.");
      setResolvedRecipient(null);
      return;
    }

    setLookupLoading(true);
    try {
      const res = await bot.lookupAccount(val);
      if (res.success) {
        setResolvedRecipient(res.data);
        setAccError("");
      } else {
        setResolvedRecipient(null);
        setAccError("Account not found. Please check the number.");
      }
    } catch {
      setResolvedRecipient(null);
      setAccError("Could not verify account. Try again.");
    } finally {
      setLookupLoading(false);
    }
  };

  const handleAmountChange = (val) => {
    setAmount(val);
    const num = parseFloat(val) || 0;
    if (num > currentBalance) {
      setAmountError(`Insufficient balance. Max: ${formatINR(currentBalance)}`);
    } else if (num <= 0 && val !== "") {
      setAmountError("Amount must be greater than ₹0");
    } else {
      setAmountError("");
    }
  };

  const handleReview = () => {
    let valid = true;
    if (!recipientAcc.trim()) {
      setAccError("Please enter a recipient account number.");
      valid = false;
    } else if (!resolvedRecipient) {
      setAccError("Please wait for account verification or check the number.");
      valid = false;
    }
    if (account && recipientAcc.trim() === account.account_number) {
      setAccError("Cannot transfer to your own account.");
      valid = false;
    }
    if (numAmount <= 0) {
      setAmountError("Please enter a valid amount.");
      valid = false;
    }
    if (numAmount > currentBalance) {
      setAmountError(`Insufficient balance. Max: ${formatINR(currentBalance)}`);
      valid = false;
    }
    if (valid) setStep("confirm");
  };

  const handleConfirm = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await bot.transfer({
        from_account_id: account.id,
        to_account_number: recipientAcc.trim(),
        amount: numAmount,
        note: note || undefined,
      });

      if (!res.success) throw new Error(res.error || "Transfer failed");

      setCurrentBalance(Number(res.data.from_balance));
      setTxnId(res.data.transaction?.id ?? null);
      setStep("success");
    } catch (err) {
      setErrorMsg(err.message || "Something went wrong. Please try again.");
      setStep("error");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep("form");
    setRecipientAcc("");
    setResolvedRecipient(null); // ✅ was missing
    setAmount("");
    setNote("");
    setAccError("");
    setAmountError("");
    setErrorMsg("");
    setTxnId(null);
  };

  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f9fc]">
        <p className="text-gray-400 text-sm animate-pulse">Loading...</p>
      </div>
    );

  const SENDER = {
    name: user.name,
    accountNumber: account?.account_number ?? "—",
    balance: currentBalance,
  };

  return (
    <div
      className="relative min-h-screen bg-[#f7f9fc] overflow-hidden"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <BackgroundBlobs />
      <Navbar user={user} showBack />

      <main className="relative z-10 max-w-lg mx-auto px-6 py-10">
        <AnimatePresence mode="wait">
          {/* ── FORM ── */}
          {step === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4 }}
            >
              <p className="text-sm text-gray-400 mb-1">Send Money</p>
              <h1 className="text-3xl font-semibold text-[#010935] mb-8">
                Transfer Funds
              </h1>

              {/* Sender card */}
              <motion.div
                {...fadeUp(0.1)}
                className="rounded-2xl p-5 mb-8 border border-[#00baf2]/30 bg-white shadow-sm flex items-center justify-between"
              >
                <div>
                  <p className="text-xs text-gray-400 mb-1">Sending from</p>
                  <p className="text-sm font-semibold text-[#010935]">
                    {SENDER.name}
                  </p>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">
                    {SENDER.accountNumber}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 mb-1">Balance</p>
                  <p className="text-lg font-semibold text-[#010935]">
                    {formatINR(currentBalance)}
                  </p>
                </div>
              </motion.div>

              {/* Recipient */}
              <motion.div {...fadeUp(0.15)} className="mb-5">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Recipient Account Number
                </label>
                <input
                  type="text"
                  placeholder="ACC000000000000"
                  value={recipientAcc}
                  onChange={(e) => handleAccChange(e.target.value)}
                  onBlur={handleAccBlur}
                  className={`w-full px-4 py-3 rounded-xl border bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 transition font-mono
                    ${accError ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-[#00baf2]"}`}
                />

                {/* Lookup loading */}
                {lookupLoading && (
                  <p className="mt-2 text-xs text-gray-400 animate-pulse">
                    Verifying account...
                  </p>
                )}

                {/* ✅ Green name pill */}
                {resolvedRecipient && !lookupLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl"
                  >
                    <span className="text-emerald-500 text-sm">✓</span>
                    <span className="text-sm text-emerald-700 font-medium">
                      {resolvedRecipient.name}
                    </span>
                  </motion.div>
                )}

                {accError && (
                  <p className="mt-2 text-xs text-red-500">{accError}</p>
                )}
              </motion.div>

              {/* Amount */}
              <motion.div {...fadeUp(0.2)} className="mb-5">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Amount (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                    ₹
                  </span>
                  <input
                    type="number"
                    placeholder="0.00"
                    min="1"
                    value={amount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    className={`w-full pl-8 pr-4 py-3 rounded-xl border bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 transition
                      ${amountError ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-[#00baf2]"}`}
                  />
                </div>
                {amountError && (
                  <p className="mt-2 text-xs text-red-500">{amountError}</p>
                )}
                <div className="flex gap-2 mt-3">
                  {[500, 1000, 5000, 10000].map((q) => (
                    <button
                      key={q}
                      onClick={() => handleAmountChange(String(q))}
                      className="flex-1 text-xs py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:border-[#00baf2] hover:text-[#00baf2] transition-colors"
                    >
                      {q >= 1000 ? `₹${q / 1000}K` : `₹${q}`}
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Note */}
              <motion.div {...fadeUp(0.25)} className="mb-8">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Note{" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Rent, Dinner, etc."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00baf2] transition"
                />
              </motion.div>

              <motion.button
                {...fadeUp(0.3)}
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.02 }}
                onClick={handleReview}
                disabled={!!amountError || !!accError || lookupLoading}
                className="w-full bg-[#010935] text-white py-3.5 rounded-xl font-medium shadow-md hover:bg-[#020d4d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Review Transfer →
              </motion.button>
            </motion.div>
          )}

          {/* ── CONFIRM ── */}
          {step === "confirm" && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4 }}
            >
              <p className="text-sm text-gray-400 mb-1">Almost done</p>
              <h1 className="text-3xl font-semibold text-[#010935] mb-8">
                Confirm Transfer
              </h1>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
                <div
                  className="px-8 py-8 text-center"
                  style={{
                    background:
                      "linear-gradient(135deg, #010935 0%, #020d4d 60%, #00baf2 160%)",
                  }}
                >
                  <p className="text-white/50 text-xs uppercase tracking-widest mb-2">
                    You're sending
                  </p>
                  <p className="text-4xl font-semibold text-white">
                    {formatINR(numAmount)}
                  </p>
                </div>
                <div className="px-6 py-5 space-y-4">
                  {[
                    {
                      label: "From",
                      value: SENDER.name,
                      sub: SENDER.accountNumber,
                    },
                    {
                      label: "To",
                      value: resolvedRecipient?.name || recipientAcc.trim(),
                      sub: recipientAcc.trim(),
                    }, // ✅ shows name
                    ...(note ? [{ label: "Note", value: note, sub: "" }] : []),
                    {
                      label: "Balance after",
                      value: formatINR(currentBalance - numAmount),
                      sub: "",
                    },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="flex items-center justify-between"
                    >
                      <span className="text-xs text-gray-400">{row.label}</span>
                      <div className="text-right">
                        <p className="text-sm font-medium text-[#010935]">
                          {row.value}
                        </p>
                        {row.sub && (
                          <p className="text-xs text-gray-400 font-mono">
                            {row.sub}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setStep("form")}
                  className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-50 transition"
                >
                  Edit
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={handleConfirm}
                  disabled={loading}
                  className="flex-1 bg-[#010935] text-white py-3 rounded-xl font-medium shadow-md hover:bg-[#020d4d] transition-colors disabled:opacity-60"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="animate-spin w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8z"
                        />
                      </svg>
                      Processing…
                    </span>
                  ) : (
                    "Confirm & Send"
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ── SUCCESS ── */}
          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 18,
                  delay: 0.1,
                }}
                className="w-24 h-24 rounded-full bg-emerald-50 border-4 border-emerald-200 flex items-center justify-center text-4xl mx-auto mb-6"
              >
                ✓
              </motion.div>
              <h1 className="text-3xl font-semibold text-[#010935] mb-2">
                Transfer Successful!
              </h1>
              <p className="text-sm text-gray-500 mb-8">
                {formatINR(numAmount)} sent to{" "}
                <span className="font-medium text-[#010935]">
                  {resolvedRecipient?.name || recipientAcc.trim()}{" "}
                  {/* ✅ shows name */}
                </span>
              </p>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5 mb-8 text-left space-y-3">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-400">Transaction ID</span>
                  <span className="text-xs font-mono text-gray-600">
                    {txnId ?? `TXN${Date.now().toString().slice(-8)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-400">To</span>
                  <div className="text-right">
                    <p className="text-sm font-medium text-[#010935]">
                      {resolvedRecipient?.name}
                    </p>
                    <p className="text-xs text-gray-400 font-mono">
                      {recipientAcc.trim()}
                    </p>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-400">Amount</span>
                  <span className="text-sm font-semibold text-red-500">
                    −{formatINR(numAmount)}
                  </span>
                </div>
                {note && (
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-400">Note</span>
                    <span className="text-sm text-gray-600">{note}</span>
                  </div>
                )}
                <div className="h-px bg-gray-100" />
                <div className="flex justify-between">
                  <span className="text-xs text-gray-400">New Balance</span>
                  <span className="text-base font-semibold text-[#010935]">
                    {formatINR(currentBalance)}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleReset}
                  className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-50 transition"
                >
                  New Transfer
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => router.push("/dashboard")}
                  className="flex-1 bg-[#010935] text-white py-3 rounded-xl font-medium shadow-md hover:bg-[#020d4d] transition-colors"
                >
                  Go to Dashboard
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ── ERROR ── */}
          {step === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 18,
                  delay: 0.1,
                }}
                className="w-24 h-24 rounded-full bg-red-50 border-4 border-red-200 flex items-center justify-center text-4xl mx-auto mb-6"
              >
                ✕
              </motion.div>
              <h1 className="text-3xl font-semibold text-[#010935] mb-2">
                Transfer Failed
              </h1>
              <p className="text-sm text-gray-500 mb-8">
                {errorMsg || "Something went wrong. Please try again."}
              </p>
              <div className="flex gap-3">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setStep("confirm")}
                  className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-50 transition"
                >
                  Retry
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => router.push("/dashboard")}
                  className="flex-1 bg-[#010935] text-white py-3 rounded-xl font-medium shadow-md hover:bg-[#020d4d] transition-colors"
                >
                  Dashboard
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
