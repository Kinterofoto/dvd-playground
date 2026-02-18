"use client";

import { ChatInput } from "../components/chat/chat-input";
import { ChatView } from "../components/chat/chat-view";
import { SetupBar } from "../components/setup-form";

export default function Home() {
  return (
    <main className="h-screen flex flex-col bg-[#0a0a0a]">
      <SetupBar />
      <ChatView />
      <ChatInput />
    </main>
  );
}
