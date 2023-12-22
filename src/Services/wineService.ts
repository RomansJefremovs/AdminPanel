// eventService.ts
import {Wine} from '../Models/Models';
import {SupabaseClient} from "@supabase/supabase-js";

export async function addWines(supabase: SupabaseClient, wines: Wine[]) {

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