"use client";

import { useEffect } from "react";
import useWebSocket from "react-use-websocket";

export default function WebSocketClient() {
  const WS_URL = `${process.env.NEXT_PUBLIC_WS_SERVER}`;

  const { lastMessage } = useWebSocket(WS_URL, {
    share: true,
    shouldReconnect: () => true,
  });

  function parseData(dataStr: string) {
    let data = null;
    try {
      data = JSON.parse(dataStr);
    } catch {}

    return data;
  }

  useEffect(() => {
    const data = parseData(lastMessage?.data + "");
    if (!data) return;

    console.log("websocket message: ", data);
  }, [lastMessage]);

  return null;
}
