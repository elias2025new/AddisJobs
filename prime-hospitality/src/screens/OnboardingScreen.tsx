"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion, LazyMotion, domAnimation } from "framer-motion";
import { ArrowLeft, UploadCloud, CheckCircle, Smartphone, Lock, AlertTriangle } from "lucide-react";
import { useOnboarding, OnboardingStep } from "@/hooks/useOnboarding";
import { JobCategory } from "@/data/jobs";
import { useTelegram } from "@/hooks/useTelegram";

// --- Types ---
interface StepProps {
  state: ReturnType<typeof useOnboarding>["state"];
  updateState: ReturnType<typeof useOnboarding>["updateState"];
  onNext: () => void;
}

// --- Main Component ---
export default function OnboardingScreen({ onComplete }: { onComplete: () => void }) {
  const { state, updateState, setStep, submitProfile } = useOnboarding();
  const shouldReduceMotion = useReducedMotion();
  const [direction, setDirection] = useState(1); // 1 for forward, -1 for backward

  const goNext = (targetStep: OnboardingStep) => {
    setDirection(1);
    setStep(targetStep);
  };

  const goBack = (targetStep: OnboardingStep) => {
    setDirection(-1);
    setStep(targetStep);
  };

  const handleFinalSubmit = async () => {
    await submitProfile();
    // After submitProfile finishes, it sets the step to 6 internally on success
  };

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir < 0 ? "100%" : "-100%",
      opacity: 0,
    }),
  };

  return (
    <LazyMotion features={domAnimation}>
      <div style={{ position: "relative", width: "100%", height: "100dvh", background: "transparent", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        
        {/* Progress Bar (Hide on Step 6) */}
        {state.step < 6 && (
          <div style={{ position: "absolute", top: "env(safe-area-inset-top, 0px)", left: 0, right: 0, height: 4, background: "rgba(255,255,255,0.05)", zIndex: 50 }}>
            <motion.div
              initial={false}
              animate={{ width: `${(state.step / 5) * 100}%` }}
              transition={{ duration: 0.3 }}
              style={{ height: "100%", background: "var(--brand)" }}
            />
          </div>
        )}

        {/* Back Button (Hide on Step 1 and 6) */}
        {state.step > 1 && state.step < 6 && (
          <div style={{ position: "absolute", top: "max(72px, calc(env(safe-area-inset-top, 0px) + 32px))", left: 20, zIndex: 50 }}>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => goBack((state.step - 1) as OnboardingStep)}
              style={{
                width: 40, height: 40, borderRadius: 12,
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)",
                display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer"
              }}
            >
              <ArrowLeft size={20} color="var(--text-primary)" />
            </motion.button>
          </div>
        )}

        <div style={{ flex: 1, position: "relative" }}>
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={state.step}
              custom={direction}
              variants={shouldReduceMotion ? {} : variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "flex", flexDirection: "column", overflowY: "auto", paddingBottom: 40 }}
            >
              {state.step === 1 && <Step1_JobField state={state} updateState={updateState} onNext={() => goNext(2)} />}
              {state.step === 2 && <Step2_Contact state={state} updateState={updateState} onNext={() => goNext(3)} />}
              {state.step === 3 && <Step3_Experience state={state} updateState={updateState} onNext={() => goNext(4)} />}
              {state.step === 4 && <Step4_Personal state={state} updateState={updateState} onNext={() => goNext(5)} />}
              {state.step === 5 && <Step5_CV state={state} updateState={updateState} onNext={handleFinalSubmit} />}
              {state.step === 6 && <Step6_Success state={state} onNext={onComplete} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </LazyMotion>
  );
}

