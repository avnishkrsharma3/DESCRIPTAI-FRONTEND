export interface Product {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  brand: string;
  thumbnail: string;
  rating?: number;
  stock?: number;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

export type DescriptionStatus = 'DRAFT' | 'APPROVED' | 'SUPERSEDED' | 'REJECTED';

export interface ProductDescription {
  id: string;
  productId: number;
  productName: string;
  category: string;
  originalDescription: string;
  versionNumber: number;
  status: DescriptionStatus;
  aiGeneratedDescription: string;
  imageURL: string;
  aiModel: string;
  createdBy: string;
  createdAt: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
  lockVersion: number;
}

export interface GeneratedDescription {
  productId: number;
  productName: string;
  category: string;
  originalDescription: string;
  aiGeneratedDescription: string;
  imageURL: string;
  aiModel: string;
  status: DescriptionStatus;
  id?: string;
  versionNumber?: number;
}
