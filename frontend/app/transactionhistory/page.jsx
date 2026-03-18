"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import TransactionSummary from "@/components/transactions/TransactionSummary";
import TransactionList from "@/components/transactions/TransactionList";
import TransactionDetailModal from "@/components/transactions/TransactionDetailModal";

// ── Constants ────────────────────────────────────────────────────
const ALL_TRANSACTIONS = [
  {
    id: "TXN00000001",
    title: "Salary Credit",
    date: "2026-03-15",
    amount: 85000,
    type: "credit",
    icon: "💼",
    category: "Income",
  },
  {
    id: "TXN00000002",
    title: "Netflix Subscription",
    date: "2026-03-18",
    amount: -649,
    type: "debit",
    icon: "🎬",
    category: "Entertainment",
  },
  {
    id: "TXN00000003",
    title: "Swiggy Order",
    date: "2026-03-14",
    amount: -312,
    type: "debit",
    icon: "🍔",
    category: "Food",
  },
  {
    id: "TXN00000004",
    title: "Transfer from Priya",
    date: "2026-03-12",
    amount: 5000,
    type: "credit",
    icon: "↙️",
    category: "Transfer",
  },
  {
    id: "TXN00000005",
    title: "Electricity Bill",
    date: "2026-03-10",
    amount: -1840,
    type: "debit",
    icon: "⚡",
    category: "Utilities",
  },
  {
    id: "TXN00000006",
    title: "Amazon Purchase",
    date: "2026-03-09",
    amount: -3499,
    type: "debit",
    icon: "📦",
    category: "Shopping",
  },
  {
    id: "TXN00000007",
    title: "Freelance Payment",
    date: "2026-03-07",
    amount: 22000,
    type: "credit",
    icon: "💻",
    category: "Income",
  },
  {
    id: "TXN00000008",
    title: "Zomato Order",
    date: "2026-03-06",
    amount: -480,
    type: "debit",
    icon: "🍕",
    category: "Food",
  },
  {
    id: "TXN00000009",
    title: "Deposit — UPI",
    date: "2026-03-05",
    amount: 10000,
    type: "credit",
    icon: "📱",
    category: "Deposit",
  },
  {
    id: "TXN00000010",
    title: "Rent Transfer",
    date: "2026-03-01",
    amount: -18000,
    type: "debit",
    icon: "🏠",
    category: "Transfer",
  },
  {
    id: "TXN00000011",
    title: "Bonus Credit",
    date: "2026-02-28",
    amount: 15000,
    type: "credit",
    icon: "🎉",
    category: "Income",
  },
  {
    id: "TXN00000012",
    title: "Gym Membership",
    date: "2026-02-25",
    amount: -2500,
    type: "debit",
    icon: "💪",
    category: "Health",
  },
  {
    id: "TXN00000013",
    title: "Transfer to Rahul",
    date: "2026-02-22",
    amount: -7500,
    type: "debit",
    icon: "↗️",
    category: "Transfer",
  },
  {
    id: "TXN00000014",
    title: "Deposit — Net Banking",
    date: "2026-02-20",
    amount: 25000,
    type: "credit",
    icon: "🏦",
    category: "Deposit",
  },
  {
    id: "TXN00000015",
    title: "Spotify Premium",
    date: "2026-02-18",
    amount: -119,
    type: "debit",
    icon: "🎵",
    category: "Entertainment",
  },
];

const blobTransition = (delay = 0) => ({
  duration: 8,
  repeat: Infinity,
  ease: "easeInOut",
  delay,
});

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

function groupByMonth() {
  const groups = {};
  txns.forEach((txn) => {
    const key = new Date(txn.date).toLocaleString("en-IN", {
      month: "long",
      year: "numeric",
    });
    if (!groups[key]) groups[key] = [];
    groups[key].push(txn);
  });
  return groups;
}

export default function TransactionHistory() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedTxn, setSelectedTxn] = useState(null);

  const filtered = useMemo(() => {
    return ALL_TRANSACTIONS.filter((t) => {
      const matchType = filter === "all" || t.type === filter;
      const matchSearch =
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.category.toLowerCase().includes(search.toLowerCase());
      return matchType && matchSearch;
    });
  }, [filter, search]);

  const grouped = useMemo(() => groupByMonth(filtered), [filtered]);

  const totalCredit = filtered
    .filter((t) => t.type === "credit")
    .reduce((s, t) => s + t.amount, 0);
  const totalDebit = filtered
    .filter((t) => t.type === "debit")
    .reduce((s, t) => s + Math.abs(t.amount), 0);

  const sharedProps = { formatINR, fadeUp };

  return (
    <div
      className="relative min-h-screen bg-[#f7f9fc] overflow-hidden"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Blobs */}
      <motion.div
        className="absolute w-[500px] h-[500px] bg-[#00baf2] opacity-20 blur-[130px] rounded-full top-[-150px] right-[-100px] pointer-events-none"
        animate={{ scale: [1, 1.08, 1] }}
        transition={blobTransition(0)}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] bg-[#010935] opacity-10 blur-[110px] rounded-full bottom-[-100px] left-[-80px] pointer-events-none"
        animate={{ scale: [1, 1.08, 1] }}
        transition={blobTransition(2)}
      />

      <Navbar user={{ name: "Arjun Sharma" }} showBack />

      <main className="relative z-10 max-w-2xl mx-auto px-6 py-10">
        {/* Header */}
        <motion.div {...fadeUp(0.05)} className="mb-6">
          <p className="text-sm text-gray-400 mb-1">Your Activity</p>
          <h1 className="text-3xl font-semibold text-[#010935]">
            Transaction History
          </h1>
        </motion.div>

        <TransactionSummary
          totalCredit={totalCredit}
          totalDebit={totalDebit}
          {...sharedProps}
        />

        <TransactionList
          grouped={grouped}
          filter={filter}
          setFilter={setFilter}
          search={search}
          setSearch={setSearch}
          setSelectedTxn={setSelectedTxn}
          {...sharedProps}
        />
      </main>

      <TransactionDetailModal
        selectedTxn={selectedTxn}
        setSelectedTxn={setSelectedTxn}
        formatINR={formatINR}
      />
    </div>
  );
}
