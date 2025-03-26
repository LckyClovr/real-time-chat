import { User } from "@/ts/api/api.types";
import { fetchAPI } from "../util";

const auth = {
  getCurrentUser: GetCurrentUser,
};

export default auth;

async function GetCurrentUser() {
  const response = (await fetchAPI({
    method: "GET",
    uri: "/auth/me",
  })) as { user?: User; error?: string };

  return {
    user: response?.user || undefined,
    error: response?.error || undefined,
  };
}
