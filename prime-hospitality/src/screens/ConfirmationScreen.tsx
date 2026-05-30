"use client";

import { useEffect } from "react";
import { motion, useReducedMotion, LazyMotion, domAnimation } from "framer-motion";
import { CheckCircle } from "lucide-react";

interface ConfirmationScreenProps {
  businessName: string;
  jobTitle: string;
  onBrowseMore: () => void;
  onViewApplications: () => void;
}

export default function ConfirmationScreen({ businessName, jobTitle, onBrowseMore, onViewApplications }: ConfirmationScreenProps) {
  const shouldReduceMotion = useReducedMotion();

  // Trigger a gentle haptic feedback on mount (Telegram WebApp API)
  useEffect(() => {
    try {
      const tg = (window as unknown as { Telegram?: { WebApp?: { HapticFeedback?: { notificationOccurred: (type: string) => void } } } }).Telegram?.WebApp;
      tg?.HapticFeedback?.notificationOccurred("success");
    } catch {
      // not in Telegram
    }
  }, []);

  return (
    <LazyMotion features={domAnimation}>
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35 }}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100dvh",
          background: "transparent",
          padding: "40px 32px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: "absolute",
            top: "30%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 280,
            height: 280,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(5,150,105,0.12) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Animated checkmark */}
        <motion.div
          initial={shouldReduceMotion ? false : { scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
            delay: 0.1,
          }}
          style={{ marginBottom: 28, willChange: "transform", position: "relative", zIndex: 1 }}
        >
          {/* Outer ring pulse */}
          {!shouldReduceMotion && (
            <motion.div
              animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              style={{
                position: "absolute",
                inset: -16,
                borderRadius: "50%",
                border: "2px solid rgba(5,150,105,0.3)",
                willChange: "transform, opacity",
              }}
            />
          )}

          <div
            style={{
              width: 88,
              height: 88,
              borderRadius: "50%",
              background: "linear-gradient(135deg, rgba(5,150,105,0.2) 0%, rgba(5,150,105,0.05) 100%)",
              border: "2px solid rgba(5,150,105,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CheckCircle size={44} color="#059669" strokeWidth={1.8} />
          </div>
        </motion.div>

        {/* Text content */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.25 }}
          style={{ position: "relative", zIndex: 1 }}
        >
          <p
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--brand)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 10,
            }}
          >
            Application Sent!
          </p>

          <h1
            style={{
              fontSize: 26,
              fontWeight: 800,
              color: "var(--text-primary)",
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
              marginBottom: 14,
            }}
          >
            Your application has been sent to{" "}
            <span className="text-brand-gradient">{businessName}</span>
          </h1>

          <p
            style={{
              fontSize: 15,
              color: "var(--text-secondary)",
              lineHeight: 1.6,
              marginBottom: 32,
              maxWidth: 300,
              margin: "0 auto 32px",
            }}
          >
            You applied for <strong style={{ color: "var(--text-primary)" }}>{jobTitle}</strong>. The hiring team will review your profile and contact you soon. Stay ready!
          </p>
        </motion.div>

        {/* Milestone cards */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.35 }}
          style={{
            display: "flex", gap: 10, width: "100%", marginBottom: 36,
            position: "relative", zIndex: 1,
          }}
        >
          {[
            { emoji: "✅", text: "Profile shared" },
            { emoji: "📨", text: "Employer notified" },
            { emoji: "⏳", text: "Awaiting review" },
          ].map(({ emoji, text }) => (
            <div
              key={text}
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 12,
                padding: "12px 8px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 20, marginBottom: 4 }}>{emoji}</div>
              <p style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500, lineHeight: 1.3 }}>
                {text}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.45 }}
          style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12, position: "relative", zIndex: 1 }}
        >
          <motion.button
            id="browse-more-jobs-btn"
            className="btn-primary"
            whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
            onClick={onBrowseMore}
            style={{ willChange: "transform" }}
          >
            Browse More Jobs
          </motion.button>

          <motion.button
            id="view-application-btn"
            className="btn-secondary"
            whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
            onClick={onViewApplications}
          >
            View My Applications
          </motion.button>
        </motion.div>

        {/* Footer note */}
        <motion.p
          initial={shouldReduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.55 }}
          style={{
            fontSize: 12, color: "var(--text-muted)",
            marginTop: 28, lineHeight: 1.5,
            position: "relative", zIndex: 1,
          }}
        >
          🌟 Prime Hospitality — Connecting talent with Ethiopia's finest hospitality businesses
        </motion.p>
      </motion.div>
    </LazyMotion>
  );
}
