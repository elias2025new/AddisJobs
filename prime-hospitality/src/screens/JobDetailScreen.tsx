"use client";

import { motion, useReducedMotion, LazyMotion, domAnimation } from "framer-motion";
import { ArrowLeft, MapPin, Wallet, Briefcase, Calendar, CheckCircle, AlertCircle } from "lucide-react";
import { Job } from "@/data/jobs";

interface JobDetailScreenProps {
  job: Job;
  onBack: () => void;
  onApply: (job: Job) => void;
}

export default function JobDetailScreen({ job, onBack, onApply }: JobDetailScreenProps) {
  const shouldReduceMotion = useReducedMotion();

  const infoItems = [
    { icon: MapPin, label: "Location", value: job.location },
    { icon: Wallet, label: "Salary", value: `ETB ${job.salaryMin.toLocaleString()}–${job.salaryMax.toLocaleString()}/mo` },
    { icon: Briefcase, label: "Job Type", value: job.jobType },
    { icon: Calendar, label: "Deadline", value: job.deadline },
  ];

  return (
    <LazyMotion features={domAnimation}>
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 40 }}
        transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100dvh",
          background: "var(--navy)",
          willChange: "transform",
          overflowY: "auto",
          overscrollBehavior: "contain",
          paddingBottom: 96,
        }}
      >
        {/* ── HEADER ── */}
        <div
          className="safe-screen-top"
          style={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            background: "rgba(10,15,30,0.95)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
            paddingLeft: 20,
            paddingRight: 20,
            paddingBottom: 14,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <motion.button
            id="job-detail-back"
            whileTap={{ scale: 0.9 }}
            onClick={onBack}
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <ArrowLeft size={18} color="var(--text-primary)" />
          </motion.button>
          <div>
            <p style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500, marginBottom: 1 }}>
              Job Detail
            </p>
            <h1
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "var(--text-primary)",
                lineHeight: 1.2,
              }}
            >
              {job.title}
            </h1>
          </div>
        </div>

        {/* ── CONTENT ── */}
        <div style={{ padding: "20px 20px 0" }}>

          {/* Business hero card */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, delay: 0.05 }}
            style={{
              background: "linear-gradient(135deg, var(--surface-elevated) 0%, var(--card) 100%)",
              border: "1px solid rgba(5,150,105,0.15)",
              borderRadius: 20,
              padding: 20,
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                background: "linear-gradient(135deg, rgba(5,150,105,0.15) 0%, rgba(5,150,105,0.05) 100%)",
                border: "1px solid rgba(5,150,105,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                flexShrink: 0,
              }}
            >
              {job.businessLogo}
            </div>
            <div>
              <h2
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: "var(--text-primary)",
                  lineHeight: 1.2,
                  marginBottom: 4,
                  letterSpacing: "-0.02em",
                }}
              >
                {job.title}
              </h2>
              <p style={{ fontSize: 14, color: "var(--brand)", fontWeight: 600 }}>
                {job.businessName}
              </p>
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                {job.businessType}
              </p>
            </div>
          </motion.div>

          {/* Info grid */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, delay: 0.1 }}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 8,
              marginBottom: 20,
            }}
          >
            {infoItems.map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 12,
                  padding: "12px 14px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  <Icon size={13} color="var(--brand)" />
                  <span style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    {label}
                  </span>
                </div>
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.3 }}>
                  {value}
                </p>
              </div>
            ))}
          </motion.div>

          {/* Qualification warning */}
          {!job.qualificationsMet && (
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25, delay: 0.12 }}
              style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.2)",
                borderRadius: 12,
                padding: "12px 14px",
                display: "flex",
                gap: 10,
                marginBottom: 20,
                alignItems: "flex-start",
              }}
            >
              <AlertCircle size={16} color="#FCA5A5" style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#FCA5A5", marginBottom: 2 }}>
                  Requirements Not Fully Met
                </p>
                <p style={{ fontSize: 12, color: "rgba(252,165,165,0.7)", lineHeight: 1.5 }}>
                  This role requires {job.requirements.experience} experience. You can still apply — employers may consider strong candidates.
                </p>
              </div>
            </motion.div>
          )}

          {/* About section */}
          <motion.section
            initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, delay: 0.15 }}
            style={{ marginBottom: 20 }}
          >
            <h3
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "var(--text-primary)",
                marginBottom: 10,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              About this Job
            </h3>
            <p
              style={{
                fontSize: 14,
                color: "var(--text-secondary)",
                lineHeight: 1.7,
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.04)",
                borderRadius: 12,
                padding: 14,
              }}
            >
              {job.fullDescription}
            </p>
          </motion.section>

          {/* Requirements section */}
          <motion.section
            initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, delay: 0.2 }}
            style={{ marginBottom: 20 }}
          >
            <h3
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "var(--text-primary)",
                marginBottom: 10,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              Requirements
            </h3>
            <div
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.04)",
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              {[
                { label: "Experience", value: job.requirements.experience },
                { label: "Education", value: job.requirements.education },
                { label: "Languages", value: job.requirements.languages.join(", ") },
                ...(job.requirements.locationPreference
                  ? [{ label: "Location", value: job.requirements.locationPreference }]
                  : []),
              ].map(({ label, value }, i, arr) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    padding: "12px 14px",
                    borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                    gap: 12,
                  }}
                >
                  <span style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 500, flexShrink: 0 }}>
                    {label}
                  </span>
                  <span
                    style={{
                      fontSize: 13,
                      color: "var(--text-primary)",
                      fontWeight: 600,
                      textAlign: "right",
                    }}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Posted info */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 8,
            }}
          >
            <CheckCircle size={13} color="var(--success)" />
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
              Posted {job.postedDaysAgo === 1 ? "today" : `${job.postedDaysAgo} days ago`} · Actively hiring
            </span>
          </div>
        </div>

        {/* ── STICKY APPLY BUTTON ── */}
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "12px 20px",
            paddingBottom: "calc(12px + env(safe-area-inset-bottom, 0px))",
            background: "rgba(10,15,30,0.95)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            borderTop: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <motion.button
            id="apply-now-btn"
            className="btn-primary"
            whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
            onClick={() => onApply(job)}
            style={{ willChange: "transform" }}
          >
            Apply Now →
          </motion.button>
        </div>
      </motion.div>
    </LazyMotion>
  );
}
