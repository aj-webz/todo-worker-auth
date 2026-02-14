"use client";

import { useEffect, useState } from "react";

export function useSession() {
  const [user, setUser] = useState<{ role: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/get-session");
        const data = await res.json();
        setUser(data.user || null);
      } catch{
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  return { user, loading };
}
