"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, LazyMotion, domAnimation } from "framer-motion";
import { Briefcase, Users, Clock, CheckCircle, AlertCircle, RefreshCw, PlusCircle, TrendingUp, X, ChevronDown } from "lucide-react";
import { useTelegram } from "@/hooks/useTelegram";
import { fetchEmployerDashboard, postJob } from "@/lib/api";

interface DashboardJob {
  id: string;
  title: string;
  category: string;
  neighborhood: string;
  status: "pending" | "active" | "closed" | "rejected";
  created_at: string;
  deadline: string;
  application_count: number;
}

interface DashboardStats {
  totalJobs: number;
  activeJobs: number;
  totalApplicants: number;
  pendingReview: number;
}

const JOB_STATUS_CONFIG = {
  pending:  { label: "Under Review", color: "#F59E0B", bg: "rgba(245,158,11,0.08)",  border: "rgba(245,158,11,0.2)"  },
  active:   { label: "Live",         color: "#4ADE80", bg: "rgba(74,222,128,0.08)",  border: "rgba(74,222,128,0.2)"  },
  closed:   { label: "Closed",       color: "#8B9BBE", bg: "rgba(139,155,190,0.08)", border: "rgba(139,155,190,0.2)" },
  rejected: { label: "Rejected",     color: "#FCA5A5", bg: "rgba(252,165,165,0.06)", border: "rgba(252,165,165,0.15)"},
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

// ── Post-job form constants ───────────────────────────────────────────────────
const POST_NEIGHBORHOODS = ["Bole","Kazanchis","CMC","Megenagna","Sarbet","Piassa","Taitu","Gerji","Ayat","Lideta","Kirkos","Yeka"];
const POST_CATEGORIES    = ["Waiter","Chef","Barista","Receptionist","Housekeeper","Security","Cashier","Manager"];
const POST_JOB_TYPES     = ["Full Time","Part Time","Contract"] as const;
const POST_EXP_LEVELS    = ["Entry Level","Mid Level","Senior Level"] as const;

const POST_FORM_DEFAULT = {
  title: "", category: "Waiter", jobType: "Full Time",
  salaryMin: "", salaryMax: "", neighborhood: "Bole",
  description: "", experience: "Entry Level", deadline: "",
};

export default function DashboardScreen() {
  const { user, initData } = useTelegram();
  const [jobs, setJobs] = useState<DashboardJob[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [employerName, setEmployerName] = useState<string | null>(null);
  const [isApproved, setIsApproved] = useState<boolean | null>(null);
  const [employerId, setEmployerId] = useState<string | null>(null);

  // ── Post-job modal state ──
  const [showPostModal, setShowPostModal] = useState(false);
  const [postForm, setPostForm] = useState(POST_FORM_DEFAULT);
  const [postLoading, setPostLoading] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);
  const [postSuccess, setPostSuccess] = useState(false);

  const fetchDashboard = useCallback(async () => {
    // No real Telegram session (browser dev mode) — show error
    if (!initData) {
      setError("Open the app inside Telegram to view your employer dashboard.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchEmployerDashboard(initData);
      
      setEmployerName(result.employer.business_name);
      setIsApproved(result.employer.status === "approved");
      setEmployerId(result.employer.id);
      setJobs(result.jobs as unknown as DashboardJob[]);
      setStats(result.stats);
    } catch (err) {
      console.error("Dashboard fetch failed:", err);
      setError("Could not load your dashboard. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [initData]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // ── Post a new job ─────────────────────────────────────────────────────────
  const updatePost = (key: string, value: string) =>
    setPostForm((f) => ({ ...f, [key]: value }));

  const handlePostJob = async () => {
    if (!employerId) return;
    const { title, description, deadline, salaryMin, salaryMax } = postForm;
    if (!title.trim() || !description.trim() || !deadline) {
      setPostError("Please fill in all required fields.");
      return;
    }
    setPostLoading(true);
    setPostError(null);
    try {
      await postJob({
        initData,
        jobData: {
          title: title.trim(),
          category: postForm.category,
          jobType: postForm.jobType,
          salaryMin,
          salaryMax,
          neighborhood: postForm.neighborhood,
          description: description.trim(),
          deadline,
          experience: postForm.experience,
        },
      });
      setPostSuccess(true);
      setPostForm(POST_FORM_DEFAULT);
      setTimeout(() => {
        setPostSuccess(false);
        setShowPostModal(false);
        fetchDashboard();
      }, 2200);
    } catch (err) {
      console.error("Post job failed:", err);
      setPostError("Failed to post job. Please try again.");
    } finally {
      setPostLoading(false);
    }
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
        {/* ── Header ── */}
        <div className="safe-screen-top" style={{ paddingLeft: 20, paddingRight: 20, paddingBottom: 20, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <h1
                style={{
                  fontSize: 22, fontWeight: 800,
                  color: "var(--text-primary)",
                  letterSpacing: "-0.02em", marginBottom: 4,
                }}
              >
                {employerName ? `${employerName}` : "Employer Dashboard"}
              </h1>
              <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>
                {isApproved === false
                  ? "Your account is pending approval"
                  : "Manage your job listings"}
              </p>
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={fetchDashboard}
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
          {/* Loading skeletons */}
          {isLoading && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="shimmer" style={{ height: 110, borderRadius: 16 }} />
              <div className="shimmer" style={{ height: 200, borderRadius: 16 }} />
              <div className="shimmer" style={{ height: 140, borderRadius: 16 }} />
            </div>
          )}

          {/* Error */}
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
              <AlertCircle size={28} color="#FCA5A5" style={{ margin: "0 auto 12px" }} />
              <p style={{ color: "#FCA5A5", fontSize: 14, marginBottom: 12 }}>{error}</p>
              <button
                onClick={fetchDashboard}
                style={{ fontSize: 13, fontWeight: 600, color: "var(--gold)", background: "none", border: "none", cursor: "pointer" }}
              >
                Try again
              </button>
            </motion.div>
          )}

          {/* Pending approval banner */}
          {!isLoading && !error && isApproved === false && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: "rgba(245,158,11,0.08)",
                border: "1px solid rgba(245,158,11,0.25)",
                borderRadius: 14, padding: 16,
                display: "flex", gap: 12, alignItems: "flex-start",
                marginBottom: 20,
              }}
            >
              <Clock size={20} color="#F59E0B" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#FDE68A", marginBottom: 4 }}>Account Under Review</p>
                <p style={{ fontSize: 13, color: "rgba(253,230,138,0.7)", lineHeight: 1.5 }}>
                  Your employer account is being verified by our team. You'll be notified once approved and can start posting jobs.
                </p>
              </div>
            </motion.div>
          )}

          {/* Stats cards */}
          {!isLoading && !error && stats && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              style={{ display: "flex", flexDirection: "column", gap: 16 }}
            >
              {/* Stat grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  { icon: <Briefcase size={20} color="var(--gold)" />, value: stats.totalJobs, label: "Total Listings" },
                  { icon: <CheckCircle size={20} color="#4ADE80" />, value: stats.activeJobs, label: "Active Jobs" },
                  { icon: <Users size={20} color="#60A5FA" />, value: stats.totalApplicants, label: "Total Applicants" },
                  { icon: <TrendingUp size={20} color="#F59E0B" />, value: stats.pendingReview, label: "Under Review" },
                ].map(({ icon, value, label }) => (
                  <div
                    key={label}
                    style={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 14,
                      padding: "14px 16px",
                    }}
                  >
                    <div style={{ marginBottom: 8 }}>{icon}</div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)", marginBottom: 2 }}>
                      {value}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>
                      {label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Post a job CTA */}
              {isApproved && (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { setShowPostModal(true); setPostError(null); setPostSuccess(false); }}
                  style={{
                    width: "100%",
                    padding: "14px 20px",
                    borderRadius: 14,
                    background: "linear-gradient(135deg, #D4A843 0%, #B8922E 100%)",
                    border: "none",
                    cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                    color: "#0A0F1E", fontSize: 15, fontWeight: 700,
                    fontFamily: "inherit",
                    boxShadow: "0 4px 16px rgba(212,168,67,0.25)",
                  }}
                >
                  <PlusCircle size={18} />
                  Post a New Job
                </motion.button>
              )}

              {/* Jobs list */}
              <div>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 12 }}>
                  Your Job Listings
                </h2>

                {jobs.length === 0 ? (
                  <div
                    style={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 14, padding: 24,
                      textAlign: "center",
                    }}
                  >
                    <Briefcase size={28} color="var(--text-muted)" style={{ margin: "0 auto 10px", display: "block" }} />
                    <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>
                      You haven't posted any jobs yet.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {jobs.map((job, i) => {
                      const cfg = JOB_STATUS_CONFIG[job.status] ?? JOB_STATUS_CONFIG.pending;
                      return (
                        <motion.div
                          key={job.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: i * 0.05 }}
                          style={{
                            background: "var(--card)",
                            border: "1px solid var(--border)",
                            borderRadius: 14, padding: 14,
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                            <div style={{ flex: 1, minWidth: 0, paddingRight: 12 }}>
                              <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {job.title}
                              </p>
                              <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
                                {job.neighborhood} · {timeAgo(job.created_at)}
                              </p>
                            </div>
                            <span
                              style={{
                                fontSize: 11, fontWeight: 600,
                                color: cfg.color,
                                background: cfg.bg,
                                border: `1px solid ${cfg.border}`,
                                borderRadius: 100, padding: "3px 10px",
                                whiteSpace: "nowrap", flexShrink: 0,
                              }}
                            >
                              {cfg.label}
                            </span>
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <Users size={13} color="var(--text-muted)" />
                            <span style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 600 }}>
                              {job.application_count} applicant{job.application_count !== 1 ? "s" : ""}
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* ── POST JOB BOTTOM SHEET ─────────────────────────────────────── */}
      <AnimatePresence>
        {showPostModal && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !postLoading && setShowPostModal(false)}
              style={{
                position: "fixed", inset: 0,
                background: "rgba(0,0,0,0.65)",
                backdropFilter: "blur(6px)",
                WebkitBackdropFilter: "blur(6px)",
                zIndex: 100,
              }}
            />

            {/* Sheet */}
            <motion.div
              key="sheet"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              style={{
                position: "fixed", bottom: 0, left: 0, right: 0,
                background: "var(--surface-elevated)",
                borderRadius: "22px 22px 0 0",
                border: "1px solid rgba(255,255,255,0.08)",
                borderBottom: "none",
                zIndex: 101,
                maxHeight: "92dvh",
                overflowY: "auto",
                paddingBottom: "env(safe-area-inset-bottom, 20px)",
              }}
            >
              {/* Drag handle */}
              <div style={{ display: "flex", justifyContent: "center", paddingTop: 12, paddingBottom: 4 }}>
                <div style={{ width: 40, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.12)" }} />
              </div>

              {/* Header */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "12px 20px 16px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}>
                <div>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>New Listing</p>
                  <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>Post a Job</h2>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => !postLoading && setShowPostModal(false)}
                  style={{
                    width: 34, height: 34, borderRadius: 10,
                    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)",
                    display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                  }}
                >
                  <X size={16} color="var(--text-muted)" />
                </motion.button>
              </div>

              {/* Success state */}
              {postSuccess ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{ padding: 40, textAlign: "center" }}
                >
                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 250, damping: 20 }}
                    style={{
                      width: 72, height: 72, borderRadius: "50%",
                      background: "linear-gradient(135deg, rgba(212,168,67,0.2), rgba(212,168,67,0.05))",
                      border: "2px solid rgba(212,168,67,0.4)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      margin: "0 auto 20px",
                    }}
                  >
                    <CheckCircle size={36} color="#D4A843" />
                  </motion.div>
                  <h3 style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)", marginBottom: 8 }}>Job Submitted!</h3>
                  <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                    Your listing is under review. We'll activate it shortly.
                  </p>
                </motion.div>
              ) : (
                <div style={{ padding: "20px 20px 8px", display: "flex", flexDirection: "column", gap: 16 }}>

                  {/* Job Title */}
                  <PostField label="Job Title *">
                    <input
                      className="input-base"
                      placeholder="e.g. Senior Waiter"
                      value={postForm.title}
                      onChange={(e) => updatePost("title", e.target.value)}
                    />
                  </PostField>

                  {/* Category */}
                  <PostField label="Category">
                    <div style={{ position: "relative" }}>
                      <select className="input-base" style={{ appearance: "none", paddingRight: 40 }}
                        value={postForm.category}
                        onChange={(e) => updatePost("category", e.target.value)}
                      >
                        {POST_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <ChevronDown size={15} color="var(--text-muted)" style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                    </div>
                  </PostField>

                  {/* Job Type */}
                  <PostField label="Job Type">
                    <div style={{ display: "flex", gap: 8 }}>
                      {POST_JOB_TYPES.map((t) => {
                        const active = postForm.jobType === t;
                        return (
                          <button key={t} onClick={() => updatePost("jobType", t)}
                            style={{
                              flex: 1, padding: "10px 4px", borderRadius: 10, fontSize: 13,
                              fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                              background: active ? "rgba(212,168,67,0.15)" : "rgba(255,255,255,0.04)",
                              border: active ? "1px solid rgba(212,168,67,0.4)" : "1px solid rgba(255,255,255,0.07)",
                              color: active ? "var(--gold)" : "var(--text-secondary)",
                            }}
                          >{t}</button>
                        );
                      })}
                    </div>
                  </PostField>

                  {/* Salary */}
                  <PostField label="Salary Range (ETB / month)">
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      <input className="input-base" type="number" placeholder="Min e.g. 5000"
                        value={postForm.salaryMin} onChange={(e) => updatePost("salaryMin", e.target.value)} />
                      <input className="input-base" type="number" placeholder="Max e.g. 8000"
                        value={postForm.salaryMax} onChange={(e) => updatePost("salaryMax", e.target.value)} />
                    </div>
                  </PostField>

                  {/* Neighborhood */}
                  <PostField label="Location">
                    <div style={{ position: "relative" }}>
                      <select className="input-base" style={{ appearance: "none", paddingRight: 40 }}
                        value={postForm.neighborhood}
                        onChange={(e) => updatePost("neighborhood", e.target.value)}
                      >
                        {POST_NEIGHBORHOODS.map((n) => <option key={n} value={n}>{n}</option>)}
                      </select>
                      <ChevronDown size={15} color="var(--text-muted)" style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                    </div>
                  </PostField>

                  {/* Required Experience */}
                  <PostField label="Experience Required">
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {POST_EXP_LEVELS.map((lvl) => {
                        const active = postForm.experience === lvl;
                        return (
                          <button key={lvl} onClick={() => updatePost("experience", lvl)}
                            style={{
                              padding: "8px 14px", borderRadius: 100, fontSize: 13,
                              fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                              background: active ? "rgba(212,168,67,0.15)" : "rgba(255,255,255,0.04)",
                              border: active ? "1px solid rgba(212,168,67,0.4)" : "1px solid rgba(255,255,255,0.07)",
                              color: active ? "var(--gold)" : "var(--text-secondary)",
                            }}
                          >{lvl}</button>
                        );
                      })}
                    </div>
                  </PostField>

                  {/* Description */}
                  <PostField label="Job Description *">
                    <textarea
                      className="input-base"
                      placeholder="Describe the role, responsibilities, and what you're looking for…"
                      rows={4}
                      value={postForm.description}
                      onChange={(e) => updatePost("description", e.target.value)}
                      style={{ resize: "none", lineHeight: 1.6 }}
                    />
                    <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4, textAlign: "right" }}>
                      {postForm.description.length} chars
                    </p>
                  </PostField>

                  {/* Deadline */}
                  <PostField label="Application Deadline *">
                    <input
                      className="input-base"
                      type="date"
                      value={postForm.deadline}
                      onChange={(e) => updatePost("deadline", e.target.value)}
                      style={{ colorScheme: "dark" }}
                    />
                  </PostField>

                  {/* Error */}
                  {postError && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                      style={{
                        background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
                        borderRadius: 10, padding: "10px 14px",
                      }}
                    >
                      <p style={{ fontSize: 13, color: "#FCA5A5" }}>{postError}</p>
                    </motion.div>
                  )}

                  {/* Submit */}
                  <div style={{ paddingTop: 4, paddingBottom: 16 }}>
                    <motion.button
                      className="btn-primary"
                      whileTap={{ scale: 0.97 }}
                      onClick={handlePostJob}
                      disabled={postLoading}
                      style={{ opacity: postLoading ? 0.7 : 1, willChange: "transform" }}
                    >
                      {postLoading ? (
                        <motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 0.8, repeat: Infinity }}>
                          Submitting for Review…
                        </motion.span>
                      ) : "Submit Job Listing →"}
                    </motion.button>
                    <p style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center", marginTop: 10, lineHeight: 1.5 }}>
                      Listings are reviewed by our team before going live (usually within 24 hrs).
                    </p>
                  </div>

                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </LazyMotion>
  );
}

// ── Helper component ──────────────────────────────────────────────────────────
function PostField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
        {label}
      </p>
      {children}
    </div>
  );
}
