"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, LazyMotion, domAnimation } from "framer-motion";
import { Search, X, SlidersHorizontal, MapPin, Clock } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Job, JobCategory, JobType, ExperienceLevel, JOB_CATEGORIES } from "@/data/jobs";
import { SupabaseJob, mapSupabaseJobToJob } from "@/hooks/useJobs";

interface SearchScreenProps {
  onJobSelect: (job: Job) => void;
}

const CATEGORY_EMOJIS: Record<string, string> = {
  Waiter: "💁", Chef: "🍳", Receptionist: "🛎️", Barista: "☕",
  Housekeeper: "🧹", Security: "🛡️", Cashier: "💵", Manager: "💼",
  "Marketing & Sales": "📈", "F&B": "🍹", Finance: "💰", "Cost Control": "📊",
  Accountant: "🧮", Bellboy: "🧳", "Store Keeper": "📦", "Phone Operator": "📞",
  Maintenance: "🔧",
};

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export default function SearchScreen({ onJobSelect }: SearchScreenProps) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<JobCategory | null>(null);
  const [results, setResults] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedQuery = useDebounce(query, 350);

  const doSearch = useCallback(async (kw: string, cat: JobCategory | null) => {
    const trimmed = kw.trim();
    if (!trimmed && !cat) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      let q = supabase
        .from("jobs")
        .select(`
          id, employer_id, title, category, location, neighborhood,
          job_type, salary_min, salary_max, currency, description,
          full_description, requirements, deadline, status, created_at,
          employers ( business_name, business_type )
        `)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(50);

      if (cat) q = q.eq("category", cat);

      if (trimmed) {
        // Supabase full-text style — search title and description with ilike
        q = q.or(`title.ilike.%${trimmed}%,description.ilike.%${trimmed}%,neighborhood.ilike.%${trimmed}%`);
      }

      const { data, error: fetchError } = await q;
      if (fetchError) throw fetchError;

      setResults(((data ?? []) as SupabaseJob[]).map(mapSupabaseJobToJob));
    } catch (err) {
      console.error("Search failed:", err);
      setError("Search failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    doSearch(debouncedQuery, selectedCategory);
  }, [debouncedQuery, selectedCategory, doSearch]);

  const clearSearch = () => {
    setQuery("");
    setSelectedCategory(null);
    setResults([]);
    setHasSearched(false);
    inputRef.current?.focus();
  };

  const formatSalary = (min: number, max: number, currency: string) =>
    `${currency} ${(min / 1000).toFixed(0)}k–${(max / 1000).toFixed(0)}k`;

  return (
    <LazyMotion features={domAnimation}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100dvh",
          background: "var(--navy)",
          overflow: "hidden",
        }}
      >
        {/* ── HEADER ── */}
        <div
          className="safe-screen-top"
          style={{
            paddingLeft: 20,
            paddingRight: 20,
            paddingBottom: 12,
            background: "linear-gradient(180deg, rgba(10,15,30,1) 0%, rgba(10,15,30,0.95) 100%)",
            flexShrink: 0,
          }}
        >
          <div style={{ marginBottom: 16 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 4 }}>
              Find Your Role
            </h1>
            <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>
              Search across all active hospitality jobs
            </p>
          </div>

          {/* Search input */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 14,
              padding: "12px 16px",
              marginBottom: 10,
            }}
          >
            <Search size={18} color="var(--gold)" style={{ flexShrink: 0 }} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Job title, hotel, neighborhood…"
              autoComplete="off"
              style={{
                flex: 1,
                background: "none",
                border: "none",
                outline: "none",
                fontSize: 15,
                color: "var(--text-primary)",
                fontFamily: "inherit",
              }}
            />
            {(query || selectedCategory) && (
              <motion.button
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                whileTap={{ scale: 0.9 }}
                onClick={clearSearch}
                style={{
                  width: 22, height: 22, borderRadius: "50%",
                  background: "rgba(255,255,255,0.12)",
                  border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <X size={12} color="var(--text-muted)" />
              </motion.button>
            )}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowFilters((v) => !v)}
              style={{
                width: 32, height: 32, borderRadius: 9,
                background: showFilters ? "rgba(212,168,67,0.15)" : "rgba(255,255,255,0.05)",
                border: showFilters ? "1px solid rgba(212,168,67,0.3)" : "1px solid rgba(255,255,255,0.07)",
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <SlidersHorizontal size={14} color={showFilters ? "var(--gold)" : "var(--text-secondary)"} />
            </motion.button>
          </div>

          {/* Category filter panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                key="filters"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                style={{ overflow: "hidden" }}
              >
                <div style={{ paddingBottom: 8 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Filter by Role
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {JOB_CATEGORIES.map((cat) => {
                      const active = selectedCategory === cat;
                      return (
                        <motion.button
                          key={cat}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedCategory(active ? null : cat)}
                          style={{
                            display: "flex", alignItems: "center", gap: 6,
                            padding: "7px 12px",
                            borderRadius: 100,
                            fontSize: 13, fontWeight: 600,
                            cursor: "pointer",
                            background: active ? "rgba(212,168,67,0.15)" : "rgba(255,255,255,0.04)",
                            border: active ? "1px solid rgba(212,168,67,0.35)" : "1px solid rgba(255,255,255,0.07)",
                            color: active ? "var(--gold)" : "var(--text-secondary)",
                            transition: "all 0.15s ease",
                          }}
                        >
                          <span style={{ fontSize: 14 }}>{CATEGORY_EMOJIS[cat] ?? "🏨"}</span>
                          {cat}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── RESULTS ── */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "8px 20px 96px",
            overscrollBehavior: "contain",
            WebkitOverflowScrolling: "touch",
          } as React.CSSProperties}
        >
          {/* Loading skeletons */}
          {isLoading && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[1, 2, 3].map((i) => (
                <div key={i} className="shimmer" style={{ height: 110, borderRadius: 16 }} />
              ))}
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
                borderRadius: 14, padding: 20, textAlign: "center", marginTop: 20,
              }}
            >
              <p style={{ color: "#FCA5A5", fontSize: 14, marginBottom: 12 }}>{error}</p>
              <button
                onClick={() => doSearch(query, selectedCategory)}
                style={{ fontSize: 13, fontWeight: 600, color: "var(--gold)", background: "none", border: "none", cursor: "pointer" }}
              >
                Try again
              </button>
            </motion.div>
          )}

          {/* Idle / prompt state */}
          {!isLoading && !error && !hasSearched && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ textAlign: "center", padding: "60px 20px" }}
            >
              <div
                style={{
                  width: 72, height: 72, borderRadius: 20,
                  background: "rgba(212,168,67,0.06)",
                  border: "1px solid rgba(212,168,67,0.12)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 20px", fontSize: 32,
                }}
              >
                🔍
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>
                Start Searching
              </h2>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6, maxWidth: 260, margin: "0 auto" }}>
                Type a job title, hotel name or neighborhood, or pick a category to filter.
              </p>
            </motion.div>
          )}

          {/* Empty results */}
          {!isLoading && !error && hasSearched && results.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ textAlign: "center", padding: "60px 20px" }}
            >
              <div
                style={{
                  width: 72, height: 72, borderRadius: 20,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 20px", fontSize: 32,
                }}
              >
                😶
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>
                No Jobs Found
              </h2>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6, maxWidth: 260, margin: "0 auto" }}>
                Try a different keyword or remove category filters.
              </p>
            </motion.div>
          )}

          {/* Results list */}
          {!isLoading && !error && results.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {/* Result count */}
              <p style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 500, paddingTop: 4 }}>
                {results.length} result{results.length !== 1 ? "s" : ""}
                {selectedCategory ? ` · ${selectedCategory}` : ""}
              </p>

              <AnimatePresence>
                {results.map((job, i) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, delay: Math.min(i * 0.05, 0.3) }}
                    whileTap={{ scale: 0.985 }}
                    onClick={() => onJobSelect(job)}
                    style={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 16,
                      padding: 16,
                      cursor: "pointer",
                      willChange: "transform",
                    }}
                  >
                    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      {/* Logo */}
                      <div
                        style={{
                          width: 46, height: 46, borderRadius: 13,
                          background: "rgba(212,168,67,0.08)",
                          border: "1px solid rgba(212,168,67,0.15)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 22, flexShrink: 0,
                        }}
                      >
                        {job.businessLogo}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {job.title}
                        </p>
                        <p style={{ fontSize: 13, color: "var(--gold)", marginBottom: 8, fontWeight: 600 }}>
                          {job.businessName}
                        </p>

                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                          {/* Salary */}
                          <span
                            style={{
                              fontSize: 12, fontWeight: 700,
                              color: "var(--success)",
                              background: "rgba(74,222,128,0.08)",
                              border: "1px solid rgba(74,222,128,0.2)",
                              borderRadius: 100, padding: "3px 9px",
                            }}
                          >
                            {formatSalary(job.salaryMin, job.salaryMax, job.currency)}
                          </span>

                          {/* Location */}
                          <span style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 3 }}>
                            <MapPin size={10} /> {job.neighborhood}
                          </span>

                          {/* Job type */}
                          <span style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 3 }}>
                            <Clock size={10} /> {job.jobType}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </LazyMotion>
  );
}
