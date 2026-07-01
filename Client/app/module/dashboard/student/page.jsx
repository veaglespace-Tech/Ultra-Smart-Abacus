"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function StudentModuleRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.push("/dashboard/student");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <p className="text-slate-600">Redirecting to Student Dashboard...</p>
    </div>
  );
}