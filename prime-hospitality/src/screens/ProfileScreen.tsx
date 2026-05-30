"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, LazyMotion, domAnimation, AnimatePresence } from "framer-motion";
import { Phone, MapPin, Briefcase, FileText, RefreshCw, CheckCircle, HelpCircle, ShieldCheck, Settings, AlertCircle, Upload, Loader2, Moon, Sun, X } from "lucide-react";
import { fetchProfile as fetchProfileApi, updateCv } from "@/lib/api";
import { useTelegram } from "@/hooks/useTelegram";
import { supabase } from "@/lib/supabase";

// ── Profile completion helpers ──────────────────────────────────────────────
interface CompletionSection {
  key: string;
  label: string;
  done: boolean;
  weight: number;
}

function getCompletionSections(profile: Profile): CompletionSection[] {
  return [
    {
      key: "personal",
      label: "Personal information incomplete",
      done: !!(profile.full_name && profile.age && profile.location),
      weight: 20,
    },
    {
      key: "contact",
      label: "Contact number not shared",
      done: !!(profile.contact_shared),
      weight: 20,
    },
    {
      key: "roles",
      label: "No job roles selected",
      done: !!(profile.selected_categories && profile.selected_categories.length > 0),
      weight: 20,
    },
    {
      key: "experience",
      label: "Experience levels not set",
      done: !!(profile.selected_categories && profile.selected_categories.length > 0 &&
        profile.selected_categories.every((c) => !!profile.experience_levels?.[c])),
      weight: 20,
    },
    {
      key: "cv",
      label: "Resume (CV) not uploaded",
      done: !!(profile.cv_url),
      weight: 20,
    },
  ];
}

function getCompletionScore(sections: CompletionSection[]) {
  return sections.reduce((acc, s) => acc + (s.done ? s.weight : 0), 0);
}

