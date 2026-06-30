"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function TeacherModuleRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.push("/dashboard/teacher");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <p className="text-slate-600">Redirecting to Teacher Dashboard...</p>
    </div>
  );
}