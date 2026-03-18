"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut", delay },
});

export default function Navbar({ user, showBack = false }) {
  const router = useRouter();

  return (
    <motion.nav
      {...fadeUp(0)}
      className="relative z-10 flex items-center justify-between px-8 py-5 bg-white border-b border-gray-100 shadow-sm"
    >
      {/* LEFT */}
      <div className="flex items-center gap-3">
        {/* ✅ optional back button */}
        {showBack && (
          <button
            onClick={() => router.push("/dashboard")}
            className="text-gray-400 hover:text-[#010935] mr-1 text-lg"
          >
            ←
          </button>
        )}

        <div className="relative w-9 h-9">
          <Image src="/logo.png" alt="ZBank" fill className="object-contain" />
        </div>

        <span className="text-lg font-semibold text-[#010935]">ZBank</span>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4">
        <button className="text-sm text-gray-500 hover:text-[#010935]">
          🔔
        </button>

        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#010935] to-[#00baf2] flex items-center justify-center text-white text-sm font-semibold">
          {user?.name?.charAt(0) || "Z"}
        </div>
      </div>
    </motion.nav>
  );
}
