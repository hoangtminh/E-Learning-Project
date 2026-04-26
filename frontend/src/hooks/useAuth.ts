"use client";

import { useUserStore } from "@/store/user-store";

export function useAuth() {
  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);

  return {
    user,
    setUser,
    isAuthenticated: !!user,
    isInstructor:
      user?.role === "instructor" || user?.role === "admin",
  };
}
