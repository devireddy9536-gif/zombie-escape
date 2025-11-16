// Backstory + Gameplay script
const bgm = document.getElementById("bgm");

// UI Elements
const startScreen = document.getElementById("startScreen");
const backstoryTextEl = document.getElementById("backstoryText");
const commenceBtn = document.getElementById("commenceBtn");

const gameContainer = document.getElementById("gameContainer");
const mainImage = document.getElementById("mainImage");
const roomTitle = document.getElementById("roomTitle");
const roomText = document.getElementById("roomText");
const choiceButtons = document.getElementById("choiceButtons");
const exitBtn = document.getElementById("exitBtn");

// --- Backstory poem (short, 4-6 lines) ---
const backstory = `
Beneath the crimson-bleeding sky,
The silent village waits to die.
A secret lab, a cursed moon,
Awoke the dead too soon… too soon.
Now whispers crawl through broken stone,
And you must face the dark alone.
`;
backstoryTextEl.innerText = backstory.trim();

// --- Rooms (poem-style riddles) ---
// Each room has poem text and horror-themed choices related to the backstory
const rooms = [
  {
    title: "Room 1 — The Flooded Archive",
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
    title: "Room 2 — The Echoing Lab",
    img: "./img2.jpg",
    text:
`Fog rolls thick where nightmares tread,
And silent cries call forth the dead.
Two choices stand before your fear:
A forward step that draws them near,
Or flee the path as death grows near.`,
    choices: [
      { text: "Follow the distant growl", next: 3 },
      { text: "Retreat toward the ruined house", next: 0 }
    ]
  },
  {
    title: "Room 3 — The Dormant Husk",
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
    title: "Room 4 — Red Moon Valley",
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
    title: "Room 5 — The Shadowed Lab",
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
    title: "Room 6 — Zombie Attack",
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
    title: "Room 7 — Mountain Escape (Ending)",
    img: "./img6.jpg",
    text:
`You climb beyond where shadows roam,
The mountain winds now call you home.
The moonlight fades, its curse undone,
Congratulations, you escaped...
To be continued.`,
    choices: [
      { text: "Play Again", next: 0 }
    ]
  }
];

// current room index
let current = 0;

// When player clicks "Commence the Trial"
commenceBtn.addEventListener("click", () => {
  // Start audio (browsers allow audio on button click)
  bgm.currentTime = 0;
  bgm.play().catch(()=>{ /* ignore */ });

  // hide backstory, show game
  startScreen.classList.add("hidden");
  gameContainer.classList.remove("hidden");

  // go to first room
  loadRoom(0);
});

// load a room by index
function loadRoom(i) {
  if (i < 0 || i >= rooms.length) i = 0;
  current = i;
  const r = rooms[i];

  // update UI
  mainImage.src = r.img;
  roomTitle.textContent = r.title;
  roomText.textContent = r.text;

  // build choices
  choiceButtons.innerHTML = "";
  r.choices.forEach(ch => {
    const b = document.createElement("button");
    b.className = "choiceBtn";
    b.style.margin = "10px";
    b.style.padding = "12px 20px";
    b.style.fontSize = "18px";
    b.style.borderRadius = "8px";
    b.style.background = "#2b2b2b";
    b.style.color = "#fff";
    b.style.border = "2px solid #8b0000";
    b.textContent = ch.text;
    b.onclick = () => loadRoom(ch.next);
    choiceButtons.appendChild(b);
  });

  // exit behaviour (reset)
  exitBtn.onclick = () => {
    bgm.pause();
    bgm.currentTime = 0;
    gameContainer.classList.add("hidden");
    startScreen.classList.remove("hidden");
  };
}

// ensure back button or reload works
window.addEventListener('beforeunload', () => {
  try { bgm.pause(); bgm.currentTime = 0; } catch(e){}
});
