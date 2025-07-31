/**
 * 询盘数据验证逻辑
 */
import { 
  validationRules, 
  combineValidators, 
  ValidationRule 
} from './form-validation';
import { 
  Inquiry,
  InquiryCreateData,
  InquiryUpdateData,
  ContactInfo,
  CompanyInfo,
  ProductRequirement,
  ProjectInfo,
  InquiryType,
  InquirySource,
  InquiryStatus,
  InquiryPriority,
  CustomerType,
  BudgetRange,
  ProjectTimeline,
  InquiryFilters,
  InquiryQuery
} from '@/types/inquiry';

// 联系人信息验证
export const validateContactInfo = (contact: Partial<ContactInfo>): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  // 名字验证
  const firstNameError = combineValidators(
    validationRules.required('First name is required'),
    validationRules.minLength(2, 'First name must be at least 2 characters'),
    validationRules.maxLength(50, 'First name must not exceed 50 characters'),
    validationRules.pattern(/^[a-zA-Z\u4e00-\u9fa5\s\-'\.]+$/, 'First name contains invalid characters')
  )(contact.firstName);
  if (firstNameError) errors.firstName = firstNameError;
  
  // 姓氏验证
  const lastNameError = combineValidators(
    validationRules.required('Last name is required'),
    validationRules.minLength(2, 'Last name must be at least 2 characters'),
    validationRules.maxLength(50, 'Last name must not exceed 50 characters'),
    validationRules.pattern(/^[a-zA-Z\u4e00-\u9fa5\s\-'\.]+$/, 'Last name contains invalid characters')
  )(contact.lastName);
  if (lastNameError) errors.lastName = lastNameError;
  
  // 邮箱验证
  const emailError = combineValidators(
    validationRules.required('Email is required'),
    validationRules.email('Please enter a valid email address')
  )(contact.email);
  if (emailError) errors.email = emailError;
  
  // 电话验证（可选）
  if (contact.phone) {
    const phoneError = validationRules.phone('Please enter a valid phone number')(contact.phone);
    if (phoneError) errors.phone = phoneError;
  }
  
  // 职位验证（可选）
  if (contact.jobTitle && contact.jobTitle.length > 100) {
    errors.jobTitle = 'Job title must not exceed 100 characters';
  }
  
  // 部门验证（可选）
  if (contact.department && contact.department.length > 100) {
    errors.department = 'Department must not exceed 100 characters';
  }
  
  return errors;
};

// 公司信息验证
export const validateCompanyInfo = (company: Partial<CompanyInfo>): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  // 公司名称验证
  const nameError = combineValidators(
    validationRules.required('Company name is required'),
    validationRules.minLength(2, 'Company name must be at least 2 characters'),
    validationRules.maxLength(200, 'Company name must not exceed 200 characters')
  )(company.name);
  if (nameError) errors.name = nameError;
  
  // 网站验证（可选）
  if (company.website) {
    const websiteError = validationRules.url('Please enter a valid website URL')(company.website);
    if (websiteError) errors.website = websiteError;
  }
  
  // 行业验证（可选）
  if (company.industry && company.industry.length > 100) {
    errors.industry = 'Industry must not exceed 100 characters';
  }
  
  // 公司规模验证（可选）
  if (company.size && company.size.length > 50) {
    errors.size = 'Company size must not exceed 50 characters';
  }
  
  // 国家验证
  const countryError = combineValidators(
    validationRules.required('Country is required'),
    validationRules.minLength(2, 'Country must be at least 2 characters'),
    validationRules.maxLength(100, 'Country must not exceed 100 characters')
  )(company.country);
  if (countryError) errors.country = countryError;
  
  // 州/省验证（可选）
  if (company.state && company.state.length > 100) {
    errors.state = 'State must not exceed 100 characters';
  }
  
  // 城市验证（可选）
  if (company.city && company.city.length > 100) {
    errors.city = 'City must not exceed 100 characters';
  }
  
  // 地址验证（可选）
  if (company.address && company.address.length > 500) {
    errors.address = 'Address must not exceed 500 characters';
  }
  
  // 邮政编码验证（可选）
  if (company.postalCode && company.postalCode.length > 20) {
    errors.postalCode = 'Postal code must not exceed 20 characters';
  }
  
  return errors;
};

// 产品需求验证
export const validateProductRequirement = (requirement: Partial<ProductRequirement>): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  // 产品名称验证（如果没有productId）
  if (!requirement.productId && !requirement.productName) {
    errors.product = 'Either product ID or product name is required';
  }
  
  if (requirement.productName && requirement.productName.length > 200) {
    errors.productName = 'Product name must not exceed 200 characters';
  }
  
  // 像素间距验证（可选）
  if (requirement.pixelPitch && requirement.pixelPitch.length > 20) {
    errors.pixelPitch = 'Pixel pitch must not exceed 20 characters';
  }
  
  // 屏幕尺寸验证（可选）
  if (requirement.screenSize) {
    if (!requirement.screenSize.width || requirement.screenSize.width <= 0) {
      errors.screenWidth = 'Screen width must be greater than 0';
    }
    if (!requirement.screenSize.height || requirement.screenSize.height <= 0) {
      errors.screenHeight = 'Screen height must be greater than 0';
    }
    if (!requirement.screenSize.unit || !['mm', 'cm', 'm', 'inch', 'ft'].includes(requirement.screenSize.unit)) {
      errors.screenUnit = 'Invalid screen size unit';
    }
  }
  
  // 数量验证（可选）
  if (requirement.quantity !== undefined && (requirement.quantity <= 0 || requirement.quantity > 10000)) {
    errors.quantity = 'Quantity must be between 1 and 10000';
  }
  
  // 应用场景验证（可选）
  if (requirement.application && requirement.application.length > 200) {
    errors.application = 'Application must not exceed 200 characters';
  }
  
  // 安装环境验证（可选）
  if (requirement.installationEnvironment && 
      !['indoor', 'outdoor', 'semi_outdoor'].includes(requirement.installationEnvironment)) {
    errors.installationEnvironment = 'Invalid installation environment';
  }
  
  // 观看距离验证（可选）
  if (requirement.viewingDistance) {
    if (requirement.viewingDistance.min <= 0) {
      errors.viewingDistanceMin = 'Minimum viewing distance must be greater than 0';
    }
    if (requirement.viewingDistance.max <= 0) {
      errors.viewingDistanceMax = 'Maximum viewing distance must be greater than 0';
    }
    if (requirement.viewingDistance.min >= requirement.viewingDistance.max) {
      errors.viewingDistance = 'Minimum viewing distance must be less than maximum';
    }
    if (!['m', 'ft'].includes(requirement.viewingDistance.unit)) {
      errors.viewingDistanceUnit = 'Invalid viewing distance unit';
    }
  }
  
  return errors;
};

// 项目信息验证
export const validateProjectInfo = (project: Partial<ProjectInfo>): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  // 项目名称验证（可选）
  if (project.name && project.name.length > 200) {
    errors.name = 'Project name must not exceed 200 characters';
  }
  
  // 项目描述验证（可选）
  if (project.description && project.description.length > 2000) {
    errors.description = 'Project description must not exceed 2000 characters';
  }
  
  // 预算验证（可选）
  if (project.budget) {
    if (!Object.values(BudgetRange).includes(project.budget.range)) {
      errors.budgetRange = 'Invalid budget range';
    }
    if (project.budget.exactAmount !== undefined && project.budget.exactAmount < 0) {
      errors.budgetAmount = 'Budget amount cannot be negative';
    }
    if (project.budget.currency && project.budget.currency.length > 10) {
      errors.budgetCurrency = 'Currency code must not exceed 10 characters';
    }
  }
  
  // 时间线验证（可选）
  if (project.timeline && !Object.values(ProjectTimeline).includes(project.timeline)) {
    errors.timeline = 'Invalid project timeline';
  }
  
  // 决策者验证（可选）
  if (project.decisionMakers && project.decisionMakers.length > 10) {
    errors.decisionMakers = 'Too many decision makers (maximum 10)';
  }
  
  // 竞争对手验证（可选）
  if (project.competitors && project.competitors.length > 20) {
    errors.competitors = 'Too many competitors (maximum 20)';
  }
  
  return errors;
};

