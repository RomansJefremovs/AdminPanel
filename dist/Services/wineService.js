"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteWine = exports.getEventWines = exports.addEventWine = exports.getWine = exports.getWinesByEvent = exports.getWines = exports.addWines = exports.addWine = void 0;
// Function to add an event to the database
async function addWine(supabase, wine) {
    try {
        const { data, error } = await supabase
            .from('wines')
            .insert([
            { country: wine.country, region: wine.region, type: wine.type, year: wine.year, rating: wine.rating, name: wine.name },
        ])
            .select();
        return data;
    }
    catch (error) {
        throw new Error('Error adding event to the database');
    }
}
exports.addWine = addWine;
async function addWines(supabase, wines) {
    console.log(wines);
    console.log(wines[0].country);
    // const wineData = wines.map(wine => {
    //     return  { country: wine.country, region: wine.region, type: wine.type, year: wine.year, rating: wine.rating, name: wine.name }
    // })
    try {
        const { data, error } = await supabase
            .from('wines')
            .insert(wines).select();
        if (error)
            throw new Error(`Error adding wines: ${error.message}`);
        return data; // Data should be the array of added wines
    }
    catch (error) {
        console.error('Error in addWines:', error);
        throw error; // Propagate the error for the caller to handle
    }
}
exports.addWines = addWines;
async function getWines(supabase) {
    try {
        const { data, error } = await supabase
            .from('wines')
            .select('*');
        return data;
    }
    catch (error) {
        throw new Error('Error getting wines from the database');
    }
}
exports.getWines = getWines;
async function getWinesByEvent(supabase, eventId) {
    try {
        const { data, error } = await supabase
            .from('wines')
            .select('*').eq('event', eventId);
        return data;
    }
    catch (error) {
        throw new Error('Error getting wines from the database');
    }
}
exports.getWinesByEvent = getWinesByEvent;
async function getWine(supabase, name) {
    try {
        const { data, error } = await supabase
            .from('wines')
            .select('*')
            .eq('name', name);
        return data;
    }
    catch (error) {
        throw new Error('Error getting wine from the database');
    }
}
exports.getWine = getWine;
async function addEventWine(supabase, eventId, wineId) {
    try {
        const { data, error } = await supabase
            .from('eventwines')
            .insert([{ eventid: eventId, wineid: wineId }])
            .select();
    }
    catch (error) {
        throw new Error('Error adding event wine to the database');
    }
}
exports.addEventWine = addEventWine;
async function getEventWines(supabase, eventId) {
    try {
        // First, get the wine IDs from the eventWines table
        const { data: eventWines, error: eventWinesError } = await supabase
            .from('eventwines')
            .select('wineid')
            .eq('eventid', eventId);
        if (eventWinesError)
            throw eventWinesError;
        // Extract wineIds from the eventWines
        const wineIds = eventWines.map(ew => ew.wineid);
        // Then, get the wines using the wineIds
        const { data: wines, error: winesError } = await supabase
            .from('wines')
            .select('*')
            .in('wineid', wineIds);
        if (winesError)
            throw winesError;
        return wines;
    }
    catch (err) {
        console.error(err);
        throw err;
    }
}
exports.getEventWines = getEventWines;
async function deleteWine(supabase, wineId) {
    try {
        const { data: eventWineData, error: eventWineError } = await supabase.from('eventwines').delete().eq('wineid', wineId).select();
        if (eventWineError)
            throw eventWineError;
        const { data, error } = await supabase
            .from('wines')
            .delete()
            .eq('wineid', wineId).select();
        if (error)
            throw error;
        // console.log(error)
        return data;
    }
    catch (error) {
        console.log(error);
        throw new Error('Error deleting wine from the database');
    }
}
exports.deleteWine = deleteWine;
