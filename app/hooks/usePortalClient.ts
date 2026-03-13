"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export type PortalClient = {
  id: string;
  name: string;
  email: string;
  jungianType: string;
  goal: string;
  status: string;
  forcePasswordChange: boolean;
};

export function usePortalClient() {
  const [client, setClient] = useState<PortalClient | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/portal/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          router.push("/portal/login");
          return;
        }
        if (data.forcePasswordChange) {
          router.push("/portal/change-password");
          return;
        }
        setClient(data);
      })
      .catch(() => router.push("/portal/login"))
      .finally(() => setLoading(false));
  }, [router]);

  return { client, loading };
}
