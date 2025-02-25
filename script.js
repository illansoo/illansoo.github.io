document.addEventListener("DOMContentLoaded", async () => {
    const { createClient } = window.supabase;  // Zugriff auf die globale Supabase-Bibliothek
    if (!createClient) {
        console.error("Supabase konnte nicht geladen werden!");
        return;
    }

// Supabase Konfiguration
const SUPABASE_URL = "https://uoxfhghhoqjcxxwfwedd.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVveGZoZ2hob3FqY3h4d2Z3ZWRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA0ODA4NDMsImV4cCI6MjA1NjA1Njg0M30.lsKcX4kjk4W0hImBSZQP0G_8mDpfELW5x62fuYFxw1g";
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Abstimmung speichern
async function vote(option) {
    const { error } = await supabase
        .from('votes')
        .insert([{ restaurant: option }]);

    if (error) {
        console.error("Fehler beim Abstimmen:", error);
    } else {
        alert("Deine Stimme wurde gezählt! ✅");
    }
}

// Gewinner berechnen
async function calculateWinner() {
    const { data: votes, error } = await supabase
        .from('votes')
        .select('restaurant');

    if (error) {
        console.error("Fehler beim Abrufen der Stimmen:", error);
        return;
    }

    let voteCounts = {};
    votes.forEach(vote => {
        voteCounts[vote.restaurant] = (voteCounts[vote.restaurant] || 0) + 1;
    });

    let winner = Object.keys(voteCounts).reduce((a, b) => voteCounts[a] > voteCounts[b] ? a : b, "Noch keine Stimmen");
    document.getElementById("winner").innerText = winner;
}

// Live-Updates aktivieren
supabase
    .channel('votes')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'votes' }, payload => {
        calculateWinner();
    })
    .subscribe();

// Gewinner regelmäßig aktualisieren
setInterval(calculateWinner, 5000);

// Täglicher Reset um Mitternacht
async function resetVotes() {
    let now = new Date();
    if (now.getHours() === 0 && now.getMinutes() === 0) {
        await supabase.from('votes').delete().neq('id', ''); 
        document.getElementById("winner").innerText = "Noch keine Stimmen";
    }
}

// Täglicher Check für Reset
setInterval(resetVotes, 60000);
