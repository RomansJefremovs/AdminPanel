export interface Common{
    title: string;
    description: string;
    price: number;
    image: string;
}
export interface Event extends Common{
    eventDate: string;
}
export interface Wine{
    country: string;
    region: string;
    type: string;
    year: number;
    rating: number;
}

export interface WineTasting extends Common{
    wines: Wine[];
}

export interface AddEventBody {
    title: string;
    description: string;
    price: number;
    date: string; // or Date, depending on how you handle dates
}
