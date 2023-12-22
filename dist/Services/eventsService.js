"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.geUpcomingtWeeklyDish = exports.getWeeklyWine = exports.getWeeklyDish = exports.deleteEvent = exports.getTastingByName = exports.getAllTastings = exports.getTastings = exports.getAllEvents = exports.getEvents = exports.addEvent = void 0;
async function addEvent(supabase, event) {
    try {
        const { data: eventData, error } = await supabase
            .from('events')
            .insert([
            { title: event.title, description: event.description, price: event.price, date: event.date, event_type: event.event_type },
        ])
            .select();
        if (error)
            return 500;
        return eventData;
    }
    catch (error) {
        return 500;
        // throw new Error('Error adding event to the database');
    }
}
exports.addEvent = addEvent;
async function getEvents(supabase) {
    try {
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .gt('date', new Date().toISOString())
            .eq('event_type', 'event');
        if (error)
            return error;
        return data;
    }
    catch (error) {
        // throw new Error('Error getting events from the database');
    }
}
exports.getEvents = getEvents;
async function getAllEvents(supabase) {
    try {
        const { data, error } = await supabase
            .from('events')
            .select('*').eq('event_type', 'event');
        if (error)
            return error;
        return data;
    }
    catch (error) {
        // throw new Error('Error getting events from the database');
    }
}
exports.getAllEvents = getAllEvents;
async function getTastings(supabase) {
    try {
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .gt('date', new Date().toISOString())
            .eq('event_type', 'tasting');
        if (error)
            return error;
        return data;
    }
    catch (error) {
        // throw new Error('Error getting events from the database');
    }
}
exports.getTastings = getTastings;
async function getAllTastings(supabase) {
    try {
        const { data, error } = await supabase
            .from('events')
            .select('*')
            // .gt('date', new Date().toISOString())
            .eq('event_type', 'tasting');
        if (error)
            return error;
        return data;
    }
    catch (error) {
        // throw new Error('Error getting events from the database');
    }
}
exports.getAllTastings = getAllTastings;
async function getTastingByName(supabase, name) {
    try {
        const { data, error } = await supabase
            .from('events')
            .select('*')
            // .gt('date', new Date().toISOString())
            .eq('event_type', 'tasting').eq('title', name);
        if (error)
            return error;
        return data;
    }
    catch (error) {
        // throw new Error('Error getting events from the database');
    }
}
exports.getTastingByName = getTastingByName;
async function deleteEvent(supabase, eventId) {
    try {
        const { data, error } = await supabase
            .from('events')
            .select('event_type')
            .eq('id', eventId)
            .single();
        if (error)
            return error;
        if (data.event_type === 'tasting') {
            const { error: deleteError } = await supabase
                .from('eventwines')
                .delete()
                .eq('eventid', eventId);
            if (deleteError)
                return deleteError;
        }
        const { data: deletedEventData, error: deleteEventError } = await supabase
            .from('events')
            .delete()
            .eq('id', eventId).select();
        if (deleteEventError)
            return deleteEventError;
        return [deletedEventData, error, deleteEventError];
    }
    catch (e) {
        console.log(e);
        // throw new Error('Error deleting event from the database');
    }
}
exports.deleteEvent = deleteEvent;
async function getWeeklyDish(supabase) {
    try {
        const { data, error } = await supabase
            .from('events')
            .select('*')
            // .gt('date', new Date().toISOString())
            .eq('event_type', 'dish');
        return data;
    }
    catch (error) {
        // throw new Error('Error getting events from the database');
    }
}
exports.getWeeklyDish = getWeeklyDish;
async function getWeeklyWine(supabase) {
    try {
        const { data, error } = await supabase
            .from('events')
            .select('*')
            // .gt('date', new Date().toISOString())
            .eq('event_type', 'wine');
        return data;
    }
    catch (error) {
        // throw new Error('Error getting events from the database');
    }
}
exports.getWeeklyWine = getWeeklyWine;
async function geUpcomingtWeeklyDish(supabase) {
    try {
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .gt('date', new Date().toISOString())
            .eq('event_type', 'dish');
        return data;
    }
    catch (error) {
        // throw new Error('Error getting events from the database');
    }
}
exports.geUpcomingtWeeklyDish = geUpcomingtWeeklyDish;
