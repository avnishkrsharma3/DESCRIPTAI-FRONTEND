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