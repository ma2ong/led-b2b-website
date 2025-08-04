import { NextApiRequest, NextApiResponse } from 'next';
import { 
  Inquiry,
  InquiryUpdateData,
  InquiryFollowUp,
  InquiryStatus,
  InquiryPriority
} from '@/types/inquiry';
import { validateInquiryUpdateData } from '@/lib/inquiry-validation';
import { generateId } from '@/lib/utils';

// 这里应该从数据库或其他存储中获取数据
// 为了演示，我们使用一个简单的内存存储
const inquiries: Inquiry[] = [];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_ID',
        message: 'Valid inquiry ID is required',
      },
    });
  }

  try {
    switch (method) {
      case 'GET':
        await handleGet(req, res, id);
        break;
      case 'PUT':
        await handlePut(req, res, id);
        break;
      case 'DELETE':
        await handleDelete(req, res, id);
        break;
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        res.status(405).json({
          success: false,
          error: {
            code: 'METHOD_NOT_ALLOWED',
            message: `Method ${method} Not Allowed`,
          },
        });
    }
  } catch (error) {
    console.error('Inquiry API error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Internal Server Error',
        details: process.env.NODE_ENV === 'development' ? error : undefined,
      },
    });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse, id: string) {
  const { include } = req.query;
  
  const inquiry = inquiries.find(inq => inq.id === id);
  
  if (!inquiry) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'INQUIRY_NOT_FOUND',
        message: 'Inquiry not found',
      },
    });
  }

  // 根据include参数决定返回哪些关联数据
  const responseData = { ...inquiry };
  
  if (include) {
    const includeArray = Array.isArray(include) ? include : [include];
    
    // 这里可以根据include参数加载相关数据
    // 例如：followUps, attachments, score, relatedInquiries
  }

  return res.status(200).json({
    success: true,
    data: responseData,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: generateId(),
      version: '1.0.0',
    },
  });
}

async function handlePut(req: NextApiRequest, res: NextApiResponse, id: string) {
  const updateData: InquiryUpdateData = { ...req.body, id };

  // 验证更新数据
  const validationErrors = validateInquiryUpdateData(updateData);
  if (Object.keys(validationErrors).length > 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid inquiry data',
        details: validationErrors,
      },
    });
  }

  const inquiryIndex = inquiries.findIndex(inq => inq.id === id);
  
  if (inquiryIndex === -1) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'INQUIRY_NOT_FOUND',
        message: 'Inquiry not found',
      },
    });
  }

  const inquiry = inquiries[inquiryIndex];
  
  // 更新询盘数据
  const updatedInquiry: Inquiry = {
    ...inquiry,
    ...updateData,
    id: inquiry.id, // 确保ID不被覆盖
    updatedAt: new Date(),
  };

  // 如果状态改变，记录状态变更时间
  if (updateData.status && updateData.status !== inquiry.status) {
    if (updateData.status === InquiryStatus.WON || updateData.status === InquiryStatus.LOST || updateData.status === InquiryStatus.CANCELLED) {
      updatedInquiry.closedAt = new Date();
    }
  }

  inquiries[inquiryIndex] = updatedInquiry;

  // 这里可以添加状态变更通知逻辑
  // await sendStatusChangeNotification(updatedInquiry, inquiry.status);

  return res.status(200).json({
    success: true,
    data: updatedInquiry,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: generateId(),
      version: '1.0.0',
    },
  });
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse, id: string) {
  const inquiryIndex = inquiries.findIndex(inq => inq.id === id);
  
  if (inquiryIndex === -1) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'INQUIRY_NOT_FOUND',
        message: 'Inquiry not found',
      },
    });
  }

  // 删除询盘
  inquiries.splice(inquiryIndex, 1);

  return res.status(200).json({
    success: true,
    data: { message: 'Inquiry deleted successfully' },
    meta: {
      timestamp: new Date().toISOString(),
      requestId: generateId(),
      version: '1.0.0',
    },
  });
}