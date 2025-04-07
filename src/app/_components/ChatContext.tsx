"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import api from "@/ts/api";

import { usePathname, useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

import { Chat, Message } from "@/ts/api/api.types";

const ChatContext = createContext<{
  selectedChat: Chat | undefined;
  messages: Message[];
  allChats: Chat[];
  sendMessage: (message: string) => Promise<void>;
}>({
  selectedChat: undefined,
  messages: [],
  allChats: [],
  sendMessage: async () => {},
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
    const response = await api.chat.getChat(chatId);
    if (response.error) {
      console.error("Error fetching chat:", response.error);
      return;
    }
    if (!response.chat) {
      console.error("Chat not found");
      return;
    }
    router.push(`?id=${response.chat.id}`);
    if (response.chat.id === selectedChat?.id) {
      setMessages(response.chat.messages || []);
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
    setSelectedChat(response.chats[0]);
  }

  useEffect(() => {
    const chatId = searchParams.get("id") || undefined;
    if (!chatId && !selectedChat) {
      setSelectedChat(undefined);
      setMessages([]);
      return;
    }

    fetchChat(chatId || selectedChat?.id || "");
  }, [pathname, searchParams, selectedChat]);

  async function sendMessage(message: string) {
    if (!selectedChat) {
      console.error("No chat selected");
      return;
    }
    const response = await api.chat.sendMessage(selectedChat.id, message);
    if (response.error) {
      console.error("Error sending message:", response.error);
      return;
    }
    if (!response.message) {
      console.error("Message not found in response");
      return;
    }
    fetchChat(selectedChat.id);
  }

  return (
    <ChatContext.Provider
      value={{
        selectedChat,
        messages,
        allChats,
        sendMessage,
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
