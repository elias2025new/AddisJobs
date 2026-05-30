"use client";

import { useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { JobCategory, JOB_CATEGORIES } from "@/data/jobs";

interface FilterChipsProps {
  selected: JobCategory | null;
  onSelect: (category: JobCategory | null) => void;
}

export default function FilterChips({ selected, onSelect }: FilterChipsProps) {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSelect = useCallback(
    (category: JobCategory | null) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onSelect(category);
      }, 150);
    },
    [onSelect]
  );

  const allCategories = [null, ...JOB_CATEGORIES] as (JobCategory | null)[];

  const categoryEmoji: Record<string, string> = {
    Waiter: "🍽️",
    Chef: "👨‍🍳",
    Receptionist: "🛎️",
    Barista: "☕",
    Housekeeper: "🧹",
    Security: "🛡️",
    Cashier: "💳",
    Manager: "📋",
    "Marketing & Sales": "📈",
    "F&B": "🍹",
    Finance: "💰",
    "Cost Control": "📊",
    Accountant: "🧮",
    Bellboy: "🧳",
    "Store Keeper": "📦",
    "Phone Operator": "📞",
    Maintenance: "🔧",
  };

  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        overflowX: "auto",
        paddingBottom: 4,
        scrollbarWidth: "none",
        msOverflowStyle: "none",
        paddingLeft: 20,
        paddingRight: 20,
      }}
      className="scroll-smooth"
    >
      {allCategories.map((cat) => {
        const isActive = selected === cat;
        const label = cat ?? "All Jobs";
        const emoji = cat ? categoryEmoji[cat] : "✨";

        return (
          <motion.button
            key={label}
            id={`filter-${label.toLowerCase().replace(" ", "-")}`}
            onClick={() => handleSelect(cat)}
            whileTap={{ scale: 0.95 }}
            style={{ willChange: "transform", flexShrink: 0 }}
            animate={{
              background: isActive
                ? "linear-gradient(135deg, #059669 0%, #047857 100%)"
                : "rgba(255, 255, 255, 0.05)",
              borderColor: isActive
                ? "transparent"
                : "rgba(255, 255, 255, 0.08)",
              color: isActive ? "#0A0F1E" : "#8B9BBE",
            }}
            transition={{ duration: 0.18 }}
            whileHover={{ scale: 1.03 }}
          >
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                borderRadius: 100,
                border: "1px solid",
                borderColor: "inherit",
                fontSize: 13,
                fontWeight: isActive ? 700 : 500,
                whiteSpace: "nowrap",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              <span style={{ fontSize: 14 }}>{emoji}</span>
              {label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
