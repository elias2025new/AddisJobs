"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion, LazyMotion, domAnimation } from "framer-motion";
import {
  ArrowLeft, User, Phone, Briefcase, GraduationCap,
  Languages, MapPin, AlertTriangle, CheckCircle, ChevronDown
} from "lucide-react";
import { Job, ExperienceLevel, JobCategory } from "@/data/jobs";
import { MOCK_PROFILE, JobSeekerProfile } from "@/data/profile";

type ProfileStep = "check" | "build" | "qualGate";

interface ProfileCheckScreenProps {
  job: Job;
  onBack: () => void;
  onProceed: (profile: JobSeekerProfile) => void;
}

const EXPERIENCE_LEVELS: ExperienceLevel[] = ["Entry Level", "Mid Level", "Senior Level"];
const CATEGORIES: JobCategory[] = [
  "Waiter", "Chef", "Receptionist", "Barista",
  "Housekeeper", "Security", "Cashier", "Manager",
  "Marketing & Sales", "F&B", "Finance", "Cost Control",
  "Accountant", "Bellboy", "Store Keeper", "Phone Operator",
  "Maintenance",
];
const EDUCATION_OPTIONS = [
  "Grade 12 / High School",
  "Certificate (TVET)",
  "Diploma",
  "BA / Bachelor's Degree",
  "Master's Degree",
];
const NEIGHBORHOODS = [
  "Bole", "Kazanchis", "Megenagna", "CMC", "Sarbet",
  "Piazza", "Taitu", "4 Kilo", "Gerji", "Ayat",
  "Mexico", "Lebu", "Goro", "Summit", "Lideta",
];

import { useTelegram } from "@/hooks/useTelegram";
import { fetchProfile } from "@/lib/api";

