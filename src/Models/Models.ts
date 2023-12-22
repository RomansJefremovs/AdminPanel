export interface Common{
    "id": number,
    "title": string,
    "description": string,
    "price": number,
    "date": string,
    // "event_type": string
}
export interface Event extends Common{
    "event_type": 'tasting'|'event'|'dish'|'wine'
}
export interface Wine{
    country: string;
    region: string;
    type: string;
    year: number;
    rating: number;
    name: string;
    event: number;
}

