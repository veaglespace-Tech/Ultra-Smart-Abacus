"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminModuleRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.push("/dashboard/admin");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <p className="text-slate-400">Redirecting to Admin Dashboard...</p>
    </div>
  );
}
