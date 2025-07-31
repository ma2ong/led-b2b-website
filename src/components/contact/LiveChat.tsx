/**
 * 在线客服聊天组件
 */
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'next-i18next';
import {
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  UserIcon,
  ComputerDesktopIcon,
  FaceSmileIcon,
  PaperClipIcon,
  MinusIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface ChatMessage {
  id: string;
  type: 'user' | 'agent' | 'system';
  content: string;
  timestamp: Date;
  sender?: {
    name: string;
    avatar?: string;
  };
}

interface LiveChatProps {
  className?: string;
  position?: 'bottom-right' | 'bottom-left';
  autoOpen?: boolean;
}

const LiveChat: React.FC<LiveChatProps> = ({
  className,
  position = 'bottom-right',
  autoOpen = false
}) => {
  const { t } = useTranslation('contact');
  const [isOpen, setIsOpen] = useState(autoOpen);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 模拟连接状态
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setIsConnected(true);
        addSystemMessage(t('chatConnected'));
        addAgentMessage(t('welcomeMessage'));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, t]);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 焦点管理
  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  // 添加系统消息
  const addSystemMessage = (content: string) => {
    const message: ChatMessage = {
      id: `system_${Date.now()}`,
      type: 'system',
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, message]);
  };

  // 添加客服消息
  const addAgentMessage = (content: string) => {
    const message: ChatMessage = {
      id: `agent_${Date.now()}`,
      type: 'agent',
      content,
      timestamp: new Date(),
      sender: {
        name: t('customerService'),
        avatar: '/images/avatars/agent.jpg',
      },
    };
    setMessages(prev => [...prev, message]);
    
    if (isMinimized) {
      setUnreadCount(prev => prev + 1);
    }
  };

  // 添加用户消息
  const addUserMessage = (content: string) => {
    const message: ChatMessage = {
      id: `user_${Date.now()}`,
      type: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, message]);
  };

  // 发送消息
  const sendMessage = () => {
    if (!inputMessage.trim() || !isConnected) return;

    addUserMessage(inputMessage);
    setInputMessage('');

    // 模拟客服回复
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const responses = [
        t('thankYouForMessage'),
        t('letMeHelpYou'),
        t('canYouProvideMoreDetails'),
        t('ourTeamWillContactYou'),
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      addAgentMessage(randomResponse);
    }, 1000 + Math.random() * 2000);
  };

  // 处理键盘事件
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // 打开聊天
  const openChat = () => {
    setIsOpen(true);
    setIsMinimized(false);
    setUnreadCount(0);
  };

  // 最小化聊天
  const minimizeChat = () => {
    setIsMinimized(true);
  };

  // 关闭聊天
  const closeChat = () => {
    setIsOpen(false);
    setIsMinimized(false);
    setMessages([]);
    setIsConnected(false);
    setUnreadCount(0);
  };

  // 格式化时间
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // 获取位置样式
  const getPositionStyles = () => {
    const baseStyles = 'fixed z-50';
    switch (position) {
      case 'bottom-right':
        return `${baseStyles} bottom-4 right-4`;
      case 'bottom-left':
        return `${baseStyles} bottom-4 left-4`;
      default:
        return `${baseStyles} bottom-4 right-4`;
    }
  };

  return (
    <div className={cn(getPositionStyles(), className)}>
      {/* 聊天窗口 */}
      {isOpen && (
        <div className={cn(
          'bg-white rounded-lg shadow-2xl border border-gray-200 transition-all duration-300 ease-in-out',
          isMinimized ? 'w-80 h-16' : 'w-80 h-96 sm:w-96 sm:h-[500px]'
        )}>
          {/* 头部 */}
          <div className="flex items-center justify-between p-4 bg-primary-600 text-white rounded-t-lg">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <ComputerDesktopIcon className="w-5 h-5 text-primary-600" />
                </div>
                {isConnected && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-sm">{t('liveChat')}</h3>
                <p className="text-xs text-primary-100">
                  {isConnected ? t('online') : t('connecting')}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
              <button
                onClick={minimizeChat}
                className="text-white hover:text-primary-200 transition-colors"
                aria-label={t('minimize')}
              >
                <MinusIcon className="w-5 h-5" />
              </button>
              <button
                onClick={closeChat}
                className="text-white hover:text-primary-200 transition-colors"
                aria-label={t('close')}
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 聊天内容 */}
          {!isMinimized && (
            <>
              {/* 消息列表 */}
              <div className="flex-1 p-4 space-y-4 overflow-y-auto h-80 bg-gray-50">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      'flex',
                      message.type === 'user' ? 'justify-end' : 'justify-start',
                      message.type === 'system' && 'justify-center'
                    )}
                  >
                    {message.type === 'system' ? (
                      <div className="text-xs text-gray-500 bg-gray-200 px-3 py-1 rounded-full">
                        {message.content}
                      </div>
                    ) : (
                      <div className={cn(
                        'max-w-xs lg:max-w-md px-4 py-2 rounded-lg',
                        message.type === 'user'
                          ? 'bg-primary-600 text-white'
                          : 'bg-white text-gray-900 border border-gray-200'
                      )}>
                        {message.type === 'agent' && message.sender && (
                          <div className="flex items-center space-x-2 mb-1">
                            <UserIcon className="w-4 h-4 text-gray-500" />
                            <span className="text-xs text-gray-500">{message.sender.name}</span>
                          </div>
                        )}
                        <p className="text-sm">{message.content}</p>
                        <p className={cn(
                          'text-xs mt-1',
                          message.type === 'user' ? 'text-primary-200' : 'text-gray-500'
                        )}>
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    )}
                  </div>
                ))}

                {/* 正在输入指示器 */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white text-gray-900 border border-gray-200 px-4 py-2 rounded-lg">
                      <div className="flex items-center space-x-1">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                        <span className="text-xs text-gray-500 ml-2">{t('typing')}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* 输入区域 */}
              <div className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 relative">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={isConnected ? t('typeMessage') : t('connecting')}
                      disabled={!isConnected}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>
                  <button
                    onClick={sendMessage}
                    disabled={!inputMessage.trim() || !isConnected}
                    className="bg-primary-600 text-white p-2 rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    aria-label={t('sendMessage')}
                  >
                    <PaperAirplaneIcon className="w-5 h-5" />
                  </button>
                </div>
                
                {/* 快速回复 */}
                {messages.length === 1 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {[
                      t('needQuote'),
                      t('productInfo'),
                      t('technicalSupport'),
                    ].map((quickReply) => (
                      <button
                        key={quickReply}
                        onClick={() => {
                          setInputMessage(quickReply);
                          setTimeout(sendMessage, 100);
                        }}
                        className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors"
                      >
                        {quickReply}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* 聊天按钮 */}
      {!isOpen && (
        <button
          onClick={openChat}
          className="relative bg-primary-600 hover:bg-primary-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
          aria-label={t('openLiveChat')}
        >
          <ChatBubbleLeftRightIcon className="w-6 h-6" />
          
          {/* 未读消息指示器 */}
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
          
          {/* 脉冲动画 */}
          <div className="absolute inset-0 rounded-full bg-primary-600 animate-ping opacity-20" />
        </button>
      )}
    </div>
  );
};

export default LiveChat;