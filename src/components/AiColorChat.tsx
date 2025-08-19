import { useState, useEffect, useRef } from "react";
import { useMutation, useAction, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface AiColorChatProps {
  setCurrentPage: (page: string) => void;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  type?: "message" | "analysis" | "result";
  analysisData?: any;
  timestamp: number;
}

export function AiColorChat({ setCurrentPage }: AiColorChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showAnalysisResult, setShowAnalysisResult] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const startConsultation = useMutation(api.aiColorChat.startColorConsultation);
  const sendMessage = useAction(api.aiColorChat.sendChatMessage);
  const userSeasonalType = useQuery(api.quiz.getUserSeasonalType);

  // Initialize consultation
  useEffect(() => {
    const initConsultation = async () => {
      try {
        const result = await startConsultation();
        setSessionId(result.sessionId);
        
        // Add welcome message
        const welcomeMessage: Message = {
          id: "welcome",
          role: "assistant",
          content: result.message,
          type: "message",
          timestamp: Date.now(),
        };
        setMessages([welcomeMessage]);
        // Auto-focus input after welcome message
        setTimeout(() => {
          inputRef.current?.focus();
        }, 500);
      } catch (error) {
        toast.error("Failed to start consultation");
      }
    };

    if (!sessionId && !userSeasonalType) {
      initConsultation();
    }
  }, [sessionId, userSeasonalType, startConsultation]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Typewriter effect for AI messages
  const typewriterEffect = (text: string, callback: () => void) => {
    setIsTyping(true);
    let index = 0;
    const typingSpeed = 20; // milliseconds per character
    
    const typeInterval = setInterval(() => {
      if (index < text.length) {
        index++;
        // Update the last message content
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage && lastMessage.role === "assistant") {
            lastMessage.content = text.substring(0, index);
          }
          return newMessages;
        });
      } else {
        clearInterval(typeInterval);
        setIsTyping(false);
        callback();
        // Auto-focus the input after AI finishes typing
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      }
    }, typingSpeed);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !sessionId || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: inputMessage.trim(),
      type: "message",
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      // Prepare conversation history for OpenAI
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await sendMessage({
        sessionId,
        message: userMessage.content,
        conversationHistory,
      });

      // Create assistant message
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: "", // Will be filled by typewriter effect
        type: response.type,
        analysisData: response.analysisData,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Apply typewriter effect
      typewriterEffect(response.message, () => {
        if (response.type === "analysis" && response.analysisData) {
          setAnalysisResult(response.analysisData);
          setShowAnalysisResult(true);
        }
      });

    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
      
      // Add fallback message
      const fallbackMessage: Message = {
        id: `fallback-${Date.now()}`,
        role: "assistant",
        content: "I'm having some technical difficulties. Let me ask you directly: What's your natural hair color, and would you say your skin has more cool (pink/blue) or warm (yellow/golden) undertones?",
        type: "message",
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, fallbackMessage]);
      // Auto-focus input after fallback message
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // If user already has results, show them
  if (userSeasonalType && !showAnalysisResult) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Seasonal Type</h2>
            <div className="inline-block px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full text-xl font-semibold">
              {userSeasonalType.seasonalType}
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600">{userSeasonalType.description}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Perfect Colors</h3>
              <div className="flex flex-wrap gap-3">
                {userSeasonalType.colors.map((color) => (
                  <span
                    key={color}
                    className="px-4 py-2 bg-gray-100 text-gray-800 rounded-full text-sm font-medium"
                  >
                    {color}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Characteristics</h3>
              <ul className="space-y-2">
                {userSeasonalType.characteristics.map((char, index) => (
                  <li key={index} className="flex items-center text-gray-600">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                    {char}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Start New Consultation
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show analysis result if available
  if (showAnalysisResult && analysisResult) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Color Analysis Result!</h2>
            <div className="inline-block px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full text-xl font-semibold">
              You are a {analysisResult.seasonalType}
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Analysis</h3>
              <p className="text-gray-600">{analysisResult.reasoning}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600">{analysisResult.description}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Perfect Colors</h3>
              <div className="flex flex-wrap gap-3">
                {analysisResult.colors.map((color: string) => (
                  <span
                    key={color}
                    className="px-4 py-2 bg-gray-100 text-gray-800 rounded-full text-sm font-medium"
                  >
                    {color}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Characteristics</h3>
              <ul className="space-y-2">
                {analysisResult.characteristics.map((char: string, index: number) => (
                  <li key={index} className="flex items-center text-gray-600">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                    {char}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 mb-4">
              Confidence: {Math.round((analysisResult.confidence || 0.8) * 100)}%
            </p>
            <div className="flex space-x-4 justify-center">
              <button
                onClick={() => setCurrentPage("products")}
                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 transition-colors"
              >
                Shop Your Colors
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                New Consultation
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Chat interface
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden h-[600px] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white p-6">
          <h2 className="text-2xl font-bold mb-2">AI Color Consultant</h2>
          <p className="text-pink-100">Let's discover your perfect seasonal color palette together!</p>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                  message.role === "user"
                    ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                <div className="whitespace-pre-wrap text-sm">
                  {message.content}
                </div>
                {message.role === "assistant" && message.type === "analysis" && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <span className="text-xs text-gray-500">Analysis Complete</span>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-900 px-4 py-3 rounded-2xl max-w-xs">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex space-x-4">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Tell me about your natural coloring..."
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={2}
              disabled={isLoading || isTyping}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading || isTyping}
              className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Send"
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>

      {/* Fallback Option */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 mb-3">
          Prefer the traditional quiz format?
        </p>
        <button
          onClick={() => {
            // Reset and show traditional quiz
            window.location.reload();
          }}
          className="text-purple-600 hover:text-purple-700 text-sm font-medium"
        >
          Take the Classic Quiz Instead
        </button>
      </div>
    </div>
  );
}