export type JobType = "Full Time" | "Part Time" | "Contract";
export type ExperienceLevel = "Entry Level" | "Mid Level" | "Senior Level";
export type JobCategory =
  | "Waiter"
  | "Chef"
  | "Receptionist"
  | "Barista"
  | "Housekeeper"
  | "Security"
  | "Cashier"
  | "Manager";

export interface Job {
  id: string;
  businessName: string;
  businessLogo: string; // emoji placeholder
  businessType: string;
  title: string;
  category: JobCategory;
  location: string;
  neighborhood: string;
  jobType: JobType;
  salaryMin: number;
  salaryMax: number;
  currency: string;
  postedDaysAgo: number;
  description: string;
  fullDescription: string;
  requirements: {
    experience: ExperienceLevel;
    education: string;
    languages: string[];
    locationPreference: string | null;
  };
  deadline: string;
  qualificationsMet: boolean; // demo: hardcoded against mock profile
  locationMismatch: boolean; // demo: hardcoded location mismatch flag
}

export const JOBS: Job[] = [
  {
    id: "job-001",
    businessName: "Skylight Hotel",
    businessLogo: "🏨",
    businessType: "5-Star Hotel",
    title: "Senior Waiter",
    category: "Waiter",
    location: "Bole, Addis Ababa",
    neighborhood: "Bole",
    jobType: "Full Time",
    salaryMin: 6000,
    salaryMax: 9000,
    currency: "ETB",
    postedDaysAgo: 1,
    description: "Serve guests in our award-winning restaurant with world-class hospitality standards.",
    fullDescription:
      "We are looking for an experienced and professional Senior Waiter to join our award-winning food & beverage team. The ideal candidate will be passionate about hospitality, fluent in English, and capable of delivering five-star dining experiences to our international guests. You will work across our main restaurant, rooftop bar, and private dining facilities.",
    requirements: {
      experience: "Mid Level",
      education: "Diploma in Hotel Management or related field",
      languages: ["Amharic", "English"],
      locationPreference: "Bole area preferred",
    },
    deadline: "June 15, 2026",
    qualificationsMet: true,
    locationMismatch: false,
  },
  {
    id: "job-002",
    businessName: "Tomoca Coffee",
    businessLogo: "☕",
    businessType: "Coffee House",
    title: "Head Barista",
    category: "Barista",
    location: "Piazza, Addis Ababa",
    neighborhood: "Piazza",
    jobType: "Full Time",
    salaryMin: 5500,
    salaryMax: 7500,
    currency: "ETB",
    postedDaysAgo: 2,
    description: "Lead barista role at Ethiopia's most iconic coffee house — share the art of Ethiopian coffee.",
    fullDescription:
      "Tomoca Coffee, Ethiopia's most historic and beloved coffee house since 1953, is seeking a passionate Head Barista to lead our brew team. You will be responsible for quality control, training junior staff, and maintaining the authentic Tomoca experience that has been cherished by Addis Ababans for generations. Knowledge of Ethiopian coffee ceremony is a strong plus.",
    requirements: {
      experience: "Mid Level",
      education: "Certificate in Food & Beverage or equivalent",
      languages: ["Amharic"],
      locationPreference: null,
    },
    deadline: "June 10, 2026",
    qualificationsMet: true,
    locationMismatch: false,
  },
  {
    id: "job-003",
    businessName: "Radisson Blu Hotel",
    businessLogo: "🏩",
    businessType: "International Hotel",
    title: "Front Desk Receptionist",
    category: "Receptionist",
    location: "Kazanchis, Addis Ababa",
    neighborhood: "Kazanchis",
    jobType: "Full Time",
    salaryMin: 7000,
    salaryMax: 11000,
    currency: "ETB",
    postedDaysAgo: 3,
    description: "Be the first face our international guests see — professional, warm, and fluent in English.",
    fullDescription:
      "Radisson Blu Addis Ababa is looking for a polished and professional Front Desk Receptionist to represent our brand at the heart of our operations. You will handle check-ins, check-outs, guest queries, and coordinate with housekeeping and concierge teams. Excellent communication in English is essential. Experience with Opera PMS is an advantage.",
    requirements: {
      experience: "Mid Level",
      education: "BA in Hospitality Management or Tourism",
      languages: ["Amharic", "English"],
      locationPreference: null,
    },
    deadline: "June 20, 2026",
    qualificationsMet: false,
    locationMismatch: false,
  },
  {
    id: "job-004",
    businessName: "Lime Tree Restaurant",
    businessLogo: "🌿",
    businessType: "Fine Dining",
    title: "Line Chef",
    category: "Chef",
    location: "Sarbet, Addis Ababa",
    neighborhood: "Sarbet",
    jobType: "Full Time",
    salaryMin: 8000,
    salaryMax: 13000,
    currency: "ETB",
    postedDaysAgo: 4,
    description: "Join Addis Ababa's top garden restaurant and craft premium Mediterranean and Ethiopian fusion dishes.",
    fullDescription:
      "Lime Tree Restaurant — Addis Ababa's beloved garden dining destination — is hiring a skilled Line Chef. You will work in a fast-paced kitchen environment preparing Mediterranean and Ethiopian fusion cuisine. The ideal candidate has strong knife skills, heat management ability, and a passion for seasonal, locally sourced ingredients. We pride ourselves on quality and consistency.",
    requirements: {
      experience: "Senior Level",
      education: "Culinary Arts Diploma or equivalent professional training",
      languages: ["Amharic"],
      locationPreference: "Sarbet / CMC area preferred",
    },
    deadline: "June 5, 2026",
    qualificationsMet: false,
    locationMismatch: true,
  },
  {
    id: "job-005",
    businessName: "Hyatt Regency Addis",
    businessLogo: "🌟",
    businessType: "Luxury Hotel",
    title: "Room Attendant (Housekeeper)",
    category: "Housekeeper",
    location: "Megenagna, Addis Ababa",
    neighborhood: "Megenagna",
    jobType: "Full Time",
    salaryMin: 4500,
    salaryMax: 6000,
    currency: "ETB",
    postedDaysAgo: 1,
    description: "Maintain world-class room standards at one of Addis Ababa's most prestigious luxury hotels.",
    fullDescription:
      "Hyatt Regency Addis Ababa is seeking dedicated Room Attendants to maintain the exceptional cleanliness and presentation standards our guests expect. You will be responsible for servicing guest rooms, restocking amenities, and reporting any maintenance issues. A detail-oriented personality and pride in your work are more important than experience — we will train the right candidate.",
    requirements: {
      experience: "Entry Level",
      education: "High School Completion (Grade 12)",
      languages: ["Amharic"],
      locationPreference: null,
    },
    deadline: "June 30, 2026",
    qualificationsMet: true,
    locationMismatch: false,
  },
  {
    id: "job-006",
    businessName: "Kaldis Coffee",
    businessLogo: "🫘",
    businessType: "Coffee Chain",
    title: "Cashier & Customer Service",
    category: "Cashier",
    location: "CMC, Addis Ababa",
    neighborhood: "CMC",
    jobType: "Part Time",
    salaryMin: 3000,
    salaryMax: 4500,
    currency: "ETB",
    postedDaysAgo: 5,
    description: "Fast-paced cashier role at Ethiopia's fastest growing coffee brand — perfect for energetic starters.",
    fullDescription:
      "Kaldis Coffee is expanding its CMC branch team and looking for bright, friendly cashiers who love interacting with people. You will handle POS transactions, assist with order preparation, and ensure every customer leaves with a smile. This is a part-time role ideal for students or those looking to enter the hospitality sector. Training provided from day one.",
    requirements: {
      experience: "Entry Level",
      education: "High School Completion (Grade 12)",
      languages: ["Amharic"],
      locationPreference: "CMC / Megenagna area preferred",
    },
    deadline: "June 8, 2026",
    qualificationsMet: true,
    locationMismatch: false,
  },
  {
    id: "job-007",
    businessName: "Sheraton Addis",
    businessLogo: "✨",
    businessType: "5-Star Luxury Hotel",
    title: "Night Security Officer",
    category: "Security",
    location: "Taitu, Addis Ababa",
    neighborhood: "Taitu",
    jobType: "Full Time",
    salaryMin: 5000,
    salaryMax: 7000,
    currency: "ETB",
    postedDaysAgo: 6,
    description: "Guard one of Africa's most iconic hotels — professional, disciplined, and attentive.",
    fullDescription:
      "Sheraton Addis, a landmark of luxury in Africa, is seeking a Night Security Officer to join our safety team. You will patrol the property, monitor CCTV systems, and ensure the safety of guests and staff throughout the night shift. Military or police background preferred. Candidates must be physically fit, disciplined, and able to maintain composure under pressure.",
    requirements: {
      experience: "Mid Level",
      education: "Grade 12 minimum; security training certificate is an advantage",
      languages: ["Amharic", "English"],
      locationPreference: null,
    },
    deadline: "June 25, 2026",
    qualificationsMet: true,
    locationMismatch: false,
  },
  {
    id: "job-008",
    businessName: "Four Points by Sheraton",
    businessLogo: "🍽️",
    businessType: "Business Hotel",
    title: "Breakfast Chef",
    category: "Chef",
    location: "Bole, Addis Ababa",
    neighborhood: "Bole",
    jobType: "Part Time",
    salaryMin: 4000,
    salaryMax: 6500,
    currency: "ETB",
    postedDaysAgo: 2,
    description: "Lead morning breakfast operations at a busy international business hotel near Bole Airport.",
    fullDescription:
      "Four Points by Sheraton Addis Ababa is looking for an experienced Breakfast Chef to manage our busy morning kitchen operations. You will prepare buffet and à la carte breakfast items for our international business guests. Early morning shift (5am–12pm). Must be reliable, fast-paced, and knowledgeable in both Ethiopian and continental breakfast items.",
    requirements: {
      experience: "Mid Level",
      education: "Culinary Certificate or equivalent on-the-job experience",
      languages: ["Amharic"],
      locationPreference: "Bole area preferred",
    },
    deadline: "June 12, 2026",
    qualificationsMet: true,
    locationMismatch: true,
  },
];

export const JOB_CATEGORIES: JobCategory[] = [
  "Waiter",
  "Chef",
  "Receptionist",
  "Barista",
  "Housekeeper",
  "Security",
  "Cashier",
  "Manager",
];
