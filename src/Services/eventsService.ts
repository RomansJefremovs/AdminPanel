// eventService.ts
import {Event} from '../Models/Models';
import {SupabaseClient} from "@supabase/supabase-js";

interface EventQueryModel extends Event{
    id: number;
}
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
        if (error) return error
        return data;
    } catch (error) {
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
export async function getTastingByName(supabase: SupabaseClient, name: string) {
    try {
        const { data, error } = await supabase
            .from('events')
            .select('*')
            // .gt('date', new Date().toISOString())
            .eq('event_type', 'tasting').eq('title',name)
        if (error) return error
        return data;
    } catch (error) {
        // throw new Error('Error getting events from the database');
    }
}
export async function deleteEvent(supabase: SupabaseClient, eventId:number) {
    try {
        const { data, error } = await supabase
            .from('events')
            .select('event_type')
            .eq('id', eventId)
            .single();

        if (error) return  error;

        if (data.event_type === 'tasting') {
            const { error: deleteError } = await supabase
                .from('eventwines')
                .delete()
                .eq('eventid', eventId);

            if (deleteError) return  deleteError;
        }
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