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
