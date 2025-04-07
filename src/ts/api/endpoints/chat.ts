import { Chat, User } from "@/ts/api/api.types";
import { fetchAPI } from "../util";

const chat = {
  createChat: createChat,
  getChatList: getChatList,
  getChat: getChat,
};

export default chat;

async function createChat(chatName: string) {
  const response = (await fetchAPI({
    method: "POST",
    uri: "/chat/create-chat",
    body: { chatName },
  })) as { chat?: any; error?: string };

  return {
    chat: response?.chat || undefined,
    error: response?.error || undefined,
  };
}

async function getChatList() {
  const response = (await fetchAPI({
    method: "GET",
    uri: "/chat/list",
  })) as { chats?: Chat[]; error?: string };

  return {
    chats: response?.chats || [],
    error: response?.error || undefined,
  };
}

async function getChat(chatId: string) {
  const response = (await fetchAPI({
    method: "GET",
    uri: `/chat/${chatId}/get`,
  })) as { chat?: Chat; error?: string };

  return {
    chat: response?.chat || undefined,
    error: response?.error || undefined,
  };
}
