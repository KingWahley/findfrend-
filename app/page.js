"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { v4 as uuidv4 } from "uuid";

const INPUT_BASE =
  "w-full rounded-2xl border border-white/40 bg-white/95 px-4 py-3 text-sm text-slate-900 shadow-[0_18px_40px_-26px_rgba(15,23,42,0.7)] outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:ring-2 focus:ring-slate-200";

const PILL_BASE =
  "flex items-center gap-2 rounded-full border border-white/30 bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 shadow-sm backdrop-blur";

const ICON_BASE = "h-4 w-4";

const IconFilter = ({ className = ICON_BASE }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M4 5h16" />
    <path d="M7 12h10" />
    <path d="M10 19h4" />
  </svg>
);

const IconLocation = ({ className = ICON_BASE }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);

const IconAge = ({ className = ICON_BASE }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M3 7h18" />
    <path d="M7 3v4" />
    <path d="M17 3v4" />
    <rect x="4" y="7" width="16" height="14" rx="2" />
    <path d="M8 12h8" />
    <path d="M8 16h6" />
  </svg>
);

const IconRefresh = ({ className = ICON_BASE }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M3 12a9 9 0 0 1 15.5-6.5" />
    <path d="M18 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-15.5 6.5" />
    <path d="M6 21v-5h5" />
  </svg>
);

const IconLogout = ({ className = ICON_BASE }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="M16 17l5-5-5-5" />
    <path d="M21 12H9" />
  </svg>
);

