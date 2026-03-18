"use client";

import { motion } from "framer-motion";

export default function TransferConfirm(props: any) {
  const {
    SENDER,
    resolvedRecipient,
    note,
    numAmount,
    currentBalance,
    loading,
    setStep,
    handleConfirm,
    formatINR,
  } = props;

  return (
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

      {/* Summary Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
        {/* Amount hero */}
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

        {/* Details */}
        <div className="px-6 py-5 space-y-4">
          {[
            { label: "From", value: SENDER.name, sub: SENDER.accountNumber },
            {
              label: "To",
              value: resolvedRecipient?.name || "",
              sub: resolvedRecipient?.accountNumber || "",
            },
            ...(note ? [{ label: "Note", value: note, sub: "" }] : []),
            {
              label: "Balance after",
              value: formatINR(currentBalance - numAmount),
              sub: "",
            },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between">
              <span className="text-xs text-gray-400">{row.label}</span>
              <div className="text-right">
                <p className="text-sm font-medium text-[#010935]">
                  {row.value}
                </p>
                {row.sub && (
                  <p className="text-xs text-gray-400 font-mono">{row.sub}</p>
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
  );
}
