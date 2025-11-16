// GAME DATA
const gameData = [
    {
        img: "img1.jpg",
        title: "Broken Village Entrance",
        text: "You enter an abandoned village under a blood-red moon. Zombies crawl out from the shadows.",
        choices: [
            { text: "Walk inside the village", next: 1 },
            { text: "Run back to the forest", next: 2 }
        ]
    },
    {
        img: "img2.jpg",
        title: "Silent Street",
        text: "The street is filled with broken houses and strange growls.",
        choices: [
            { text: "Enter the damaged house", next: 3 },
            { text: "Follow the muddy footprints", next: 4 }
        ]
    },
    {
        img: "img3.jpg",
        title: "Forest Escape?",
        text: "You try to run… but zombies block the forest entrance.",
        choices: [
            { text: "Fight your way through", next: 5 },
            { text: "Return to the village", next: 1 }
        ]
    },
    {
        img: "img4.jpg",
        title: "The Scientist’s Lab",
        text: "You discover a hidden underground lab. The scientists who experimented here became zombies!",
        choices: [
            { text: "Search the lab", next: 6 },
            { text: "Run upstairs", next: 1 }
        ]
    },
    {
        img: "img5.jpg",
        title: "Footprints Trail",
        text: "The footprints lead you to an old well covered in blood.",
        choices: [
            { text: "Look inside the well", next: 7 },
            { text: "Step away slowly", next: 1 }
        ]
    },
    {
        img: "img6.jpg",
        title: "Zombie Attack!",
        text: "A group of zombies leap toward you.",
        choices: [
            { text: "Fight", next: 7 },
            { text: "Scream for help", next: 7 }
        ]
    },
    {
        img: "img7.jpg",
        title: "THE END",
        text: "Your fate is sealed… but you can replay the game.",
        choices: [
            { text: "Restart Game", next: 0 }
        ]
    }
];

let currentRoom = 0;

// ELEMENTS
const startScreen = document.getElementById("startScreen");
const gameContainer = document.getElementById("gameContainer");
const mainImage = document.getElementById("mainImage");
const roomTitle = document.getElementById("roomTitle");
const roomText = document.getElementById("roomText");
const choiceButtons = document.getElementById("choiceButtons");
const bgm = document.getElementById("bgm");

// START GAME
document.getElementById("startBtn").addEventListener("click", () => {
    startScreen.style.display = "none";
    gameContainer.classList.remove("hidden");
    bgm.play();
    loadRoom(0);
});

// EXIT BUTTON
document.getElementById("exitBtn").addEventListener("click", () => {
    location.reload();
});

// LOAD ROOM
function loadRoom(number) {
    currentRoom = number;
    let room = gameData[number];

    mainImage.src = room.img;
    roomTitle.textContent = room.title;
    roomText.textContent = room.text;

    choiceButtons.innerHTML = "";
    room.choices.forEach(choice => {
        let btn = document.createElement("button");
        btn.textContent = choice.text;
        btn.onclick = () => loadRoom(choice.next);
        choiceButtons.appendChild(btn);
    });
}