export default function ProfileCheckScreen({ job, onBack, onProceed }: ProfileCheckScreenProps) {
  const shouldReduceMotion = useReducedMotion();
  const { user, initData } = useTelegram();
  const [profile, setProfile] = useState<JobSeekerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [step, setStep] = useState<ProfileStep>("check");

  // Profile builder state
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    category: "Waiter" as JobCategory,
    experience: "Entry Level" as ExperienceLevel,
    education: "",
    languages: [] as string[],
    neighborhood: "Bole",
    willingToRelocate: false,
  });

  const updateForm = (key: string, value: unknown) =>
    setForm((f) => ({ ...f, [key]: value }));

  useEffect(() => {
    async function loadAndCheckProfile() {
      // No real Telegram session (browser dev mode) — fallback to mock
      if (!initData) {
        const mock = MOCK_PROFILE;
        setProfile(mock);
        checkExperience(mock);
        setIsLoading(false);
        return;
      }

      try {
        const result = await fetchProfile(initData);

        if (!result.profile) {
          setStep("build");
        } else {
          // Resolve experience level for this job category, or fallback to the first selected category's experience
          const profileData = result.profile;
          const userExpMap = (profileData.experience_levels || {}) as Record<string, string>;
          const jobCat = job.category;
          const selectedCategories = (profileData.selected_categories || []) as string[];
          const userExp = userExpMap[jobCat] || userExpMap[selectedCategories[0]] || "Entry Level";

          const mappedProfile: JobSeekerProfile = {
            id: profileData.id as string,
            fullName: profileData.full_name as string,
            phone: (profileData.phone_number as string) || "Not Shared",
            telegramId: profileData.telegram_id as number,
            photoUrl: null,
            preferredCategory: (selectedCategories[0] as JobCategory) || "Waiter",
            experienceLevel: userExp as ExperienceLevel,
            education: "",
            languages: [],
            neighborhood: profileData.location as string,
            willingToRelocate: profileData.willing_to_relocate as boolean,
            hasProfile: true,
          };

          setProfile(mappedProfile);
          checkExperience(mappedProfile);
        }
      } catch (err) {
        console.error("Error loading profile:", err);
        setStep("build");
      } finally {
        setIsLoading(false);
      }
    }

    function checkExperience(prof: JobSeekerProfile) {
      const LEVEL_WEIGHTS = {
        "Entry Level": 1,
        "Mid Level": 2,
        "Senior Level": 3,
      };
      
      const reqWeight = LEVEL_WEIGHTS[job.requirements.experience] || 1;
      const userWeight = LEVEL_WEIGHTS[prof.experienceLevel] || 1;

      if (userWeight < reqWeight) {
        setStep("qualGate");
      } else {
        // Meets qualifications! Proceed immediately.
        onProceed(prof);
      }
    }

    loadAndCheckProfile();
  }, [user, job, onProceed]);

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100dvh",
          background: "transparent",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          style={{
            width: 40, height: 40, borderRadius: 12,
            border: "3px solid rgba(5,150,105,0.1)",
            borderTopColor: "var(--brand)",
          }}
        />
        <p style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 500 }}>
          Checking qualifications…
        </p>
      </div>
    );
  }

  if (step === "check") return null;

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
          background: "transparent",
          willChange: "transform",
          overflowY: "auto",
          overscrollBehavior: "contain",
          paddingBottom: 100,
        }}
      >
        {/* Header */}
        <div
          className="safe-screen-top"
          style={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            background: "rgba(10,15,30,0.96)",
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
              {step === "qualGate" ? "Before You Apply" : "Create Your Profile"}
            </p>
            <h1 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>
              {step === "qualGate" ? "Qualification Check" : "Build Your Profile"}
            </h1>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* ── QUALIFICATION GATE ── */}
          {step === "qualGate" && (
            <motion.div
              key="qualGate"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25 }}
              style={{ padding: 20 }}
            >
              {/* Warning icon */}
              <div style={{ textAlign: "center", marginBottom: 24, marginTop: 16 }}>
                <div
                  style={{
                    width: 72, height: 72, borderRadius: "50%",
                    background: "rgba(245,158,11,0.1)",
                    border: "2px solid rgba(245,158,11,0.25)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 14px",
                  }}
                >
                  <AlertTriangle size={32} color="#FCD34D" />
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)", marginBottom: 8 }}>
                  You might not meet all requirements
                </h2>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6, maxWidth: 300, margin: "0 auto" }}>
                  This job asks for{" "}
                  <strong style={{ color: "var(--brand)" }}>{job.requirements.experience}</strong>{" "}
                  experience. Your profile shows{" "}
                  <strong style={{ color: "var(--text-primary)" }}>{profile?.experienceLevel || "Entry Level"}</strong>.
                </p>
              </div>

              {/* Comparison cards */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
                <div
                  style={{
                    background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)",
                    borderRadius: 14, padding: 14,
                  }}
                >
                  <p style={{ fontSize: 10, color: "#FCA5A5", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>
                    Job Requires
                  </p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>
                    {job.requirements.experience}
                  </p>
                </div>
                <div
                  style={{
                    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 14, padding: 14,
                  }}
                >
                  <p style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>
                    Your Level
                  </p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>
                    {profile?.experienceLevel || "Entry Level"}
                  </p>
                </div>
              </div>

              <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", marginBottom: 24, lineHeight: 1.5 }}>
                Many employers consider passionate candidates even if they don't meet every requirement. Do you want to apply anyway?
              </p>

              {/* Action buttons */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <motion.button
                  id="apply-anyway-btn"
                  className="btn-primary"
                  whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
                  onClick={() => profile && onProceed(profile)}
                  style={{ willChange: "transform" }}
                >
                  Apply Anyway
                </motion.button>
                <motion.button
                  id="go-back-btn"
                  className="btn-secondary"
                  whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
                  onClick={onBack}
                >
                  Go Back
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ── PROFILE BUILDER ── */}
          {step === "build" && (
            <motion.div
              key="build"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25 }}
              style={{ padding: 20 }}
            >
              {/* Intro */}
              <div
                style={{
                  background: "rgba(5,150,105,0.06)", border: "1px solid rgba(5,150,105,0.12)",
                  borderRadius: 14, padding: "14px 16px", marginBottom: 24,
                  display: "flex", alignItems: "flex-start", gap: 10,
                }}
              >
                <CheckCircle size={16} color="var(--brand)" style={{ flexShrink: 0, marginTop: 2 }} />
                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  Create a quick profile so employers can reach you. It takes less than 2 minutes.
                </p>
              </div>

              {/* ── Form fields ── */}
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

                {/* Full Name */}
                <FieldBlock label="Full Name" icon={<User size={14} />}>
                  <input
                    id="profile-name"
                    className="input-base"
                    placeholder="e.g. Tigist Haile"
                    value={form.fullName}
                    onChange={(e) => updateForm("fullName", e.target.value)}
                  />
                </FieldBlock>

                {/* Phone */}
                <FieldBlock label="Phone Number" icon={<Phone size={14} />}>
                  <input
                    id="profile-phone"
                    className="input-base"
                    placeholder="+251 91 234 5678"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => updateForm("phone", e.target.value)}
                  />
                </FieldBlock>

                {/* Job Category */}
                <FieldBlock label="Job Category" icon={<Briefcase size={14} />}>
                  <div style={{ position: "relative" }}>
                    <select
                      id="profile-category"
                      className="input-base"
                      value={form.category}
                      onChange={(e) => updateForm("category", e.target.value)}
                      style={{ appearance: "none", paddingRight: 40 }}
                    >
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <ChevronDown size={16} color="var(--text-muted)" style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                  </div>
                </FieldBlock>

                {/* Experience */}
                <FieldBlock label="Experience Level" icon={<Briefcase size={14} />}>
                  <div style={{ position: "relative" }}>
                    <select
                      id="profile-experience"
                      className="input-base"
                      value={form.experience}
                      onChange={(e) => updateForm("experience", e.target.value as ExperienceLevel)}
                      style={{ appearance: "none", paddingRight: 40 }}
                    >
                      {EXPERIENCE_LEVELS.map((e) => <option key={e} value={e}>{e}</option>)}
                    </select>
                    <ChevronDown size={16} color="var(--text-muted)" style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                  </div>
                </FieldBlock>

                {/* Education */}
                <FieldBlock label="Education Level" icon={<GraduationCap size={14} />}>
                  <div style={{ position: "relative" }}>
                    <select
                      id="profile-education"
                      className="input-base"
                      value={form.education}
                      onChange={(e) => updateForm("education", e.target.value)}
                      style={{ appearance: "none", paddingRight: 40 }}
                    >
                      <option value="">Select education level</option>
                      {EDUCATION_OPTIONS.map((e) => <option key={e} value={e}>{e}</option>)}
                    </select>
                    <ChevronDown size={16} color="var(--text-muted)" style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                  </div>
                </FieldBlock>

                {/* Languages */}
                <FieldBlock label="Languages Spoken" icon={<Languages size={14} />}>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {["Amharic", "English", "Oromiffa", "Tigrinya", "Somali"].map((lang) => {
                      const active = form.languages.includes(lang);
                      return (
                        <motion.button
                          key={lang}
                          whileTap={{ scale: 0.95 }}
                          onClick={() =>
                            updateForm(
                              "languages",
                              active
                                ? form.languages.filter((l) => l !== lang)
                                : [...form.languages, lang]
                            )
                          }
                          style={{
                            padding: "7px 14px", borderRadius: 100,
                            fontSize: 13, fontWeight: 600, cursor: "pointer",
                            background: active ? "rgba(5,150,105,0.15)" : "rgba(255,255,255,0.04)",
                            border: active ? "1px solid rgba(5,150,105,0.3)" : "1px solid rgba(255,255,255,0.08)",
                            color: active ? "var(--brand)" : "var(--text-secondary)",
                            fontFamily: "inherit",
                          }}
                        >
                          {lang}
                        </motion.button>
                      );
                    })}
                  </div>
                </FieldBlock>

                {/* Neighborhood */}
                <FieldBlock label="Your Neighborhood" icon={<MapPin size={14} />}>
                  <div style={{ position: "relative" }}>
                    <select
                      id="profile-neighborhood"
                      className="input-base"
                      value={form.neighborhood}
                      onChange={(e) => updateForm("neighborhood", e.target.value)}
                      style={{ appearance: "none", paddingRight: 40 }}
                    >
                      {NEIGHBORHOODS.map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                    <ChevronDown size={16} color="var(--text-muted)" style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                  </div>
                </FieldBlock>

                {/* Relocate toggle */}
                <div
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 12, padding: "14px 16px",
                  }}
                >
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 2 }}>
                      Willing to Relocate?
                    </p>
                    <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      Apply to jobs outside your neighborhood
                    </p>
                  </div>
                  <motion.button
                    id="relocate-toggle"
                    whileTap={{ scale: 0.9 }}
                    onClick={() => updateForm("willingToRelocate", !form.willingToRelocate)}
                    style={{
                      width: 48, height: 28, borderRadius: 100,
                      background: form.willingToRelocate ? "var(--brand)" : "rgba(255,255,255,0.1)",
                      border: "none", cursor: "pointer", position: "relative",
                      flexShrink: 0, transition: "background 0.2s",
                    }}
                  >
                    <motion.div
                      animate={{ x: form.willingToRelocate ? 20 : 2 }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      style={{
                        position: "absolute", top: 3,
                        width: 22, height: 22, borderRadius: "50%", background: "white",
                        willChange: "transform",
                      }}
                    />
                  </motion.button>
                </div>

              </div>

              {/* Submit */}
              <div style={{ marginTop: 24 }}>
                <motion.button
                  id="save-profile-btn"
                  className="btn-primary"
                  whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
                  onClick={() => {
                    const newProfile: JobSeekerProfile = {
                      id: "profile-new",
                      fullName: form.fullName || "New User",
                      phone: form.phone,
                      telegramId: 0,
                      photoUrl: null,
                      preferredCategory: form.category,
                      experienceLevel: form.experience,
                      education: form.education,
                      languages: form.languages,
                      neighborhood: form.neighborhood,
                      willingToRelocate: form.willingToRelocate,
                      hasProfile: true,
                    };
                    onProceed(newProfile);
                  }}
                  style={{ willChange: "transform" }}
                >
                  Save Profile & Continue →
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </LazyMotion>
  );
}

function FieldBlock({
  label, icon, children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
        <span style={{ color: "var(--brand)" }}>{icon}</span>
        <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
          {label}
        </label>
      </div>
      {children}
    </div>
  );
}