interface Profile {
  id: string;
  telegram_id: number;
  full_name: string;
  age: number;
  gender: "male" | "female" | string | null;
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
  const [privacyDismissed, setPrivacyDismissed] = useState<boolean>(() => {
    try { return localStorage.getItem("profile_privacy_dismissed") === "true"; } catch { return false; }
  });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isDark, setIsDark] = useState<boolean>(() => {
    try { return localStorage.getItem("theme") === "dark"; } catch { return false; }
  });

  const applyTheme = (dark: boolean) => {
    setIsDark(dark);
    try { localStorage.setItem("theme", dark ? "dark" : "light"); } catch {}
    if (dark) {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    // Notify the useTelegram hook to update native chrome bars
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("themeToggle"));
    }
  };

  const dismissPrivacy = () => {
    setPrivacyDismissed(true);
    try { localStorage.setItem("profile_privacy_dismissed", "true"); } catch {}
  };
  const restorePrivacy = () => {
    setPrivacyDismissed(false);
    try { localStorage.removeItem("profile_privacy_dismissed"); } catch {}
  };

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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingCv, setIsUploadingCv] = useState(false);
  const [cvUploadError, setCvUploadError] = useState<string | null>(null);

  const triggerCvUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        alert("File is too large. Max 5MB.");
        return;
      }
      if (!file.name.endsWith(".pdf") && !file.name.endsWith(".doc") && !file.name.endsWith(".docx")) {
        alert("Please upload a PDF or Word document.");
        return;
      }

      setIsUploadingCv(true);
      setCvUploadError(null);

      try {
        const telegramId = user?.id || Date.now();
        const fileExt = file.name.split(".").pop();
        const fileName = `${telegramId}-${Date.now()}.${fileExt}`;
        const filePath = `cvs/${fileName}`;

        console.log("[CV Upload] Uploading to resumes storage...");
        const { error: uploadError } = await supabase.storage
          .from("resumes")
          .upload(filePath, file);

        if (uploadError) {
          throw new Error(uploadError.message);
        }

        const { data: publicUrlData } = supabase.storage
          .from("resumes")
          .getPublicUrl(filePath);

        const cvUrl = publicUrlData.publicUrl;
        console.log("[CV Upload] Success! Public URL:", cvUrl);

        // Update profile in DB via Edge Function
        await updateCv({ initData, cvUrl });

        // Refresh profile state
        await fetchProfile();
        
        if (typeof window !== "undefined" && (window as any).Telegram?.WebApp) {
          (window as any).Telegram.WebApp.showAlert("CV uploaded successfully!");
        } else {
          alert("CV uploaded successfully!");
        }
      } catch (err: any) {
        console.error("Error uploading CV:", err);
        setCvUploadError(err.message || "Failed to upload CV");
        if (typeof window !== "undefined" && (window as any).Telegram?.WebApp) {
          (window as any).Telegram.WebApp.showAlert(err.message || "Failed to upload CV");
        } else {
          alert(err.message || "Failed to upload CV");
        }
      } finally {
        setIsUploadingCv(false);
      }
    }
  };

  const handleShareContact = async () => {
    try {
      const tg = (window as any).Telegram?.WebApp;
      if (tg && tg.requestContact) {
        tg.requestContact(async (shared: boolean, data: any) => {
          if (shared) {
            let phone = data?.contact?.phone_number || data?.phone_number || "";
            if (phone && !phone.startsWith("+")) {
              phone = "+" + phone;
            }
            if (profile?.telegram_id) {
              setIsLoading(true);
              try {
                const { error } = await supabase
                  .from("profiles")
                  .update({ contact_shared: true, phone_number: phone })
                  .eq("telegram_id", profile.telegram_id);
                if (error) throw error;
                await fetchProfile();
                tg.showAlert("Phone number shared successfully!");
              } catch (err: any) {
                console.error("Error updating phone:", err);
                tg.showAlert("Failed to save phone number.");
              } finally {
                setIsLoading(false);
              }
            }
          }
        });
      } else {
        alert("This feature is only available inside Telegram.");
      }
    } catch (e) {
      console.warn("Telegram SDK requestContact error:", e);
    }
  };

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
          background: "transparent",
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
                background: "var(--surface-elevated)",
                border: "1px solid var(--border)",
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
                  fontSize: 13, fontWeight: 600, color: "var(--brand)",
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
              {(() => {
                const sections = getCompletionSections(profile);
                const score = getCompletionScore(sections);
                const incomplete = sections.filter((s) => !s.done);
                const isFullyDone = score === 100;
                return (
                  <>
                    {/* ── Avatar / name card ── */}
                    <div
                      style={{
                        background: "linear-gradient(135deg, var(--surface-elevated) 0%, var(--card) 100%)",
                        border: "1px solid rgba(5,150,105,0.15)",
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
                            background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 22, fontWeight: 800, color: "#0A0F1E",
                            flexShrink: 0,
                            boxShadow: "0 4px 12px rgba(5,150,105,0.2)",
                          }}
                        >
                          {profile.gender === "female" ? (
                            <svg width="34" height="34" viewBox="0 0 40 40" fill="none">
                              <circle cx="20" cy="11" r="7" fill="#0A0F1E" />
                              <path d="M20 18v3M12 27c0-3.314 3.582-6 8-6s8 2.686 8 6" stroke="#0A0F1E" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                              <path d="M14 33c0 0 1.5-4 6-4s6 4 6 4" stroke="#0A0F1E" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                              <ellipse cx="20" cy="33" rx="6" ry="3.5" fill="rgba(10,15,30,0.25)"/>
                            </svg>
                          ) : profile.gender === "male" ? (
                            <svg width="34" height="34" viewBox="0 0 40 40" fill="none">
                              <circle cx="20" cy="11" r="7" fill="#0A0F1E" />
                              <path d="M8 38c0-6.627 5.373-12 12-12s12 5.373 12 12" stroke="#0A0F1E" strokeWidth="3" strokeLinecap="round" fill="none"/>
                            </svg>
                          ) : (
                            getInitials(profile.full_name)
                          )}
                        </div>
                        <div>
                          <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)", marginBottom: 2 }}>
                            {profile.full_name}
                          </h2>
                          <p style={{ fontSize: 13, color: "var(--brand)", marginBottom: 6, fontWeight: 600 }}>
                            Age: {profile.age} · {profile.willing_to_relocate ? "Willing to relocate" : "Local only"}
                          </p>
                          <span
                            style={{
                              fontSize: 11, fontWeight: 600,
                              color: isFullyDone ? "var(--success)" : "var(--warning, #F59E0B)",
                              background: isFullyDone ? "rgba(74,222,128,0.08)" : "rgba(245,158,11,0.08)",
                              border: isFullyDone ? "1px solid rgba(74,222,128,0.2)" : "1px solid rgba(245,158,11,0.25)",
                              borderRadius: 100, padding: "3px 10px",
                              display: "inline-flex", alignItems: "center", gap: 4
                            }}
                          >
                            {isFullyDone ? (
                              <><CheckCircle size={10} /> Profile Complete</>
                            ) : (
                              <><AlertCircle size={10} /> {score}% Complete</>
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Settings button */}
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setSettingsOpen(true)}
                        style={{
                          width: 38, height: 38, borderRadius: 12,
                          background: "var(--surface-elevated)",
                          border: "1px solid var(--border)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          cursor: "pointer",
                          flexShrink: 0,
                        }}
                      >
                        <Settings size={18} color="var(--text-secondary)" />
                      </motion.button>
                    </div>

                    {/* ── Profile Completion Progress Bar ── */}
                    <div
                      style={{
                        background: "var(--card)",
                        border: isFullyDone ? "1px solid rgba(74,222,128,0.2)" : "1px solid rgba(245,158,11,0.2)",
                        borderRadius: 16,
                        padding: 16,
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
                          Profile Strength
                        </span>
                        <span style={{
                          fontSize: 13, fontWeight: 800,
                          color: isFullyDone ? "var(--success)" : "var(--brand)",
                        }}>
                          {score}%
                        </span>
                      </div>

                      {/* Track */}
                      <div style={{ height: 8, background: "var(--surface-elevated)", borderRadius: 100, overflow: "hidden" }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${score}%` }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                          style={{
                            height: "100%",
                            borderRadius: 100,
                            background: isFullyDone
                              ? "linear-gradient(90deg, #4ADE80 0%, #22C55E 100%)"
                              : "linear-gradient(90deg, #059669 0%, #F59E0B 100%)",
                          }}
                        />
                      </div>

                    </div>

                    {/* ── Incomplete section nudge cards ── */}
                    {incomplete.length > 0 && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>
                          Pending
                        </p>
                        {incomplete.map((s) => {
                          const isCv = s.key === "cv";
                          return (
                            <motion.div
                              key={s.key}
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              whileTap={isCv ? { scale: 0.98 } : undefined}
                              onClick={isCv ? triggerCvUpload : undefined}
                              style={{
                                background: isCv ? "rgba(5,150,105,0.06)" : "var(--surface-elevated)",
                                border: isCv ? "1px solid rgba(5,150,105,0.3)" : "1px solid rgba(245,158,11,0.15)",
                                borderRadius: 10,
                                padding: "11px 14px",
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                cursor: isCv ? "pointer" : "default",
                                transition: "all 0.2s ease",
                              }}
                            >
                              <div style={{
                                width: 6, height: 6, borderRadius: "50%",
                                background: isCv ? "var(--brand)" : "#F59E0B",
                                flexShrink: 0,
                              }} />
                              <div style={{ flex: 1 }}>
                                <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)" }}>
                                  {s.label}
                                </p>
                                {isCv && (
                                  <p style={{ fontSize: 11, color: "var(--brand)", fontWeight: 600, marginTop: 2 }}>
                                    {isUploadingCv ? "Uploading CV..." : "Tap to upload CV"}
                                  </p>
                                )}
                              </div>
                              <span style={{
                                fontSize: 11, fontWeight: 700,
                                color: isCv ? "var(--brand)" : "#F59E0B",
                                flexShrink: 0,
                              }}>
                                +{s.weight}%
                              </span>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </>
                );
              })()}

              {/* Privacy Notice */}
              <AnimatePresence mode="wait">
                {privacyDismissed ? (
                  /* Collapsed — just a small "i" button */
                  <motion.div
                    key="info-btn"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.18 }}
                    style={{ display: "flex", justifyContent: "flex-end" }}
                  >
                    <motion.button
                      whileTap={{ scale: 0.88 }}
                      onClick={() => restorePrivacy()}
                      title="Show privacy notice"
                      style={{
                        width: 28, height: 28,
                        borderRadius: "50%",
                        background: "rgba(5,150,105,0.12)",
                        border: "1px solid rgba(5,150,105,0.35)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer",
                        flexShrink: 0,
                      }}
                    >
                      <HelpCircle size={14} color="var(--brand)" />
                    </motion.button>
                  </motion.div>
                ) : (
                  /* Expanded — full notice with OK button */
                  <motion.div
                    key="privacy-box"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                    style={{
                      background: "rgba(5,150,105,0.08)",
                      border: "1px dashed rgba(5,150,105,0.3)",
                      borderRadius: 16,
                      padding: "14px 16px",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12,
                    }}
                  >
                    <div style={{ marginTop: 2, background: "rgba(5,150,105,0.15)", borderRadius: "50%", padding: 6, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <ShieldCheck size={18} color="var(--brand)" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: "var(--brand)", marginBottom: 4 }}>
                        Only Visible to Employers
                      </p>
                      <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.4 }}>
                        Your profile and contact info are strictly confidential. They are only viewable by verified companies, and never by other job seekers.
                      </p>
                    </div>
                    {/* OK button */}
                    <motion.button
                      whileTap={{ scale: 0.88 }}
                      onClick={() => dismissPrivacy()}
                      style={{
                        flexShrink: 0,
                        alignSelf: "center",
                        height: 26,
                        padding: "0 10px",
                        borderRadius: 100,
                        background: "rgba(5,150,105,0.18)",
                        border: "1px solid rgba(5,150,105,0.45)",
                        color: "var(--brand)",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                        fontFamily: "inherit",
                        letterSpacing: "0.03em",
                      }}
                    >
                      OK
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>

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
                  onClick={() => {
                    if (!profile.phone_number) {
                      handleShareContact();
                    }
                  }}
                  style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "14px 0",
                    borderBottom: "1px solid var(--border)",
                    cursor: !profile.phone_number ? "pointer" : "default",
                  }}
                >
                  <span style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}>
                    <Phone size={14} color="var(--brand)" /> Phone
                  </span>
                  <span style={{ 
                    fontSize: 13, 
                    color: profile.phone_number ? "var(--text-primary)" : "var(--brand)", 
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: 6
                  }}>
                    {profile.phone_number ? profile.phone_number : (
                      <>
                        <RefreshCw size={12} /> Share Now
                      </>
                    )}
                  </span>
                </div>

                {/* Location */}
                <div
                  style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "14px 0",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <span style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}>
                    <MapPin size={14} color="var(--brand)" /> Location
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
                    borderBottom: "1px solid var(--border)",
                    gap: 8
                  }}
                >
                  <span style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}>
                    <Briefcase size={14} color="var(--brand)" /> Roles & Experience
                  </span>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, paddingLeft: 22 }}>
                    {profile.selected_categories.map((cat) => {
                      const exp = profile.experience_levels[cat] || "Entry Level";
                      return (
                        <div
                          key={cat}
                          style={{
                            background: "var(--surface-elevated)",
                            border: "1px solid rgba(255,255,255,0.06)",
                            borderRadius: 10,
                            padding: "6px 10px",
                            fontSize: 12,
                            color: "var(--text-primary)",
                          }}
                        >
                          <span style={{ fontWeight: 700 }}>{cat}</span>
                          <span style={{ color: "var(--brand)", marginLeft: 6 }}>{exp}</span>
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
                    <FileText size={14} color="var(--brand)" /> Resume (CV)
                  </span>
                  <span style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                    {isUploadingCv ? (
                      <span style={{ color: "var(--brand)", display: "flex", alignItems: "center", gap: 4 }}>
                        <Loader2 size={12} className="animate-spin" /> Uploading...
                      </span>
                    ) : profile.cv_url ? (
                      <>
                        <CheckCircle size={12} color="var(--success)" />
                        <span style={{ textDecoration: "underline", color: "var(--brand)", cursor: "pointer" }} onClick={() => profile.cv_url && window.open(profile.cv_url, "_blank")}>
                          View CV
                        </span>
                        <span style={{ color: "var(--text-muted)", fontSize: 11, marginLeft: 2, marginRight: 2 }}>|</span>
                        <span style={{ textDecoration: "underline", color: "var(--text-secondary)", cursor: "pointer" }} onClick={triggerCvUpload}>
                          Change
                        </span>
                      </>
                    ) : (
                      <span style={{ textDecoration: "underline", color: "var(--brand)", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }} onClick={triggerCvUpload}>
                        <Upload size={12} /> Upload CV
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
        <input
          type="file"
          ref={fileInputRef}
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
      </div>

      {/* ── Settings Bottom Sheet ── */}
      <AnimatePresence>
        {settingsOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="settings-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSettingsOpen(false)}
              style={{
                position: "fixed", inset: 0, zIndex: 100,
                background: "rgba(0,0,0,0.5)",
                backdropFilter: "blur(4px)",
              }}
            />

            {/* Sheet */}
            <motion.div
              key="settings-sheet"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              style={{
                position: "fixed", bottom: 0, left: 0, right: 0,
                zIndex: 101,
                background: "var(--surface)",
                borderRadius: "24px 24px 0 0",
                padding: "0 0 env(safe-area-inset-bottom, 24px)",
                boxShadow: "0 -8px 40px rgba(0,0,0,0.18)",
                maxWidth: 480,
                margin: "0 auto",
              }}
            >
              {/* Handle bar */}
              <div style={{
                width: 40, height: 4, borderRadius: 100,
                background: "var(--border)", margin: "12px auto 0",
              }} />

              {/* Header */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "16px 20px 8px",
                borderBottom: "1px solid var(--border)",
              }}>
                <div>
                  <p style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)" }}>Settings</p>
                  <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>Customize your experience</p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.88 }}
                  onClick={() => setSettingsOpen(false)}
                  style={{
                    width: 34, height: 34, borderRadius: "50%",
                    background: "var(--surface-elevated)",
                    border: "1px solid var(--border)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", flexShrink: 0,
                  }}
                >
                  <X size={16} color="var(--text-secondary)" />
                </motion.button>
              </div>

              {/* Settings options */}
              <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 8 }}>

                {/* Appearance section label */}
                <p style={{
                  fontSize: 11, fontWeight: 700, color: "var(--text-muted)",
                  textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4,
                }}>
                  Appearance
                </p>

                {/* Dark / Light toggle row */}
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  background: "var(--surface-elevated)",
                  border: "1px solid var(--border)",
                  borderRadius: 16, padding: "14px 16px",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {/* Icon that switches with theme */}
                    <div style={{
                      width: 38, height: 38, borderRadius: 12,
                      background: isDark ? "rgba(99,102,241,0.12)" : "rgba(245,158,11,0.12)",
                      border: `1px solid ${isDark ? "rgba(99,102,241,0.25)" : "rgba(245,158,11,0.25)"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      {isDark
                        ? <Moon size={18} color="#818CF8" />
                        : <Sun size={18} color="#F59E0B" />
                      }
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>
                        {isDark ? "Dark Mode" : "Light Mode"}
                      </p>
                      <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
                        {isDark ? "Easy on the eyes at night" : "Bright and clear display"}
                      </p>
                    </div>
                  </div>

                  {/* Toggle switch */}
                  <motion.button
                    onClick={() => applyTheme(!isDark)}
                    style={{
                      width: 50, height: 28, borderRadius: 100,
                      background: isDark ? "var(--brand)" : "var(--surface)",
                      border: `1.5px solid ${isDark ? "var(--brand)" : "var(--border)"}`,
                      position: "relative", cursor: "pointer", flexShrink: 0,
                      transition: "background 0.25s ease, border-color 0.25s ease",
                    }}
                  >
                    <motion.div
                      layout
                      animate={{ x: isDark ? 22 : 2 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      style={{
                        position: "absolute", top: 3,
                        width: 20, height: 20, borderRadius: "50%",
                        background: isDark ? "#fff" : "var(--text-muted)",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                      }}
                    />
                  </motion.button>
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </LazyMotion>
  );
}
