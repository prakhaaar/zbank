"use client";

import { motion, AnimatePresence } from "framer-motion";

export default function TransactionDetailModal({
  selectedTxn,
  setSelectedTxn,
  formatINR,
}) {
  return (
    <AnimatePresence>
      {selectedTxn && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedTxn(null)}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          />

          {/* Sheet */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl px-6 py-8 max-w-lg mx-auto"
          >
            {/* Handle */}
            <div className="w-10 h-1 rounded-full bg-gray-200 mx-auto mb-6" />

            {/* Icon + amount */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-[#f0faff] flex items-center justify-center text-3xl mx-auto mb-4">
                {selectedTxn.icon}
              </div>
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">
                {selectedTxn.category}
              </p>
              <p className="text-2xl font-semibold text-[#010935]">
                {selectedTxn.title}
              </p>
              <p
                className={`text-3xl font-bold mt-2 ${selectedTxn.type === "credit" ? "text-emerald-500" : "text-red-400"}`}
              >
                {selectedTxn.type === "credit" ? "+" : "−"}
                {formatINR(selectedTxn.amount)}
              </p>
            </div>

            {/* Details */}
            <div className="bg-gray-50 rounded-2xl px-5 py-4 space-y-3 mb-6">
              {[
                { label: "Transaction ID", value: selectedTxn.id },
                {
                  label: "Date",
                  value: new Date(selectedTxn.date).toLocaleDateString(
                    "en-IN",
                    { day: "numeric", month: "long", year: "numeric" },
                  ),
                },
                {
                  label: "Type",
                  value: selectedTxn.type === "credit" ? "Credit" : "Debit",
                },
                { label: "Status", value: "Completed ✓" },
              ].map((row) => (
                <div key={row.label} className="flex justify-between">
                  <span className="text-xs text-gray-400">{row.label}</span>
                  <span className="text-xs font-medium text-[#010935] font-mono">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setSelectedTxn(null)}
              className="w-full bg-[#010935] text-white py-3.5 rounded-xl font-medium hover:bg-[#020d4d] transition-colors"
            >
              Close
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
