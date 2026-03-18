"use client";
import { motion } from "framer-motion";

const blob = (delay = 0) => ({
  duration: 8,
  repeat: Infinity,
  ease: "easeInOut",
  delay,
});

export default function BackgroundBlobs() {
  return (
    <>
      <motion.div
        className="absolute w-[400px] h-[400px] bg-[#00baf2] opacity-30 blur-[100px] rounded-full top-[-100px] left-[-100px]"
        animate={{ scale: [1, 1.08, 1] }}
        transition={blob(0)}
      />
      <motion.div
        className="absolute w-[500px] h-[500px] bg-[#7ad7f7] opacity-30 blur-[120px] rounded-full top-[-120px] right-[-120px]"
        animate={{ scale: [1, 1.08, 1] }}
        transition={blob(1)}
      />
      <motion.div
        className="absolute w-[500px] h-[500px] bg-[#010935] opacity-10 blur-[120px] rounded-full bottom-[-150px] left-[30%]"
        animate={{ scale: [1, 1.08, 1] }}
        transition={blob(2)}
      />
    </>
  );
}
