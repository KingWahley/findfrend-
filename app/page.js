"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { v4 as uuidv4 } from "uuid";

const INPUT_BASE =
  "w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200";

export default function Home() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [match, setMatch] = useState(null);
  const [filters, setFilters] = useState({ city: "", minAge: 18, maxAge: 40 });
  const [loading, setLoading] = useState(true);
  const [authBusy, setAuthBusy] = useState(false);
  const [spinBusy, setSpinBusy] = useState(false);
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
      <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center px-6 py-16">
        <div className="rounded-3xl bg-white/80 px-8 py-6 text-center shadow-lg">
          Loading your spot in the friend wheel...
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center gap-10 px-6 py-16">
        <section className="w-full rounded-[32px] border border-white/60 bg-white/70 p-10 shadow-xl backdrop-blur">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl space-y-4">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                Random Friend Pro v2
              </p>
              <h1 className="text-4xl font-semibold text-slate-900 md:text-5xl">
                Spin the wheel. Meet a new friend.
              </h1>
              <p className="text-base text-slate-600">
                Drop in anonymously, set your vibe filters, and we will pull a
                friendly surprise from the community.
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 md:w-auto">
              <button
                onClick={signIn}
                disabled={authBusy}
                className="rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {authBusy ? "Entering..." : "Enter the lounge"}
              </button>
              <p className="text-xs text-slate-500">
                No email needed. You can stay anonymous.
              </p>
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
      <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center px-6 py-16">
        <ProfileSetup user={user} onDone={() => fetchProfile(user.id)} />
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-6 py-12">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
            Random Friend Pro v2
          </p>
          <h1 className="text-4xl font-semibold text-slate-900">
            Find a surprise friend
          </h1>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="rounded-3xl border border-white/60 bg-white/70 px-5 py-4 text-sm text-slate-600 shadow-sm">
            You are signed in as{" "}
            <span className="font-semibold text-slate-900">{profile.name}</span>
          </div>
          <button
            onClick={signOut}
            disabled={authBusy}
            className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {authBusy ? "Signing out..." : "Logout"}
          </button>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[32px] border border-white/60 bg-white/80 p-8 shadow-xl backdrop-blur">
          <h2 className="text-2xl font-semibold text-slate-900">
            Tune your spin
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Filters help match you with someone close to your vibe.
          </p>

          <div className="mt-6 grid gap-4">
            <label className="text-xs uppercase tracking-[0.2em] text-slate-500">
              City
            </label>
            <input
              placeholder="e.g. Austin"
              className={INPUT_BASE}
              value={filters.city}
              onChange={(event) =>
                setFilters({ ...filters, city: event.target.value })
              }
            />

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Minimum age
                </label>
                <input
                  type="number"
                  min="18"
                  max="99"
                  className={INPUT_BASE}
                  value={filters.minAge}
                  onChange={(event) =>
                    setFilters({ ...filters, minAge: event.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Maximum age
                </label>
                <input
                  type="number"
                  min="18"
                  max="99"
                  className={INPUT_BASE}
                  value={filters.maxAge}
                  onChange={(event) =>
                    setFilters({ ...filters, maxAge: event.target.value })
                  }
                />
              </div>
            </div>

            <button
              onClick={spin}
              disabled={spinBusy}
              className="mt-4 rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {spinBusy ? "Spinning the wheel..." : "Surprise me"}
            </button>
            {error ? (
              <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </p>
            ) : null}
          </div>
        </div>

        <div className="rounded-[32px] border border-white/60 bg-white/80 p-8 shadow-xl backdrop-blur">
          <h2 className="text-2xl font-semibold text-slate-900">
            Your surprise match
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Spin to reveal a new face.
          </p>

          <div className="mt-6">
            {!match ? (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 px-6 py-10 text-center text-sm text-slate-500">
                No match yet. Your next friend is waiting.
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 rounded-3xl border border-emerald-100 bg-emerald-50 px-6 py-8 text-center shadow-sm">
                <img
                  src={match.avatar_url}
                  alt={`${match.name} avatar`}
                  className="h-24 w-24 rounded-full border-4 border-white object-cover shadow"
                />
                <div>
                  <p className="text-lg font-semibold text-slate-900">
                    {match.name}, {match.age}
                  </p>
                  <p className="text-sm text-slate-600">{match.city}</p>
                </div>
                <a
                  href={`https://wa.me/${match.phone}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-2xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow transition hover:bg-emerald-500"
                >
                  Message on WhatsApp
                </a>
              </div>
            )}
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
          phone: form.phone,
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
    <section className="w-full max-w-2xl rounded-[32px] border border-white/60 bg-white/80 p-8 shadow-xl backdrop-blur">
      <h2 className="text-2xl font-semibold text-slate-900">
        Complete your profile
      </h2>
      <p className="mt-2 text-sm text-slate-600">
        Tell the community a bit about you before spinning.
      </p>

      <div className="mt-6 grid gap-4">
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

        <div className="flex gap-2">
          <select
            className={`${INPUT_BASE} max-w-[110px]`}
            value={form.countryCode}
            onChange={(e) => setForm({ ...form, countryCode: e.target.value })}
          >
            <option value="+234">🇳🇬 +234</option>
            <option value="+1">🇺🇸 +1</option>
            <option value="+44">🇬🇧 +44</option>
            <option value="+91">🇮🇳 +91</option>
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

        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 px-4 py-3 text-sm text-slate-500">
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
          className="rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
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
