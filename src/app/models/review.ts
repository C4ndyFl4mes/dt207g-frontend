export interface Review {
    id: string;
    createdBy: string;
    rating: number;
    message: string;
    fullname?: string;
    product?: string;
    posted: string;
    edited: string;
}
