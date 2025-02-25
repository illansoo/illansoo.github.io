document.addEventListener("DOMContentLoaded", async () => {
    // **Passcode-Schutz**
    const passcode = "1234"; // Ändere das auf deinen gewünschten Code
    let userInput = prompt("Bitte gib den Zugangscode ein:");

    if (userInput !== passcode) {
        alert("Falscher Code! Zugriff verweigert.");
        document.body.innerHTML = ""; // Sperrt die gesamte Seite
        return; // Stoppt die weitere Ausführung des Skripts
    }

    console.log("Zugangscode korrekt! Webseite wird geladen...");
    
    // Stelle sicher, dass Supabase verfügbar ist
    if (!window.supabase) {
        console.error("Supabase konnte nicht geladen werden!");
        return;
    }
    
    // Supabase initialisieren
    const SUPABASE_URL = "https://uoxfhghhoqjcxxwfwedd.supabase.co";
    const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVveGZoZ2hob3FqY3h4d2Z3ZWRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA0ODA4NDMsImV4cCI6MjA1NjA1Njg0M30.lsKcX4kjk4W0hImBSZQP0G_8mDpfELW5x62fuYFxw1g";
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    console.log("Supabase erfolgreich initialisiert!", supabase);

    // Funktion zum Abstimmen
    async function vote(option) {
        console.log(`Abstimmung für: ${option}`);
        
        const { error } = await supabase
            .from("votes")
            .insert([{ restaurant: option }]);
        
        if (error) {
            console.error("Fehler beim Abstimmen:", error);
        } else {
            alert("Deine Stimme wurde gezählt! ✅");
            updateWinner();
        }
    }
    
    // Gewinner berechnen
    async function updateWinner() {
        const { data: votes, error } = await supabase
            .from("votes")
            .select("restaurant");
        
        if (error) {
            console.error("Fehler beim Abrufen der Stimmen:", error);
            return;
        }
        
        let voteCounts = {};
        votes.forEach(vote => {
            voteCounts[vote.restaurant] = (voteCounts[vote.restaurant] || 0) + 1;
        });
        
        const winner = Object.entries(voteCounts).reduce((a, b) => b[1] > a[1] ? b : a, ["Noch keine Stimmen", 0]);
        document.getElementById("winner").textContent = winner[0];
    }
    
    // Buttons mit Abstimmungsfunktion verbinden
    document.querySelectorAll("button").forEach(button => {
        button.addEventListener("click", () => vote(button.textContent.trim()));
    });
    
    // Initialen Gewinner abrufen
    updateWinner();
});
