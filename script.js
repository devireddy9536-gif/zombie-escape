// Background music auto-play
const bgm = document.getElementById("bgm");

// Start Screen Elements
const startScreen = document.getElementById("startScreen");
const startBtn = document.getElementById("startBtn");

// Game Screen Elements
const gameContainer = document.getElementById("gameContainer");
const mainImage = document.getElementById("mainImage");
const roomTitle = document.getElementById("roomTitle");
const roomText = document.getElementById("roomText");
const choiceButtons = document.getElementById("choiceButtons");
const exitBtn = document.getElementById("exitBtn");

// Game Data (Questions + Images)
const rooms = [
    {
        title: "Abandoned House",
        text: "You enter the ruined house. Something moves inside...",
        img: "./img1.jpg",
        choices: [
            { text: "Go Left", next: 1 },
            { text: "Go Right", next: 2 }
        ]
    },
    {
        title: "Dark Path",
        text: "Fog covers the path... you hear growling.",
        img: "./img2.jpg",
        choices: [
            { text: "Move Forward", next: 3 },
            { text: "Run Back", next: 0 }
        ]
    },
    {
        title: "Destroyed Barn",
        text: "Shadows crawl on the broken walls.",
        img: "./img3.jpg",
        choices: [
            { text: "Open the Door", next: 4 },
            { text: "Hide Behind Wood", next: 0 }
        ]
    },
    {
        title: "Red Moon Valley",
        text: "The moon turns blood red. Zombies appear!",
        img: "./img7.jpg",
        choices: [
            { text: "Fight", next: 5 },
            { text: "Run", next: 6 }
        ]
    },
    {
        title: "Zombie Lab",
        text: "You discover a secret lab full of infected scientists.",
        img: "./img4.jpg",
        choices: [
            { text: "Search the files", next: 6 },
            { text: "Escape quickly", next: 0 }
        ]
    },
    {
        title: "Zombie Attack",
        text: "A zombie lunges at you! You barely escape.",
        img: "./img5.jpg",
        choices: [
            { text: "Run to Forest", next: 6 },
            { text: "Climb a tree", next: 3 }
        ]
    },
    {
        title: "Mountain Escape",
        text: "You climb the mountains… zombies can't follow. You survived!",
        img: "./img6.jpg",
        choices: []
    }
];

// Start Game
startBtn.addEventListener("click", () => {
    bgm.play(); // start music
    startScreen.classList.add("hidden");
    gameContainer.classList.remove("hidden");
    loadRoom(0);
});

// Load Room Function
function loadRoom(index) {
    const room = rooms[index];

    mainImage.src = room.img;
    roomTitle.textContent = room.title;
    roomText.textContent = room.text;

    choiceButtons.innerHTML = "";

    room.choices.forEach(choice => {
        const btn = document.createElement("button");
        btn.textContent = choice.text;
        btn.classList.add("choiceBtn");
        btn.onclick = () => loadRoom(choice.next);
        choiceButtons.appendChild(btn);
    });

    exitBtn.onclick = () => {
        bgm.pause();
        bgm.currentTime = 0;
        startScreen.classList.remove("hidden");
        gameContainer.classList.add("hidden");
    };
}
