"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import BackgroundBlobs from "@/components/BackgroundBlobs";
import Navbar from "@/components/Navbar";
import Welcome from "@/components/Welcome";
import AccountCard from "@/components/AccountCard";
import QuickActions from "@/components/QuickActions";
import Transactions from "@/components/Transactions";
import LoadingScreen from "@/components/LoadingScreen";
import { bot } from "@/lib/bot";

function formatINR(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));
}

export default function Dashboard() {
  const router = useRouter();
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [activeAction, setActiveAction] = useState(null);
  const [user, setUser] = useState(null);
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const init = async () => {
      try {
        // 1. get user + accounts
        const me = await bot.me();
        if (!me.success) {
          router.push("/login");
          return;
        }

        const activeAccount = me.data.accounts?.[0];
        setUser(me.data.user);
        setAccount(activeAccount);

        // 2. get transactions for the first account
        if (activeAccount?.id) {
          const txnRes = await bot.getTransactions(activeAccount.id, 1, 5);
          if (txnRes.success) setTransactions(txnRes.data.transactions ?? []);
        }
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);
  if (loading) return <LoadingScreen />;

  // shape data to match what your components expect
  const USER = {
    name: user?.name ?? "User",
    accountNumber: account?.account_number ?? "—",
    accountType: account?.account_type ?? "Savings",
    balance: Number(account?.balance ?? 0),
  };

  const TRANSACTIONS = transactions.map((txn) => {
    // derive from ledger entry_type or amount sign
    const isCredit = txn.entry_type === "credit";
    return {
      id: txn.id,
      title: txn.description ?? txn.note ?? txn.type,
      date: new Date(txn.created_at).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      amount: Math.abs(Number(txn.amount)),
      icon: isCredit ? "↙️" : "↗️",
      type: isCredit ? "credit" : "debit",
    };
  });

  return (
    <div className="relative min-h-screen bg-[#f7f9fc] overflow-hidden">
      <BackgroundBlobs />
      <Navbar user={user} />

      <main className="relative z-10 max-w-4xl mx-auto px-6 py-10">
        <Welcome USER={USER} />
        <AccountCard
          USER={USER}
          balanceVisible={balanceVisible}
          setBalanceVisible={setBalanceVisible}
          formatINR={formatINR}
        />
        <QuickActions
          activeAction={activeAction}
          setActiveAction={setActiveAction}
        />
        <Transactions TRANSACTIONS={TRANSACTIONS} formatINR={formatINR} />
      </main>
    </div>
  );
}
