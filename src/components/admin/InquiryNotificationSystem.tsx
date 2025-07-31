/**
 * 询盘通知系统组件
 */
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import {
  BellIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  UserIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { 
  Inquiry,
  InquiryStatus,
  InquiryPriority
} from '@/types/inquiry';

interface InquiryNotification {
  id: string;
  type: 'new_inquiry' | 'status_change' | 'follow_up_due' | 'urgent_inquiry';
  title: string;
  message: string;
  inquiry: Inquiry;
  createdAt: Date;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

interface InquiryNotificationSystemProps {
  className?: string;
}

const InquiryNotificationSystem: React.FC<InquiryNotificationSystemProps> = ({ className }) => {
  const { t } = useTranslation('admin');
  const [notifications, setNotifications] = useState<InquiryNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // 模拟通知数据
  useEffect(() => {
    const mockNotifications: InquiryNotification[] = [
      {
        id: 'notif_1',
        type: 'new_inquiry',
        title: t('newInquiryReceived'),
        message: t('newInquiryFromCompany', { company: 'ABC Corporation' }),
        inquiry: {
          id: 'inq_1',
          inquiryNumber: 'INQ-2024-001',
          status: InquiryStatus.NEW,
          priority: InquiryPriority.HIGH,
          contact: {
            firstName: 'John',
            lastName: 'Smith',
            email: 'john@abc-corp.com',
          },
          company: {
            name: 'ABC Corporation',
            country: 'United States',
          },
          subject: 'LED Display Quote Request',
          message: 'We need a quote for conference room displays.',
          createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
          updatedAt: new Date(Date.now() - 30 * 60 * 1000),
        } as Inquiry,
        createdAt: new Date(Date.now() - 30 * 60 * 1000),
        isRead: false,
        priority: 'high',
      },
      {
        id: 'notif_2',
        type: 'urgent_inquiry',
        title: t('urgentInquiryAlert'),
        message: t('urgentInquiryFromCompany', { company: '北京科技有限公司' }),
        inquiry: {
          id: 'inq_2',
          inquiryNumber: 'INQ-2024-002',
          status: InquiryStatus.NEW,
          priority: InquiryPriority.URGENT,
          contact: {
            firstName: '张',
            lastName: '伟',
            email: 'zhang.wei@example.cn',
          },
          company: {
            name: '北京科技有限公司',
            country: 'China',
          },
          subject: '紧急LED显示屏采购需求',
          message: '我们有紧急的LED显示屏采购需求，请尽快联系。',
          createdAt: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
          updatedAt: new Date(Date.now() - 15 * 60 * 1000),
        } as Inquiry,
        createdAt: new Date(Date.now() - 15 * 60 * 1000),
        isRead: false,
        priority: 'urgent',
      },
      {
        id: 'notif_3',
        type: 'follow_up_due',
        title: t('followUpDue'),
        message: t('followUpDueForInquiry', { inquiryNumber: 'INQ-2024-003' }),
        inquiry: {
          id: 'inq_3',
          inquiryNumber: 'INQ-2024-003',
          status: InquiryStatus.IN_PROGRESS,
          priority: InquiryPriority.MEDIUM,
          contact: {
            firstName: 'Sarah',
            lastName: 'Johnson',
            email: 'sarah@example.com',
          },
          company: {
            name: 'Tech Solutions Inc',
            country: 'Canada',
          },
          subject: 'Outdoor LED Display Information',
          message: 'Looking for outdoor LED display solutions.',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        } as Inquiry,
        createdAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
        isRead: true,
        priority: 'medium',
      },
    ];

    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.isRead).length);
  }, [t]);

  // 获取通知图标
  const getNotificationIcon = (type: InquiryNotification['type'], priority: string) => {
    const iconClass = cn(
      'w-5 h-5',
      priority === 'urgent' ? 'text-red-500' :
      priority === 'high' ? 'text-orange-500' :
      priority === 'medium' ? 'text-yellow-500' : 'text-blue-500'
    );

    switch (type) {
      case 'new_inquiry':
        return <EnvelopeIcon className={iconClass} />;
      case 'urgent_inquiry':
        return <ExclamationTriangleIcon className={iconClass} />;
      case 'follow_up_due':
        return <ClockIcon className={iconClass} />;
      case 'status_change':
        return <CheckCircleIcon className={iconClass} />;
      default:
        return <InformationCircleIcon className={iconClass} />;
    }
  };

  // 获取通知样式
  const getNotificationStyle = (priority: string, isRead: boolean) => {
    const baseStyle = 'border-l-4 transition-colors';
    const readStyle = isRead ? 'bg-gray-50' : 'bg-white';
    
    let borderColor = '';
    switch (priority) {
      case 'urgent':
        borderColor = 'border-red-500';
        break;
      case 'high':
        borderColor = 'border-orange-500';
        break;
      case 'medium':
        borderColor = 'border-yellow-500';
        break;
      default:
        borderColor = 'border-blue-500';
    }

    return cn(baseStyle, readStyle, borderColor);
  };

  // 标记为已读
  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // 标记所有为已读
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
    setUnreadCount(0);
  };

  // 删除通知
  const deleteNotification = (notificationId: string) => {
    const notification = notifications.find(n => n.id === notificationId);
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    if (notification && !notification.isRead) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  // 处理通知点击
  const handleNotificationClick = (notification: InquiryNotification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    // 这里可以添加跳转到询盘详情的逻辑
    console.log('Navigate to inquiry:', notification.inquiry.id);
  };

  // 格式化时间
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return t('justNow');
    if (minutes < 60) return t('minutesAgo', { count: minutes });
    if (hours < 24) return t('hoursAgo', { count: hours });
    return t('daysAgo', { count: days });
  };

  return (
    <div className={cn('relative', className)}>
      {/* 通知按钮 */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <BellIcon className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* 通知面板 */}
      {showNotifications && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          {/* 头部 */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              {t('notifications')}
            </h3>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={markAllAsRead}
                  className="text-xs"
                >
                  {t('markAllRead')}
                </Button>
              )}
              <button
                onClick={() => setShowNotifications(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 通知列表 */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      'p-4 hover:bg-gray-50 cursor-pointer',
                      getNotificationStyle(notification.priority, notification.isRead)
                    )}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type, notification.priority)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className={cn(
                            'text-sm font-medium truncate',
                            notification.isRead ? 'text-gray-700' : 'text-gray-900'
                          )}>
                            {notification.title}
                          </h4>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </div>
                        <p className={cn(
                          'text-sm mt-1',
                          notification.isRead ? 'text-gray-500' : 'text-gray-700'
                        )}>
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <UserIcon className="w-3 h-3" />
                            <span>{notification.inquiry.contact.firstName} {notification.inquiry.contact.lastName}</span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {formatTime(notification.createdAt)}
                          </span>
                        </div>
                        {!notification.isRead && (
                          <div className="mt-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                              className="text-xs text-primary-600 hover:text-primary-700 flex items-center space-x-1"
                            >
                              <CheckIcon className="w-3 h-3" />
                              <span>{t('markAsRead')}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <BellIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t('noNotifications')}
                </h3>
                <p className="text-gray-600">
                  {t('noNotificationsDesc')}
                </p>
              </div>
            )}
          </div>

          {/* 底部 */}
          {notifications.length > 0 && (
            <div className="p-4 border-t border-gray-200">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  setShowNotifications(false);
                  // 跳转到通知管理页面
                }}
              >
                {t('viewAllNotifications')}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* 点击外部关闭 */}
      {showNotifications && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowNotifications(false)}
        />
      )}
    </div>
  );
};

export default InquiryNotificationSystem;