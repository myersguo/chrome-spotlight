import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

interface AiChatResultProps {
    query: string;
    keyword: string;
}

interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

interface AiChatSettings {
    aiChatEnabled: boolean;
    aiChatProvider: string;
    aiChatApiUrl: string;
    aiChatApiKey: string;
    aiChatModel: string;
}

const AiChatResult: React.FC<AiChatResultProps> = ({ query, keyword }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [settings, setSettings] = useState<AiChatSettings>({
        aiChatEnabled: false,
        aiChatProvider: 'volcengine',
        aiChatApiUrl: '',
        aiChatApiKey: '',
        aiChatModel: ''
    });
    const [copiedMessageId, setCopiedMessageId] = useState<number | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Extract the query without the keyword
    const extractedQuery = query.substring(keyword.length).trim();

    useEffect(() => {
        // Load settings
        chrome.storage.sync.get({
            aiChatEnabled: false,
            aiChatProvider: 'volcengine',
            aiChatApiUrl: 'https://ark.cn-beijing.volces.com',
            aiChatApiKey: '',
            aiChatModel: 'doubao-1-5-lite-32k-250115'
        }, (items) => {
            setSettings(items as AiChatSettings);
        });
    }, []);

    useEffect(() => {
        // If there's an initial query, send it
        if (extractedQuery && !messages.length) {
            handleSendMessage(extractedQuery);
        }
    }, [extractedQuery]);

    useEffect(() => {
        // Scroll to bottom when messages change
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (inputRef.current && !loading && settings.aiChatEnabled) {
                inputRef.current.focus();
            }
        }, 100);
        return () => clearTimeout(timer);
    }, [loading, settings.aiChatEnabled]);

    useEffect(() => {
        if (messages.length === 0 && inputRef.current && !loading && settings.aiChatEnabled) {
            inputRef.current.focus();
        }
    }, [messages.length, loading, settings.aiChatEnabled]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            e.stopPropagation();
            handleSendMessage(inputValue);
        }
    };

    const handleSendMessage = (text: string) => {
        if (!text.trim() || loading) return;

        const userMessage: Message = { role: 'user', content: text };
        setMessages(prevMessages => [...prevMessages, userMessage]);
        setInputValue('');
        setLoading(true);
        setError(null);

        // Send message to background script to handle the API request
        chrome.runtime.sendMessage({
            action: "aiChat",
            messages: [...messages, userMessage],
            settings: settings
        }, (response) => {
            setLoading(false);
            if (response.error) {
                setError(response.error);
            } else if (response.message) {
                setMessages(prevMessages => [...prevMessages, response.message]);
            }
            if (inputRef.current) {
                inputRef.current.focus();
            }
        });
    };

    const handleNewChat = () => {
        setMessages([]);
        setInputValue('');
        setError(null);
    };

    const handleCopyMessage = (content: string, index: number) => {
        navigator.clipboard.writeText(content).then(() => {
            setCopiedMessageId(index);
            setTimeout(() => {
                setCopiedMessageId(null);
            }, 3000);
        }).catch(err => {
            console.error('Failed to copy:', err);
        });
    };

    if (!settings.aiChatEnabled) {
        return (
            <div className="spotlight-ai-chat-disabled">
                <p>AI Chat is disabled. Please enable it in the options page.</p>
                <button
                    className="search-action-button"
                    onClick={() => chrome.runtime.sendMessage({ action: "openOptionsPage" })}
                >
                    Open Settings
                </button>
            </div>
        );
    }

    return (
        <div className="spotlight-ai-chat">
            <div className="ai-chat-header">
                <div className="provider-name">
                    Engine:&nbsp;
                    {settings.aiChatProvider === 'volcengine' && 'Volcengine'}
                    {settings.aiChatProvider === 'gemini' && 'Google Gemini'}
                    {settings.aiChatProvider === 'openai' && 'OpenAI'}
                    {settings.aiChatProvider === 'claude' && 'Anthropic Claude'}
                    {settings.aiChatProvider === 'custom' && 'Custom AI Provider'}
                </div>
                <button
                    className="new-chat-button"
                    onClick={handleNewChat}
                    title="New Chat"
                >
                    &#43;
                </button>
            </div>

            <div className="ai-chat-messages">
                {messages.length === 0 ? (
                    <div className="ai-chat-welcome">
                        <p>Start a conversation with the AI assistant</p>
                    </div>
                ) : (
                    messages.map((message, index) => (
                        <div
                            key={index}
                            className={`ai-chat-message ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}
                        >
                            <div className="message-bubble">
                                <div className="message-content">
                                    <ReactMarkdown
                                        components={{
                                            code({ node, className, children, ...props }) {
                                                const match = /language-(\w+)/.exec(className || '');
                                                return  match ? (
                                                    <div className="code-block-wrapper">
                                                        <div className="code-block-header">
                                                            <span className="code-language">{match[1]}</span>
                                                            <button
                                                                className="copy-code-button"
                                                                onClick={() => {
                                                                    navigator.clipboard.writeText(String(children).replace(/\n$/, ''));
                                                                }}
                                                            >
                                                                Copy
                                                            </button>
                                                        </div>
                                                        <pre className={`code-block ${className || ''}`}>
                                                            <code {...props}>{children}</code>
                                                        </pre>
                                                    </div>
                                                ) : (
                                                    <code className={className} {...props}>
                                                        {children}
                                                    </code>
                                                );
                                            },
                                            pre({ node, children, ...props }) {
                                                return <div className="pre-wrapper" {...props as React.HTMLAttributes<HTMLDivElement>}>{children}</div>;
                                            }
                                        }}
                                    >
                                        {message.content}
                                    </ReactMarkdown>
                                </div>

                                {message.role === 'assistant' && (
                                    <div className="message-actions">
                                        <button
                                            className="copy-message-button"
                                            onClick={() => handleCopyMessage(message.content, index)}
                                            title={copiedMessageId === index ? "Copied!" : "Copy message"}
                                        >
                                            {copiedMessageId === index ? (
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="20 6 9 17 4 12"></polyline>
                                                </svg>
                                            ) : (
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                )}

                            </div>
                        </div>
                    ))
                )}

                {loading && (
                    <div className="ai-chat-message assistant-message">
                        <div className="message-bubble">
                            <div className="loading-indicator">
                                <div className="loading-dot"></div>
                                <div className="loading-dot"></div>
                                <div className="loading-dot"></div>
                            </div>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="ai-chat-error">
                        <p>Error: {error}</p>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            <div className="ai-chat-input">
                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    disabled={loading}
                />
                <button
                    onClick={() => handleSendMessage(inputValue)}
                    disabled={!inputValue.trim() || loading}
                    className="send-button"
                >
                    Send
                </button>
            </div>

            <div className="ai-chat-footer">
                <a
                    href="#"
                    onClick={(e) => {
                        e.preventDefault();
                        chrome.runtime.sendMessage({ action: "openOptionsPage" });
                    }}
                >
                    AI Chat Settings
                </a>
            </div>
        </div>
    );
};

export default AiChatResult;
