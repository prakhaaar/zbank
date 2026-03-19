"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function QuickActions({ activeAction, setActiveAction }) {
  const router = useRouter();

  const actions = [
    {
      label: "Transfer",
      icon: "↗️",
      desc: "Send money instantly",
      route: "/transfer",
    },
    {
      label: "Deposit",
      icon: "💰",
      desc: "Add funds to account",
      route: "/deposit",
    },
  ];

  return (
    <motion.div className="mb-8">
      <h2 className="text-sm font-medium text-gray-400 uppercase tracking-widest mb-4">
        Quick Actions
      </h2>

      <div className="grid grid-cols-2 gap-4">
        {actions.map((action) => (
          <motion.button
            key={action.label}
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => {
              setActiveAction(action.label); // existing behavior
              router.push(action.route); //  navigation added
            }}
            className={`flex items-center gap-4 p-5 rounded-2xl border transition-all text-left
              ${
                activeAction === action.label
                  ? "bg-[#010935] border-[#010935] text-white shadow-lg"
                  : "bg-white border-gray-100 text-[#010935] hover:border-[#00baf2] hover:shadow-md"
              }`}
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl
              ${
                activeAction === action.label ? "bg-white/10" : "bg-[#f0faff]"
              }`}
            >
              {action.icon}
            </div>

            <div>
              <p className="font-semibold text-sm">{action.label}</p>
              <p
                className={`text-xs mt-0.5 ${
                  activeAction === action.label
                    ? "text-white/60"
                    : "text-gray-400"
                }`}
              >
                {action.desc}
              </p>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
