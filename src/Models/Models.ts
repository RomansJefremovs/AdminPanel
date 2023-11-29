export interface Common{
    title: string;
    description: string;
    price: number;
    image: string;
    eventDate: string;
}
export interface Event extends Common{
    eventType: 'tasting'|'event'|'dish'
}
export interface Wine{
    country: string;
    region: string;
    type: string;
    year: number;
    rating: number;
    name: string;
}

