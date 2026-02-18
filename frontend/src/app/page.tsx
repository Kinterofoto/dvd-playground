"use client";

import { SetupForm } from "../components/setup-form";
import { Terminal } from "../components/terminal/terminal";

export default function Home() {
  return (
    <main className="h-screen flex flex-col bg-[var(--bg-primary)]">
      <SetupForm />
      <Terminal />
    </main>
  );
}
