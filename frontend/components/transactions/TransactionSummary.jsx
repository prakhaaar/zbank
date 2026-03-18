"use client";

import { motion } from "framer-motion";

export default function TransactionSummary({
  totalCredit,
  totalDebit,
  formatINR,
  fadeUp,
}) {
  return (
    <motion.div {...fadeUp(0.1)} className="grid grid-cols-2 gap-4 mb-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
        <p className="text-xs text-gray-400 mb-1">Total Credited</p>
        <p className="text-xl font-semibold text-emerald-500">
          +{formatINR(totalCredit)}
        </p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
        <p className="text-xs text-gray-400 mb-1">Total Debited</p>
        <p className="text-xl font-semibold text-red-400">
          −{formatINR(totalDebit)}
        </p>
      </div>
    </motion.div>
  );
}
