"use client";

import { motion } from "framer-motion";

export default function AccountCard({
  USER,
  balanceVisible,
  setBalanceVisible,
  formatINR,
}) {
  return (
    <motion.div
      className="relative rounded-2xl overflow-hidden mb-8 shadow-xl"
      style={{
        background:
          "linear-gradient(135deg, #010935 0%, #020d4d 60%, #00baf2 150%)",
      }}
    >
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "radial-gradient(circle at 80% 20%, #7ad7f7 0%, transparent 60%)",
        }}
      />
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full border border-white/10" />
      <div className="absolute -top-4 -right-4 w-28 h-28 rounded-full border border-white/10" />

      <div className="relative p-8 text-white">
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="text-xs text-white/50 uppercase tracking-widest mb-1">
              {USER.accountType} Account
            </p>
            <p className="text-sm text-white/70 font-mono tracking-widest">
              {USER.accountNumber}
            </p>
          </div>

          <button
            onClick={() => setBalanceVisible(!balanceVisible)}
            className="text-white/60 hover:text-white transition-colors text-xl"
          >
            {balanceVisible ? "👁️" : "🙈"}
          </button>
        </div>

        <div>
          <p className="text-xs text-white/50 uppercase tracking-widest mb-2">
            Available Balance
          </p>
          <motion.p className="text-4xl font-semibold tracking-tight">
            {balanceVisible ? formatINR(USER.balance) : "₹ ••••••"}
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
}
