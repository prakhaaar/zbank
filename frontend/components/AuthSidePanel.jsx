"use client";
import { motion } from "framer-motion";

export default function AuthSidePanel() {
  return (
    <div className="hidden md:flex items-center justify-center bg-gradient-to-br from-[#010935] to-[#020d4d] text-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col items-center text-center px-8"
      >
        <img
          src="/logo.png"
          alt="ZBank"
          className="w-80 object-contain mb-8 drop-shadow-lg"
        />
        <p className="text-sm text-white/70 max-w-xs">
          Secure digital banking for everyone
        </p>
      </motion.div>
    </div>
  );
}
