export interface User {
  id: number;
  name: string;
  email: string;
  role: 'CONSUMER' | 'CONSULTANT' | 'MANUFACTURER' | 'ADMIN';
  avatar?: string | null;
  phone?: string | null;
  isActive: boolean;
  createdAt: Date;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  parentId?: number | null;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  ingredients: string[];
  benefits: string[];
  usage: string;
  price: number;
  comparePrice?: number | null;
  stock: number;
  images: string[];
  categoryId: number;
  manufacturerId: number;
  isActive: boolean;
  isFeatured: boolean;
  rating: number;
  totalReviews: number;
  createdAt: Date;
  category?: Category;
}

export interface ConsultantProfile {
  id: number;
  userId: number;
  specialization: string;
  experience: number;
  bio: string;
  languages: string[];
  consultationFee: number;
  isVerified: boolean;
  rating: number;
  totalReviews: number;
  availability: Record<string, string[]>;
  user?: User;
}

export interface Appointment {
  id: number;
  consultantId: number;
  userId: number;
  scheduledAt: Date;
  duration: number;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  type: 'CHAT' | 'AUDIO' | 'VIDEO';
  concern: string;
  notes?: string | null;
  fee: number;
  meetingLink?: string | null;
  createdAt: Date;
  consultant?: ConsultantProfile;
  user?: User;
}

export interface KnowledgeArticle {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  type: 'HERB' | 'CONDITION' | 'DIET' | 'LIFESTYLE' | 'RESEARCH';
  tags: string[];
  featuredImage?: string | null;
  authorId: number;
  isPublished: boolean;
  publishedAt?: Date | null;
  viewCount: number;
  createdAt: Date;
  author?: User;
}

export interface CartItem {
  productId: number;
  product: Product;
  quantity: number;
}
