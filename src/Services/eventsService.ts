// eventService.ts
import {Event} from '../Models/Models';
import {SupabaseClient} from "@supabase/supabase-js";

interface EventQueryModel extends Event{
    id: number;
}
// Function to add an event to the database
export async function addEvent(supabase: SupabaseClient, event: Event, wines?:number[]) {
    try {
        const { data:eventData, error } = await supabase
            .from('events')
            .insert([
                { title:event.title, description: event.description, price: event.price, image: event.image, date: event.eventDate, event_type: event.eventType },
            ])
            .select()

        if(event.eventType === 'tasting'){
            const{data:eventData,error} = await supabase.from('events').select('id').eq('title',event.title).single();
            if(eventData != null && eventData.id != null){
                for (const wine in wines) {
                    const { data, error } = await supabase
                        .from('eventWines')
                        .insert([
                            { eventId: eventData.id, wineId: wine },
                        ])
                        .select()
                }
            }
        }
    } catch (error) {
        throw new Error('Error adding event to the database');
    }
}

export async function getEvents(supabase: SupabaseClient) {
    try {
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .gt('date', new Date().toISOString())
            .eq('event_type', 'event')
        return data;
    } catch (error) {
        throw new Error('Error getting events from the database');
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
        throw new Error('Error getting events from the database');
    }
}
export async function deleteEvent(supabase: SupabaseClient, eventId:number) {
    try {
        const { data, error } = await supabase
            .from('events')
            .select('event_type')
            .eq('id', eventId)
            .single();

        if (error) throw error;

        // If it's a 'tasting' event, delete associated wines
        if (data.event_type === 'tasting') {
            const { error: deleteError } = await supabase
                .from('eventwines')
                .delete()
                .eq('eventid', eventId);

            if (deleteError) throw deleteError;
        }

        // Then delete the event itself
        const {data:deletedEventData, error: deleteEventError } = await supabase
            .from('events')
            .delete()
            .eq('id', eventId).select()

        if (deleteEventError) throw deleteEventError;

        return [deletedEventData,error,deleteEventError]
    }catch (e) {
        console.log(e)
        throw new Error('Error deleting event from the database');
    }
}
export async function getWeeklyDish(supabase: SupabaseClient) {
    try {
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .gt('date', new Date().toISOString())
            .eq('event_type', 'dish')
        return data;
    } catch (error) {
        throw new Error('Error getting events from the database');
    }
}