// TextEditor.tsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useChatContext } from "@/app/_components/ChatContext";

interface DocumentInfo {
  id: string;
  content: string;
  fileName: string;
}

interface ChatContextType {
  activeDocument: DocumentInfo | null;
  documentEditors: number;
  updateDocument: (c: string) => void;
  closeDocument: () => void;
  saveDocument: () => void;
}

const COLORS = {
  editorBg: "#1e1e1e",
  editorText: "#f0f0f0",
  editorHeader: "#333333",
};

export default function TextEditor() {
  const {
    activeDocument,
    documentEditors,
    updateDocument,
    closeDocument,
    saveDocument,
  } = useChatContext() as ChatContextType;

  const [content, setContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // refs to manage typing bursts
  const changeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  const activeDocIdRef = useRef<string>("");
  const initialLoadDoneRef = useRef(false);

  // 1) initial load, once per-document
  useEffect(() => {
    if (!activeDocument) return;
    const docId = activeDocument.id;
    if (docId !== activeDocIdRef.current || !initialLoadDoneRef.current) {
      activeDocIdRef.current = docId;
      initialLoadDoneRef.current = true;
      setContent(activeDocument.content);
    }
  }, [activeDocument]);

  // 2) remote-sync: apply whenever server content changes and user isn't typing
  useEffect(() => {
    if (
      activeDocument &&
      initialLoadDoneRef.current &&
      activeDocument.content !== content &&
      !isTypingRef.current
    ) {
      setContent(activeDocument.content);
    }
  }, [activeDocument?.content, content, activeDocument]);

  // debounce updates and mark “typing”
  const debouncedUpdate = useCallback(
    (newContent: string) => {
      // mark typing
      isTypingRef.current = true;
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        isTypingRef.current = false;
      }, 500);

      // debounce the WS update
      if (changeTimeoutRef.current) clearTimeout(changeTimeoutRef.current);
      changeTimeoutRef.current = setTimeout(() => {
        if (activeDocument && newContent !== activeDocument.content) {
          updateDocument(newContent);
        }
      }, 300);
    },
    [activeDocument, updateDocument]
  );

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value;
    setContent(v);
    debouncedUpdate(v);
  };

  // clean up timers on unmount
  useEffect(() => {
    return () => {
      if (changeTimeoutRef.current) clearTimeout(changeTimeoutRef.current);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  const handleSave = () => {
    if (activeDocument) updateDocument(content);
    saveDocument();
  };

  const handleClose = () => {
    if (activeDocument && content !== activeDocument.content) {
      updateDocument(content);
    }
    closeDocument();
  };

  // auto-resize
  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = `${ta.scrollHeight}px`;
    }
  }, [content]);

  if (!activeDocument) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div
        className="w-full max-w-4xl h-4/5 flex flex-col rounded-lg overflow-hidden"
        style={{ backgroundColor: COLORS.editorBg }}
      >
        {/* header */}
        <div
          className="flex items-center justify-between px-4 py-2"
          style={{ backgroundColor: COLORS.editorHeader }}
        >
          <div className="flex items-center gap-4">
            <span className="text-white font-medium truncate">
              {activeDocument.fileName}
            </span>
            <span className="text-gray-400 text-sm">
              {documentEditors} {documentEditors === 1 ? "person" : "people"}{" "}
              editing
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm"
            >
              Save to Computer
            </button>
            <button
              onClick={handleClose}
              className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-sm"
            >
              Close
            </button>
          </div>
        </div>

        {/* editor */}
        <div className="flex-1 overflow-auto p-4">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleContentChange}
            spellCheck={false}
            className="w-full h-full resize-none outline-none p-2 font-mono"
            style={{
              backgroundColor: COLORS.editorBg,
              color: COLORS.editorText,
              lineHeight: 1.5,
            }}
          />
        </div>

        {/* footer */}
        <div
          className="px-4 py-2 text-xs text-gray-400 flex justify-between"
          style={{ backgroundColor: COLORS.editorHeader }}
        >
          <div>
            {documentEditors > 1
              ? `${documentEditors - 1} other ${
                  documentEditors - 1 === 1 ? "person" : "people"
                } editing with you`
              : "You are the only one editing this document"}
          </div>
          <div>Changes are automatically saved and shared</div>
        </div>
      </div>
    </div>
  );
}
