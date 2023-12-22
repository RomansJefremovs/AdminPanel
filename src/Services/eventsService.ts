// eventService.ts
import {Event} from '../Models/Models';
import {SupabaseClient} from "@supabase/supabase-js";

export async function addEvent(supabase: SupabaseClient, event: Event) {
    try {
        const { data:eventData, error } = await supabase
            .from('events')
            .insert([
                { title:event.title, description: event.description, price: event.price, date: event.date, event_type: event.event_type },
            ])
            .select()
        if (error) return 500

        return eventData;
    } catch (error) {
        return 500
        // throw new Error('Error adding event to the database');
    }
}

export async function getEvents(supabase: SupabaseClient) {
    try {
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .gt('date', new Date().toISOString())
            .eq('event_type', 'event')
        if (error)return error

        return data;
    } catch (error) {
        // throw new Error('Error getting events from the database');
    }
}
export async function getAllEvents(supabase: SupabaseClient) {
    try {
        const { data, error } = await supabase
            .from('events')
            .select('*') .eq('event_type', 'event')
        if (error)return error
        return data;
    } catch (error) {
        // throw new Error('Error getting events from the database');
    }
}
export async function getTastings(supabase: SupabaseClient) {
    try {
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .gt('date', new Date().toISOString())
            .eq('event_type', 'tasting')
        return data;
    } catch (error) {
        return null
        // throw new Error('Error getting events from the database');
    }
}
export async function getAllTastings(supabase: SupabaseClient) {
    try {
        const { data, error } = await supabase
            .from('events')
            .select('*')
            // .gt('date', new Date().toISOString())
            .eq('event_type', 'tasting')
        if (error) return error
        return data;
    } catch (error) {
        // throw new Error('Error getting events from the database');
    }
}
export async function deleteEvent(supabase: SupabaseClient, eventId:number) {
    try {
        const { data, error } = await supabase
            .from('wines')
            .delete()
            .eq('event', eventId)

        if (error) return  error;

        const {data:deletedEventData, error: deleteEventError } = await supabase
            .from('events')
            .delete()
            .eq('id', eventId).select()

        if (deleteEventError) return deleteEventError;

        return [deletedEventData,error,deleteEventError]
    }catch (e) {
        console.log(e)
        // throw new Error('Error deleting event from the database');
    }
}
export async function getWeeklyDish(supabase: SupabaseClient) {
    try {
        const {data, error} = await supabase
            .from('events')
            .select('*')
            // .gt('date', new Date().toISOString())
            .eq('event_type', 'dish')
        return data;
    } catch (error) {
        // throw new Error('Error getting events from the database');
    }
}
    export async function getWeeklyWine(supabase: SupabaseClient) {
        try {
            const { data, error } = await supabase
                .from('events')
                .select('*')
                // .gt('date', new Date().toISOString())
                .eq('event_type', 'wine')
            return data;
        } catch (error) {
            // throw new Error('Error getting events from the database');
        }
}
export async function geUpcomingtWeeklyDish(supabase: SupabaseClient) {
    try {
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .gt('date', new Date().toISOString())
            .eq('event_type', 'dish')
        return data;
    } catch (error) {
        // throw new Error('Error getting events from the database');
    }
}
export async function geUpcomingWeeklyWine(supabase: SupabaseClient) {
    try {
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .gt('date', new Date().toISOString())
            .eq('event_type', 'wine')
        return data;
    } catch (error) {
        return null
        // throw new Error('Error getting events from the database');
    }
}