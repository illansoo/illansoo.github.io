document.addEventListener("DOMContentLoaded", async () => {
    // Passcode-Schutz
    const passcode = "1234";
    if (!sessionStorage.getItem("accessGranted")) {
        let userInput = prompt("Bitte gib den Zugangscode ein:");
        if (userInput !== passcode) {
            alert("Falscher Code! Zugriff verweigert.");
            document.body.innerHTML = "";
            return;
        }
        sessionStorage.setItem("accessGranted", "true");
    }

    console.log("Zugangscode korrekt! Webseite wird geladen...");

    // Supabase Initialisierung
    if (!window.supabase) {
        console.error("Supabase konnte nicht geladen werden!");
        return;
    }
    
    const SUPABASE_URL = "https://uoxfhghhoqjcxxwfwedd.supabase.co";
    const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVveGZoZ2hob3FqY3h4d2Z3ZWRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA0ODA4NDMsImV4cCI6MjA1NjA1Njg0M30.lsKcX4kjk4W0hImBSZQP0G_8mDpfELW5x62fuYFxw1g";
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log("Supabase erfolgreich initialisiert!");

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
            updateVoteHistory();
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

    // Abstimmungsverlauf aktualisieren
    async function updateVoteHistory() {
        const { data: votes, error } = await supabase
            .from("votes")
            .select("restaurant, created_at")
            .order("created_at", { ascending: false });
        if (error) {
            console.error("Fehler beim Abrufen des Verlaufs:", error);
            return;
        }
        const historyElement = document.getElementById("vote-history");
        historyElement.innerHTML = ""; // Verlauf leeren
        
        const container = document.createElement("div");
        container.style.border = "1px solid #ccc";
        container.style.borderRadius = "8px";
        container.style.padding = "10px";
        container.style.marginTop = "20px";
        container.style.backgroundColor = "#f9f9f9";

        votes.forEach(vote => {
            const time = new Date(vote.created_at).toLocaleTimeString("de-DE");
            const listItem = document.createElement("div");
            listItem.style.display = "flex";
            listItem.style.justifyContent = "space-between";
            listItem.style.width = "100%";
            listItem.style.padding = "5px 0";
            listItem.style.borderBottom = "1px solid #ddd";
            listItem.innerHTML = `<span><strong>${vote.restaurant}</strong></span> <span>${time}</span>`;
            container.appendChild(listItem);
        });

        historyElement.appendChild(container);

        // Reset Button hinzufügen
        const resetButton = document.createElement("button");
        resetButton.textContent = "Reset";
        resetButton.style.display = "block";
        resetButton.style.margin = "20px auto";
        resetButton.style.padding = "10px 20px";
        resetButton.style.fontSize = "16px";
        resetButton.style.cursor = "pointer";
        resetButton.style.border = "none";
        resetButton.style.borderRadius = "5px";
        resetButton.style.backgroundColor = "#ff4d4d";
        resetButton.style.color = "white";
        resetButton.onclick = async () => {
            const { error } = await supabase.from("votes").delete().neq("id", 0);
            if (error) {
                console.error("Fehler beim Zurücksetzen des Verlaufs:", error);
            } else {
                alert("Abstimmungsverlauf wurde zurückgesetzt!");
                updateVoteHistory();
                updateWinner();
            }
        };
        historyElement.appendChild(resetButton);
    }

    // Event Listener für Buttons
    document.querySelectorAll("button").forEach(button => {
        button.addEventListener("click", () => vote(button.textContent.trim()));
    });

    // Initiale Aufrufe
    updateWinner();
    updateVoteHistory();
});
