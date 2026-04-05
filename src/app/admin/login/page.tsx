"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push("/admin");
      } else {
        const data = await res.json();
        setError(data.error || "Invalid password");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-layout flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-sm">
        <div className="admin-card p-8">
          <div className="text-center mb-8">
            <h1 className="font-display text-2xl text-charcoal tracking-wide">
              Ahad &amp; Sana
            </h1>
            <p className="label-caps mt-2">Guest Manager</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-blush/40 border border-blush-deep/30 text-charcoal-light text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="password"
                className="label-caps block mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="admin-input"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading || !password}
              className="admin-btn-primary w-full py-3"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
