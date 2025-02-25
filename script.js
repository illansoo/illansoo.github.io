document.addEventListener("DOMContentLoaded", async () => {
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

    // Nutzer muss sich zuerst einloggen
    async function login() {
        let email = prompt("Bitte gib deine E-Mail ein:");
        let password = prompt("Bitte gib dein Passwort ein:");

        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            alert("Falsche Zugangsdaten oder kein Konto vorhanden!");
            document.body.innerHTML = ""; // Sperrt den Zugriff auf die Seite
            return false;
        } else {
            alert("Erfolgreich eingeloggt!");
            return true;
        }
    }

    // Prüft, ob der Nutzer bereits eingeloggt ist
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        const isLoggedIn = await login();
        if (!isLoggedIn) return;
    }

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
