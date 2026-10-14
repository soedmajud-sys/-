export type RequestStatus = 'new' | 'processing' | 'accepted' | 'rejected' | 'completed';

export type UrgencyLevel = 'low' | 'medium' | 'high';

export interface AIAnalysis {
  category: string;
  categoryInArabic: string;
  urgency: UrgencyLevel;
  urgencyReason: string;
  summary: string;
  suggestedResponse: string;
  missingDetails: string[];
  confidenceScore: number;
}

export interface ServiceRequest {
  id: string;
  trackingNumber: string;
  applicantName: string;
  nationalId: string;
  email: string;
  phone: string;
  category: string;
  title: string;
  description: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
  fileName?: string;
  fileSize?: string;
  contentBase64?: string;
  aiAnalysis?: AIAnalysis;
  officialComments?: string;
}

export interface ServiceCategoryMeta {
  id: string;
  titleArabic: string;
  titleEnglish: string;
  description: string;
  iconName: string;
}

export const SERVICE_CATEGORIES: ServiceCategoryMeta[] = [
  {
    id: 'admin',
    titleArabic: 'الخدمات الإدارية العامة',
    titleEnglish: 'General Admin Services',
    description: 'طلبات التصاديق، التراخيص الإدارية، الشهادات الرسمية والوثائق العامة.',
    iconName: 'FileText'
  },
  {
    id: 'licensing',
    titleArabic: 'تراخيص الأنشطة والعمليات',
    titleEnglish: 'Licensing & Operations',
    description: 'تراخيص ممارسة الأنشطة التجارية والمهنية والتشغيل والعمليات الميدانية.',
    iconName: 'ShieldCheck'
  },
  {
    id: 'finance',
    titleArabic: 'الخدمات المالية والضريبية',
    titleEnglish: 'Financial & Tax Services',
    description: 'الإعفاءات الجمركية، الاستفسارات المالية، تسوية الرسوم والمدفوعات الرسمية.',
    iconName: 'Coins'
  },
  {
    id: 'hr',
    titleArabic: 'الموارد البشرية والتوظيف',
    titleEnglish: 'HR & Employment Services',
    description: 'طلبات التدريب، التقدم للفرص الوظيفية بالمكتب، الاستعلام الوظيفي والخدمات المهنية.',
    iconName: 'Users'
  },
  {
    id: 'support',
    titleArabic: 'الدعم، الاقتراحات والشكاوى',
    titleEnglish: 'Support & Suggestions',
    description: 'الشكاوى المتعلقة بالخدمات، مقترحات التطوير، طلبات الدعم الفني والتقني.',
    iconName: 'LifeBuoy'
  }
];
