import type { NavigationItem } from '@/types/navigation';

export const navigationItems: NavigationItem[] = [
  {
    id: 'home',
    label: 'Home',
    href: '/',
  },
  {
    id: 'about',
    label: 'About Us',
    href: '/about',
  },
  {
    id: 'products',
    label: 'Products',
    href: '/products',
    children: [
      {
        id: 'fine-pitch',
        label: 'Fine Pitch LED',
        href: '/products/fine-pitch',
        badge: 'Popular',
      },
      {
        id: 'indoor',
        label: 'Indoor LED Display',
        href: '/products/indoor',
      },
      {
        id: 'outdoor',
        label: 'Outdoor LED Display',
        href: '/products/outdoor',
      },
      {
        id: 'rental',
        label: 'Rental LED Display',
        href: '/products/rental',
      },
      {
        id: 'creative',
        label: 'Creative LED Display',
        href: '/products/creative',
      },
      {
        id: 'transparent',
        label: 'Transparent LED',
        href: '/products/transparent',
        badge: 'New',
      },
    ],
  },
  {
    id: 'solutions',
    label: 'Solutions',
    href: '/solutions',
    children: [
      {
        id: 'conference',
        label: 'Conference Room',
        href: '/solutions/conference',
      },
      {
        id: 'advertising',
        label: 'Digital Advertising',
        href: '/solutions/advertising',
      },
      {
        id: 'stage',
        label: 'Stage & Events',
        href: '/solutions/stage',
      },
      {
        id: 'sports',
        label: 'Sports Venue',
        href: '/solutions/sports',
      },
      {
        id: 'transportation',
        label: 'Transportation',
        href: '/solutions/transportation',
      },
      {
        id: 'retail',
        label: 'Retail Display',
        href: '/solutions/retail',
      },
    ],
  },
  {
    id: 'cases',
    label: 'Cases',
    href: '/cases',
  },
  {
    id: 'news',
    label: 'News',
    href: '/news',
  },
  {
    id: 'support',
    label: 'Support',
    href: '/support',
    children: [
      {
        id: 'technical',
        label: 'Technical Support',
        href: '/support/technical',
      },
      {
        id: 'downloads',
        label: 'Downloads',
        href: '/support/downloads',
      },
      {
        id: 'faq',
        label: 'FAQ',
        href: '/support/faq',
      },
      {
        id: 'warranty',
        label: 'Warranty',
        href: '/support/warranty',
      },
    ],
  },
  {
    id: 'contact',
    label: 'Contact',
    href: '/contact',
  },
];

// 中文导航配置
export const navigationItemsZh: NavigationItem[] = [
  {
    id: 'home',
    label: '首页',
    href: '/',
  },
  {
    id: 'about',
    label: '关于我们',
    href: '/about',
  },
  {
    id: 'products',
    label: '产品中心',
    href: '/products',
    children: [
      {
        id: 'fine-pitch',
        label: '小间距LED显示屏',
        href: '/products/fine-pitch',
        badge: '热门',
      },
      {
        id: 'indoor',
        label: '室内LED显示屏',
        href: '/products/indoor',
      },
      {
        id: 'outdoor',
        label: '户外LED显示屏',
        href: '/products/outdoor',
      },
      {
        id: 'rental',
        label: '租赁LED显示屏',
        href: '/products/rental',
      },
      {
        id: 'creative',
        label: '创意LED显示屏',
        href: '/products/creative',
      },
      {
        id: 'transparent',
        label: '透明LED显示屏',
        href: '/products/transparent',
        badge: '新品',
      },
    ],
  },
  {
    id: 'solutions',
    label: '解决方案',
    href: '/solutions',
    children: [
      {
        id: 'conference',
        label: '会议室显示',
        href: '/solutions/conference',
      },
      {
        id: 'advertising',
        label: '数字广告',
        href: '/solutions/advertising',
      },
      {
        id: 'stage',
        label: '舞台演出',
        href: '/solutions/stage',
      },
      {
        id: 'sports',
        label: '体育场馆',
        href: '/solutions/sports',
      },
      {
        id: 'transportation',
        label: '交通信息',
        href: '/solutions/transportation',
      },
      {
        id: 'retail',
        label: '零售展示',
        href: '/solutions/retail',
      },
    ],
  },
  {
    id: 'cases',
    label: '成功案例',
    href: '/cases',
  },
  {
    id: 'news',
    label: '新闻资讯',
    href: '/news',
  },
  {
    id: 'support',
    label: '技术支持',
    href: '/support',
    children: [
      {
        id: 'technical',
        label: '技术支持',
        href: '/support/technical',
      },
      {
        id: 'downloads',
        label: '下载中心',
        href: '/support/downloads',
      },
      {
        id: 'faq',
        label: '常见问题',
        href: '/support/faq',
      },
      {
        id: 'warranty',
        label: '质保服务',
        href: '/support/warranty',
      },
    ],
  },
  {
    id: 'contact',
    label: '联系我们',
    href: '/contact',
  },
];

// 根据语言获取导航配置
export const getNavigationItems = (locale: 'en' | 'zh'): NavigationItem[] => {
  return locale === 'zh' ? navigationItemsZh : navigationItems;
};