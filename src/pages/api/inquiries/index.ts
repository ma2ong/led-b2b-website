import { NextApiRequest, NextApiResponse } from 'next';
import { 
  Inquiry,
  InquiryCreateData,
  InquiryQuery,
  InquiryQueryResult,
  InquiryStatus,
  InquiryPriority,
  InquiryType,
  InquirySource,
  CustomerType,
  InquiryStats,
  InquiryBulkOperation
} from '@/types/inquiry';
import { 
  validateInquiryCreateData,
  validateInquiryQuery 
} from '@/lib/inquiry-validation';
import { generateId } from '@/lib/utils';

// 模拟数据存储
let inquiries: Inquiry[] = [];
let inquiryCounter = 1;

// 生成询盘编号
function generateInquiryNumber(): string {
  const year = new Date().getFullYear();
  const number = inquiryCounter.toString().padStart(3, '0');
  inquiryCounter++;
  return `INQ-${year}-${number}`;
}

// 创建模拟询盘数据
function createMockInquiry(data: InquiryCreateData): Inquiry {
  const now = new Date();
  
  return {
    id: generateId(),
    inquiryNumber: generateInquiryNumber(),
    type: data.type,
    source: data.source,
    status: InquiryStatus.NEW,
    priority: InquiryPriority.MEDIUM,
    contact: data.contact,
    company: data.company,
    customerType: data.customerType,
    productRequirements: data.productRequirements.map(req => ({
      ...req,
      id: generateId()
    })),
    projectInfo: data.projectInfo,
    subject: data.subject,
    message: data.message,
    attachments: [],
    followUps: [],
    tags: data.tags || [],
    language: data.language,
    ipAddress: data.ipAddress,
    userAgent: data.userAgent,
    referrer: data.referrer,
    utmSource: data.utmSource,
    utmMedium: data.utmMedium,
    utmCampaign: data.utmCampaign,
    createdAt: now,
    updatedAt: now,
  };
}

// 初始化一些模拟数据
function initializeMockData() {
  if (inquiries.length === 0) {
    const mockInquiries: InquiryCreateData[] = [
      {
        type: InquiryType.QUOTE_REQUEST,
        source: InquirySource.WEBSITE,
        contact: {
          firstName: 'John',
          lastName: 'Smith',
          email: 'john.smith@example.com',
          phone: '+1-555-0123',
          jobTitle: 'Project Manager',
        },
        company: {
          name: 'ABC Corporation',
          website: 'https://abc-corp.com',
          industry: 'Retail',
          country: 'United States',
          city: 'New York',
        },
        customerType: CustomerType.END_USER,
        productRequirements: [
          {
            productName: 'P2.5 Indoor LED Display',
            pixelPitch: 'P2.5',
            screenSize: { width: 3000, height: 2000, unit: 'mm' },
            quantity: 2,
            application: 'Conference Room Display',
            installationEnvironment: 'indoor',
          }
        ],
        subject: 'Quote Request for Conference Room LED Displays',
        message: 'We need LED displays for our new conference rooms. Please provide a quote.',
        language: 'en',
      },
      {
        type: InquiryType.PRODUCT_INFO,
        source: InquirySource.EMAIL,
        contact: {
          firstName: '张',
          lastName: '伟',
          email: 'zhang.wei@example.cn',
          phone: '+86-138-0000-0000',
          jobTitle: '采购经理',
        },
        company: {
          name: '北京科技有限公司',
          industry: '广告传媒',
          country: 'China',
          city: 'Beijing',
        },
        customerType: CustomerType.INTEGRATOR,
        productRequirements: [
          {
            productName: 'P4 户外LED显示屏',
            pixelPitch: 'P4',
            screenSize: { width: 6000, height: 4000, unit: 'mm' },
            quantity: 1,
            application: '户外广告',
            installationEnvironment: 'outdoor',
          }
        ],
        subject: '户外LED显示屏产品咨询',
        message: '我们需要了解P4户外LED显示屏的详细规格和价格信息。',
        language: 'zh',
      }
    ];

    inquiries = mockInquiries.map(createMockInquiry);
  }
}

