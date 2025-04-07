import { redirect } from "next/navigation";
export default function Page() {
  redirect("/chat"); // Redirect to the chat page
  // All code from here was moved to the chat page (real-time-chat\src\app\chat\page.tsx)
}
