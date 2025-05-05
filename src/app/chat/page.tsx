// page.tsx
"use client";

/* eslint-disable @next/next/no-img-element */

import React, { useState, useEffect, useRef } from "react";
import { useChatContext } from "../_components/ChatContext";
import TextEditor from "./_components/TextEditor";
import GetTimeAgo from "@/ts/utils/GetTimeAgo";
import { fetchAPI } from "@/ts/api/util";

const COLORS = {
  main: "#262626",
  sidebar: "#202020",
  chatSelection: "#191919",
  textBox: "#323232",
};

export default function ChatPage() {
  const { messages, sendMessage, openDocument, activeDocument } =
    useChatContext();

  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const hasScrolledInitially = useRef(false);
  const userScrolledUp = useRef(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && text.trim()) {
      if (text.startsWith("/name")) {
        const newName = text.slice(6).trim();
        window.localStorage.setItem("username", newName);
      } else {
        sendMessage(text, attachments);
      }
      setText("");
      setAttachments([]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
  };

  useEffect(() => {
    if (scrollContainerRef.current && !hasScrolledInitially.current) {
      scrollContainerRef.current.scrollTop =
        scrollContainerRef.current.scrollHeight;
      hasScrolledInitially.current = true;
    }
  }, []);

  useEffect(() => {
    const c = scrollContainerRef.current;
    if (c && !userScrolledUp.current) {
      c.scrollTop = c.scrollHeight;
    }
  }, [messages]);

  const handleScroll = () => {
    const c = scrollContainerRef.current;
    if (!c) return;
    const dist = c.scrollHeight - c.scrollTop - c.clientHeight;
    userScrolledUp.current = dist > 50;
  };

  const isImageUrl = (url: string) =>
    [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".svg"].some((e) =>
      url.toLowerCase().endsWith(e)
    );
  const isTextFile = (url: string) =>
    [
      ".txt",
      ".md",
      ".csv",
      ".json",
      ".log",
      ".html",
      ".css",
      ".js",
      ".ts",
      ".jsx",
      ".tsx",
    ].some((e) => url.toLowerCase().endsWith(e));
  const sortAttachments = (atts: string[]) =>
    [...atts].sort((a, b) =>
      isImageUrl(a) && !isImageUrl(b)
        ? -1
        : isImageUrl(b) && !isImageUrl(a)
        ? 1
        : 0
    );
  const getAttachmentNameFromUrl = (url: string) => url.split("/").pop() || url;

  const handleOpenTextFile = async (url: string, fileName: string) => {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(res.statusText);
      const content = await res.text();
      // use the file’s URL as the shared document ID
      openDocument(url, content, fileName);
    } catch (err) {
      console.error(err);
      alert("Failed to load the text file.");
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <div
        className="h-full py-5 flex flex-col items-center"
        style={{ width: "7vw", backgroundColor: COLORS.chatSelection }}
      >
        {/* sidebar */}
      </div>

      <div
        className="h-full flex flex-col"
        style={{ width: "75vw", backgroundColor: COLORS.main }}
      >
        <div
          className="flex flex-col overflow-y-auto p-4 flex-grow"
          ref={scrollContainerRef}
          onScroll={handleScroll}
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className="bg-gray-800 p-3 mb-3 rounded-lg text-white flex flex-col"
            >
              <div className="flex items-center mb-2 gap-3">
                <div className="text-gray-300 font-semibold">
                  {msg.authorName}
                </div>
                {msg.authorBot && (
                  <div className="text-xs bg-blue-600/[50%] rounded-sm px-1">
                    BOT
                  </div>
                )}
                <div className="text-xs text-gray-400">
                  {GetTimeAgo(msg.createdAt)}
                </div>
              </div>
              <div style={getMessageStyle(msg.text)} className="text-gray-100">
                {getMessageText(msg.text)}
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {sortAttachments(msg.attachments).map((att) =>
                  isImageUrl(att) ? (
                    <img
                      key={att}
                      src={att}
                      alt=""
                      className="max-w-xs max-h-64 rounded-md"
                      loading="lazy"
                    />
                  ) : isTextFile(att) ? (
                    <div key={att} className="flex flex-col gap-1">
                      <a
                        href={att}
                        target="_blank"
                        className="text-blue-400 px-3 py-2 bg-gray-700 rounded-md flex items-center"
                      >
                        📄 {getAttachmentNameFromUrl(att)}
                      </a>
                      <button
                        onClick={() =>
                          handleOpenTextFile(att, getAttachmentNameFromUrl(att))
                        }
                        className="text-green-400 px-3 py-1 bg-gray-700 rounded-md flex items-center text-sm"
                      >
                        ✏️ Edit Collaboratively
                      </button>
                    </div>
                  ) : (
                    <a
                      key={att}
                      href={att}
                      target="_blank"
                      className="text-blue-400 px-3 py-2 bg-gray-700 rounded-md flex items-center"
                    >
                      📎 {getAttachmentNameFromUrl(att)}
                    </a>
                  )
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 flex items-center gap-2">
          <input
            type="text"
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message and press enter..."
            className="min-w-0 flex-1 p-3 h-[48px] rounded-lg text-white"
            style={{ backgroundColor: COLORS.textBox }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-[48px] h-[48px] bg-white/20 text-xl rounded-full grid place-items-center"
          >
            <i className="bi bi-plus-lg"></i>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={async (e) => {
              if (!e.target.files) return;
              await Promise.all(
                Array.from(e.target.files).map(async (file) => {
                  if (file.size > 50 * 1024 * 1024) {
                    alert("File too large");
                    return;
                  }
                  const { url, key } = (await fetchAPI({
                    uri: "/file/get-presigned-upload-url",
                    method: "POST",
                    body: { fileName: file.name },
                  })) as { url: string; key: string };
                  const up = await fetch(url, {
                    method: "PUT",
                    body: file,
                    headers: { "Content-Type": file.type },
                  });
                  if (!up.ok) return alert("Upload failed");
                  setAttachments((a) => [
                    ...a,
                    `https://pub-1ad4139dc9ed4e75ba1b107a2ea2dcc0.r2.dev/${key}`,
                  ]);
                })
              );
              e.target.value = "";
            }}
          />
        </div>

        {attachments.length > 0 && (
          <div className="p-4 pt-0">
            attachments: {attachments.map((u) => u.split("/").pop()).join(", ")}
          </div>
        )}
      </div>

      <div className="h-full w-[20vw] bg-gray-900 p-6">
        <link
          href="https://fonts.googleapis.com/css2?family=Delius:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <div
          style={{
            backgroundColor: COLORS.chatSelection,
            padding: "20px",
            position: "relative",
          }}
          className="flex flex-col gap-2"
        >
          <p
            style={{
              width: "100%",
              fontSize: "24px",
              fontFamily: "Delius",
              boxSizing: "border-box",
              backgroundColor: COLORS.chatSelection,
              color: "#f0bd16",
              cursor: "default",
            }}
          >
            Comet Chat
          </p>
          <p className="text-2xl">
            Welcome to Comet Chat! This is a demo chat application built with
            React and Next.js. You can send messages, upload files, and even use
            some fun commands like /gold /rainbow and even customize your
            nickname with /name. Enjoy chatting!
          </p>
          <a
            href="https://tinyurl.com/bdhsyfu7"
            target="_blank"
            rel="noopener noreferrer"
            className="text-center text-blue-500 font-bold text-2xl underline"
          >
            Join the conversation
          </a>
        </div>
      </div>

      {activeDocument && <TextEditor />}
    </div>
  );
}

function getMessageText(text: string) {
  if (text.startsWith("/gold")) {
    return text.slice(6);
  }
  if (text.startsWith("/rainbow")) {
    return (
      <>
        {text
          .slice(9)
          .split("")
          .map((char, index) => (
            <span
              key={index}
              style={{
                color: "red",
                fontWeight: "bold",
                animation: `rotate-hue 5s infinite`,
                animationDelay: `-${index * 0.1}s`,
                textShadow: `0 0 10px darkred`,
              }}
            >
              {char}
            </span>
          ))}
      </>
    );
  }

  return text;
}

function getMessageStyle(text: string) {
  if (text.startsWith("/gold")) {
    return {
      color: "gold",
      fontWeight: "bold",
      textShadow: "0 0 5px gold, 0 0 10px gold, 0 0 15px gold",
      animation: "pulse-gold 2s infinite",
    };
  } else if (text.startsWith("/rainbow")) {
    return {};
  }
  return {};
}
