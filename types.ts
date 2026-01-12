export interface GuestbookEntry {
  id: string;
  name: string;
  content: string;
  createdAt: number;
}

export interface Comment {
  id: string;
  postId: string;
  name: string;
  content: string;
  createdAt: number;
}

export interface ContentItem {
  id: string;
  category: string; // 'manual_do' | 'manual_dont' | 'taste' | 'wishlist' | 'culture' | 'blog' | 'memo'
  title?: string;
  content: string;
  link?: string; // For youtube/music links
  createdAt: number;
}

export type SectionType = 'home' | 'about' | 'taste' | 'log';

export interface UserProfile {
  name: string;
  birthday: string;
  zodiac: string;
  chineseZodiac: string;
  bloodType: string;
  mbti: string;
  motto: string;
  instagram: string;
  email: string;
}