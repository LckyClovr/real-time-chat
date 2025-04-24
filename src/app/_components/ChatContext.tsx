"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Message } from "@/ts/api/api.types";
import useWebSocket from "react-use-websocket";
import { createId } from "@paralleldrive/cuid2";

const ChatContext = createContext<{
  messages: Message[];
  sendMessage: (message: string, attachments: string[]) => Promise<void>;
}>({
  messages: [],
  sendMessage: async () => {},
});

export const ChatContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const searchParams = useSearchParams();

  const [messages, setMessages] = useState<Message[]>([]);

  const { lastMessage, sendMessage: sendWsMessage } = useWebSocket(
    process.env.NEXT_PUBLIC_WS_SERVER + "",
    {
      share: true,
      shouldReconnect: () => true,
    }
  );

  // Send a join room message when the component mounts or search params change
  useEffect(() => {
    if (!searchParams.get("id")) return;
    sendWsMessage(
      JSON.stringify({
        type: "room:join",
        data: {
          roomId: searchParams.get("id"),
        },
      })
    );
  }, [searchParams, sendWsMessage]);

  // Parse websocket events
  useEffect(() => {
    const data = parseData(lastMessage?.data + "");
    if (!data) return;

    if (data.type === "room:joined") {
      setMessages(data.data.messages);
    }

    if (data.type === "message:received") {
      setMessages((prev) => [...prev, data.data.message]);
    }
  }, [lastMessage]);

  async function sendMessage(message: string, attachments?: string[]) {
    // Create the new message object
    const newMessage = {
      id: createId(),
      text: message,
      attachments: attachments || [],
      createdAt: Date.now(),
      authorName: window.localStorage.getItem("username") || "Unnamed User",
    };

    // Add it to the local state first
    setMessages((prev) => [...prev, newMessage]);

    // Send the message to the server using the message:send event type
    sendWsMessage(
      JSON.stringify({
        type: "message:send",
        data: {
          message: newMessage,
        },
      })
    );
  }

  return (
    <ChatContext.Provider
      value={{
        messages,
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

function parseData(dataStr: string) {
  let data = null;
  try {
    data = JSON.parse(dataStr);
  } catch {}

  return data;
}
