"use client";

import { useEffect, useState } from "react";
import { isEmployer } from "@/data/employers";

export interface TelegramUser {
  id: number;
  firstName: string;
  lastName?: string;
  username?: string;
  photoUrl?: string;
}

interface UseTelegramReturn {
  user: TelegramUser | null;
  initData: string | null; // Raw initData string for Edge Function auth header
  isReady: boolean;
  isEmployer: boolean;
}

// Mock user for dev/browser environment (not inside Telegram)
const MOCK_DEV_USER: TelegramUser = {
  id: 123456789,
  firstName: "Biruk",
  lastName: "Tadesse",
  username: "birukt",
};

export function useTelegram(): UseTelegramReturn {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [initData, setInitData] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        // Attempt to load Telegram WebApp data from window.Telegram
        const tgWebApp = (window as any).Telegram?.WebApp;
        if (typeof window !== "undefined" && tgWebApp?.initDataUnsafe?.user) {
          // ── Full-screen: expand to fill the entire Telegram screen ──
          // expand() works on all Telegram versions
          tgWebApp.expand();
          // requestFullscreen() is supported on Telegram 7.7+ (silently ignored on older)
          tgWebApp.requestFullscreen?.();
          // Disable vertical swipe-to-close so users don't accidentally dismiss the app
          tgWebApp.disableVerticalSwipes?.();
          // Enable closing confirmation to prevent accidental exits
          tgWebApp.enableClosingConfirmation?.();
          // ── Theme Syncing ──
          // Helper to apply the current active theme
          const applyActiveTheme = () => {
            let activeScheme = tgWebApp.colorScheme || "light";
            try {
              const saved = localStorage.getItem("theme");
              if (saved === "dark" || saved === "light") {
                activeScheme = saved;
              }
            } catch (e) {}

            if (activeScheme === "dark") {
              document.documentElement.setAttribute("data-theme", "dark");
            } else {
              document.documentElement.removeAttribute("data-theme");
            }

            const bgPrimary = activeScheme === "dark" ? "#0F172A" : "#F9FAFB";
            const surfaceColor = activeScheme === "dark" ? "#1E293B" : "#FFFFFF";
            
            tgWebApp.setHeaderColor?.(bgPrimary);
            tgWebApp.setBackgroundColor?.(bgPrimary);
            tgWebApp.setBottomBarColor?.(surfaceColor);
          };

          // Apply immediately on launch
          applyActiveTheme();

          // Re-evaluate if Telegram's native theme changes
          tgWebApp.onEvent?.("themeChanged", applyActiveTheme);
          
          // Add a custom event listener so our ProfileScreen toggle can notify this hook
          if (typeof window !== "undefined") {
            window.addEventListener("themeToggle", applyActiveTheme);
          }

          const tgUser = tgWebApp.initDataUnsafe.user;
          setUser({
            id: tgUser.id,
            firstName: tgUser.first_name,
            lastName: tgUser.last_name,
            username: tgUser.username,
            photoUrl: tgUser.photo_url,
          });
          // Capture the raw initData string for use in Edge Function auth headers
          setInitData(tgWebApp.initData || null);
        } else {
          // Fallback for dev/browser environment — no real initData available
          setUser(MOCK_DEV_USER);
          setInitData(null); // null in dev; Edge Function will handle gracefully
        }
      } catch {
        setUser(MOCK_DEV_USER);
        setInitData(null);
      } finally {
        setIsReady(true);
      }
    };

    init();
  }, []);

  return {
    user,
    initData,
    isReady,
    isEmployer: user ? isEmployer(user.id) : false,
  };
}
