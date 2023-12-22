"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWinesByEvent = exports.addWines = void 0;
async function addWines(supabase, wines) {
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
