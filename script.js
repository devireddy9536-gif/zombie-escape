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


// 🟥 BACKSTORY (Start Screen Poem)
const backstoryText = `
Beneath the crimson-bleeding sky,
The silent village waits to die.
A secret lab, a cursed moon,
Awoke the dead too soon… too soon.
Now whispers crawl through broken stone,
And you must face the dark alone.
`;

document.getElementById("introText").innerText = backstoryText;


// GAME ROOMS — Poem Style + Horror Choices
const rooms = [
    {
        title: "Abandoned House",
        img: "./img1.jpg",
        text:
`Through shattered doors the cold wind creeps,
Where dusty echoes never sleep.
A shadow moves behind the wood —
Choose wisely if you think you should,
For one path hides what once was good.`,
        choices: [
            { text: "Enter the whispering hallway", next: 1 },
            { text: "Investigate the shadowed corner", next: 2 }
        ]
    },
    {
        title: "Dark Path",
        img: "./img2.jpg",
        text:
`Fog rolls thick where nightmares tread,
And silent cries call forth the dead.
Two choices stand before your fear:
A forward step that draws them near,
Or flee the path as death grows near.`,
        choices: [
            { text: "Follow the distant growl", next: 3 },
            { text: "Retreat toward the broken house", next: 0 }
        ]
    },
    {
        title: "Destroyed Barn",
        img: "./img3.jpg",
        text:
`Within this barn where wood decays,
The moonlight tricks and shadows play.
A door might hide a cursed surprise,
Or safety waits from watching eyes,
If you retreat from where horror lies.`,
        choices: [
            { text: "Open the rotting barn door", next: 4 },
            { text: "Hide behind collapsed beams", next: 0 }
        ]
    },
    {
        title: "Red Moon Valley",
        img: "./img7.jpg",
        text:
`The valley bleeds a crimson light,
As zombies rise to greet the night.
Their hollow moans shake dust and bone —
Run or fight, survive alone,
For death walks slow but hunts its own.`,
        choices: [
            { text: "Stand and face the rising dead", next: 5 },
            { text: "Sprint into the blood-red fog", next: 6 }
        ]
    },
    {
        title: "Zombie Lab",
        img: "./img4.jpg",
        text:
`Machines once hummed with brilliant minds,
Now twisted screams are all you’ll find.
The lab records the moon’s embrace;
The virus grew inside this place.
Will you uncover truth… or race?`,
        choices: [
            { text: "Search the corrupted files", next: 6 },
            { text: "Escape before they awaken", next: 0 }
        ]
    },
    {
        title: "Zombie Attack",
        img: "./img5.jpg",
        text:
`A sudden howl — a shifting shape,
No time remains for clean escape.
Fight or flee the beast ahead,
But know this truth the moon has bred:
All paths will dance with waking dead.`,
        choices: [
            { text: "Dash into the trees", next: 6 },
            { text: "Climb the broken fence", next: 3 }
        ]
    },
    {
        title: "Mountain Escape",
        img: "./img6.jpg",
        text:
`You climb beyond where shadows roam,
The mountain winds now call you home.
The moonlight fades, its curse undone,
You've lived to see another sun…
For now, survivor — you have won.`,
        choices: [
            { text: "Restart the journey", next: 0 }
        ]
    }
];


// Start Game
startBtn.addEventListener("click", () => {
    bgm.play();
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
