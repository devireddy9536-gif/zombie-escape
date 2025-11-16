document.getElementById("startBtn").onclick = () => {
    document.getElementById("startScreen").classList.add("hidden");
    document.getElementById("gameContainer").classList.remove("hidden");

    document.getElementById("bgm").play();

    loadRoom(0);
};

document.getElementById("exitBtn").onclick = () => {
    location.reload();
};

// ---------------- GAME DATA -----------------

const images = [
    "img1.jpg",
    "img2.jpg",
    "img3.jpg",
    "img4.jpg",
    "img5.jpg",
    "img6.jpg",
    "img7.jpg"
];

const rooms = [
    {
        title: "Room 1 — The Cursed Village",
        text: "The red moon rises… zombies crawl from the shadows.",
        choices: ["Move Forward"]
    },
    {
        title: "Room 2 — Fog of the Lost",
        text: "A thick cursed fog surrounds you… something moves!",
        choices: ["Continue"]
    },
    {
        title: "Room 3 — The Burning Night",
        text: "Flames glow from broken homes. The dead walk freely.",
        choices: ["Proceed"]
    },
    {
        title: "Room 4 — The Silent Path",
        text: "You hear wolves howling at the red moon…",
        choices: ["Go On"]
    },
    {
        title: "Room 5 — Village of Screams",
        text: "Zombies gather. Their eyes glow bright.",
        choices: ["Next"]
    },
    {
        title: "Room 6 — Dark Castle",
        text: "Far away, a blood-red castle appears.",
        choices: ["Continue"]
    },
    {
        title: "Final Room — Blood Moon Peak",
        text: "You reached the final point. You survived the village!",
        choices: ["Play Again"]
    }
];

function loadRoom(i) {
    document.getElementById("mainImage").src = images[i];
    document.getElementById("roomTitle").innerText = rooms[i].title;
    document.getElementById("roomText").innerText = rooms[i].text;

    let btns = document.getElementById("choiceButtons");
    btns.innerHTML = "";

    rooms[i].choices.forEach(choice => {
        let b = document.createElement("button");
        b.innerText = choice;

        b.onclick = () => {
            if (i === rooms.length - 1) location.reload();
            else loadRoom(i + 1);
        };

        btns.appendChild(b);
    });
}
