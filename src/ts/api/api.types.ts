// File: @/ts/api/api.types.ts
// This extends your existing types with the new document-related types

export interface Message {
  id: string;
  text: string;
  attachments: string[];
  createdAt: number;
  authorName: string;
  authorBot?: boolean;
}

export interface DocumentEditSession {
  documentId: string;
  content: string;
  fileName: string;
  editors: string[]; // Array of connection IDs
  lastUpdated: number;
}

export interface WebSocketEvents {
  // Existing events
  "room:join": {
    roomId: string;
  };
  "room:joined": {
    messages: Message[];
    activeDocuments?: Map<string, DocumentEditSession>;
  };
  "message:send": {
    message: Message;
  };
  "message:received": {
    message: Message;
  };
  ping: {
    message: string;
  };

  // New document-related events
  "document:open": {
    documentId: string;
    content: string;
    fileName: string;
  };
  "document:opened": {
    documentId: string;
    content: string;
    fileName: string;
    editorsCount: number;
  };
  "document:update": {
    documentId: string;
    content: string;
  };
  "document:updated": {
    documentId: string;
    content: string;
    editorId: string;
  };
  "document:close": {
    documentId: string;
  };
  "document:editor-joined": {
    documentId: string;
    editorId: string;
    editorsCount: number;
  };
  "document:editor-left": {
    documentId: string;
    editorId: string;
    editorsCount: number;
  };
}

export type WebSocketEventType = keyof WebSocketEvents;
