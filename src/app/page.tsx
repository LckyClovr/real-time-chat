"use client";
import Image from "next/image";
import React from "react";
import { useState } from "react";

const mainBackgroundColor = "#262626";
const friendsBackgroundColor = "#202020";
const chatroomSelectionBackgroundColor = "#191919";
const textBoxColor = "#323232";
//there are some weird numbers in the positioning and sizing that are taken by positioning manually using
//pixels then converting to a dynamic percentage of the viewport size so they scale with the window
const Home: React.FC = () => {
  //console.log(window.innerHeight)// 1440 by 778 for some reason?
  const [text, setText] = useState("");
  const keyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      console.log(text); // right now it just outputs whatever you type into the console
      // make a function that takes the text in the textbox as input
      setText(""); // remove the text in the chat box after hitting enter so we can type our next message
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setText(event.target.value); // Update the state as the user types
  };
  return (
    <div>
      <div
        style={{
          // rectangle for background of chatroom selection
          width: "6.94vw", // Width of the rectangle
          height: "100vh", // Height of the rectangle
          backgroundColor: chatroomSelectionBackgroundColor, // Background color of the rectangle
        }}
      />
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
      />
      <input
        type="text"
        id="chatTextBox"
        value={text}
        onChange={handleChange}
        placeholder="Message @User"
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
};

export default Home;