// 筛选和排序询盘
function filterAndSortInquiries(query: InquiryQuery): InquiryQueryResult {
  let filteredInquiries = [...inquiries];

  // 应用筛选条件
  if (query.filters) {
    const { filters } = query;

    if (filters.status) {
      const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
      filteredInquiries = filteredInquiries.filter(inquiry => 
        statuses.includes(inquiry.status)
      );
    }

    if (filters.priority) {
      const priorities = Array.isArray(filters.priority) ? filters.priority : [filters.priority];
      filteredInquiries = filteredInquiries.filter(inquiry => 
        priorities.includes(inquiry.priority)
      );
    }

    if (filters.type) {
      const types = Array.isArray(filters.type) ? filters.type : [filters.type];
      filteredInquiries = filteredInquiries.filter(inquiry => 
        types.includes(inquiry.type)
      );
    }

    if (filters.source) {
      const sources = Array.isArray(filters.source) ? filters.source : [filters.source];
      filteredInquiries = filteredInquiries.filter(inquiry => 
        sources.includes(inquiry.source)
      );
    }

    if (filters.customerType) {
      const customerTypes = Array.isArray(filters.customerType) ? filters.customerType : [filters.customerType];
      filteredInquiries = filteredInquiries.filter(inquiry => 
        customerTypes.includes(inquiry.customerType)
      );
    }

    if (filters.country) {
      const countries = Array.isArray(filters.country) ? filters.country : [filters.country];
      filteredInquiries = filteredInquiries.filter(inquiry => 
        countries.includes(inquiry.company.country)
      );
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredInquiries = filteredInquiries.filter(inquiry => 
        inquiry.subject.toLowerCase().includes(searchTerm) ||
        inquiry.message.toLowerCase().includes(searchTerm) ||
        inquiry.company.name.toLowerCase().includes(searchTerm) ||
        inquiry.contact.firstName.toLowerCase().includes(searchTerm) ||
        inquiry.contact.lastName.toLowerCase().includes(searchTerm) ||
        inquiry.contact.email.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.dateRange) {
      const { start, end, field } = filters.dateRange;
      filteredInquiries = filteredInquiries.filter(inquiry => {
        const date = inquiry[field as keyof Inquiry] as Date;
        return date >= start && date <= end;
      });
    }
  }

  // 应用排序
  if (query.sortBy) {
    filteredInquiries.sort((a, b) => {
      switch (query.sortBy) {
        case 'created_desc':
          return b.createdAt.getTime() - a.createdAt.getTime();
        case 'created_asc':
          return a.createdAt.getTime() - b.createdAt.getTime();
        case 'updated_desc':
          return b.updatedAt.getTime() - a.updatedAt.getTime();
        case 'updated_asc':
          return a.updatedAt.getTime() - b.updatedAt.getTime();
        case 'company_name_asc':
          return a.company.name.localeCompare(b.company.name);
        case 'company_name_desc':
          return b.company.name.localeCompare(a.company.name);
        default:
          return 0;
      }
    });
  } else {
    // 默认按创建时间倒序
    filteredInquiries.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // 分页
  const page = query.page || 1;
  const limit = query.limit || 20;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedInquiries = filteredInquiries.slice(startIndex, endIndex);

  return {
    inquiries: paginatedInquiries,
    total: filteredInquiries.length,
    page,
    limit,
    totalPages: Math.ceil(filteredInquiries.length / limit),
    hasNextPage: endIndex < filteredInquiries.length,
    hasPrevPage: page > 1,
    filters: query.filters,
    sortBy: query.sortBy,
  };
}

// 生成统计数据
function generateInquiryStats(): InquiryStats {
  const total = inquiries.length;
  
  // 按状态统计
  const statusCounts = Object.values(InquiryStatus).map(status => {
    const count = inquiries.filter(inquiry => inquiry.status === status).length;
    return {
      status,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0,
    };
  });

  // 按优先级统计
  const priorityCounts = Object.values(InquiryPriority).map(priority => {
    const count = inquiries.filter(inquiry => inquiry.priority === priority).length;
    return { priority, count };
  });

  // 按来源统计
  const sourceCounts = Object.values(InquirySource).map(source => {
    const count = inquiries.filter(inquiry => inquiry.source === source).length;
    return { source, count };
  });

  // 按客户类型统计
  const customerTypeCounts = Object.values(CustomerType).map(customerType => {
    const count = inquiries.filter(inquiry => inquiry.customerType === customerType).length;
    return { customerType, count };
  });

  // 按国家统计
  const countryMap = new Map<string, number>();
  inquiries.forEach(inquiry => {
    const country = inquiry.company.country;
    countryMap.set(country, (countryMap.get(country) || 0) + 1);
  });
  const countryCounts = Array.from(countryMap.entries()).map(([country, count]) => ({
    country,
    count,
  }));

  // 转化率统计
  const wonInquiries = inquiries.filter(inquiry => inquiry.status === InquiryStatus.WON).length;
  const conversionRate = {
    totalInquiries: total,
    wonInquiries,
    rate: total > 0 ? (wonInquiries / total) * 100 : 0,
  };

  // 生成趋势数据（最近30天）
  const trendsData = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const newInquiries = inquiries.filter(inquiry => 
      inquiry.createdAt >= dayStart && inquiry.createdAt <= dayEnd
    ).length;

    const closedInquiries = inquiries.filter(inquiry => 
      inquiry.closedAt && inquiry.closedAt >= dayStart && inquiry.closedAt <= dayEnd
    ).length;

    trendsData.push({
      date: dateStr,
      newInquiries,
      closedInquiries,
      conversionRate: newInquiries > 0 ? (closedInquiries / newInquiries) * 100 : 0,
    });
  }

  return {
    total,
    byStatus: statusCounts,
    byPriority: priorityCounts,
    bySource: sourceCounts,
    byCustomerType: customerTypeCounts,
    byCountry: countryCounts,
    conversionRate,
    averageResponseTime: 2.5, // 模拟平均响应时间（小时）
    averageScore: 75, // 模拟平均评分
    trendsData,
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 初始化模拟数据
  initializeMockData();

  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        await handleGet(req, res);
        break;
      case 'POST':
        await handlePost(req, res);
        break;
      default:
        res.setHeader('Allow', ['GET', 'POST']);
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

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const { action } = req.query;

  switch (action) {
    case 'stats':
      const stats = generateInquiryStats();
      return res.status(200).json({
        success: true,
        data: stats,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: generateId(),
          version: '1.0.0',
        },
      });

    case 'search':
      const { q, limit = 10 } = req.query;
      if (!q || typeof q !== 'string') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_QUERY',
            message: 'Search query is required',
          },
        });
      }

      const searchResults = inquiries.filter(inquiry =>
        inquiry.subject.toLowerCase().includes(q.toLowerCase()) ||
        inquiry.message.toLowerCase().includes(q.toLowerCase()) ||
        inquiry.company.name.toLowerCase().includes(q.toLowerCase()) ||
        inquiry.contact.email.toLowerCase().includes(q.toLowerCase())
      ).slice(0, parseInt(limit as string));

      return res.status(200).json({
        success: true,
        data: searchResults,
      });

    default:
      // 获取询盘列表
      const query: InquiryQuery = {};

      // 解析查询参数
      if (req.query.page) query.page = parseInt(req.query.page as string);
      if (req.query.limit) query.limit = parseInt(req.query.limit as string);
      if (req.query.sortBy) query.sortBy = req.query.sortBy as any;

      // 解析筛选条件
      if (req.query.filters) {
        query.filters = {};
        // 这里可以添加更复杂的筛选参数解析逻辑
      }

      // 验证查询参数
      const validationErrors = validateInquiryQuery(query);
      if (Object.keys(validationErrors).length > 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid query parameters',
            details: validationErrors,
          },
        });
      }

      const result = filterAndSortInquiries(query);
      return res.status(200).json({
        success: true,
        data: result,
      });
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const { action } = req.query;

  switch (action) {
    case 'bulk':
      const bulkOperation: InquiryBulkOperation = req.body;
      
      if (!bulkOperation.action || !bulkOperation.inquiryIds || !Array.isArray(bulkOperation.inquiryIds)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_BULK_OPERATION',
            message: 'Invalid bulk operation data',
          },
        });
      }

      let successCount = 0;
      let failedCount = 0;
      const errors: any[] = [];

      for (const inquiryId of bulkOperation.inquiryIds) {
        try {
          const inquiryIndex = inquiries.findIndex(inquiry => inquiry.id === inquiryId);
          if (inquiryIndex === -1) {
            failedCount++;
            errors.push({ inquiryId, error: 'Inquiry not found' });
            continue;
          }

          const inquiry = inquiries[inquiryIndex];

          switch (bulkOperation.action) {
            case 'assign':
              if (bulkOperation.data?.assignedTo) {
                inquiry.assignedTo = bulkOperation.data.assignedTo;
                inquiry.updatedAt = new Date();
                successCount++;
              } else {
                failedCount++;
                errors.push({ inquiryId, error: 'Assignee not specified' });
              }
              break;

            case 'update_status':
              if (bulkOperation.data?.status) {
                inquiry.status = bulkOperation.data.status;
                inquiry.updatedAt = new Date();
                successCount++;
              } else {
                failedCount++;
                errors.push({ inquiryId, error: 'Status not specified' });
              }
              break;

            case 'update_priority':
              if (bulkOperation.data?.priority) {
                inquiry.priority = bulkOperation.data.priority;
                inquiry.updatedAt = new Date();
                successCount++;
              } else {
                failedCount++;
                errors.push({ inquiryId, error: 'Priority not specified' });
              }
              break;

            case 'add_tags':
              if (bulkOperation.data?.tags) {
                inquiry.tags = [...new Set([...inquiry.tags, ...bulkOperation.data.tags])];
                inquiry.updatedAt = new Date();
                successCount++;
              } else {
                failedCount++;
                errors.push({ inquiryId, error: 'Tags not specified' });
              }
              break;

            case 'remove_tags':
              if (bulkOperation.data?.tags) {
                inquiry.tags = inquiry.tags.filter(tag => !bulkOperation.data!.tags!.includes(tag));
                inquiry.updatedAt = new Date();
                successCount++;
              } else {
                failedCount++;
                errors.push({ inquiryId, error: 'Tags not specified' });
              }
              break;

            case 'delete':
              inquiries.splice(inquiryIndex, 1);
              successCount++;
              break;

            default:
              failedCount++;
              errors.push({ inquiryId, error: 'Unknown action' });
          }
        } catch (error) {
          failedCount++;
          errors.push({ inquiryId, error: error instanceof Error ? error.message : 'Unknown error' });
        }
      }

      return res.status(200).json({
        success: true,
        data: {
          success: successCount,
          failed: failedCount,
          errors: errors.length > 0 ? errors : undefined,
        },
      });

    default:
      // 创建新询盘
      const inquiryData: InquiryCreateData = req.body;

      // 验证数据
      const validationErrors = validateInquiryCreateData(inquiryData);
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

      // 创建询盘
      const newInquiry = createMockInquiry(inquiryData);
      inquiries.push(newInquiry);

      // 这里可以添加邮件通知逻辑
      // await sendInquiryNotification(newInquiry);

      return res.status(201).json({
        success: true,
        data: newInquiry,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: generateId(),
          version: '1.0.0',
        },
      });
  }
}