// 询盘类型验证
export const validateInquiryType: ValidationRule = (value) => {
  if (!value) {
    return 'Inquiry type is required';
  }
  if (!Object.values(InquiryType).includes(value)) {
    return 'Invalid inquiry type';
  }
  return undefined;
};

// 询盘来源验证
export const validateInquirySource: ValidationRule = (value) => {
  if (!value) {
    return 'Inquiry source is required';
  }
  if (!Object.values(InquirySource).includes(value)) {
    return 'Invalid inquiry source';
  }
  return undefined;
};

// 询盘状态验证
export const validateInquiryStatus: ValidationRule = (value) => {
  if (!value) {
    return 'Inquiry status is required';
  }
  if (!Object.values(InquiryStatus).includes(value)) {
    return 'Invalid inquiry status';
  }
  return undefined;
};

// 询盘优先级验证
export const validateInquiryPriority: ValidationRule = (value) => {
  if (!value) {
    return 'Inquiry priority is required';
  }
  if (!Object.values(InquiryPriority).includes(value)) {
    return 'Invalid inquiry priority';
  }
  return undefined;
};

// 客户类型验证
export const validateCustomerType: ValidationRule = (value) => {
  if (!value) {
    return 'Customer type is required';
  }
  if (!Object.values(CustomerType).includes(value)) {
    return 'Invalid customer type';
  }
  return undefined;
};

