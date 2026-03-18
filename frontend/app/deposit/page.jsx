"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";

import DepositLayout from "@/components/deposit/DepositLayout";
import DepositForm from "@/components/deposit/DepositForm";
import DepositConfirm from "@/components/deposit/DepositConfirm";
import DepositSuccess from "@/components/deposit/DepositSuccess";
import { bot } from "@/lib/bot";

const PAYMENT_METHODS = [
  { id: "upi", label: "UPI", icon: "📱", desc: "Google Pay, PhonePe, Paytm" },
  { id: "netbanking", label: "Net Banking", icon: "🏦", desc: "All banks" },
  { id: "card", label: "Debit Card", icon: "💳", desc: "Visa, Mastercard" },
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut", delay },
});

function formatINR(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(Math.abs(amount));
}

export default function Deposit() {
  const router = useRouter();
  const [step, setStep] = useState("form");
  const [amount, setAmount] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("upi");
  const [upiId, setUpiId] = useState("");
  const [amountError, setAmountError] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [account, setAccount] = useState(null);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [depositedTxnId, setDepositedTxnId] = useState(null);

  const numAmount = parseFloat(amount) || 0;

  // load real user + account
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    bot
      .me()
      .then((res) => {
        if (!res.success) {
          router.push("/login");
          return;
        }
        const acc = res.data.accounts?.[0];
        setUser(res.data.user);
        setAccount(acc);
        setCurrentBalance(Number(acc?.balance ?? 0));
      })
      .catch(() => router.push("/login"));
  }, []);

  const handleAmountChange = (val) => {
    setAmount(val);
    const num = parseFloat(val) || 0;
    if (num <= 0 && val !== "") {
      setAmountError("Amount must be greater than ₹0");
    } else if (num > 1000000) {
      setAmountError("Maximum deposit limit is ₹10,00,000");
    } else {
      setAmountError("");
    }
  };

  const handleReview = () => {
    if (numAmount <= 0) return setAmountError("Please enter a valid amount.");
    if (numAmount > 1000000)
      return setAmountError("Maximum deposit limit is ₹10,00,000");
    setStep("confirm");
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const res = await bot.deposit({
        account_id: account.id,
        amount: numAmount,
      });

      if (!res.success) throw new Error(res.error || "Deposit failed");

      // update balance from response or optimistically
      const newBalance = res.data?.balance ?? currentBalance + numAmount;
      setCurrentBalance(Number(newBalance));
      setDepositedTxnId(res.data?.transaction_id ?? null);
      setStep("success");
    } catch (err) {
      setAmountError(err.message || "Something went wrong. Try again.");
      setStep("form");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep("form");
    setAmount("");
    setUpiId("");
    setAmountError("");
    setSelectedMethod("upi");
  };

  // shape USER to match what sub-components expect
  const USER = {
    name: user?.name ?? "—",
    accountNumber: account?.account_number ?? "—",
    accountType: account?.account_type ?? "Savings",
    balance: currentBalance,
  };

  const sharedProps = {
    USER,
    PAYMENT_METHODS,
    amount,
    setAmount,
    handleAmountChange,
    selectedMethod,
    setSelectedMethod,
    upiId,
    setUpiId,
    amountError,
    setAmountError,
    loading,
    setLoading,
    currentBalance,
    setCurrentBalance,
    numAmount,
    formatINR,
    fadeUp,
    handleReview,
    setStep,
    handleConfirm,
    handleReset,
    depositedTxnId, // available in DepositSuccess if you want to show it
  };

  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f9fc]">
        <p className="text-gray-400 text-sm animate-pulse">Loading...</p>
      </div>
    );

  return (
    <DepositLayout USER={USER}>
      <AnimatePresence mode="wait">
        {step === "form" && <DepositForm key="form" {...sharedProps} />}
        {step === "confirm" && (
          <DepositConfirm key="confirm" {...sharedProps} />
        )}
        {step === "success" && (
          <DepositSuccess key="success" {...sharedProps} />
        )}
      </AnimatePresence>
    </DepositLayout>
  );
}
