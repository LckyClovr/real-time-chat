import { Suspense } from "react";
import { ChatContextProvider } from "../_components/ChatContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense>
      <ChatContextProvider>{children}</ChatContextProvider>
    </Suspense>
  );
}
