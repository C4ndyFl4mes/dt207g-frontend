export interface Product {
    id: string;
    name: {
        normal: string;
        slug: string;
    };
    inCategory: {
        id: string;
        name: {
            normal: string;
            slug: string;
        }
    }
    description: string;
    price: number;
    rating: number;
    created: string;
    updated: string;
}