// --- Step 1: Job Field Selection ---
const JOB_CATEGORIES_DATA = [
  { label: "Waiter", emoji: "🍽️" },
  { label: "Chef", emoji: "👨‍🍳" },
  { label: "Barista", emoji: "☕" },
  { label: "Receptionist", emoji: "🛎️" },
  { label: "Housekeeper", emoji: "🧹" },
  { label: "Security", emoji: "🛡️" },
  { label: "Cashier", emoji: "💳" },
  { label: "Cook", emoji: "🍳" },
  { label: "Delivery", emoji: "🛵" },
  { label: "Driver", emoji: "🚗" },
  { label: "Marketing & Sales", emoji: "📈" },
  { label: "F&B", emoji: "🍹" },
  { label: "Finance", emoji: "💰" },
  { label: "Cost Control", emoji: "📊" },
  { label: "Accountant", emoji: "🧮" },
  { label: "Bellboy", emoji: "🧳" },
  { label: "Phone Operator", emoji: "📞" },
  { label: "Maintenance", emoji: "🔧" },
  { label: "IT Officer", emoji: "💻" },
  { label: "Spa Attendant", emoji: "💆" },
  { label: "Gym Trainer", emoji: "🏋️" },
  { label: "Banquet", emoji: "🥂" },
  { label: "Other", emoji: "✨" },
];

