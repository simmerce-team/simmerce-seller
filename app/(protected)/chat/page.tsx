import { ChatInterface } from "@/components/chat/chat-interface";
import Header from "@/components/header";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Messages - Simmerce",
  description:
    "Connect with suppliers and buyers on Simmerce B2B marketplace",
};

export default function ChatPage() {
  return (
    <div className="flex flex-col">
      <Header />
      <ChatInterface />
    </div>
  );
}