// 主题验证
export const validateSubject: ValidationRule = combineValidators(
  validationRules.required('Subject is required'),
  validationRules.minLength(5, 'Subject must be at least 5 characters'),
  validationRules.maxLength(200, 'Subject must not exceed 200 characters')
);

// 消息内容验证
export const validateMessage: ValidationRule = combineValidators(
  validationRules.required('Message is required'),
  validationRules.minLength(10, 'Message must be at least 10 characters'),
  validationRules.maxLength(5000, 'Message must not exceed 5000 characters')
);

// 语言验证
export const validateLanguage: ValidationRule = (value) => {
  if (!value) {
    return 'Language is required';
  }
  if (!['en', 'zh'].includes(value)) {
    return 'Invalid language';
  }
  return undefined;
};

// 询盘创建数据验证
export const validateInquiryCreateData = (data: InquiryCreateData): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  // 基本信息验证
  const typeError = validateInquiryType(data.type);
  if (typeError) errors.type = typeError;
  
  const sourceError = validateInquirySource(data.source);
  if (sourceError) errors.source = sourceError;
  
  const customerTypeError = validateCustomerType(data.customerType);
  if (customerTypeError) errors.customerType = customerTypeError;
  
  const subjectError = validateSubject(data.subject);
  if (subjectError) errors.subject = subjectError;
  
  const messageError = validateMessage(data.message);
  if (messageError) errors.message = messageError;
  
  const languageError = validateLanguage(data.language);
  if (languageError) errors.language = languageError;
  
  // 联系人信息验证
  const contactErrors = validateContactInfo(data.contact);
  Object.keys(contactErrors).forEach(key => {
    errors[`contact.${key}`] = contactErrors[key];
  });
  
  // 公司信息验证
  const companyErrors = validateCompanyInfo(data.company);
  Object.keys(companyErrors).forEach(key => {
    errors[`company.${key}`] = companyErrors[key];
  });
  
  // 产品需求验证
  if (!data.productRequirements || data.productRequirements.length === 0) {
    errors.productRequirements = 'At least one product requirement is required';
  } else {
    data.productRequirements.forEach((requirement, index) => {
      const requirementErrors = validateProductRequirement(requirement);
      Object.keys(requirementErrors).forEach(key => {
        errors[`productRequirements[${index}].${key}`] = requirementErrors[key];
      });
    });
  }
  
  // 项目信息验证（可选）
  if (data.projectInfo) {
    const projectErrors = validateProjectInfo(data.projectInfo);
    Object.keys(projectErrors).forEach(key => {
      errors[`projectInfo.${key}`] = projectErrors[key];
    });
  }
  
  // 标签验证（可选）
  if (data.tags && data.tags.length > 20) {
    errors.tags = 'Too many tags (maximum 20)';
  }
  
  return errors;
};

// 询盘更新数据验证
export const validateInquiryUpdateData = (data: InquiryUpdateData): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  if (!data.id) {
    errors.id = 'Inquiry ID is required';
  }
  
  // 只验证提供的字段
  if (data.status !== undefined) {
    const statusError = validateInquiryStatus(data.status);
    if (statusError) errors.status = statusError;
  }
  
  if (data.priority !== undefined) {
    const priorityError = validateInquiryPriority(data.priority);
    if (priorityError) errors.priority = priorityError;
  }
  
  if (data.subject !== undefined) {
    const subjectError = validateSubject(data.subject);
    if (subjectError) errors.subject = subjectError;
  }
  
  if (data.message !== undefined) {
    const messageError = validateMessage(data.message);
    if (messageError) errors.message = messageError;
  }
  
  if (data.contact) {
    const contactErrors = validateContactInfo(data.contact);
    Object.keys(contactErrors).forEach(key => {
      errors[`contact.${key}`] = contactErrors[key];
    });
  }
  
  if (data.company) {
    const companyErrors = validateCompanyInfo(data.company);
    Object.keys(companyErrors).forEach(key => {
      errors[`company.${key}`] = companyErrors[key];
    });
  }
  
  if (data.productRequirements) {
    data.productRequirements.forEach((requirement, index) => {
      const requirementErrors = validateProductRequirement(requirement);
      Object.keys(requirementErrors).forEach(key => {
        errors[`productRequirements[${index}].${key}`] = requirementErrors[key];
      });
    });
  }
  
  if (data.projectInfo) {
    const projectErrors = validateProjectInfo(data.projectInfo);
    Object.keys(projectErrors).forEach(key => {
      errors[`projectInfo.${key}`] = projectErrors[key];
    });
  }
  
  if (data.tags && data.tags.length > 20) {
    errors.tags = 'Too many tags (maximum 20)';
  }
  
  return errors;
};

