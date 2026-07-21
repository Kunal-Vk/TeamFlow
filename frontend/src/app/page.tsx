"use client";

import { useEffect } from "react";
import { api } from "@/lib/api/axios";

export default function HomePage() {
  useEffect(() => {
    api.get("/api/health")
      .then((res) => console.log(res.data))
      .catch(console.error);
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <h1 className="text-5xl font-bold">TeamFlow</h1>
    </main>
  );
}