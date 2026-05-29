"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, LazyMotion, domAnimation } from "framer-motion";
import { User, Phone, MapPin, Briefcase, FileText, RefreshCw, CheckCircle, HelpCircle, ShieldCheck, Settings } from "lucide-react";
import { fetchProfile as fetchProfileApi } from "@/lib/api";
import { useTelegram } from "@/hooks/useTelegram";

interface Profile {
  id: string;
  telegram_id: number;
  full_name: string;
  age: number;
  location: string;
  willing_to_relocate: boolean;
  phone_number: string | null;
  contact_shared: boolean;
  selected_categories: string[];
  experience_levels: Record<string, string>;
  cv_url: string | null;
  created_at: string;
}

export default function ProfileScreen() {
  const { user, initData } = useTelegram();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    // No real Telegram session — can't securely fetch profile
    if (!initData) {
      setError("Open the app inside Telegram to view your profile.");
      setIsLoading(false);
      return;
    }

    try {
      const result = await fetchProfileApi(initData);
      if (!result.profile) {
        setError("Profile not found. Please complete registration.");
      } else {
        setProfile(result.profile as unknown as Profile);
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      setError("Could not load your profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [initData]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const getInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0) return "U";
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <LazyMotion features={domAnimation}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100dvh",
          background: "var(--navy)",
          overflowY: "auto",
          paddingBottom: 96,
        }}
      >
        {/* Header */}
        <div className="safe-screen-top" style={{ paddingLeft: 20, paddingRight: 20, paddingBottom: 20, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 4 }}>
                My Profile
              </h1>
              <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>
                Manage your job seeker profile
              </p>
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={fetchProfile}
              style={{
                width: 38, height: 38, borderRadius: 12,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <RefreshCw size={16} color="var(--text-secondary)" />
            </motion.button>
          </div>
        </div>

        <div style={{ padding: "0 20px" }}>
          {/* Loading state */}
          {isLoading && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="shimmer" style={{ height: 110, borderRadius: 20 }} />
              <div className="shimmer" style={{ height: 260, borderRadius: 16 }} />
            </div>
          )}

          {/* Error state */}
          {!isLoading && error && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.2)",
                borderRadius: 14, padding: 20, textAlign: "center",
              }}
            >
              <p style={{ color: "#FCA5A5", fontSize: 14, marginBottom: 12 }}>{error}</p>
              <button
                onClick={fetchProfile}
                style={{
                  fontSize: 13, fontWeight: 600, color: "var(--gold)",
                  background: "none", border: "none", cursor: "pointer",
                }}
              >
                Try again
              </button>
            </motion.div>
          )}

          {/* Profile Details */}
          {!isLoading && !error && profile && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              style={{ display: "flex", flexDirection: "column", gap: 16 }}
            >
              {/* Profile Card */}
              <div
                style={{
                  background: "linear-gradient(135deg, var(--surface-elevated) 0%, var(--card) 100%)",
                  border: "1px solid rgba(212,168,67,0.15)",
                  borderRadius: 20,
                  padding: 20,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 16,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  {/* Avatar */}
                  <div
                    style={{
                      width: 60, height: 60, borderRadius: "50%",
                      background: "linear-gradient(135deg, #D4A843 0%, #B8922E 100%)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 22, fontWeight: 800, color: "#0A0F1E",
                      flexShrink: 0,
                      boxShadow: "0 4px 12px rgba(212,168,67,0.2)",
                    }}
                  >
                    {getInitials(profile.full_name)}
                  </div>
                  <div>
                    <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)", marginBottom: 2 }}>
                      {profile.full_name}
                    </h2>
                    <p style={{ fontSize: 13, color: "var(--gold)", marginBottom: 6, fontWeight: 600 }}>
                      Age: {profile.age} · {profile.willing_to_relocate ? "Willing to relocate" : "Local only"}
                    </p>
                    <span
                      style={{
                        fontSize: 11, fontWeight: 600,
                        color: "var(--success)",
                        background: "rgba(74,222,128,0.08)",
                        border: "1px solid rgba(74,222,128,0.2)",
                        borderRadius: 100, padding: "3px 10px",
                        display: "inline-flex", alignItems: "center", gap: 4
                      }}
                    >
                      <CheckCircle size={10} /> Profile Completed
                    </span>
                  </div>
                </div>

                {/* Settings button */}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    if (typeof window !== "undefined" && (window as any).Telegram?.WebApp) {
                      (window as any).Telegram.WebApp.showAlert("Settings options coming soon!");
                    } else {
                      alert("Settings options coming soon!");
                    }
                  }}
                  style={{
                    width: 38, height: 38, borderRadius: 12,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                >
                  <Settings size={18} color="var(--text-secondary)" />
                </motion.button>
              </div>

              {/* Privacy Notice */}
              <div
                style={{
                  background: "rgba(212,168,67,0.08)",
                  border: "1px dashed rgba(212,168,67,0.3)",
                  borderRadius: 16,
                  padding: "14px 16px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                }}
              >
                <div style={{ marginTop: 2, background: "rgba(212,168,67,0.15)", borderRadius: "50%", padding: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <ShieldCheck size={18} color="var(--gold)" />
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "var(--gold)", marginBottom: 4 }}>
                    Only Visible to Employers
                  </p>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.4 }}>
                    Your profile and contact info are strictly confidential. They are only viewable by verified companies, and never by other job seekers.
                  </p>
                </div>
              </div>

              {/* Details sections */}
              <div
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 16,
                  padding: "8px 16px",
                }}
              >
                {/* Phone */}
                <div
                  style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "14px 0",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                  }}
                >
                  <span style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}>
                    <Phone size={14} color="var(--gold)" /> Phone
                  </span>
                  <span style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 600 }}>
                    {profile.phone_number ? profile.phone_number : (profile.contact_shared ? "Shared via Telegram" : "Not Shared")}
                  </span>
                </div>

                {/* Location */}
                <div
                  style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "14px 0",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                  }}
                >
                  <span style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}>
                    <MapPin size={14} color="var(--gold)" /> Location
                  </span>
                  <span style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 600 }}>
                    {profile.location}
                  </span>
                </div>

                {/* Experience Map */}
                <div
                  style={{
                    display: "flex", flexDirection: "column",
                    padding: "14px 0",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                    gap: 8
                  }}
                >
                  <span style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}>
                    <Briefcase size={14} color="var(--gold)" /> Roles & Experience
                  </span>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, paddingLeft: 22 }}>
                    {profile.selected_categories.map((cat) => {
                      const exp = profile.experience_levels[cat] || "Entry Level";
                      return (
                        <div
                          key={cat}
                          style={{
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.06)",
                            borderRadius: 10,
                            padding: "6px 10px",
                            fontSize: 12,
                            color: "var(--text-primary)",
                          }}
                        >
                          <span style={{ fontWeight: 700 }}>{cat}</span>
                          <span style={{ color: "var(--gold)", marginLeft: 6 }}>{exp}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* CV File */}
                <div
                  style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "14px 0",
                  }}
                >
                  <span style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}>
                    <FileText size={14} color="var(--gold)" /> Resume (CV)
                  </span>
                  <span style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                    {profile.cv_url ? (
                      <>
                        <CheckCircle size={12} color="var(--success)" />
                        <span style={{ textDecoration: "underline", color: "var(--gold)", cursor: "pointer" }} onClick={() => profile.cv_url && window.open(profile.cv_url, "_blank")}>
                          View CV
                        </span>
                      </>
                    ) : (
                      "No CV Uploaded"
                    )}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </LazyMotion>
  );
}
