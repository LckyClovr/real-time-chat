"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import api from "@/ts/api";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Chat, Message } from "@/ts/api/api.types";

const ChatContext = createContext<{
  selectedChat: Chat | undefined;
  messages: Message[];
  allChats: Chat[];
}>({
  selectedChat: undefined,
  messages: [],
  allChats: [],
});

export const ChatContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [selectedChat, setSelectedChat] = useState<Chat>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [allChats, setAllChats] = useState<Chat[]>([]);

  useEffect(() => {
    fetchAllChats();
  }, []);

  async function fetchChat(chatId: string) {
    const response = await api.chat.getChat(chatId as string);
    if (response.error) {
      console.error("Error fetching chat:", response.error);
      return;
    }
    if (!response.chat) {
      console.error("Chat not found");
      return;
    }
    setSelectedChat(response.chat);
    setMessages(response.chat.messages || []);
  }

  async function fetchAllChats() {
    const response = await api.chat.getChatList();
    if (response.error) {
      console.error("Error fetching chat list:", response.error);
      return;
    }
    setAllChats(response.chats || []);
  }

  useEffect(() => {
    const chatId = searchParams.get("id") || undefined;
    if (!chatId) {
      setSelectedChat(undefined);
      setMessages([]);
      return;
    }

    fetchChat(chatId);
  }, [pathname, searchParams]);

  return (
    <ChatContext.Provider
      value={{
        selectedChat,
        messages,
        allChats,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => {
  const context = useContext(ChatContext);

  if (context === undefined) {
    throw new Error("useChatContext must be used within a ChatContextProvider");
  }

  return context;
};
