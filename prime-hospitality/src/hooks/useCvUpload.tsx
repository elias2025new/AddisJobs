"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { updateCv, fetchProfile } from "@/lib/api";
import { useTelegram } from "@/hooks/useTelegram";

interface CvUploadContextType {
  isUploadingCv: boolean;
  cvUploadError: string | null;
  uploadCv: (file: File) => Promise<void>;
}

const CvUploadContext = createContext<CvUploadContextType | undefined>(undefined);

export function CvUploadProvider({ children }: { children: ReactNode }) {
  const { user, initData } = useTelegram();
  const [isUploadingCv, setIsUploadingCv] = useState(false);
  const [cvUploadError, setCvUploadError] = useState<string | null>(null);

  const uploadCv = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      window.dispatchEvent(new CustomEvent("cvToast", { detail: { type: "error", message: "File is too large. Max 5MB." } }));
      return;
    }
    if (!file.name.endsWith(".pdf") && !file.name.endsWith(".doc") && !file.name.endsWith(".docx")) {
      window.dispatchEvent(new CustomEvent("cvToast", { detail: { type: "error", message: "Please upload a PDF or Word document." } }));
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
      
      // Dispatch events to tell ProfileScreen to refresh and show toast
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("cvUploadSuccess"));
        window.dispatchEvent(new CustomEvent("cvToast", { detail: { type: "success", message: "Your CV has been uploaded successfully!" } }));
      }
    } catch (err: any) {
      console.error("Error uploading CV:", err);
      setCvUploadError(err.message || "Failed to upload CV");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("cvToast", { detail: { type: "error", message: err.message || "Failed to upload CV" } }));
      }
    } finally {
      setIsUploadingCv(false);
    }
  };

  return (
    <CvUploadContext.Provider value={{ isUploadingCv, cvUploadError, uploadCv }}>
      {children}
    </CvUploadContext.Provider>
  );
}

export function useCvUpload() {
  const context = useContext(CvUploadContext);
  if (context === undefined) {
    throw new Error("useCvUpload must be used within a CvUploadProvider");
  }
  return context;
}
