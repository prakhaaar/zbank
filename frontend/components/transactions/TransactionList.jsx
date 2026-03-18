"use client";

import { motion } from "framer-motion";

export default function TransactionList({
  grouped,
  filter,
  setFilter,
  search,
  setSearch,
  formatINR,
  setSelectedTxn,
  fadeUp,
}) {
  return (
    <>
      {/* Search + Filter */}
      <motion.div {...fadeUp(0.15)} className="mb-6 flex flex-col gap-3">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            🔍
          </span>
          <input
            type="text"
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#00baf2] transition text-sm"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          />
        </div>

        <div className="flex gap-2 bg-white rounded-xl border border-gray-100 p-1 shadow-sm">
          {["all", "credit", "debit"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all
                ${filter === f ? "bg-[#010935] text-white shadow-sm" : "text-gray-400 hover:text-[#010935]"}`}
            >
              {f === "all" ? "All" : f === "credit" ? "Credits ↙" : "Debits ↗"}
            </button>
          ))}
        </div>
      </motion.div>

      {/* List */}
      <motion.div {...fadeUp(0.2)}>
        {Object.keys(grouped).length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-sm">No transactions found</p>
          </div>
        ) : (
          Object.entries(grouped).map(([month, txns], gi) => (
            <div key={month} className="mb-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                {month}
              </p>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {txns.map((txn, i) => (
                  <motion.button
                    key={txn.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: gi * 0.05 + i * 0.04 }}
                    onClick={() => setSelectedTxn(txn)}
                    className={`w-full flex items-center gap-4 px-6 py-4 text-left hover:bg-gray-50/70 transition-colors
                      ${i < txns.length - 1 ? "border-b border-gray-50" : ""}`}
                  >
                    <div className="w-11 h-11 rounded-xl bg-[#f0faff] flex items-center justify-center text-lg flex-shrink-0">
                      {txn.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#010935] truncate">
                        {txn.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-gray-400">
                          {new Date(txn.date).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                        <span className="w-1 h-1 rounded-full bg-gray-300" />
                        <span className="text-xs text-gray-400">
                          {txn.category}
                        </span>
                      </div>
                    </div>
                    <p
                      className={`text-sm font-semibold flex-shrink-0 ${txn.type === "credit" ? "text-emerald-500" : "text-red-400"}`}
                    >
                      {txn.type === "credit" ? "+" : "−"}
                      {formatINR(txn.amount)}
                    </p>
                  </motion.button>
                ))}
              </div>
            </div>
          ))
        )}
      </motion.div>
    </>
  );
}