const IconWhatsapp = ({ className = "h-4 w-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M20.5 3.6A11 11 0 0 0 2.2 17.8L1 23l5.3-1.4A11 11 0 1 0 20.5 3.6Zm-8.4 17.8a9 9 0 0 1-4.6-1.2l-.3-.2-3.1.8.8-3-.2-.3a9 9 0 1 1 7.4 3.9Zm5.3-6.5c-.3-.1-1.7-.8-2-1s-.5-.1-.7.1-.8 1-1 1.2-.4.2-.7 0a7.5 7.5 0 0 1-2.2-1.4 8.3 8.3 0 0 1-1.5-1.8c-.2-.3 0-.5.1-.6l.5-.5c.2-.2.2-.3.3-.5a.6.6 0 0 0 0-.5c0-.1-.7-1.7-1-2.3-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.7.3-.2.2-1 1-1 2.4 0 1.4 1 2.8 1.2 3 .1.2 2 3.1 4.9 4.4.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.7-.7 2-1.4.2-.7.2-1.3.1-1.4-.1-.1-.3-.2-.6-.3Z" />
  </svg>
);

export default function Home() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [match, setMatch] = useState(null);
  const [filters, setFilters] = useState({ city: "", minAge: 18, maxAge: 40 });
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authBusy, setAuthBusy] = useState(false);
  const [spinBusy, setSpinBusy] = useState(false);
  const [hasSpun, setHasSpun] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const init = async () => {
      const { data } = await supabase.auth.getUser();
      if (!active) return;
      if (data.user) {
        setUser(data.user);
        await fetchProfile(data.user.id);
      }
      setLoading(false);
    };

    init();

    return () => {
      active = false;
    };
  }, []);

  const fetchProfile = async (id) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();
    setProfile(data);
  };

  useEffect(() => {
    if (profile?.id) {
      setHasSpun(false);
    }
  }, [profile?.id]);

  const signIn = async () => {
    setError("");
    setAuthBusy(true);
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) {
      setError(error.message);
      setAuthBusy(false);
      return;
    }
    setUser(data.user);
    await fetchProfile(data.user.id);
    setAuthBusy(false);
  };

  const signOut = async () => {
    setError("");
    setAuthBusy(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      setError(error.message);
      setAuthBusy(false);
      return;
    }
    setUser(null);
    setProfile(null);
    setMatch(null);
    setHasSpun(false);
    setAuthBusy(false);
  };

  const normalizedFilters = useMemo(() => {
    const minAge = Number(filters.minAge) || 18;
    const maxAge = Number(filters.maxAge) || 99;
    return {
      city: filters.city.trim(),
      minAge: Math.min(minAge, maxAge),
      maxAge: Math.max(minAge, maxAge),
    };
  }, [filters]);

  const spin = async () => {
    if (!profile) return;
    setError("");
    setSpinBusy(true);
    setMatch(null);
    setHasSpun(true);

    const query = supabase
      .from("profiles")
      .select("*")
      .neq("id", user.id)
      .gte("age", normalizedFilters.minAge)
      .lte("age", normalizedFilters.maxAge);

    if (normalizedFilters.city) {
      query.ilike("city", `%${normalizedFilters.city}%`);
    }

    const { data, error } = await query;

    if (error) {
      setError(error.message);
      setSpinBusy(false);
      return;
    }

    if (!data || !data.length) {
      setError("No match found in those filters.");
      setSpinBusy(false);
      return;
    }

    const random = data[Math.floor(Math.random() * data.length)];

    await supabase.from("matches").insert([
      {
        user1: user.id,
        user2: random.id,
      },
    ]);

    setMatch(random);
    setSpinBusy(false);
  };

  if (loading) {
    return (
      <main className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-6 py-16">

        <div className="flex flex-col items-center justify-center">
          <div className="loader"></div>
          <p className="p-6 font-bold">Finding you a spot in the lobby</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center gap-10 px-6 py-16">
        <section className="grid w-full gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6 rounded-[36px] border border-white/40 bg-white/80 p-10 shadow-2xl backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
              Random Friend Pro v2
            </p>
            <h1 className="text-4xl font-semibold text-slate-900 md:text-5xl">
              Friend finder, built like your favorite social app.
            </h1>
            <p className="text-base text-slate-600">
              Drop in anonymously, tune your vibe filters, and spin for a
              surprise introduction. Clean profiles, instant WhatsApp reach, and
              no noisy onboarding.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                onClick={signIn}
                disabled={authBusy}
                className="flex items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <IconFilter className="h-4 w-4" />
                {authBusy ? "Entering..." : "Enter the lounge"}
              </button>
              <p className="text-xs text-slate-500">
                No email needed. Stay anonymous.
              </p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[40px] bg-slate-950 shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80"
              alt="Preview profile"
              className="h-full min-h-[420px] w-full object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute top-6 left-6 flex flex-wrap gap-2">
              <span className={PILL_BASE}>
                <IconFilter />
                Filter
              </span>
              <span className={PILL_BASE}>
                <IconLocation />
                Location
              </span>
              <span className={PILL_BASE}>
                <IconAge />
                18-40
              </span>
            </div>
            <div className="absolute bottom-6 left-6 space-y-2 text-white">
              <p className="text-2xl font-semibold">Mandy Portman, 26</p>
              <div className="flex items-center gap-2 text-sm text-white/80">
                <IconLocation className="h-4 w-4" />
                Ventura, CA
              </div>
            </div>
          </div>
        </section>
        {error ? (
          <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </p>
        ) : null}
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center px-6 py-16">
        <ProfileSetup user={user} onDone={() => fetchProfile(user.id)} />
      </main>
    );
  }

  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-2 px-2 py-12 md:py-14">
      <header className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        {/* <div className="space-y-2">
          <h1 className="text-4xl font-semibold text-slate-900 md:text-5xl">
            Friend finder
          </h1>
          <p className="text-sm text-slate-600">
            Spin the wheel and meet someone new today.
          </p>
        </div> */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="flex items-center justify-between rounded-[10px] border border-slate-200 bg-white/80 px-6 py-4 ">
            <div className="flex items-center gap-4">
              <img
                src={profile.avatar_url}
                alt={profile.name}
                className="h-11 w-11 rounded-full object-cover border border-slate-200 shadow-sm"
              />
              <div className="flex flex-col leading-tight">
                <p className="text-base font-semibold text-slate-900">
                  {profile.name}
                </p>
              </div>
            </div>

            <button
              onClick={signOut}
              disabled={authBusy}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
            >
              <IconLogout className="h-4 w-4" />
              {authBusy ? "Signing out..." : "Logout"}
            </button>
          </div>
        </div>
      </header>

      <section className="grid items-start gap-8 lg:grid-cols-1">
        <div className="space-y-6">
          <div className="relative overflow-hidden rounded-[10px] bg-slate-950 shadow-2xl ring-1 ring-white/10">
            {match ? (
              <img
                src={match.avatar_url}
                alt={`${match.name} avatar`}
                className="h-[520px] w-full object-cover sm:h-[560px]"
              />
            ) : (
              <div className="flex h-[520px] w-full flex-col items-center justify-center gap-4 bg-gradient-to-br from-slate-900 via-slate-950 to-black text-center text-sm text-white/60 sm:h-[560px]">
                {!hasSpun ? (
                  <button
                    onClick={spin}
                    disabled={spinBusy}
                    className="flex h-20 w-20 items-center justify-center rounded-full border border-white/70 bg-white/90 text-slate-900 shadow-[0_10px_26px_-14px_rgba(15,23,42,0.8)] transition hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_16px_36px_-18px_rgba(15,23,42,0.9)] disabled:cursor-not-allowed disabled:opacity-60"
                    aria-label={spinBusy ? "Spinning" : "Spin"}
                    title={spinBusy ? "Spinning" : "Spin"}
                  >
                    
                    <IconRefresh
                      className={spinBusy ? "h-5 w-5 animate-spin" : "h-5 w-5"}
                    />
                  </button>
                ) : null}
                <div>Spin the wheel and find a friend</div>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none" />

            <div className="absolute top-6 left-6 right-6 space-y-3">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setShowFilters((prev) => !prev)}
                  aria-expanded={showFilters}
                  className={`${PILL_BASE} transition hover:-translate-y-0.5 hover:border-white/50 hover:bg-white`}
                >
                  <IconFilter />
                  {showFilters ? "Hide filters" : "Filter"}
                </button>
              </div>
              <div
                className={`grid gap-3 rounded-3xl border border-white/10 bg-black/35 p-4 shadow-lg backdrop-blur transition ${
                  showFilters ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
              >
                <div className="relative">
                  <IconLocation className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    placeholder="e.g. Location"
                    className={`${INPUT_BASE} pl-11`}
                    value={filters.city}
                    onChange={(event) =>
                      setFilters({ ...filters, city: event.target.value })
                    }
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Minimum age
                    </label>
                    <div className="relative">
                      <IconAge className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="number"
                        min="18"
                        max="99"
                        className={`${INPUT_BASE} pl-11`}
                        value={filters.minAge}
                        onChange={(event) =>
                          setFilters({ ...filters, minAge: event.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Maximum age
                    </label>
                    <div className="relative">
                      <IconAge className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="number"
                        min="18"
                        max="99"
                        className={`${INPUT_BASE} pl-11`}
                        value={filters.maxAge}
                        onChange={(event) =>
                          setFilters({ ...filters, maxAge: event.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute bottom-7 left-7 right-7 space-y-4 text-white">
              <div>
                <p className="text-3xl font-semibold">
                  {match ? `${match.name}, ${match.age}` : "Friend finder"}
                </p>
                <p className="flex items-center gap-2 text-sm text-white/80">
                  <IconLocation className="h-4 w-4" />
                  {match ? match.city : "City will appear here"}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {hasSpun ? (
                  <button
                    onClick={spin}
                    disabled={spinBusy}
                    className="flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white/95 px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <IconRefresh className="h-4 w-4" />
                    {spinBusy ? "Spinning..." : "Spin again"}
                  </button>
                ) : null}

                <a
                  href={match ? `https://wa.me/${match.phone}` : "#"}
                  target="_blank"
                  rel="noreferrer"
                  className={`flex items-center justify-center gap-2 rounded-full px-2 py-2 text-sm font-semibold text-white shadow-lg transition ${
                    match
                      ? "bg-emerald-600 hover:-translate-y-0.5 hover:bg-emerald-500 hover:shadow-xl"
                      : "cursor-not-allowed bg-emerald-600/50"
                  }`}
                  onClick={(event) => {
                    if (!match) event.preventDefault();
                  }}
                >
                  <IconWhatsapp />
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function ProfileSetup({ user, onDone }) {
  const [form, setForm] = useState({
    name: "",
    city: "",
    age: "",
    phone: "",
    file: null,
    countryCode: "+234",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const uploadAvatar = async () => {
    if (!form.file) {
      const encoded = encodeURIComponent(form.name || "Friend");
      return `https://ui-avatars.com/api/?name=${encoded}&background=f582ae&color=172c66&bold=true`;
    }

    const path = `avatars/${uuidv4()}`;
    const { error } = await supabase.storage
      .from("avatars")
      .upload(path, form.file);
    if (error) throw error;
    return supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl;
  };

  const saveProfile = async () => {
    setError("");

    if (!form.name || !form.city || !form.age || !form.phone) {
      setError("Please complete every field so we can match you.");
      return;
    }

    setSaving(true);

    try {
      const avatarUrl = await uploadAvatar();

      const { error } = await supabase.from("profiles").upsert([
        {
          id: user.id,
          name: form.name,
          city: form.city,
          age: Number(form.age),
          phone: `${form.countryCode}${form.phone}`,
          avatar_url: avatarUrl,
        },
      ]);

      if (error) throw error;

      onDone();
    } catch (err) {
      setError(err.message || "Something went wrong while saving.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="w-full max-w-3xl rounded-[36px] border border-white/50 bg-white/80 p-10 shadow-2xl backdrop-blur">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            Create your profile
          </p>
          <h2 className="text-3xl font-semibold text-slate-900">
            Let the community meet you
          </h2>
          <p className="text-sm text-slate-600">
            Add a photo and details so we can suggest the best match.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-4">
        <input
          placeholder="Name"
          className={INPUT_BASE}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
        />

        <input
          placeholder="City"
          className={INPUT_BASE}
          onChange={(event) => setForm({ ...form, city: event.target.value })}
        />

        <input
          type="number"
          placeholder="Age"
          min="18"
          max="99"
          className={INPUT_BASE}
          onChange={(event) => setForm({ ...form, age: event.target.value })}
        />

        <div className="flex flex-col gap-3 sm:flex-row">
          <select
            className={`${INPUT_BASE} sm:max-w-[140px]`}
            value={form.countryCode}
            onChange={(e) => setForm({ ...form, countryCode: e.target.value })}
          >
            <option value="+234">NG +234</option>
            <option value="+1">US +1</option>
            <option value="+44">UK +44</option>
            <option value="+91">IN +91</option>
          </select>

          <input
            type="tel"
            placeholder="8012345678"
            className={INPUT_BASE}
            onChange={(event) =>
              setForm({ ...form, phone: event.target.value })
            }
          />
        </div>

        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 px-4 py-3 text-sm text-slate-500">
          <input
            type="file"
            className="w-full text-sm"
            onChange={(event) =>
              setForm({ ...form, file: event.target.files[0] })
            }
          />
        </div>

        <button
          onClick={saveProfile}
          disabled={saving}
          className="flex items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving profile..." : "Save profile"}
        </button>
        {error ? (
          <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </p>
        ) : null}
      </div>
    </section>
  );
}
