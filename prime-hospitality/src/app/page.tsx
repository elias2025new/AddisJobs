"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, LazyMotion, domAnimation } from "framer-motion";
import { Job } from "@/data/jobs";
import { JobSeekerProfile } from "@/data/profile";
import { useTelegram } from "@/hooks/useTelegram";
import { fetchProfile } from "@/lib/api";

import BottomNav, { NavTab } from "@/components/BottomNav";
import HomeScreen from "@/screens/HomeScreen";
import JobDetailScreen from "@/screens/JobDetailScreen";
import ProfileCheckScreen from "@/screens/ProfileCheckScreen";
import ApplicationScreen from "@/screens/ApplicationScreen";
import ConfirmationScreen from "@/screens/ConfirmationScreen";
import OnboardingScreen from "@/screens/OnboardingScreen";
import ApplicationsScreen from "@/screens/ApplicationsScreen";
import ProfileScreen from "@/screens/ProfileScreen";
import SearchScreen from "@/screens/SearchScreen";
import DashboardScreen from "@/screens/DashboardScreen";

// ── App navigation state ──
type AppView =
  | { screen: "home" }
  | { screen: "jobDetail"; job: Job }
  | { screen: "profileCheck"; job: Job }
  | { screen: "application"; job: Job; profile: JobSeekerProfile }
  | { screen: "confirmation"; job: Job };

export default function App() {
  const { user, isEmployer, isReady: isTelegramReady, initData } = useTelegram();
  const [activeTab, setActiveTab] = useState<NavTab>("home");
  const [view, setView] = useState<AppView>({ screen: "home" });
  
  // Onboarding state
  const [isOnboarded, setIsOnboarded] = useState<boolean | null>(null);

  // Check onboarding status via Edge Function (uses service-role key, bypasses RLS)
  useEffect(() => {
    async function checkOnboarding() {
      if (!isTelegramReady) return;
      console.log("[Prime Hospitality] Launching onboarding check for Telegram user:", user?.id || "Dev Mode");

      // No real Telegram session (browser dev mode) — always show onboarding
      if (!initData) {
        setIsOnboarded(false);
        return;
      }

      try {
        const result = await fetchProfile(initData);
        setIsOnboarded(result.onboarding_completed);
      } catch (err) {
        console.error("Error checking onboarding status:", err);
        setIsOnboarded(false);
      }
    }

    checkOnboarding();
  }, [isTelegramReady, initData]);

  // ── Navigation handlers ──

  /** Go back to whichever tab was active — does NOT reset the active tab. */
  const goBackToList = () => {
    setView({ screen: "home" });
  };

  /** Explicitly navigate to the home tab (e.g. after onboarding or "Browse More"). */
  const goHome = () => {
    setView({ screen: "home" });
    setActiveTab("home");
  };

  /** Navigate to the My Applications tab. */
  const goToApplications = () => {
    setView({ screen: "home" });
    setActiveTab("applications");
  };

  const handleJobSelect = (job: Job) => {
    setView({ screen: "jobDetail", job });
  };

  const handleApply = (job: Job) => {
    setView({ screen: "profileCheck", job });
  };

  const handleProfileChecked = (job: Job, profile: JobSeekerProfile) => {
    setView({ screen: "application", job, profile });
  };

  const handleApplicationSubmit = (job: Job) => {
    setView({ screen: "confirmation", job });
  };

  const handleTabChange = (tab: NavTab) => {
    setActiveTab(tab);
    // Switching to the home tab resets any lingering view state
    if (tab === "home") {
      setView({ screen: "home" });
    }
  };

  // Loading state
  const isReady = isTelegramReady && isOnboarded !== null;
  if (!isReady) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100dvh",
          background: "var(--navy)",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <motion.div
          animate={{ scale: [1, 1.06, 1], opacity: [0.85, 1, 0.85] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          style={{
            width: 72, height: 72, borderRadius: 16,
            display: "flex", alignItems: "center", justifyContent: "center",
            overflow: "hidden",
            background: "linear-gradient(145deg, rgba(45,50,70,1) 0%, rgba(15,20,35,1) 100%)",
            boxShadow: "0 12px 24px rgba(0,0,0,0.7), 0 4px 8px rgba(0,0,0,0.5), inset 0 2px 2px rgba(255,255,255,0.15), inset 0 -2px 4px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(212,168,67,0.5)",
          }}
        >
          <img src="/logo.png" alt="Prime Hospitality Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </motion.div>
        <p style={{ fontSize: 14, color: "var(--text-muted)", fontWeight: 500 }}>
          Loading Prime Hospitality…
        </p>
      </div>
    );
  }

  // Handle Onboarding Flow
  if (!isOnboarded) {
    return <OnboardingScreen onComplete={() => setIsOnboarded(true)} />;
  }

  // ── Determine which full-screen flow is active ──
  const isInFlow =
    view.screen !== "home" &&
    view.screen !== "confirmation";

  // Decide what main content to render
  const renderMainContent = () => {
    // Full-screen flows override tab content
    if (view.screen === "jobDetail") {
      return (
        <JobDetailScreen
          key="jobDetail"
          job={view.job}
          onBack={goBackToList}
          onApply={handleApply}
        />
      );
    }

    if (view.screen === "profileCheck") {
      return (
        <ProfileCheckScreen
          key="profileCheck"
          job={view.job}
          onBack={() => setView({ screen: "jobDetail", job: view.job })}
          onProceed={(profile) => handleProfileChecked(view.job, profile)}
        />
      );
    }

    if (view.screen === "application") {
      return (
        <ApplicationScreen
          key="application"
          job={view.job}
          profile={view.profile}
          onBack={() => setView({ screen: "profileCheck", job: view.job })}
          onSubmit={() => handleApplicationSubmit(view.job)}
        />
      );
    }

    if (view.screen === "confirmation") {
      return (
        <ConfirmationScreen
          key="confirmation"
          businessName={view.job.businessName}
          jobTitle={view.job.title}
          onBrowseMore={goHome}
          onViewApplications={goToApplications}
        />
      );
    }

    // Tab-based content
    switch (activeTab) {
      case "home":
        return (
          <HomeScreen
            key="home"
            onJobSelect={handleJobSelect}
            onSearchPress={() => setActiveTab("search")}
          />
        );
      case "search":
        return <SearchScreen key="search" onJobSelect={handleJobSelect} />;
      case "applications":
        return <ApplicationsScreen key="applications" />;
      case "profile":
        return <ProfileScreen key="profile" />;
      case "dashboard":
        return <DashboardScreen key="dashboard" />;
      default:
        return (
          <HomeScreen
            key="home"
            onJobSelect={handleJobSelect}
            onSearchPress={() => setActiveTab("search")}
          />
        );
    }
  };

  return (
    <LazyMotion features={domAnimation}>
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 480,
          margin: "0 auto",
          minHeight: "100dvh",
          background: "var(--navy)",
          overflow: "hidden",
        }}
      >
        {/* ── Main content with AnimatePresence ── */}
        <AnimatePresence mode="wait">
          {renderMainContent()}
        </AnimatePresence>

        {/* ── Bottom navigation — only shown on the home screen ── */}
        {view.screen === "home" && (
          <BottomNav
            activeTab={activeTab}
            onTabChange={handleTabChange}
            isEmployer={isEmployer}
          />
        )}
      </div>
    </LazyMotion>
  );
}