// 询盘筛选参数验证
export const validateInquiryFilters = (filters: InquiryFilters): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  if (filters.status) {
    const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
    const invalidStatuses = statuses.filter(status => !Object.values(InquiryStatus).includes(status));
    if (invalidStatuses.length > 0) {
      errors.status = `Invalid inquiry statuses: ${invalidStatuses.join(', ')}`;
    }
  }
  
  if (filters.priority) {
    const priorities = Array.isArray(filters.priority) ? filters.priority : [filters.priority];
    const invalidPriorities = priorities.filter(priority => !Object.values(InquiryPriority).includes(priority));
    if (invalidPriorities.length > 0) {
      errors.priority = `Invalid inquiry priorities: ${invalidPriorities.join(', ')}`;
    }
  }
  
  if (filters.type) {
    const types = Array.isArray(filters.type) ? filters.type : [filters.type];
    const invalidTypes = types.filter(type => !Object.values(InquiryType).includes(type));
    if (invalidTypes.length > 0) {
      errors.type = `Invalid inquiry types: ${invalidTypes.join(', ')}`;
    }
  }
  
  if (filters.source) {
    const sources = Array.isArray(filters.source) ? filters.source : [filters.source];
    const invalidSources = sources.filter(source => !Object.values(InquirySource).includes(source));
    if (invalidSources.length > 0) {
      errors.source = `Invalid inquiry sources: ${invalidSources.join(', ')}`;
    }
  }
  
  if (filters.customerType) {
    const customerTypes = Array.isArray(filters.customerType) ? filters.customerType : [filters.customerType];
    const invalidCustomerTypes = customerTypes.filter(type => !Object.values(CustomerType).includes(type));
    if (invalidCustomerTypes.length > 0) {
      errors.customerType = `Invalid customer types: ${invalidCustomerTypes.join(', ')}`;
    }
  }
  
  if (filters.dateRange) {
    if (filters.dateRange.start >= filters.dateRange.end) {
      errors.dateRange = 'Start date must be before end date';
    }
    if (!['createdAt', 'updatedAt', 'lastContactedAt', 'closedAt'].includes(filters.dateRange.field)) {
      errors.dateRangeField = 'Invalid date range field';
    }
  }
  
  if (filters.scoreRange) {
    if (filters.scoreRange.min < 0 || filters.scoreRange.min > 100) {
      errors.scoreRangeMin = 'Score range minimum must be between 0 and 100';
    }
    if (filters.scoreRange.max < 0 || filters.scoreRange.max > 100) {
      errors.scoreRangeMax = 'Score range maximum must be between 0 and 100';
    }
    if (filters.scoreRange.min >= filters.scoreRange.max) {
      errors.scoreRange = 'Score range minimum must be less than maximum';
    }
  }
  
  if (filters.search && filters.search.length > 200) {
    errors.search = 'Search query must not exceed 200 characters';
  }
  
  return errors;
};

// 询盘查询参数验证
export const validateInquiryQuery = (query: InquiryQuery): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  if (query.filters) {
    const filterErrors = validateInquiryFilters(query.filters);
    Object.assign(errors, filterErrors);
  }
  
  if (query.page !== undefined && (query.page < 1 || query.page > 1000)) {
    errors.page = 'Page must be between 1 and 1000';
  }
  
  if (query.limit !== undefined && (query.limit < 1 || query.limit > 100)) {
    errors.limit = 'Limit must be between 1 and 100';
  }
  
  return errors;
};

export default {
  validateContactInfo,
  validateCompanyInfo,
  validateProductRequirement,
  validateProjectInfo,
  validateInquiryType,
  validateInquirySource,
  validateInquiryStatus,
  validateInquiryPriority,
  validateCustomerType,
  validateSubject,
  validateMessage,
  validateLanguage,
  validateInquiryCreateData,
  validateInquiryUpdateData,
  validateInquiryFilters,
  validateInquiryQuery,
};