"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function TransferSuccess(props: any) {
  const {
    resolvedRecipient,
    numAmount,
    currentBalance,
    handleReset,
    formatINR,
  } = props;
  const router = useRouter();

  return (
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
        transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
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
          {resolvedRecipient?.name}
        </span>
      </p>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5 mb-8 text-left space-y-3">
        <div className="flex justify-between">
          <span className="text-xs text-gray-400">Transaction ID</span>
          <span className="text-xs font-mono text-gray-600">
            TXN{Date.now().toString().slice(-8)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-gray-400">Amount</span>
          <span className="text-sm font-semibold text-emerald-600">
            −{formatINR(numAmount)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-gray-400">New Balance</span>
          <span className="text-sm font-semibold text-[#010935]">
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
  );
}
