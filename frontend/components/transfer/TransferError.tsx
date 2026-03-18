"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function TransferError(props: any) {
  const { setStep } = props;
  const router = useRouter();

  return (
    <motion.div
      key="error"
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
        className="w-24 h-24 rounded-full bg-red-50 border-4 border-red-200 flex items-center justify-center text-4xl mx-auto mb-6"
      >
        ✕
      </motion.div>

      <h1 className="text-3xl font-semibold text-[#010935] mb-2">
        Transfer Failed
      </h1>
      <p className="text-sm text-gray-500 mb-8">
        Something went wrong. Please try again.
      </p>

      <div className="flex gap-3">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setStep("confirm")}
          className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-50 transition"
        >
          Retry
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push("/dashboard")}
          className="flex-1 bg-[#010935] text-white py-3 rounded-xl font-medium shadow-md hover:bg-[#020d4d] transition-colors"
        >
          Dashboard
        </motion.button>
      </div>
    </motion.div>
  );
}
