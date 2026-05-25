import { ExperienceLevel, JobCategory } from "./jobs";

export interface JobSeekerProfile {
  id: string;
  fullName: string;
  phone: string;
  telegramId: number;
  photoUrl: string | null;
  preferredCategory: JobCategory;
  experienceLevel: ExperienceLevel;
  education: string;
  languages: string[];
  neighborhood: string;
  willingToRelocate: boolean;
  hasProfile: boolean;
}

// Mock profile — represents the demo job seeker
export const MOCK_PROFILE: JobSeekerProfile = {
  id: "profile-001",
  fullName: "Biruk Tadesse",
  phone: "+251 91 234 5678",
  telegramId: 123456789,
  photoUrl: null,
  preferredCategory: "Waiter",
  experienceLevel: "Mid Level",
  education: "Diploma in Hotel Management",
  languages: ["Amharic", "English"],
  neighborhood: "Megenagna",
  willingToRelocate: false,
  hasProfile: true,
};
