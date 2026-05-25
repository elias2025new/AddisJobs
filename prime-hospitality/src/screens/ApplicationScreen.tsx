"use client";

import { useState } from "react";
import { motion, useReducedMotion, LazyMotion, domAnimation } from "framer-motion";
import { ArrowLeft, MapPin, User, Phone, Briefcase, AlertTriangle } from "lucide-react";
import { Job } from "@/data/jobs";
import { JobSeekerProfile } from "@/data/profile";
import { useTelegram } from "@/hooks/useTelegram";
import { submitApplication, ApiError } from "@/lib/api";

interface ApplicationScreenProps {
  job: Job;
  profile: JobSeekerProfile;
  onBack: () => void;
  onSubmit: () => void;
}

export default function ApplicationScreen({ job, profile, onBack, onSubmit }: ApplicationScreenProps) {
  const shouldReduceMotion = useReducedMotion();
  const { initData } = useTelegram();
  const [whyHire, setWhyHire] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await submitApplication({
        initData,
        jobId: job.id,
        coverNote: whyHire,
      });
      // Success — advance to confirmation screen
      onSubmit();
    } catch (error: unknown) {
      console.error("Application submit error:", error);
      if (error instanceof ApiError) {
        if (error.isDuplicate) {
          setSubmitError("You have already applied for this job.");
        } else if (error.isRateLimit) {
          setSubmitError("You have reached the application limit (10/hour). Please try again later.");
        } else if (error.isUnauthorized) {
          setSubmitError("Authentication failed. Please reopen the app from Telegram.");
        } else {
          setSubmitError(error.message);
        }
      } else {
        setSubmitError("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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
          paddingBottom: 100,
        }}
      >
        {/* ── HEADER ── */}
        <div
          style={{
            position: "sticky", top: 0, zIndex: 10,
            background: "rgba(10,15,30,0.96)",
            backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
            padding: "50px 20px 14px",
            display: "flex", alignItems: "center", gap: 12,
          }}
        >
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onBack}
            style={{
              width: 38, height: 38, borderRadius: 12,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.08)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", flexShrink: 0,
            }}
          >
            <ArrowLeft size={18} color="var(--text-primary)" />
          </motion.button>
          <div>
            <p style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500, marginBottom: 1 }}>
              Applying to {job.businessName}
            </p>
            <h1 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>
              {job.title}
            </h1>
          </div>
        </div>

        <div style={{ padding: "20px 20px 0" }}>

          {/* Job summary pill */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.05 }}
            style={{
              background: "rgba(212,168,67,0.06)",
              border: "1px solid rgba(212,168,67,0.15)",
              borderRadius: 14, padding: "12px 16px",
              display: "flex", alignItems: "center", gap: 12, marginBottom: 24,
            }}
          >
            <div style={{ fontSize: 24 }}>{job.businessLogo}</div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{job.title}</p>
              <p style={{ fontSize: 12, color: "var(--gold)" }}>{job.businessName} · {job.neighborhood}</p>
            </div>
          </motion.div>

          {/* Pre-filled fields */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.08 }}
          >
            <SectionLabel>Your Information</SectionLabel>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>

              {/* Full name */}
              <PrefilledField
                icon={<User size={14} color="var(--gold)" />}
                label="Full Name"
                value={profile.fullName}
              />

              {/* Phone */}
              <PrefilledField
                icon={<Phone size={14} color="var(--gold)" />}
                label="Phone Number"
                value={profile.phone}
              />

              {/* Experience */}
              <PrefilledField
                icon={<Briefcase size={14} color="var(--gold)" />}
                label="Experience Level"
                value={profile.experienceLevel}
              />

              {/* Location */}
              <div
                style={{
                  display: "flex", alignItems: "center",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 12, padding: "12px 16px", gap: 10,
                }}
              >
                <MapPin size={14} color="var(--gold)" style={{ flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 2 }}>
                    Location
                  </p>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
                    {profile.neighborhood}, Addis Ababa
                  </p>
                </div>
                {job.locationMismatch && (
                  <span
                    style={{
                      marginLeft: "auto", fontSize: 10, fontWeight: 600,
                      color: "#FCD34D",
                      background: "rgba(245,158,11,0.1)",
                      border: "1px solid rgba(245,158,11,0.2)",
                      borderRadius: 100, padding: "3px 8px", flexShrink: 0,
                    }}
                  >
                    ⚠️ Mismatch
                  </span>
                )}
              </div>
            </div>
          </motion.div>

          {/* Why hire text field */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.12 }}
            style={{ marginBottom: 24 }}
          >
            <SectionLabel>Cover Note (Optional)</SectionLabel>
            <textarea
              id="why-hire-field"
              className="input-base"
              placeholder={`Tell ${job.businessName} why you're the right person for this role…`}
              value={whyHire}
              onChange={(e) => setWhyHire(e.target.value)}
              rows={4}
              style={{
                resize: "none",
                lineHeight: 1.6,
              }}
            />
            <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6, textAlign: "right" }}>
              {whyHire.length}/300 characters
            </p>
          </motion.div>

          {/* Info note */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25, delay: 0.15 }}
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.05)",
              borderRadius: 12, padding: "12px 14px", marginBottom: 8,
            }}
          >
            <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6 }}>
              📋 Your profile details will be shared with {job.businessName}. They will contact you via your Telegram or phone number if you are shortlisted.
            </p>
          </motion.div>
        </div>

        {/* ── STICKY FOOTER: Error banner + Submit button ── */}
        <div
          style={{
            position: "fixed", bottom: 0, left: 0, right: 0,
            padding: "12px 20px",
            paddingBottom: "calc(12px + env(safe-area-inset-bottom, 0px))",
            background: "rgba(10,15,30,0.97)",
            backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {/* Error banner — shown only when submission fails */}
          {submitError && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                display: "flex", alignItems: "flex-start", gap: 10,
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.25)",
                borderRadius: 10, padding: "10px 12px",
              }}
            >
              <AlertTriangle size={15} color="var(--error)" style={{ flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: 13, color: "#FCA5A5", lineHeight: 1.5 }}>{submitError}</p>
            </motion.div>
          )}

          <motion.button
            id="submit-application-btn"
            className="btn-primary"
            whileTap={shouldReduceMotion ? {} : { scale: 0.96 }}
            onClick={handleSubmit}
            disabled={isSubmitting}
            style={{
              willChange: "transform",
              opacity: isSubmitting ? 0.7 : 1,
            }}
          >
            {isSubmitting ? (
              <motion.span
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              >
                Submitting…
              </motion.span>
            ) : (
              "Submit Application ✓"
            )}
          </motion.button>
        </div>
      </motion.div>
    </LazyMotion>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontSize: 12, fontWeight: 700, color: "var(--text-muted)",
        textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10,
      }}
    >
      {children}
    </p>
  );
}

function PrefilledField({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex", alignItems: "center",
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 12, padding: "12px 16px", gap: 10,
      }}
    >
      <span style={{ flexShrink: 0 }}>{icon}</span>
      <div>
        <p style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 2 }}>
          {label}
        </p>
        <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{value}</p>
      </div>
      <span
        style={{
          marginLeft: "auto", fontSize: 10, color: "var(--text-muted)",
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 6, padding: "2px 7px", flexShrink: 0, fontWeight: 500,
        }}
      >
        Pre-filled
      </span>
    </div>
  );
}
