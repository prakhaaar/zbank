"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function Transactions({ TRANSACTIONS, formatINR }) {
  const router = useRouter();

  return (
    <motion.div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-widest">
          Recent Transactions
        </h2>

        {/* ✅ navigation added */}
        <button
          onClick={() => router.push("/transactionhistory")}
          className="text-xs text-[#00baf2] hover:underline font-medium"
        >
          View all
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {TRANSACTIONS.map((txn, i) => (
          <motion.div
            key={txn.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.45 + i * 0.07, duration: 0.35 }}
            className={`flex items-center gap-4 px-6 py-4 ${
              i < TRANSACTIONS.length - 1 ? "border-b border-gray-50" : ""
            } hover:bg-gray-50/50 transition-colors`}
          >
            <div className="w-11 h-11 rounded-xl bg-[#f0faff] flex items-center justify-center text-lg flex-shrink-0">
              {txn.icon}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#010935] truncate">
                {txn.title}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{txn.date}</p>
            </div>

            <p
              className={`text-sm font-semibold flex-shrink-0 ${
                txn.type === "credit" ? "text-emerald-500" : "text-red-400"
              }`}
            >
              {txn.type === "credit" ? "+" : "-"}
              {formatINR(txn.amount)}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
