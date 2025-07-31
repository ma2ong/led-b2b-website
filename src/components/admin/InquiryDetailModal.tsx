/**
 * 询盘详情模态框组件
 */
import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import {
  XMarkIcon,
  PencilIcon,
  CheckIcon,
  ClockIcon,
  UserIcon,
  BuildingOfficeIcon,
  CubeIcon,
  DocumentTextIcon,
  TagIcon,
  ChatBubbleLeftRightIcon,
  PaperClipIcon,
  CalendarIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/FormComponents';
import { 
  Inquiry,
  InquiryStatus,
  InquiryPriority,
  InquiryFollowUp
} from '@/types/inquiry';

interface InquiryDetailModalProps {
  inquiry: Inquiry;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (inquiry: Inquiry) => void;
  className?: string;
}

const InquiryDetailModal: React.FC<InquiryDetailModalProps> = ({
  inquiry,
  isOpen,
  onClose,
  onUpdate,
  className
}) => {
  const { t } = useTranslation('admin');
  const [activeTab, setActiveTab] = useState<'details' | 'followups' | 'history'>('details');
  const [isEditing, setIsEditing] = useState(false);
  const [editedInquiry, setEditedInquiry] = useState<Inquiry>(inquiry);
  const [newFollowUp, setNewFollowUp] = useState({
    type: 'note',
    content: '',
    scheduledAt: '',
  });

  if (!isOpen) return null;

  const statusOptions = [
    { value: InquiryStatus.NEW, label: t('statusNew') },
    { value: InquiryStatus.ASSIGNED, label: t('statusAssigned') },
    { value: InquiryStatus.IN_PROGRESS, label: t('statusInProgress') },
    { value: InquiryStatus.QUOTED, label: t('statusQuoted') },
    { value: InquiryStatus.NEGOTIATING, label: t('statusNegotiating') },
    { value: InquiryStatus.WON, label: t('statusWon') },
    { value: InquiryStatus.LOST, label: t('statusLost') },
    { value: InquiryStatus.CLOSED, label: t('statusClosed') },
  ];

  const priorityOptions = [
    { value: InquiryPriority.LOW, label: t('priorityLow') },
    { value: InquiryPriority.MEDIUM, label: t('priorityMedium') },
    { value: InquiryPriority.HIGH, label: t('priorityHigh') },
    { value: InquiryPriority.URGENT, label: t('priorityUrgent') },
  ];

  const followUpTypeOptions = [
    { value: 'note', label: t('note') },
    { value: 'call', label: t('call') },
    { value: 'email', label: t('email') },
    { value: 'meeting', label: t('meeting') },
    { value: 'quote', label: t('quote') },
  ];

  const tabs = [
    { id: 'details', label: t('details'), icon: DocumentTextIcon },
    { id: 'followups', label: t('followUps'), icon: ChatBubbleLeftRightIcon },
    { id: 'history', label: t('history'), icon: ClockIcon },
  ];

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/inquiries/${inquiry.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedInquiry),
      });

      if (response.ok) {
        const updatedInquiry = await response.json();
        onUpdate?.(updatedInquiry.data);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating inquiry:', error);
    }
  };

  const handleAddFollowUp = async () => {
    if (!newFollowUp.content.trim()) return;

    try {
      const followUp: InquiryFollowUp = {
        id: `followup_${Date.now()}`,
        type: newFollowUp.type as any,
        content: newFollowUp.content,
        createdBy: 'current-user', // 应该从认证系统获取
        createdAt: new Date(),
        scheduledAt: newFollowUp.scheduledAt ? new Date(newFollowUp.scheduledAt) : undefined,
      };

      const response = await fetch(`/api/inquiries/${inquiry.id}/followups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(followUp),
      });

      if (response.ok) {
        const updatedInquiry = { ...editedInquiry };
        updatedInquiry.followUps = [...updatedInquiry.followUps, followUp];
        setEditedInquiry(updatedInquiry);
        setNewFollowUp({ type: 'note', content: '', scheduledAt: '' });
      }
    } catch (error) {
      console.error('Error adding follow-up:', error);
    }
  };

  const getStatusStyle = (status: InquiryStatus) => {
    switch (status) {
      case InquiryStatus.NEW:
        return 'bg-blue-100 text-blue-800';
      case InquiryStatus.ASSIGNED:
        return 'bg-yellow-100 text-yellow-800';
      case InquiryStatus.IN_PROGRESS:
        return 'bg-purple-100 text-purple-800';
      case InquiryStatus.QUOTED:
        return 'bg-indigo-100 text-indigo-800';
      case InquiryStatus.NEGOTIATING:
        return 'bg-orange-100 text-orange-800';
      case InquiryStatus.WON:
        return 'bg-green-100 text-green-800';
      case InquiryStatus.LOST:
        return 'bg-red-100 text-red-800';
      case InquiryStatus.CLOSED:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className={cn(
          'relative bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden',
          className
        )}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {inquiry.inquiryNumber}
              </h2>
              <span className={cn(
                'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                getStatusStyle(inquiry.status)
              )}>
                {t(`status${inquiry.status}`)}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {isEditing ? (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditedInquiry(inquiry);
                      setIsEditing(false);
                    }}
                  >
                    {t('cancel')}
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    leftIcon={<CheckIcon className="w-4 h-4" />}
                  >
                    {t('save')}
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  leftIcon={<PencilIcon className="w-4 h-4" />}
                >
                  {t('edit')}
                </Button>
              )}
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    'py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2',
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  )}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {activeTab === 'details' && (
              <div className="space-y-8">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <UserIcon className="w-5 h-5 mr-2" />
                      {t('contactInformation')}
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700">{t('name')}</label>
                        <p className="text-sm text-gray-900">
                          {inquiry.contact.firstName} {inquiry.contact.lastName}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <EnvelopeIcon className="w-4 h-4 text-gray-400" />
                        <a
                          href={`mailto:${inquiry.contact.email}`}
                          className="text-sm text-primary-600 hover:text-primary-700"
                        >
                          {inquiry.contact.email}
                        </a>
                      </div>
                      {inquiry.contact.phone && (
                        <div className="flex items-center space-x-2">
                          <PhoneIcon className="w-4 h-4 text-gray-400" />
                          <a
                            href={`tel:${inquiry.contact.phone}`}
                            className="text-sm text-primary-600 hover:text-primary-700"
                          >
                            {inquiry.contact.phone}
                          </a>
                        </div>
                      )}
                      {inquiry.contact.jobTitle && (
                        <div>
                          <label className="text-sm font-medium text-gray-700">{t('jobTitle')}</label>
                          <p className="text-sm text-gray-900">{inquiry.contact.jobTitle}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <BuildingOfficeIcon className="w-5 h-5 mr-2" />
                      {t('companyInformation')}
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700">{t('companyName')}</label>
                        <p className="text-sm text-gray-900">{inquiry.company.name}</p>
                      </div>
                      {inquiry.company.website && (
                        <div className="flex items-center space-x-2">
                          <GlobeAltIcon className="w-4 h-4 text-gray-400" />
                          <a
                            href={inquiry.company.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary-600 hover:text-primary-700"
                          >
                            {inquiry.company.website}
                          </a>
                        </div>
                      )}
                      <div>
                        <label className="text-sm font-medium text-gray-700">{t('location')}</label>
                        <p className="text-sm text-gray-900">
                          {[inquiry.company.city, inquiry.company.state, inquiry.company.country]
                            .filter(Boolean)
                            .join(', ')}
                        </p>
                      </div>
                      {inquiry.company.industry && (
                        <div>
                          <label className="text-sm font-medium text-gray-700">{t('industry')}</label>
                          <p className="text-sm text-gray-900">{inquiry.company.industry}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status and Priority */}
                {isEditing && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Select
                      label={t('status')}
                      options={statusOptions}
                      value={editedInquiry.status}
                      onChange={(e) => setEditedInquiry(prev => ({
                        ...prev,
                        status: e.target.value as InquiryStatus
                      }))}
                    />
                    <Select
                      label={t('priority')}
                      options={priorityOptions}
                      value={editedInquiry.priority}
                      onChange={(e) => setEditedInquiry(prev => ({
                        ...prev,
                        priority: e.target.value as InquiryPriority
                      }))}
                    />
                  </div>
                )}

                {/* Product Requirements */}
                {inquiry.productRequirements.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <CubeIcon className="w-5 h-5 mr-2" />
                      {t('productRequirements')}
                    </h3>
                    <div className="space-y-4">
                      {inquiry.productRequirements.map((req, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-lg">
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {req.productName && (
                              <div>
                                <label className="text-sm font-medium text-gray-700">{t('product')}</label>
                                <p className="text-sm text-gray-900">{req.productName}</p>
                              </div>
                            )}
                            {req.pixelPitch && (
                              <div>
                                <label className="text-sm font-medium text-gray-700">{t('pixelPitch')}</label>
                                <p className="text-sm text-gray-900">{req.pixelPitch}</p>
                              </div>
                            )}
                            {req.quantity && (
                              <div>
                                <label className="text-sm font-medium text-gray-700">{t('quantity')}</label>
                                <p className="text-sm text-gray-900">{req.quantity}</p>
                              </div>
                            )}
                            {req.application && (
                              <div>
                                <label className="text-sm font-medium text-gray-700">{t('application')}</label>
                                <p className="text-sm text-gray-900">{req.application}</p>
                              </div>
                            )}
                            {req.screenSize && (
                              <div>
                                <label className="text-sm font-medium text-gray-700">{t('screenSize')}</label>
                                <p className="text-sm text-gray-900">
                                  {req.screenSize.width} × {req.screenSize.height} {req.screenSize.unit}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Message */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <DocumentTextIcon className="w-5 h-5 mr-2" />
                    {t('inquiryMessage')}
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">{inquiry.subject}</h4>
                    <p className="text-gray-700 whitespace-pre-wrap">{inquiry.message}</p>
                  </div>
                </div>

                {/* Tags */}
                {inquiry.tags.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <TagIcon className="w-5 h-5 mr-2" />
                      {t('tags')}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {inquiry.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'followups' && (
              <div className="space-y-6">
                {/* Add Follow-up */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {t('addFollowUp')}
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Select
                        label={t('type')}
                        options={followUpTypeOptions}
                        value={newFollowUp.type}
                        onChange={(e) => setNewFollowUp(prev => ({
                          ...prev,
                          type: e.target.value
                        }))}
                      />
                      <Input
                        label={t('scheduledAt')}
                        type="datetime-local"
                        value={newFollowUp.scheduledAt}
                        onChange={(e) => setNewFollowUp(prev => ({
                          ...prev,
                          scheduledAt: e.target.value
                        }))}
                      />
                    </div>
                    <Textarea
                      label={t('content')}
                      value={newFollowUp.content}
                      onChange={(e) => setNewFollowUp(prev => ({
                        ...prev,
                        content: e.target.value
                      }))}
                      rows={3}
                      placeholder={t('enterFollowUpContent')}
                    />
                    <Button
                      onClick={handleAddFollowUp}
                      disabled={!newFollowUp.content.trim()}
                    >
                      {t('addFollowUp')}
                    </Button>
                  </div>
                </div>

                {/* Follow-ups List */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {t('followUpHistory')}
                  </h3>
                  {editedInquiry.followUps.length > 0 ? (
                    <div className="space-y-4">
                      {editedInquiry.followUps.map((followUp) => (
                        <div key={followUp.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-900">
                                {t(followUp.type)}
                              </span>
                              <span className="text-sm text-gray-500">
                                by {followUp.createdBy}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <CalendarIcon className="w-4 h-4" />
                              {followUp.createdAt.toLocaleDateString()}
                            </div>
                          </div>
                          <p className="text-gray-700 whitespace-pre-wrap">{followUp.content}</p>
                          {followUp.scheduledAt && (
                            <div className="mt-2 text-sm text-gray-500">
                              {t('scheduledFor')}: {followUp.scheduledAt.toLocaleString()}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">{t('noFollowUpsYet')}</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {t('inquiryHistory')}
                </h3>
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                      <ClockIcon className="w-4 h-4" />
                      {inquiry.createdAt.toLocaleString()}
                    </div>
                    <p className="text-gray-700">{t('inquiryCreated')}</p>
                  </div>
                  {inquiry.updatedAt > inquiry.createdAt && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                        <ClockIcon className="w-4 h-4" />
                        {inquiry.updatedAt.toLocaleString()}
                      </div>
                      <p className="text-gray-700">{t('inquiryUpdated')}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InquiryDetailModal;