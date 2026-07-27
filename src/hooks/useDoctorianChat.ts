import { useState, useCallback } from 'react';
import { sendChatMessage, ChatMessage, DOCTORIAN_SYSTEM_INSTRUCTION } from '../services/aiService';

export function useDoctorianChat(initialSystemInstruction: string = DOCTORIAN_SYSTEM_INSTRUCTION) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>("Doctorian is thinking...");
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (userText: string) => {
    if (!userText || !userText.trim()) return;

    const trimmedText = userText.trim();
    const userMessage: ChatMessage = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      role: 'user',
      content: trimmedText,
      timestamp: new Date(),
    };

    // 1. Immediately append user message to conversation
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setStatusMessage("Doctorian is thinking...");
    setError(null);

    // 2. Call backend AI service
    const result = await sendChatMessage({
      message: trimmedText,
      systemInstruction: initialSystemInstruction,
    });

    setIsLoading(false);

    if (result.error) {
      setError(result.error);
      const errorMessage: ChatMessage = {
        id: `err_${Date.now()}`,
        role: 'assistant',
        content: `⚠️ **Doctorian AI Advisory**: ${result.error}`,
        timestamp: new Date(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } else {
      const botMessage: ChatMessage = {
        id: `bot_${Date.now()}`,
        role: 'assistant',
        content: result.response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    }
  }, [initialSystemInstruction]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    statusMessage,
    error,
    sendMessage,
    clearMessages,
  };
}
