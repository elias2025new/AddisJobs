"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, LazyMotion, domAnimation } from "framer-motion";
import { FileText, MapPin, Clock, ChevronRight, RefreshCw } from "lucide-react";
import { fetchApplications } from "@/lib/api";
import { useTelegram } from "@/hooks/useTelegram";

// ─── Types ───────────────────────────────────────────────────────────────────
interface Application {
  id: string;
  job_id: string;
  status: "pending" | "reviewed" | "shortlisted" | "rejected";
  cover_note: string | null;
  created_at: string;
  jobs:
    | {
        title: string;
        location: string;
        neighborhood: string;
        employers:
          | {
              business_name: string;
              business_type: string;
            }
          | {
              business_name: string;
              business_type: string;
            }[]
          | null;
      }
    | {
        title: string;
        location: string;
        neighborhood: string;
        employers:
          | {
              business_name: string;
              business_type: string;
            }
          | {
              business_name: string;
              business_type: string;
            }[]
          | null;
      }[]
    | null;
}

const STATUS_CONFIG: Record<Application["status"], { label: string; color: string; bg: string; border: string; emoji: string }> = {
  pending:     { label: "Submitted",   color: "#8B9BBE",  bg: "rgba(139,155,190,0.08)", border: "rgba(139,155,190,0.2)",  emoji: "📋" },
  reviewed:    { label: "Reviewed",    color: "#60A5FA",  bg: "rgba(96,165,250,0.08)",  border: "rgba(96,165,250,0.2)",   emoji: "👀" },
  shortlisted: { label: "Shortlisted", color: "#4ADE80",  bg: "rgba(74,222,128,0.08)",  border: "rgba(74,222,128,0.2)",   emoji: "⭐" },
  rejected:    { label: "Not selected",color: "#FCA5A5",  bg: "rgba(252,165,165,0.06)", border: "rgba(252,165,165,0.15)", emoji: "✗" },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function ApplicationsScreen() {
  const { initData } = useTelegram();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadApplications = useCallback(async () => {
    // No real Telegram session (browser dev mode)
    if (!initData) {
      setApplications([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchApplications(initData);
      setApplications(result.applications as unknown as Application[]);
    } catch (err) {
      console.error("Failed to fetch applications:", err);
      setError("Could not load your applications. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [initData]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

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
                My Applications
              </h1>
              <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>
                {applications.length > 0
                  ? `${applications.length} application${applications.length !== 1 ? "s" : ""} submitted`
                  : "Track your job applications here"}
              </p>
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={loadApplications}
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
          {/* Loading skeleton */}
          {isLoading && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="shimmer"
                  style={{ height: 90, borderRadius: 16 }}
                />
              ))}
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
                onClick={loadApplications}
                style={{
                  fontSize: 13, fontWeight: 600, color: "var(--brand)",
                  background: "none", border: "none", cursor: "pointer",
                }}
              >
                Try again
              </button>
            </motion.div>
          )}

          {/* Empty state */}
          {!isLoading && !error && applications.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ textAlign: "center", padding: "60px 0" }}
            >
              <div
                style={{
                  width: 72, height: 72, borderRadius: 20,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 20px",
                }}
              >
                <FileText size={32} color="var(--text-muted)" />
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>
                No applications yet
              </h2>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6, maxWidth: 260, margin: "0 auto" }}>
                Browse jobs and hit Apply — your applications will track here in real time.
              </p>
            </motion.div>
          )}

          {/* Application cards */}
          {!isLoading && !error && applications.length > 0 && (
            <AnimatePresence>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {applications.map((app, i) => {
                  const cfg = STATUS_CONFIG[app.status] ?? STATUS_CONFIG.pending;
                  const rawJob = app.jobs;
                  const job = Array.isArray(rawJob) ? rawJob[0] : rawJob;
                  const rawEmp = job?.employers;
                  const emp = Array.isArray(rawEmp) ? rawEmp[0] : rawEmp;
                  return (
                    <motion.div
                      key={app.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.22, delay: i * 0.06 }}
                      style={{
                        background: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: 16, padding: 16,
                      }}
                    >
                      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                        {/* Business icon */}
                        <div
                          style={{
                            width: 44, height: 44, borderRadius: 12,
                            background: "rgba(5,150,105,0.08)",
                            border: "1px solid rgba(5,150,105,0.15)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 20, flexShrink: 0,
                          }}
                        >
                          🏨
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {job?.title ?? "Job"}
                          </p>
                          <p style={{ fontSize: 13, color: "var(--brand)", marginBottom: 8, fontWeight: 600 }}>
                            {emp?.business_name ?? "—"}
                          </p>

                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                            {/* Status badge */}
                            <span
                              style={{
                                fontSize: 11, fontWeight: 600,
                                color: cfg.color,
                                background: cfg.bg,
                                border: `1px solid ${cfg.border}`,
                                borderRadius: 100, padding: "3px 10px",
                              }}
                            >
                              {cfg.emoji} {cfg.label}
                            </span>

                            {/* Location */}
                            <span style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 3 }}>
                              <MapPin size={10} />
                              {job?.neighborhood ?? "—"}
                            </span>

                            {/* Time */}
                            <span style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 3 }}>
                              <Clock size={10} />
                              {timeAgo(app.created_at)}
                            </span>
                          </div>
                        </div>

                        <ChevronRight size={16} color="var(--text-muted)" style={{ flexShrink: 0, marginTop: 4 }} />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </LazyMotion>
  );
}
