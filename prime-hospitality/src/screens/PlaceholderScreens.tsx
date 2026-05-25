"use client";

import { motion, AnimatePresence, LazyMotion, domAnimation } from "framer-motion";
import { Search, FileText, MapPin } from "lucide-react";

// ── Placeholder screens for tabs not yet built ──

export function SearchScreen() {
  return (
    <PlaceholderScreen
      emoji="🔍"
      title="Search Jobs"
      subtitle="Advanced search with filters coming soon"
      description="Search by job title, business name, salary range, or neighborhood across all 200+ hiring businesses in Addis Ababa."
    />
  );
}

export function ApplicationsScreen() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100dvh",
        background: "var(--navy)",
        padding: "52px 20px 96px",
        overflowY: "auto",
      }}
    >
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 4 }}>
          My Applications
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>
          Track all your job applications here
        </p>
      </div>

      {/* Mock application entry */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        style={{
          background: "var(--card)",
          border: "1px solid rgba(212,168,67,0.15)",
          borderRadius: 16,
          padding: 16,
          marginBottom: 12,
        }}
      >
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <div style={{ fontSize: 24, width: 44, height: 44, borderRadius: 12, background: "rgba(212,168,67,0.08)", border: "1px solid rgba(212,168,67,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            🏨
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 2 }}>Senior Waiter</p>
            <p style={{ fontSize: 13, color: "var(--gold)", marginBottom: 8 }}>Skylight Hotel</p>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="badge badge-success">✓ Submitted</span>
              <span style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 3 }}>
                <MapPin size={10} /> Bole · Today
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Empty state hint */}
      <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text-muted)" }}>
        <FileText size={36} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
        <p style={{ fontSize: 14, fontWeight: 500 }}>Apply to more jobs to see them here</p>
      </div>
    </div>
  );
}

export function ProfileScreen() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100dvh",
        background: "var(--navy)",
        padding: "52px 20px 96px",
        overflowY: "auto",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 4 }}>
          My Profile
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>
          Manage your job seeker profile
        </p>
      </div>

      {/* Profile card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        style={{
          background: "linear-gradient(135deg, var(--surface-elevated) 0%, var(--card) 100%)",
          border: "1px solid rgba(212,168,67,0.15)",
          borderRadius: 20,
          padding: 20,
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: 60, height: 60, borderRadius: "50%",
            background: "linear-gradient(135deg, #D4A843 0%, #B8922E 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24, fontWeight: 800, color: "#0A0F1E",
            flexShrink: 0,
          }}
        >
          B
        </div>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)", marginBottom: 2 }}>
            Biruk Tadesse
          </h2>
          <p style={{ fontSize: 13, color: "var(--gold)", marginBottom: 4 }}>Waiter · Mid Level</p>
          <span className="badge badge-success">✓ Profile Complete</span>
        </div>
      </motion.div>

      {/* Profile details */}
      {[
        { label: "Phone", value: "+251 91 234 5678" },
        { label: "Location", value: "Megenagna, Addis Ababa" },
        { label: "Education", value: "Diploma in Hotel Management" },
        { label: "Languages", value: "Amharic, English" },
        { label: "Relocate", value: "Not willing to relocate" },
      ].map(({ label, value }) => (
        <div
          key={label}
          style={{
            display: "flex", justifyContent: "space-between",
            padding: "13px 0",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <span style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 500 }}>{label}</span>
          <span style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 600, textAlign: "right", maxWidth: "60%" }}>{value}</span>
        </div>
      ))}

      <motion.button
        className="btn-primary"
        whileTap={{ scale: 0.97 }}
        style={{ marginTop: 24, willChange: "transform" }}
        onClick={() => {}}
      >
        Edit Profile
      </motion.button>
    </div>
  );
}

export function DashboardScreen() {
  return (
    <PlaceholderScreen
      emoji="📊"
      title="Employer Dashboard"
      subtitle="Post jobs & manage applicants"
      description="Your employer dashboard is being set up. You'll be able to post jobs, view applicant profiles, and manage your hiring pipeline here."
      isGold
    />
  );
}

// ── Generic placeholder ──
function PlaceholderScreen({
  emoji, title, subtitle, description, isGold = false,
}: {
  emoji: string;
  title: string;
  subtitle: string;
  description: string;
  isGold?: boolean;
}) {
  return (
    <LazyMotion features={domAnimation}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100dvh",
          background: "var(--navy)",
          padding: "40px 32px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 80, height: 80, borderRadius: 24,
            background: isGold ? "rgba(212,168,67,0.1)" : "rgba(255,255,255,0.04)",
            border: isGold ? "1px solid rgba(212,168,67,0.2)" : "1px solid rgba(255,255,255,0.06)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 36, marginBottom: 20,
          }}
        >
          {emoji}
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", marginBottom: 6, letterSpacing: "-0.02em" }}>
          {title}
        </h2>
        <p style={{ fontSize: 13, fontWeight: 600, color: isGold ? "var(--gold)" : "var(--text-muted)", marginBottom: 12 }}>
          {subtitle}
        </p>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6, maxWidth: 280 }}>
          {description}
        </p>
      </motion.div>
    </LazyMotion>
  );
}