function Step1_JobField({ state, updateState, onNext }: StepProps) {
  const [shakeId, setShakeId] = useState<string | null>(null);
  const [otherValue, setOtherValue] = useState("");

  const toggleCategory = (label: string) => {
    const isSelected = state.selectedCategories.includes(label);
    if (isSelected) {
      updateState({ selectedCategories: state.selectedCategories.filter(c => c !== label) });
    } else {
      if (state.selectedCategories.length >= 3) {
        setShakeId(label);
        setTimeout(() => setShakeId(null), 500);
        return;
      }
      updateState({ selectedCategories: [...state.selectedCategories, label] });
    }
  };

  return (
    <div style={{ padding: "130px 20px 40px", flex: 1, display: "flex", flexDirection: "column" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", marginBottom: 8, lineHeight: 1.2 }}>
        What type of work are you looking for?
      </h1>
      <p style={{ fontSize: 15, color: "var(--text-secondary)", marginBottom: 32 }}>Select up to 3 categories.</p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px 18px", marginBottom: "auto" }}>
        {JOB_CATEGORIES_DATA.map((cat) => {
          const selectedIndex = state.selectedCategories.indexOf(cat.label);
          const isSelected = selectedIndex !== -1;
          const isShaking = shakeId === cat.label;
          return (
            <motion.button
              key={cat.label}
              whileTap={{ scale: 0.95 }}
              animate={isShaking ? { x: [-5, 5, -5, 5, 0] } : {}}
              transition={isShaking ? { duration: 0.3 } : {}}
              onClick={() => toggleCategory(cat.label)}
              style={{
                background: "none",
                border: "none",
                padding: "6px 0",
                display: "inline-flex",
                alignItems: "center",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              <span style={{
                fontSize: 16,
                fontWeight: isSelected ? 700 : 500,
                color: isSelected ? "var(--brand)" : "var(--text-secondary)",
                transition: "color 0.2s, font-weight 0.2s",
                display: "inline-flex",
                alignItems: "center",
              }}>
                {cat.label}
                {isSelected && (
                  <span style={{
                    marginLeft: 6,
                    fontSize: 11,
                    fontWeight: 800,
                    background: "var(--brand)",
                    color: "#FFFFFF",
                    borderRadius: "50%",
                    width: 18,
                    height: 18,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    {selectedIndex + 1}
                  </span>
                )}
              </span>
            </motion.button>
          );
        })}
      </div>

      {shakeId && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: "var(--warning)", textAlign: "center", marginTop: 16, fontSize: 14 }}>
          You can only pick up to 3.
        </motion.p>
      )}

      {state.selectedCategories.includes("Other") && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          style={{ marginTop: 16 }}
        >
          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Please Specify
          </p>
          <input
            className="input-base"
            placeholder="e.g. Musician"
            value={otherValue}
            onChange={(e) => setOtherValue(e.target.value)}
          />
        </motion.div>
      )}

      {state.selectedCategories.length > 0 && (
        <motion.button
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="btn-primary"
          style={{ marginTop: 24 }}
          onClick={() => {
            if (state.selectedCategories.includes("Other") && otherValue.trim()) {
              const updated = state.selectedCategories.map(c => c === "Other" ? otherValue.trim() : c);
              updateState({ selectedCategories: updated });
            }
            onNext();
          }}
        >
          Continue
        </motion.button>
      )}
    </div>
  );
}

// --- Step 2: Share Contact ---
function Step2_Contact({ state, updateState, onNext }: StepProps) {
  const { isReady } = useTelegram();

  const handleYes = () => {
    try {
      const tg = (window as any).Telegram?.WebApp;
      if (tg && tg.requestContact) {
        tg.requestContact((shared: boolean, data: any) => {
          if (shared) {
            let phone = data?.contact?.phone_number || data?.phone_number || "";
            if (phone && !phone.startsWith("+")) {
              phone = "+" + phone;
            }
            updateState({ contactShared: true, phoneNumber: phone });
          } else {
            // User dismissed the native prompt — treat as declined
            updateState({ contactShared: false, phoneNumber: "" });
          }
          onNext();
        });
        return;
      }
    } catch (e) {
      console.warn("Telegram SDK requestContact error:", e);
    }

    // Fallback for browser/dev environment
    updateState({ contactShared: true, phoneNumber: "" });
    onNext();
  };

  const handleNo = () => {
    updateState({ contactShared: false, phoneNumber: "" });
    onNext();
  };

  return (
    <div style={{ padding: "130px 20px 40px", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
      <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(5,150,105,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
        <Smartphone size={36} color="var(--brand)" />
      </div>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)", marginBottom: 12, lineHeight: 1.2 }}>
        Can we share your contact with employers?
      </h1>
      <p style={{ fontSize: 15, color: "var(--text-secondary)", marginBottom: 40, maxWidth: 300 }}>
        This helps employers reach you faster when they want to hire you.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%" }}>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleYes}
          style={{
            padding: 20, borderRadius: 16, background: "var(--card)", border: "1px solid var(--brand)",
            display: "flex", alignItems: "center", gap: 16, cursor: "pointer", textAlign: "left"
          }}
        >
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--brand)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CheckCircle size={20} color="var(--navy)" />
          </div>
          <div>
            <p style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>Yes, share my contact</p>
            <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>Employers can reach you directly</p>
          </div>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleNo}
          style={{
            padding: 20, borderRadius: 16, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)",
            display: "flex", alignItems: "center", gap: 16, cursor: "pointer", textAlign: "left"
          }}
        >
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Lock size={20} color="var(--text-muted)" />
          </div>
          <div>
            <p style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>No, keep it private</p>
            <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>You will be contacted through the app only</p>
          </div>
        </motion.button>
      </div>
    </div>
  );
}

// --- Step 3: Experience Level ---
const EXPERIENCE_OPTIONS = ["No Experience", "Less than 1 year", "1 to 2 years", "3 to 5 years", "5+ years"];

function Step3_Experience({ state, updateState, onNext }: StepProps) {
  const handleSelect = (category: string, level: string) => {
    updateState({
      experienceLevels: { ...state.experienceLevels, [category]: level }
    });
  };

  const allSelected = state.selectedCategories.every(cat => state.experienceLevels[cat]);

  return (
    <div style={{ padding: "130px 20px 40px", flex: 1, display: "flex", flexDirection: "column" }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)", marginBottom: 8, lineHeight: 1.2 }}>
        What is your experience level?
      </h1>
      <p style={{ fontSize: 15, color: "var(--text-secondary)", marginBottom: 32 }}>Select for each category.</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 24, marginBottom: "auto" }}>
        {state.selectedCategories.map(cat => (
          <div key={cat}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--brand)", marginBottom: 12 }}>{cat} Experience</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {EXPERIENCE_OPTIONS.map(level => {
                const isSelected = state.experienceLevels[cat] === level;
                return (
                  <motion.button
                    key={level}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelect(cat, level)}
                    style={{
                      padding: "14px 16px", borderRadius: 12,
                      background: isSelected ? "rgba(5,150,105,0.15)" : "var(--card)",
                      border: isSelected ? "1px solid var(--brand)" : "1px solid var(--border)",
                      color: isSelected ? "var(--brand)" : "var(--text-primary)",
                      fontWeight: isSelected ? 600 : 500,
                      textAlign: "left", fontSize: 15, cursor: "pointer"
                    }}
                  >
                    {level}
                  </motion.button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {allSelected && (
        <motion.button initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="btn-primary" style={{ marginTop: 24 }} onClick={onNext}>
          Continue
        </motion.button>
      )}
    </div>
  );
}

// --- Step 4: Personal Details ---
const ADDIS_NEIGHBORHOODS = ["Bole", "Kazanchis", "CMC", "Megenagna", "Sarbet", "Lebu", "Gerji", "Piassa", "Akaki", "Lideta", "Kirkos", "Kolfe", "Yeka", "Other"];

function Step4_Personal({ state, updateState, onNext }: StepProps) {
  const [ageError, setAgeError] = useState("");

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const capitalized = val.charAt(0).toUpperCase() + val.slice(1);
    updateState({ fullName: capitalized });
  };

  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "") {
      updateState({ age: "" });
      setAgeError("");
      return;
    }
    const num = parseInt(val, 10);
    if (isNaN(num)) return;
    updateState({ age: num });
    if (num < 16 || num > 60) setAgeError("Age must be between 16 and 60.");
    else setAgeError("");
  };

  const canProceed = state.fullName.length > 2 && state.age !== "" && state.age >= 16 && state.age <= 60 && state.location !== "" && state.gender !== "";

  return (
    <div style={{ padding: "130px 20px 40px", flex: 1, display: "flex", flexDirection: "column" }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)", marginBottom: 32, lineHeight: 1.2 }}>
        Tell us a bit about yourself
      </h1>

      <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: "auto" }}>
        
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8, textTransform: "uppercase" }}>Full Name</label>
          <input className="input-base" placeholder="E.g. Abebe Kebede" value={state.fullName} onChange={handleNameChange} />
        </div>

        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8, textTransform: "uppercase" }}>Age</label>
          <input type="number" className="input-base" placeholder="18" value={state.age} onChange={handleAgeChange} />
          {ageError && <p style={{ color: "var(--warning)", fontSize: 12, marginTop: 6 }}>{ageError}</p>}
        </div>

        {/* Gender Selector */}
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 12, textTransform: "uppercase" }}>Gender</label>
          <div style={{ display: "flex", gap: 12 }}>
            {(["male", "female"] as const).map((g) => {
              const isSelected = state.gender === g;
              return (
                <motion.button
                  key={g}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => updateState({ gender: g })}
                  style={{
                    flex: 1, padding: "16px 12px", borderRadius: 16, cursor: "pointer",
                    fontFamily: "inherit", display: "flex", flexDirection: "column",
                    alignItems: "center", gap: 10,
                    background: isSelected ? "rgba(5,150,105,0.12)" : "var(--card)",
                    border: isSelected ? "1.5px solid var(--brand)" : "1px solid var(--border)",
                  }}
                >
                  {/* SVG figure */}
                  {g === "male" ? (
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                      <circle cx="20" cy="11" r="7" fill={isSelected ? "#059669" : "#8B9BBE"} />
                      <path d="M8 38c0-6.627 5.373-12 12-12s12 5.373 12 12" stroke={isSelected ? "#059669" : "#8B9BBE"} strokeWidth="3" strokeLinecap="round" fill="none"/>
                    </svg>
                  ) : (
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                      <circle cx="20" cy="11" r="7" fill={isSelected ? "#059669" : "#8B9BBE"} />
                      <path d="M20 18v4M11 26c0-2.761 4.029-5 9-5s9 2.239 9 5" stroke={isSelected ? "#059669" : "#8B9BBE"} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                      <path d="M13 32c0 0 1.5-4 7-4s7 4 7 4" stroke={isSelected ? "#059669" : "#8B9BBE"} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                      <ellipse cx="20" cy="31" rx="7" ry="4" fill={isSelected ? "rgba(5,150,105,0.2)" : "rgba(139,155,190,0.15)"}/>
                    </svg>
                  )}
                  <span style={{
                    fontSize: 14, fontWeight: 700,
                    color: isSelected ? "var(--brand)" : "var(--text-secondary)",
                    textTransform: "capitalize",
                  }}>{g}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8, textTransform: "uppercase" }}>Location (Neighborhood)</label>
          <select className="input-base" style={{ appearance: "none" }} value={state.location} onChange={(e) => updateState({ location: e.target.value })}>
            <option value="">Select your area...</option>
            {ADDIS_NEIGHBORHOODS.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--card)", padding: 16, borderRadius: 16, border: "1px solid var(--border)" }}>
          <div>
            <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>Willing to relocate?</p>
            <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>Apply to jobs outside your area</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => updateState({ willingToRelocate: !state.willingToRelocate })}
            style={{ width: 48, height: 28, borderRadius: 100, background: state.willingToRelocate ? "var(--brand)" : "var(--text-muted)", border: "none", cursor: "pointer", position: "relative" }}
          >
            <motion.div
              animate={{ x: state.willingToRelocate ? 20 : 2 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              style={{ position: "absolute", top: 3, width: 22, height: 22, borderRadius: "50%", background: "white" }}
            />
          </motion.button>
        </div>

      </div>

      <motion.button className="btn-primary" style={{ marginTop: 24, opacity: canProceed ? 1 : 0.5 }} disabled={!canProceed} onClick={onNext}>
        Continue
      </motion.button>
    </div>
  );
}


