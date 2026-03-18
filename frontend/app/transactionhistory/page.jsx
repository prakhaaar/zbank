"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import TransactionSummary from "@/components/transactions/TransactionSummary";
import TransactionList from "@/components/transactions/TransactionList";
import TransactionDetailModal from "@/components/transactions/TransactionDetailModal";
import { bot } from "@/lib/bot";

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

function groupByMonth(txns) {
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

function mapTxn(txn) {
  const isCredit = txn.entry_type === "credit";
  const desc = txn.description ?? txn.note ?? txn.type ?? "Transaction";

  const icon = (() => {
    const d = desc.toLowerCase();
    if (d.includes("deposit") || d.includes("opening")) return "💰";
    if (d.includes("transfer to")) return "↗️";
    if (d.includes("transfer from")) return "↙️";
    return isCredit ? "↙️" : "↗️";
  })();

  const category = (() => {
    const d = desc.toLowerCase();
    if (d.includes("deposit") || d.includes("opening")) return "Deposit";
    if (d.includes("transfer")) return "Transfer";
    return isCredit ? "Credit" : "Debit";
  })();

  return {
    id: txn.transaction_id ?? txn.id,
    title: desc,
    date: txn.created_at,
    amount: Math.abs(Number(txn.amount)),
    type: isCredit ? "credit" : "debit",
    icon,
    category,
  };
}

const LIMIT = 20;

export default function TransactionHistory() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedTxn, setSelectedTxn] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const init = async () => {
      try {
        const me = await bot.me();
        if (!me.success) {
          router.push("/login");
          return;
        }

        const acc = me.data.accounts?.[0];
        setUser(me.data.user);
        setAccount(acc);

        if (acc?.id) {
          const res = await bot.getTransactions(acc.id, 1, LIMIT);
          if (res.success) {
            const txns = res.data.transactions ?? [];
            setTransactions(txns.map(mapTxn));
            setHasMore(txns.length === LIMIT);
          }
        }
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const loadMore = useCallback(async () => {
    if (!account?.id || loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await bot.getTransactions(account.id, nextPage, LIMIT);
      if (res.success) {
        const txns = res.data.transactions ?? [];
        setTransactions((prev) => [...prev, ...txns.map(mapTxn)]);
        setPage(nextPage);
        setHasMore(txns.length === LIMIT);
      }
    } finally {
      setLoadingMore(false);
    }
  }, [account, page, loadingMore, hasMore]);

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const matchType = filter === "all" || t.type === filter;
      const matchSearch =
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.category.toLowerCase().includes(search.toLowerCase());
      return matchType && matchSearch;
    });
  }, [transactions, filter, search]);

  const grouped = useMemo(() => groupByMonth(filtered), [filtered]);

  const totalCredit = useMemo(
    () =>
      filtered
        .filter((t) => t.type === "credit")
        .reduce((s, t) => s + t.amount, 0),
    [filtered],
  );
  const totalDebit = useMemo(
    () =>
      filtered
        .filter((t) => t.type === "debit")
        .reduce((s, t) => s + t.amount, 0),
    [filtered],
  );

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f9fc]">
        <p className="text-gray-400 text-sm animate-pulse">
          Loading transactions...
        </p>
      </div>
    );

  return (
    <div
      className="relative min-h-screen bg-[#f7f9fc] overflow-hidden"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <motion.div
        className="absolute w-[500px] h-[500px] bg-[#00baf2] opacity-20 blur-[130px] rounded-full top-[-150px] right-[-100px] pointer-events-none"
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] bg-[#010935] opacity-10 blur-[110px] rounded-full bottom-[-100px] left-[-80px] pointer-events-none"
        animate={{ scale: [1, 1.08, 1] }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />

      <Navbar user={user} showBack />

      <main className="relative z-10 max-w-2xl mx-auto px-6 py-10">
        <motion.div {...fadeUp(0.05)} className="mb-6">
          <p className="text-sm text-gray-400 mb-1">Your Activity</p>
          <h1 className="text-3xl font-semibold text-[#010935]">
            Transaction History
          </h1>
        </motion.div>

        <TransactionSummary
          totalCredit={totalCredit}
          totalDebit={totalDebit}
          formatINR={formatINR}
          fadeUp={fadeUp}
        />

        <TransactionList
          grouped={grouped}
          filter={filter}
          setFilter={setFilter}
          search={search}
          setSearch={setSearch}
          setSelectedTxn={setSelectedTxn}
          formatINR={formatINR}
          fadeUp={fadeUp}
        />

        {hasMore && (
          <div className="mt-6 text-center">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="px-6 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-500 hover:border-[#00baf2] hover:text-[#00baf2] transition-colors disabled:opacity-50"
            >
              {loadingMore ? "Loading..." : "Load more"}
            </button>
          </div>
        )}
      </main>

      <TransactionDetailModal
        selectedTxn={selectedTxn}
        setSelectedTxn={setSelectedTxn}
        formatINR={formatINR}
      />
    </div>
  );
}
