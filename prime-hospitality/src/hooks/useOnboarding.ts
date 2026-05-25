import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { createProfile, ApiError } from "@/lib/api";
import { useTelegram } from "./useTelegram";

export type OnboardingStep = 1 | 2 | 3 | 4 | 5 | 6;

export interface OnboardingState {
  step: OnboardingStep;
  selectedCategories: string[];
  contactShared: boolean | null;
  phoneNumber: string;
  experienceLevels: Record<string, string>;
  fullName: string;
  age: number | "";
  location: string;
  willingToRelocate: boolean;
  cvFile: File | null;
  cvUploaded: boolean;
  isSubmitting: boolean;
  submitError: string | null;
}

const initialState: OnboardingState = {
  step: 1,
  selectedCategories: [],
  contactShared: null,
  phoneNumber: "",
  experienceLevels: {},
  fullName: "",
  age: "",
  location: "",
  willingToRelocate: false,
  cvFile: null,
  cvUploaded: false,
  isSubmitting: false,
  submitError: null,
};

export function useOnboarding() {
  const { user, initData } = useTelegram();
  const [state, setState] = useState<OnboardingState>(initialState);

  const updateState = useCallback(
    (updates: Partial<OnboardingState>) => {
      setState((prev) => ({ ...prev, ...updates }));
    },
    []
  );

  const setStep = useCallback((step: OnboardingStep) => {
    setState((prev) => ({ ...prev, step }));
  }, []);

  const submitProfile = useCallback(async () => {
    setState((prev) => ({ ...prev, isSubmitting: true, submitError: null }));

    try {
      let cvUrl: string | null = null;
      const telegramId = user?.id || Date.now(); // fallback for dev

      // 1. Upload CV to Supabase Storage if present
      //    (Storage upload is OK client-side; it doesn't bypass row-level DB RLS)
      if (state.cvFile && state.cvUploaded) {
        const fileExt = state.cvFile.name.split(".").pop();
        const fileName = `${telegramId}-${Date.now()}.${fileExt}`;
        const filePath = `cvs/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("resumes")
          .upload(filePath, state.cvFile);

        if (uploadError) {
          throw new Error(`CV Upload failed: ${uploadError.message}`);
        }

        const { data: publicUrlData } = supabase.storage
          .from("resumes")
          .getPublicUrl(filePath);

        cvUrl = publicUrlData.publicUrl;
      }

      // 2. Create profile via the secure Edge Function.
      //    The Edge Function validates the Telegram initData signature before
      //    inserting anything into the database.
      await createProfile({
        initData,
        profileData: {
          fullName: state.fullName,
          age: state.age,
          location: state.location,
          willingToRelocate: state.willingToRelocate,
          contactShared: state.contactShared,
          phoneNumber: state.phoneNumber,
          selectedCategories: state.selectedCategories,
          experienceLevels: state.experienceLevels,
        },
        cvUrl,
      });

      // Success — advance to the success screen
      setStep(6);
    } catch (error: unknown) {
      console.error("Onboarding submission error:", error);
      let message = "Failed to submit profile. Please try again.";
      if (error instanceof ApiError) {
        if (error.isDuplicate) {
          // Profile already exists — treat as success and move on
          setStep(6);
          return;
        }
        message = error.message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      setState((prev) => ({
        ...prev,
        submitError: message,
      }));
    } finally {
      setState((prev) => ({ ...prev, isSubmitting: false }));
    }
  }, [state, user, initData]);

  return {
    state,
    updateState,
    setStep,
    submitProfile,
  };
}