// --- Step 5: CV Upload ---
function Step5_CV({ state, updateState, onNext }: StepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        alert("File is too large. Max 5MB.");
        return;
      }
      // Allowed types simplified for demo
      if (!file.name.endsWith(".pdf") && !file.name.endsWith(".doc") && !file.name.endsWith(".docx")) {
         alert("Please upload a PDF or Word document.");
         return;
      }
      updateState({ cvFile: file, cvUploaded: true });
    }
  };

  return (
    <div style={{ padding: "130px 20px 40px", flex: 1, display: "flex", flexDirection: "column" }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)", marginBottom: 8, lineHeight: 1.2 }}>
        Upload your CV
      </h1>
      <p style={{ fontSize: 15, color: "var(--text-secondary)", marginBottom: 32 }}>PDF or Word document. Max 5MB.</p>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <input type="file" ref={fileInputRef} style={{ display: "none" }} accept=".pdf,.doc,.docx" onChange={handleFileChange} />
        
        <motion.div
          whileTap={{ scale: 0.98 }}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: "2px dashed rgba(5,150,105,0.4)", borderRadius: 20, padding: 40,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            background: "rgba(5,150,105,0.05)", cursor: "pointer", minHeight: 200
          }}
        >
          {state.cvFile ? (
            <>
              <CheckCircle size={48} color="var(--success)" style={{ marginBottom: 16 }} />
              <p style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", textAlign: "center", wordBreak: "break-all" }}>{state.cvFile.name}</p>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 8 }}>Tap to change file</p>
            </>
          ) : (
            <>
              <UploadCloud size={48} color="var(--brand)" style={{ marginBottom: 16 }} />
              <p style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)" }}>Tap to select file</p>
            </>
          )}
        </motion.div>

        {state.submitError && (
          <div style={{ marginTop: 16, padding: 12, borderRadius: 8, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", display: "flex", alignItems: "center", gap: 8 }}>
            <AlertTriangle size={16} color="var(--error)" />
            <p style={{ fontSize: 13, color: "var(--error)" }}>{state.submitError}</p>
          </div>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 24 }}>
        <motion.button className="btn-primary" onClick={onNext} disabled={state.isSubmitting}>
          {state.isSubmitting ? "Submitting..." : (state.cvFile ? "Finish Setup" : "Continue Without CV")}
        </motion.button>
        {!state.cvFile && !state.isSubmitting && (
           <button onClick={onNext} style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
             Skip for now
           </button>
        )}
      </div>
    </div>
  );
}

// --- Step 6: Success Screen ---
function Step6_Success({ state, onNext }: { state: ReturnType<typeof useOnboarding>["state"], onNext: () => void }) {
  return (
    <div style={{ padding: "40px 20px", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
      <motion.div
        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 20 }}
        style={{ width: 100, height: 100, borderRadius: "50%", background: "linear-gradient(135deg, var(--brand) 0%, var(--brand-dim) 100%)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 32 }}
      >
        <CheckCircle size={50} color="var(--navy)" />
      </motion.div>
      
      <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ fontSize: 32, fontWeight: 800, color: "var(--text-primary)", marginBottom: 12, lineHeight: 1.2 }}>
        Welcome {state.fullName.split(" ")[0]}!
      </motion.h1>
      
      <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={{ fontSize: 16, color: "var(--text-secondary)", lineHeight: 1.6, maxWidth: 300, marginBottom: 48 }}>
        Welcome to AddisJobs by Prime Hospitality. Your profile is ready. Let's find you the perfect job.
      </motion.p>

      <motion.button initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="btn-primary" onClick={onNext} style={{ width: "100%" }}>
        Browse Jobs
      </motion.button>
    </div>
  );
}
