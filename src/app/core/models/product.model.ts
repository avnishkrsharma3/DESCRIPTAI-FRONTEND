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

export interface ApprovedProduct {
    productName: string;
    category: string;
    originalDescription: string;
    aiGeneratedDescription: string;
    aiModel: string;
    imageURL: string;
    createdTime: string;
    approvedTime: string;
    productApprovedBy: string;
}
