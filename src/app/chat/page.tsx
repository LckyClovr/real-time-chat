"use client";
import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import { useChatContext } from "../_components/ChatContext";
import { useRouter } from "next/navigation";
import GetTimeAgo from "@/ts/utils/GetTimeAgo";
import { cn } from "@/ts/utils/cn";

const mainBackgroundColor = "#262626";
const friendsBackgroundColor = "#202020";
const chatroomSelectionBackgroundColor = "#191919";
const textBoxColor = "#323232";
//there are some weird numbers in the positioning and sizing that are taken by positioning manually using
//pixels then converting to a dynamic percentage of the viewport size so they scale with the window
//console.log(window.innerHeight)// 1440 by 778 for some reason?

export default function Page() {
  const router = useRouter();
  const { selectedChat, messages, allChats, sendMessage } = useChatContext();

  const [text, setText] = useState("");

  // refs for controlling scroll behavior
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const hasScrolledInitially = useRef(false); // only scroll to bottom on first load
  const userScrolledUp = useRef(false); // track if user scrolled up manually

  const keyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      sendMessage(text); // Call the sendMessage function with the current text
      setText(""); // remove the text in the chat box after hitting enter so we can type our next message
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setText(event.target.value); // Update the state as the user types
  };

  // Automatically scroll to the bottom once on initial load
  useEffect(() => {
    if (scrollContainerRef.current && !hasScrolledInitially.current) {
      scrollContainerRef.current.scrollTop =
        scrollContainerRef.current.scrollHeight;
      hasScrolledInitially.current = true;
    }
  }, []);

  // Auto-scroll when new messages arrive unless the user has scrolled up
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

      // if the user scrolls more than 50px away from bottom, we stop auto-scrolling
      userScrolledUp.current = distanceFromBottom > 50;
    }
  };

  if (allChats.length === 0) {
    return (
      <div className="flex flex-row text-3xl items-center justify-center w-screen h-screen">
        <p className="text-center">
          Loading, please wait
          <span className="animate-[blink_1.5s_steps(5,start)_infinite]">
            ...
          </span>
        </p>
        <style jsx>{`
          @keyframes blink {
            0% {
              opacity: 1;
            }
            50% {
              opacity: 0;
            }
            100% {
              opacity: 1;
            }
          }
        `}</style>
      </div>
    ); // or some loading spinner
  }

  return (
    <div>
      <div
        style={{
          // rectangle for background of chatroom selection
          width: "6.94vw", // Width of the rectangle
          height: "100vh", // Height of the rectangle
          backgroundColor: chatroomSelectionBackgroundColor, // Background color of the rectangle
        }}
        className="py-5"
      >
        {allChats.map((chat) => {
          return (
            <div
              className={cn(
                `hover:cursor-pointer hover:bg-gray-600 w-full rounded-full text-center`,
                {
                  "bg-gray-700": selectedChat?.id !== chat.id,
                  "bg-gray-600": selectedChat?.id === chat.id,
                }
              )}
              key={chat.id}
              onClick={() => {
                // make a function that takes the chat id as input and sets the selected chat to that chat
                router.push(`?id=${chat.id}`); // this is the function that changes the url to the chat id
              }}
            >
              {chat.name}
            </div>
          );
        })}
      </div>
      <div
        style={{
          // rectangle for background of friends list
          width: "20.83vw", // Width of the rectangle
          height: "100vh", // Height of the rectangle
          backgroundColor: friendsBackgroundColor, // Background color of the rectangle
          position: "absolute",
          top: "0px",
          left: "6.94vw",
        }}
      />
      <div
        style={{
          // rectangle for background of info on the users
          width: "20.83vw", // Width of the rectangle
          height: "100vh", // Height of the rectangle
          backgroundColor: friendsBackgroundColor, // Background color of the rectangle
          position: "absolute",
          top: "0px",
          left: "83.3vw",
        }}
      />
      <div
        style={{
          // rectangle for background of chat
          width: "55.6vw", // Width of the rectangle
          height: "100vh", // Height of the rectangle
          backgroundColor: mainBackgroundColor, // Background color of the rectangle
          position: "absolute",
          top: "0px",
          left: "27.78vw",
        }}
      >
        <div
          className="flex flex-col overflow-y-scroll h-[85%] w-full"
          ref={scrollContainerRef}
          onScroll={handleScroll}
        >
          {messages.map((message) => {
            return (
              <div key={message.id} className="bg-gray-800 p-2 m-2 rounded-md">
                <div className="flex items-center mb-1 gap-4">
                  <div className="text-gray-300 font-semibold">
                    {message.user.name}:
                  </div>
                  <div>{GetTimeAgo(message.createdAt)}</div>
                </div>
                {message.text}
              </div>
            );
          })}
        </div>
      </div>
      <input
        type="text"
        id="chatTextBox"
        value={text}
        onChange={handleChange}
        placeholder="Type your message and press enter..."
        onKeyDown={keyDown}
        style={{
          width: "41.6vw",
          padding: "1.28vh",
          paddingLeft: "4.16vw",
          color: "#efefef",
          position: "absolute",
          top: "89.97vh",
          left: "34.72vw",
          borderRadius: "1.28vh",
          backgroundColor: textBoxColor,
          outline: "none",
          fontSize: "1.11vw",
        }}
      />
    </div>
  );
}
