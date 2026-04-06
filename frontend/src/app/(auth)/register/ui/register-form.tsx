"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/services/api";
import { useUserStore } from "@/store/user-store";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

export function RegisterForm() {
  const router = useRouter();
  const setUser = useUserStore((s) => s.setUser);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { data } = await api.post<{
        accessToken: string;
        user: { id: string; email: string; role: string };
      }>("/auth/register", { email, password, name: name || undefined });

      const maxAge = 60 * 60 * 24 * 7;
      document.cookie = `access_token=${encodeURIComponent(data.accessToken)}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
      setUser({ ...data.user, name: name || null });
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Không thể đăng ký. Email có thể đã tồn tại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="name">
          Họ tên
        </label>
        <input
          id="name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="glass w-full rounded-lg border border-primary/15 bg-transparent px-3 py-2 text-sm outline-none ring-primary/30 focus:ring-2"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="glass w-full rounded-lg border border-primary/15 bg-transparent px-3 py-2 text-sm outline-none ring-primary/30 focus:ring-2"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="password">
          Mật khẩu (tối thiểu 8 ký tự)
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="glass w-full rounded-lg border border-primary/15 bg-transparent px-3 py-2 text-sm outline-none ring-primary/30 focus:ring-2"
        />
      </div>
      {error ? (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={loading}
        className={cn(buttonVariants({ className: "w-full" }))}
      >
        {loading ? "Đang tạo tài khoản…" : "Đăng ký"}
      </button>
    </form>
  );
}
