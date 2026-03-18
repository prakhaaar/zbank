"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";

const blobTransition = (delay = 0) => ({
  duration: 8,
  repeat: Infinity,
  ease: "easeInOut",
  delay,
});

export default function DepositLayout({ children, USER }) {
  return (
    <div className="relative min-h-screen bg-[#f7f9fc] overflow-hidden">
      {/* BLOBS */}
      <motion.div
        className="absolute w-[500px] h-[500px] bg-[#00baf2] opacity-20 blur-[130px] rounded-full top-[-150px] left-[-100px]"
        animate={{ scale: [1, 1.08, 1] }}
        transition={blobTransition(0)}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] bg-[#010935] opacity-10 blur-[110px] rounded-full bottom-[-100px] right-[-80px]"
        animate={{ scale: [1, 1.08, 1] }}
        transition={blobTransition(2)}
      />

      {/* ✅ reuse navbar properly */}
      <Navbar user={USER} showBack />

      <main className="relative z-10 max-w-lg mx-auto px-6 py-10">
        {children}
      </main>
    </div>
  );
}
