"use client";

import { motion } from "framer-motion";

export default function TransferForm(props: any) {
  const {
    SENDER,
    recipientAcc,
    setRecipientAcc,
    setResolvedRecipient,
    setAccError,
    handleAccBlur,
    accError,
    resolvedRecipient,
    amount,
    handleAmountChange,
    amountError,
    note,
    setNote,
    handleReview,
    currentBalance,
    formatINR,
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
      <p className="text-sm text-gray-400 mb-1">Send Money</p>
      <h1 className="text-3xl font-semibold text-[#010935] mb-8">
        Transfer Funds
      </h1>

      {/* Sender mini card */}
      <motion.div
        {...fadeUp(0.1)}
        className="rounded-2xl p-5 mb-8 border border-[#00baf2]/30 bg-white shadow-sm flex items-center justify-between"
      >
        <div>
          <p className="text-xs text-gray-400 mb-1">Sending from</p>
          <p className="text-sm font-semibold text-[#010935]">{SENDER.name}</p>
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

      {/* Recipient Account */}
      <motion.div {...fadeUp(0.15)} className="mb-5">
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Recipient Account Number
        </label>
        <input
          type="text"
          placeholder="ZB 0000 0000 0000"
          value={recipientAcc}
          onChange={(e) => {
            setRecipientAcc(e.target.value.toUpperCase());
            setResolvedRecipient(null);
            setAccError("");
          }}
          onBlur={handleAccBlur}
          className={`w-full px-4 py-3 rounded-xl border bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 transition font-mono
            ${accError ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-[#00baf2]"}`}
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        />
        {resolvedRecipient && (
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
        {accError && <p className="mt-2 text-xs text-red-500">{accError}</p>}
        <p className="mt-1.5 text-xs text-gray-400">
          Try: ZB 1234 5678 9012 · ZB 9999 0000 1111 · ZB 4444 3333 2222
        </p>
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
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          />
        </div>
        {amountError && (
          <p className="mt-2 text-xs text-red-500">{amountError}</p>
        )}
        {/* Quick amounts */}
        <div className="flex gap-2 mt-3">
          {[500, 1000, 5000, 10000].map((q) => (
            <button
              key={q}
              onClick={() => handleAmountChange(String(q))}
              className="flex-1 text-xs py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:border-[#00baf2] hover:text-[#00baf2] transition-colors"
            >
              ₹{(q / 1000).toFixed(q < 1000 ? 0 : 0)}
              {q >= 1000 ? "K" : ""}
              {q === 500 ? "500" : ""}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Note */}
      <motion.div {...fadeUp(0.25)} className="mb-8">
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Note <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <input
          type="text"
          placeholder="Rent, Dinner, etc."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00baf2] transition"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        />
      </motion.div>

      {/* Review Button */}
      <motion.button
        {...fadeUp(0.3)}
        whileTap={{ scale: 0.97 }}
        whileHover={{ scale: 1.02 }}
        onClick={handleReview}
        disabled={!!amountError || !!accError}
        className="w-full bg-[#010935] text-white py-3.5 rounded-xl font-medium shadow-md hover:bg-[#020d4d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Review Transfer →
      </motion.button>
    </motion.div>
  );
}
