"use client";

import { motion } from "framer-motion";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut", delay },
});

export default function Welcome({ USER }) {
  return (
    <motion.div {...fadeUp(0.1)} className="mb-8">
      {new Date().getHours() < 12
        ? "Good morning"
        : new Date().getHours() < 18
          ? "Good afternoon"
          : "Good evening"}{" "}
      👋
      <h1 className="text-3xl font-semibold text-[#010935]">
        Welcome back, {USER.name.split(" ")[0]}
      </h1>
    </motion.div>
  );
}
