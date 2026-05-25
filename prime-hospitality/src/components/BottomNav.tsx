"use client";

import { motion } from "framer-motion";
import { Home, Search, FileText, User, LayoutDashboard } from "lucide-react";

export type NavTab = "home" | "search" | "applications" | "profile" | "dashboard";

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  isEmployer?: boolean;
}

interface NavItem {
  id: NavTab;
  label: string;
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
}

const JOB_SEEKER_TABS: NavItem[] = [
  { id: "home", label: "Home", Icon: Home },
  { id: "search", label: "Search", Icon: Search },
  { id: "applications", label: "Applied", Icon: FileText },
  { id: "profile", label: "Profile", Icon: User },
];

const EMPLOYER_TABS: NavItem[] = [
  ...JOB_SEEKER_TABS,
  { id: "dashboard", label: "Dashboard", Icon: LayoutDashboard },
];

export default function BottomNav({ activeTab, onTabChange, isEmployer = false }: BottomNavProps) {
  const tabs = isEmployer ? EMPLOYER_TABS : JOB_SEEKER_TABS;

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: "rgba(10, 15, 30, 0.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        paddingBottom: "env(safe-area-inset-bottom, 8px)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          paddingTop: 8,
          paddingBottom: 4,
          maxWidth: 480,
          margin: "0 auto",
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`nav-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                padding: "6px 16px",
                background: "none",
                border: "none",
                cursor: "pointer",
                position: "relative",
                minWidth: 56,
              }}
            >
              {/* Active background pill */}
              {isActive && (
                <motion.div
                  layoutId="nav-active-pill"
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(212, 168, 67, 0.1)",
                    borderRadius: 12,
                    border: "1px solid rgba(212, 168, 67, 0.2)",
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 35 }}
                />
              )}

              <motion.div
                animate={{
                  color: isActive ? "#D4A843" : "#4A5878",
                  scale: isActive ? 1.1 : 1,
                }}
                transition={{ duration: 0.2 }}
                style={{ position: "relative", zIndex: 1, willChange: "transform" }}
              >
                <tab.Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
              </motion.div>

              <motion.span
                animate={{
                  color: isActive ? "#D4A843" : "#4A5878",
                  fontWeight: isActive ? 700 : 500,
                }}
                transition={{ duration: 0.2 }}
                style={{
                  fontSize: 10,
                  letterSpacing: "0.02em",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                {tab.label}
              </motion.span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
