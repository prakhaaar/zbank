"use client";

import { motion, AnimatePresence } from "framer-motion";

const QUICK_AMOUNTS = [1000, 2000, 5000, 10000, 25000, 50000];

export default function DepositForm(props) {
  const {
    USER,
    amount,
    handleAmountChange,
    amountError,
    numAmount,
    selectedMethod,
    setSelectedMethod,
    PAYMENT_METHODS,
    upiId,
    setUpiId,
    handleReview,
    formatINR,
    currentBalance,
    fadeUp,
  } = props;

  return (
    <motion.div
      key="form"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4 }}
    >
      <p className="text-sm text-gray-400 mb-1">Add Funds</p>
      <h1 className="text-3xl font-semibold text-[#010935] mb-8">
        Deposit Money
      </h1>

      {/* Account mini card */}
      <motion.div
        {...fadeUp(0.1)}
        className="rounded-2xl p-5 mb-8 border border-[#00baf2]/30 bg-white shadow-sm flex items-center justify-between"
      >
        <div>
          <p className="text-xs text-gray-400 mb-1">Depositing to</p>
          <p className="text-sm font-semibold text-[#010935]">{USER.name}</p>
          <p className="text-xs text-gray-400 font-mono mt-0.5">
            {USER.accountNumber}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400 mb-1">Current Balance</p>
          <p className="text-lg font-semibold text-[#010935]">
            {formatINR(currentBalance)}
          </p>
        </div>
      </motion.div>

      {/* Amount Input */}
      <motion.div {...fadeUp(0.15)} className="mb-6">
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Deposit Amount (₹)
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-lg">
            ₹
          </span>
          <input
            type="number"
            placeholder="0.00"
            min="1"
            value={amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            className={`w-full pl-9 pr-4 py-4 rounded-xl border bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 transition text-xl font-semibold text-[#010935]
              ${amountError ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-[#00baf2]"}`}
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          />
        </div>
        {amountError && (
          <p className="mt-2 text-xs text-red-500">{amountError}</p>
        )}

        {/* Quick amount grid */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          {QUICK_AMOUNTS.map((q) => (
            <button
              key={q}
              onClick={() => handleAmountChange(String(q))}
              className={`py-2.5 rounded-xl text-sm font-medium border transition-all
                ${
                  numAmount === q
                    ? "bg-[#010935] text-white border-[#010935] shadow-sm"
                    : "bg-white text-gray-600 border-gray-200 hover:border-[#00baf2] hover:text-[#00baf2]"
                }`}
            >
              ₹{q >= 1000 ? `${q / 1000}K` : q}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Payment Method */}
      <motion.div {...fadeUp(0.2)} className="mb-8">
        <label className="text-sm font-medium text-gray-700 mb-3 block">
          Payment Method
        </label>
        <div className="space-y-3">
          {PAYMENT_METHODS.map((method) => (
            <button
              key={method.id}
              onClick={() => setSelectedMethod(method.id)}
              className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl border transition-all text-left
                ${
                  selectedMethod === method.id
                    ? "border-[#010935] bg-[#010935]/5 shadow-sm"
                    : "border-gray-200 bg-white hover:border-[#00baf2]"
                }`}
            >
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
                  ${selectedMethod === method.id ? "border-[#010935]" : "border-gray-300"}`}
              >
                {selectedMethod === method.id && (
                  <div className="w-2.5 h-2.5 rounded-full bg-[#010935]" />
                )}
              </div>
              <span className="text-xl">{method.icon}</span>
              <div>
                <p className="text-sm font-semibold text-[#010935]">
                  {method.label}
                </p>
                <p className="text-xs text-gray-400">{method.desc}</p>
              </div>
            </button>
          ))}
        </div>

        {/* UPI ID field */}
        <AnimatePresence>
          {selectedMethod === "upi" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="mt-4">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  UPI ID
                </label>
                <input
                  type="text"
                  placeholder="yourname@upi"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00baf2] transition"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* CTA */}
      <motion.button
        {...fadeUp(0.3)}
        whileTap={{ scale: 0.97 }}
        whileHover={{ scale: 1.02 }}
        onClick={handleReview}
        disabled={!!amountError || numAmount <= 0}
        className="w-full bg-[#010935] text-white py-3.5 rounded-xl font-medium shadow-md hover:bg-[#020d4d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Review Deposit →
      </motion.button>
    </motion.div>
  );
}
