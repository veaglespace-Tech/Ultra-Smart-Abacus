"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function FranchiseModuleRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.push("/dashboard/franchise");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <p className="text-slate-600">Redirecting to Franchise Dashboard...</p>
    </div>
  );
}