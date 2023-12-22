// eventService.ts
import {Event, Wine} from '../Models/Models';
import {SupabaseClient} from "@supabase/supabase-js";

// Function to add an event to the database
export async function addWine(supabase: SupabaseClient, wine: Wine) {
    try {
        const { data, error } = await supabase
            .from('wines')
            .insert([
                {country: wine.country, region: wine.region, type: wine.type, year: wine.year, rating: wine.rating, name: wine.name},
            ])
            .select()
        return data;
    } catch (error) {
        throw new Error('Error adding event to the database');
    }
}
export async function addWines(supabase: SupabaseClient, wines: Wine[]) {
    console.log(wines)
    console.log(wines[0].country)
    // const wineData = wines.map(wine => {
    //     return  { country: wine.country, region: wine.region, type: wine.type, year: wine.year, rating: wine.rating, name: wine.name }
    // })
    try {
        const { data, error } = await supabase
            .from('wines')
            .insert(wines).select();

        if (error) throw new Error(`Error adding wines: ${error.message}`);
        return data; // Data should be the array of added wines
    } catch (error) {
        console.error('Error in addWines:', error);
        throw error; // Propagate the error for the caller to handle
    }
}
export async function getWines(supabase: SupabaseClient) {
    try {
        const { data, error } = await supabase
            .from('wines')
            .select('*')
        return data;
    } catch (error) {
        throw new Error('Error getting wines from the database');
    }
}
export async function getWinesByEvent(supabase: SupabaseClient,eventId:number) {
    try {
        const { data, error } = await supabase
            .from('wines')
            .select('*').eq('event',eventId)
        return data;
    } catch (error) {
        throw new Error('Error getting wines from the database');
    }
}

export async function getWine(supabase: SupabaseClient, name: string) {
    try {
        const { data, error } = await supabase
            .from('wines')
            .select('*')
            .eq('name', name)
        return data;
    } catch (error) {
        throw new Error('Error getting wine from the database');
    }
}

export async function addEventWine(supabase: SupabaseClient, eventId: number, wineId: number) {
    try {
        const { data, error } = await supabase
            .from('eventwines')
            .insert([{eventid:eventId,wineid:wineId}])
            .select()
    } catch (error) {
        throw new Error('Error adding event wine to the database');
    }
}

export async function getEventWines(supabase: SupabaseClient, eventId: number) {
    try {
        // First, get the wine IDs from the eventWines table
        const { data: eventWines, error: eventWinesError } = await supabase
            .from('eventwines')
            .select('wineid')
            .eq('eventid', eventId);

        if (eventWinesError) throw eventWinesError;

        // Extract wineIds from the eventWines
        const wineIds = eventWines.map(ew => ew.wineid);

        // Then, get the wines using the wineIds
        const { data: wines, error: winesError } = await supabase
            .from('wines')
            .select('*')
            .in('wineid', wineIds);

        if (winesError) throw winesError;

        return wines;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

export async function deleteWine(supabase: SupabaseClient, wineId: number) {
    try {
        const { data:eventWineData, error:eventWineError } = await supabase.from('eventwines').delete().eq('wineid', wineId).select()
        if (eventWineError) throw eventWineError;
        const { data, error } = await supabase
            .from('wines')
            .delete()
            .eq('wineid', wineId).select()
        if (error) throw error;
        // console.log(error)
        return data;
    } catch (error) {
        console.log(error)
        throw new Error('Error deleting wine from the database');
    }
}