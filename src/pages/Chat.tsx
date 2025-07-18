import { useState, useRef, useEffect, useCallback } from "react";
import { connect } from "@permaweb/aoconnect";

interface Message {
  id: string;
  role: "user" | "model" | "system";
  content: string;
  timestamp: Date;
}

interface ApiMessage {
  id: string | number;
  role: "user" | "model" | "system";
  content: string;
  timestamp: string;
  user?: string;
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingMessages, setIsFetchingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [nextRefreshIn, setNextRefreshIn] = useState<number>(10);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  // Auto scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getMessages = useCallback(async () => {
    setIsFetchingMessages(true);
    setError(null);

    try {
      const ao = connect({ MODE: "legacy" });

      await window.arweaveWallet.connect([
        "ACCESS_ADDRESS",
        "SIGN_TRANSACTION",
      ]);
      const user = await window.arweaveWallet.getActiveAddress();

      const res = await ao.dryrun({
        process: "_K3qyW_iXkmmUZu4Sz-vrnRW-G8fQMF8HSH0UP6AGV8",
        tags: [
          { name: "Action", value: "Get-Message" },
          { name: "user", value: user },
        ],
      });
      console.log(res);
      if (res.Error) {
        const isUserNotProvided = res.Error.includes("user not provided");
        if (isUserNotProvided) {
          setError("User is required for this action");
          return;
        }
        setError(res.Error);
        return;
      }

      if (!res.Messages || res.Messages.length === 0) {
        setError("No messages received from the server");
        return;
      }

      const data = JSON.parse(res.Messages[0].Data);
      console.log("Fetched messages:", data);

      // Handle both array and single message responses
      const messageArray = Array.isArray(data) ? data : [data];

      // Convert timestamp strings to Date objects
      const messagesWithDates = messageArray.map((msg: ApiMessage) => ({
        ...msg,
        id: msg.id.toString(), // Ensure id is string
        timestamp: new Date(msg.timestamp),
      }));

      setMessages(messagesWithDates);
      setLastRefresh(new Date());
      return messagesWithDates as Message[];
    } catch (error) {
      console.error("Error fetching messages:", error);
      setError(
        error instanceof Error ? error.message : "Failed to fetch messages"
      );
    } finally {
      setIsFetchingMessages(false);
    }
  }, []);
  useEffect(() => {
    getMessages();
  }, [getMessages]);

  // Auto-refresh messages every 10 seconds when enabled
  useEffect(() => {
    if (autoRefresh && !isLoading && !isFetchingMessages) {
      // Start countdown
      setNextRefreshIn(10);
      
      // Countdown timer
      countdownRef.current = setInterval(() => {
        setNextRefreshIn((prev) => {
          if (prev <= 1) {
            return 10; // Reset countdown
          }
          return prev - 1;
        });
      }, 1000);

      // Refresh interval
      intervalRef.current = setInterval(() => {
        // getMessages();
        setNextRefreshIn(3); // Reset countdown after refresh
      }, 3000); // 10 seconds

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        if (countdownRef.current) {
          clearInterval(countdownRef.current);
          countdownRef.current = null;
        }
      };
    } else {
      // Clear intervals when auto-refresh is disabled or when loading
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
      setNextRefreshIn(10);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
    };
  }, [autoRefresh, isLoading, isFetchingMessages, getMessages]);

  // Cleanup intervals on component unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);
    setError(null);

    try {
      const ao = connect({ MODE: "legacy" });
      await window.arweaveWallet.connect([
        "ACCESS_ADDRESS",
        "SIGN_TRANSACTION",
      ]);
      const user = await window.arweaveWallet.getActiveAddress();

      const res = await ao.dryrun({
        process: "_K3qyW_iXkmmUZu4Sz-vrnRW-G8fQMF8HSH0UP6AGV8",
        tags: [
          { name: "Action", value: "Send-Message" },
          { name: "timestamp", value: userMessage.timestamp.toISOString() },
          { name: "user", value: user },
        ],
        data: JSON.stringify(userMessage),
      });

      if (res.Error) {
        setError(res.Error);
        return;
      }

      if (!res.Messages || res.Messages.length === 0) {
        setError("No response received from the server");
        return;
      }

      const result = res.Messages[0].Data;
      console.log("Response:", JSON.parse(result));

      // Refresh messages to get the latest state
      await getMessages();
    } catch (error) {
      console.error("Error sending message:", error);
      setError(
        error instanceof Error ? error.message : "Failed to send message"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    // Handle invalid dates
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return "Invalid time";
    }

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getRoleColor = (role: Message["role"]) => {
    switch (role) {
      case "user":
        return "bg-blue-600";
      case "model":
        return "bg-green-600";
      case "system":
        return "bg-gray-600";
      default:
        return "bg-gray-600";
    }
  };

  const getRoleLabel = (role: Message["role"]) => {
    switch (role) {
      case "user":
        return "You";
      case "model":
        return "Model";
      case "system":
        return "System";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4 bg-gray-800">
      {/* Header */}
      <div className="card mb-4">
        <div className="flex items-center justify-between">
          <div className="text-center flex-1">
            <h1 className="text-2xl font-bold">Chat Interface</h1>
            <p className="text-gray-400 mt-2">
              Send messages and receive responses from the AI model
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                getMessages();
                if (autoRefresh) {
                  setNextRefreshIn(10); // Reset countdown
                }
              }}
              disabled={isFetchingMessages}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              title="Refresh messages"
            >
              {isFetchingMessages ? (
                <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "↻"
              )}
            </button>
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded"
              />
              Auto-refresh (5s)
            </label>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 card overflow-hidden flex flex-col">
        {/* Error Display */}
        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg m-4">
            <div className="flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className="text-red-200 hover:text-white text-xl font-bold"
              >
                ×
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Loading indicator for fetching messages */}
          {isFetchingMessages && messages.length === 0 && (
            <div className="flex justify-center">
              <div className="text-gray-400">Loading messages...</div>
            </div>
          )}

          {/* No messages state */}
          {!isFetchingMessages && messages.length === 0 && !error && (
            <div className="flex justify-center">
              <div className="text-gray-400">
                No messages yet. Start a conversation!
              </div>
            </div>
          )}

          {messages.length > 0 &&
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[70%] ${
                    message.role === "user" ? "order-2" : "order-1"
                  }`}
                >
                  {/* Message Header */}
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getRoleColor(
                        message.role
                      )}`}
                    >
                      {getRoleLabel(message.role)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>

                  {/* Message Content */}
                  <div
                    className={`p-3 rounded-lg ${
                      message.role === "user"
                        ? "bg-blue-600 text-white ml-auto"
                        : message.role === "model"
                        ? "bg-gray-800 text-gray-100"
                        : "bg-gray-700 text-gray-200"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[70%]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-1 rounded-full text-xs font-medium text-white bg-green-600">
                    model
                  </span>
                  <span className="text-xs text-gray-500">typing...</span>
                </div>
                <div className="bg-gray-800 text-gray-100 p-3 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <div className="border-t border-gray-800 p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading }
              className="btn-primary min-w-[80px]"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
              ) : (
                "Send"
              )}
            </button>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  const syntheticEvent = {
                    ...e,
                    currentTarget: e.currentTarget.form,
                    preventDefault: () => e.preventDefault(),
                  } as React.FormEvent;
                  handleSubmit(syntheticEvent);
                }
              }}
              placeholder="Type your message here..."
              disabled={isLoading}
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              maxLength={1000}
            />
            {error && (
              <button
                type="button"
                onClick={() => getMessages()}
                disabled={isFetchingMessages}
                className="btn-primary min-w-[80px]"
                title="Retry fetching messages"
              >
                {isFetchingMessages ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                ) : (
                  "Retry"
                )}
              </button>
            )}
          </form>

          <div className="text-xs text-gray-500 mt-2 text-center">
            {messages.length} message{messages.length !== 1 ? "s" : ""}
            {isFetchingMessages && " • Refreshing..."}
            {lastRefresh && !isFetchingMessages && (
              <span>
                {" • "}Last updated: {formatTime(lastRefresh)}
                {autoRefresh && ` • Next refresh in ${nextRefreshIn}s`}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
