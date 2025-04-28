"use client";

/* eslint-disable @next/next/no-img-element */

import React, { useState, useEffect, useRef } from "react";
import { useChatContext } from "../_components/ChatContext";
import GetTimeAgo from "@/ts/utils/GetTimeAgo";
import { fetchAPI } from "@/ts/api/util";

// Define colors as constants for easy modification
const COLORS = {
  main: "#262626",
  sidebar: "#202020",
  chatSelection: "#191919",
  textBox: "#323232",
};

export default function ChatPage() {
  const { messages, sendMessage } = useChatContext();

  const [text, setText] = useState("");
  const [attachments, setattachments] = useState<string[]>([]);

  // refs for controlling scroll behavior
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const hasScrolledInitially = useRef(false);
  const userScrolledUp = useRef(false);

  // Handle sending messages when Enter is pressed
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && text.trim()) {
      if (text.startsWith("/name")) {
        const newName = text.slice(6).trim();
        window.localStorage.setItem("username", newName);
      } else {
        sendMessage(text, attachments);
      }

      setText("");
      setattachments([]);
    }
  };

  // Update text state as user types
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setText(event.target.value);
  };

  // Automatically scroll to the bottom once on initial load
  useEffect(() => {
    if (scrollContainerRef.current && !hasScrolledInitially.current) {
      scrollContainerRef.current.scrollTop =
        scrollContainerRef.current.scrollHeight;
      hasScrolledInitially.current = true;
    }
  }, []);

  // Auto-scroll when new messages arrive unless the user has scrolled up a
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container && !userScrolledUp.current) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  // Track if user has scrolled up manually
  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (container) {
      const distanceFromBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight;
      userScrolledUp.current = distanceFromBottom > 50;
    }
  };

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isImageUrl = (url: string) => {
    // Check if the URL ends with common image extensions
    const imageExtensions = [
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".bmp",
      ".webp",
      ".svg",
    ];
    return imageExtensions.some((ext) => url.toLowerCase().endsWith(ext));
  };

  const sortAttachments = (attachments: string[]) => {
    return [...attachments].sort((a, b) => {
      const aIsImage = isImageUrl(a);
      const bIsImage = isImageUrl(b);

      if (aIsImage && !bIsImage) return -1;
      if (!aIsImage && bIsImage) return 1;
      return 0;
    });
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Chat room selection sidebar */}
      <div
        className="h-full py-5 flex flex-col items-center"
        style={{ width: "7vw", backgroundColor: COLORS.chatSelection }}
      >
        {/* {allChats.map((chat) => (
          <div
            className={cn(
              "hover:cursor-pointer hover:bg-gray-600 w-4/5 p-2 mb-2 rounded-full text-center text-white text-sm",
              {
                "bg-gray-700": selectedChat?.id !== chat.id,
                "bg-gray-600": selectedChat?.id === chat.id,
              }
            )}
            key={chat.id}
            onClick={() => router.push(`?id=${chat.id}`)}
          >
            {chat.name}
          </div>
        ))} */}
      </div>

      {/* Main chat area */}

      <div
        className="h-full flex flex-col"
        style={{ width: "75vw", backgroundColor: COLORS.main }}
      >
        {/* Messages container with scroll */}

        <div
          className="flex flex-col overflow-y-auto p-4 flex-grow"
          ref={scrollContainerRef}
          onScroll={handleScroll}
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className="bg-gray-800 p-3 mb-3 rounded-lg text-white flex flex-col"
            >
              <div className="flex items-center mb-2 gap-3">
                <div className="flex items-center gap-1">
                  <div className="text-gray-300 font-semibold">
                    {message.authorName}
                  </div>

                  {message.authorBot ? (
                    <div className="text-gray-300 font-semibold text-xs tracking-wide bg-blue-600/[50%] rounded-sm px-1 p-[1px]">
                      BOT
                    </div>
                  ) : null}
                </div>
                <div className="text-xs text-gray-400">
                  {GetTimeAgo(message.createdAt)}
                </div>
              </div>
              <div
                style={getMessageStyle(message.text) as React.CSSProperties}
                className="text-gray-100"
              >
                {getMessageText(message.text)}
              </div>
              <div className=" flex flex-wrap gap-2">
                {message.attachments.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {sortAttachments(message.attachments).map((attachment) =>
                      isImageUrl(attachment) ? (
                        <div
                          key={attachment}
                          className="relative overflow-hidden"
                        >
                          <img
                            src={attachment}
                            alt={getAttachmentNameFromUrl(attachment) || ""}
                            className="max-w-xs max-h-64 rounded-md min-w-32"
                            loading="lazy"
                          />
                          <a
                            href={attachment}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute bottom-2 right-2 bg-gray-900 bg-opacity-70 text-blue-400 hover:text-blue-300 px-2 py-1 rounded text-xs"
                          >
                            View Full
                          </a>
                        </div>
                      ) : (
                        <a
                          key={attachment}
                          href={attachment}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 h-fit w-fit hover:underline px-3 py-2 bg-gray-700 rounded-md flex items-center"
                        >
                          <span className="mr-2">📎</span>
                          {getAttachmentNameFromUrl(attachment)}
                        </a>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Message input */}
        <div className="p-4 flex items-center gap-2">
          <input
            type="text"
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message and press enter..."
            className="min-w-0 flex-1 p-3 h-[48px] rounded-lg text-white"
            style={{ backgroundColor: COLORS.textBox, outline: "none" }}
          />
          <button
            onClick={() => {
              if (fileInputRef.current) {
                fileInputRef.current.click();
              }
            }}
            className="w-[48px] h-[48px] bg-white/20 text-xl rounded-full grid place-items-center"
          >
            <i className="bi bi-plus-lg"></i>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple={true}
            className="hidden"
            onChange={async (event: React.ChangeEvent<HTMLInputElement>) => {
              if (!event.target.files || event.target.files.length === 0) {
                return;
              }

              await Promise.all(
                Array.from(event.target.files || []).map(async (file) => {
                  if (file.size > 50 * 1024 * 1024) {
                    alert("File size exceeds 50MB limit");
                    return;
                  }

                  const response = (await fetchAPI({
                    uri: "/file/get-presigned-upload-url",
                    method: "POST",
                    body: {
                      fileName: file.name,
                    },
                  })) as {
                    url: string;
                    key: string;
                  };

                  if (!response.url || !response.key) {
                    alert("Failed to upload file");
                    return;
                  }

                  const uploadResponse = await fetch(response.url, {
                    method: "PUT",
                    body: file,
                    headers: {
                      "Content-Type": file.type,
                    },
                  });
                  if (!uploadResponse.ok) {
                    alert("Failed to upload file");
                    return;
                  }

                  const uploadedFileUrl =
                    "https://pub-1ad4139dc9ed4e75ba1b107a2ea2dcc0.r2.dev/" +
                    response.key;

                  setattachments((prev) => [...prev, uploadedFileUrl]);
                })
              );

              fileInputRef.current!.value = "";
            }}
          />
        </div>
        {attachments.length ? (
          <div className="p-4 pt-0 flex items-center gap-2">
            <p>
              {`attachments: ${attachments
                .map(getAttachmentNameFromUrl)
                .join(", ")}`}
            </p>
          </div>
        ) : null}
      </div>
      <div
        className="h-full flex server-info"
        style={{ width: "20vw", backgroundColor: COLORS.chatSelection }}
      >
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
          <p className="text-2xl text-center">
            {" "}
            Or join at https://tinyurl.com/bdhsyfu7
          </p>
        </div>
      </div>
    </div>
  );
}

export function getAttachmentNameFromUrl(url: string) {
  return url
    .split("https://pub-1ad4139dc9ed4e75ba1b107a2ea2dcc0.r2.dev/")[1]
    .split("-")
    .slice(1)
    .join("-");
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
