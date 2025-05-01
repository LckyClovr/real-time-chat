// src/app/_components/ChatContext.tsx
"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Message } from "@/ts/api/api.types";
import useWebSocket from "react-use-websocket";
import { createId } from "@paralleldrive/cuid2";
import { fetchAPI } from "@/ts/api/util";

export interface DocumentInfo {
  id: string; // we store the full R2 URL here
  content: string;
  fileName: string;
  editorsCount: number;
  isEditing: boolean;
}

const ChatContext = createContext<{
  messages: Message[];
  activeDocument: DocumentInfo | null;
  documentEditors: number;
  sendMessage: (message: string, attachments: string[]) => Promise<void>;
  openDocument: (docId: string, content: string, fileName: string) => void;
  updateDocument: (content: string) => void;
  closeDocument: () => void;
  saveDocument: () => Promise<void>; // now async
}>({
  messages: [],
  activeDocument: null,
  documentEditors: 0,
  sendMessage: async () => {},
  openDocument: () => {},
  updateDocument: () => {},
  closeDocument: () => {},
  saveDocument: async () => {},
});

export const ChatContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeDocument, setActiveDocument] = useState<DocumentInfo | null>(
    null
  );
  const [documentEditors, setDocumentEditors] = useState<number>(0);

  const { lastMessage, sendMessage: sendWsMessage } = useWebSocket(
    process.env.NEXT_PUBLIC_WS_SERVER + "",
    { share: true, shouldReconnect: () => true }
  );

  // 1) join room on mount or param change
  useEffect(() => {
    const roomId = searchParams.get("id");
    if (!roomId) return;
    sendWsMessage(JSON.stringify({ type: "room:join", data: { roomId } }));
  }, [searchParams, sendWsMessage]);

  // 2) handle incoming WS messages
  useEffect(() => {
    if (!lastMessage?.data) return;
    const data = JSON.parse(lastMessage.data as string);

    switch (data.type) {
      case "room:joined":
        setMessages(data.data.messages);
        break;

      case "message:received":
        setMessages((prev) => [...prev, data.data.message]);
        break;

      case "document:opened": {
        const { documentId, content, fileName, editorsCount } = data.data;
        setActiveDocument({
          id: documentId,
          content,
          fileName,
          editorsCount: editorsCount ?? 1,
          isEditing: true,
        });
        setDocumentEditors(editorsCount ?? 1);
        break;
      }

      case "document:updated": {
        if (activeDocument && data.data.documentId === activeDocument.id) {
          setActiveDocument((prev) =>
            prev ? { ...prev, content: data.data.content } : null
          );
        }
        break;
      }

      case "document:editor-joined":
      case "document:editor-left": {
        if (activeDocument && data.data.documentId === activeDocument.id) {
          setDocumentEditors(data.data.editorsCount ?? 0);
        }
        break;
      }
    }
  }, [lastMessage]);

  // send chat
  async function sendMessage(message: string, attachments: string[] = []) {
    const newMessage = {
      id: createId(),
      text: message,
      attachments,
      createdAt: Date.now(),
      authorName: window.localStorage.getItem("username") || "Unnamed User",
      authorBot: false,
    };
    setMessages((prev) => [...prev, newMessage]);
    sendWsMessage(
      JSON.stringify({ type: "message:send", data: { message: newMessage } })
    );
  }

  // open doc
  function openDocument(docId: string, content: string, fileName: string) {
    sendWsMessage(
      JSON.stringify({
        type: "document:open",
        data: { documentId: docId, content, fileName },
      })
    );
  }

  // broadcast update
  function updateDocument(content: string) {
    if (!activeDocument) return;
    setActiveDocument((prev) => (prev ? { ...prev, content } : null));
    sendWsMessage(
      JSON.stringify({
        type: "document:update",
        data: {
          documentId: activeDocument.id,
          content,
        },
      })
    );
  }

  // leave doc
  function closeDocument() {
    if (!activeDocument) return;
    sendWsMessage(
      JSON.stringify({
        type: "document:close",
        data: { documentId: activeDocument.id },
      })
    );
    setActiveDocument(null);
    setDocumentEditors(0);
  }

  async function saveDocument() {
    if (!activeDocument) return;

    // parse the object key from the full URL stored in activeDocument.id
    const url = new URL(activeDocument.id);
    const key = url.pathname.slice(1); // remove leading "/"

    try {
      // ask your backend for a presigned PUT URL for that exact key
      const { url: uploadUrl } = (await fetchAPI({
        uri: "/file/get-presigned-upload-url",
        method: "POST",
        body: { key },
      })) as { url: string; key: string };

      // PUT the new content back to that same key
      const blob = new Blob([activeDocument.content], { type: "text/plain" });
      const res = await fetch(uploadUrl, {
        method: "PUT",
        body: blob,
        headers: { "Content-Type": "text/plain" },
      });

      if (!res.ok) throw new Error(res.statusText);
      alert("Successfully overwrote the original file on R2");
    } catch (err: any) {
      console.error("Failed to overwrite R2 object:", err);
      alert("Error saving back to R2. See console for details.");
    }
  }

  return (
    <ChatContext.Provider
      value={{
        messages,
        activeDocument,
        documentEditors,
        sendMessage,
        openDocument,
        updateDocument,
        closeDocument,
        saveDocument,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => {
  const ctx = useContext(ChatContext);
  if (!ctx)
    throw new Error("useChatContext must be used within a ChatContextProvider");
  return ctx;
};
