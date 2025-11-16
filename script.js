// ===============================
// BACKGROUND MUSIC
// ===============================
const bgm = document.getElementById("bgm");

// ===============================
// UI ELEMENTS
// ===============================
const startScreen = document.getElementById("startScreen");
const backstoryTextEl = document.getElementById("backstoryText");
const commenceBtn = document.getElementById("commenceBtn");

const gameContainer = document.getElementById("gameContainer");
const mainImage = document.getElementById("mainImage");
const roomTitle = document.getElementById("roomTitle");
const roomText = document.getElementById("roomText");
const choiceButtons = document.getElementById("choiceButtons");
const exitBtn = document.getElementById("exitBtn");

// ===============================
// BACKSTORY (Poem)
// ===============================
const backstory = `
Beneath the moon that bleeds like fire,
The village hums a broken choir.
A hidden lab below the stone,
Where cursed machines still breathe and groan.
The Wolfsong Virus, born of night,
Twists human bones beneath red light.
Now chambers wait with puzzles grim —
Your fate decides if moon grows dim.
`;
backstoryTextEl.innerText = backstory.trim();

// ===============================
// ROOMS (STAGES)
// ===============================
const rooms = [
  {
    title: "Stage 1 — The Coded Hallway",
    img: "img1.jpg",
    text: `
Shelves soaked in dust and rusted steel,
Hold secrets time refused to heal.
Three doors breathe fog across the air —
Which path reveals the answer there?
    `.trim(),
    choices: [
      { text: "A) The iron door with burning marks", next: 1 },
      { text: "B) The cracked frame leaking frost", next: 1 },
      { text: "C) The silent corridor of glass", next: 1 }
    ]
  },

  {
    title: "Stage 2 — Vials of Memory",
    img: "img2.jpg",
    text: `
On glowing tables liquids churn,
Each vial guarding what you yearn.
One hue awakens cursed despair,
One soothes the beast that waits in air —
Which color hides the cure you seek?
    `.trim(),
    choices: [
      { text: "A) The silver glow", next: 2 },
      { text: "B) The amber flame", next: 2 },
      { text: "C) The midnight-green", next: 2 }
    ]
  },

  {
    title: "Stage 3 — The Keeper’s Warning",
    img: "img3.jpg",
    text: `
Where wires twitch like living veins,
A guardian hums through metal chains.
Its voice repeats a single name —
Speak wrong, and you ignite the flame.
Whose name unlocks the chamber’s fate?
    `.trim(),
    choices: [
      { text: "A) The Pale Maker", next: 3 },
      { text: "B) Dr. Hale", next: 3 },
      { text: "C) Warden of Echoes", next: 3 }
    ]
  },

  {
    title: "Stage 4 — The Pulse Machine",
    img: "img4.jpg",
    text: `
The mainframe beats like ruined drums,
A rhythm calling what becomes.
Three sequences align the core —
But count the pulses once, no more:
How many breaks the lunar roar?
    `.trim(),
    choices: [
      { text: "A) Three pulses", next: 4 },
      { text: "B) Seven pulses", next: 4 },
      { text: "C) Five pulses", next: 4 }
    ]
  },

  {
    title: "Stage 5 — The Final Cipher",
    img: "img5.jpg",
    text: `
Wind coils through fractured vents,
Carrying half-forgotten laments.
Numbers swirl like dying breath —
One sum will cage the moonlit death.
Which total seals the curse beneath?
    `.trim(),
    choices: [
      { text: "A) 18", next: 5 },
      { text: "B) 27", next: 5 },
      { text: "C) 24", next: 5 }
    ]
  },

  {
    title: "Conclusion — You Escaped",
    img: "img6.jpg",
    text: `
The moonlight dims. The halls grow still.
Your choices bent the lab’s dark will.
Congratulations — you escaped the curse.
But deeper shadows wait… to be continued.
    `.trim(),
    choices: [
      { text: "Play Again", next: 0 }
    ]
  }
];

// ===============================
// START GAME
// ===============================
commenceBtn.addEventListener("click", () => {
  bgm.currentTime = 0;
  bgm.play().catch(() => {});

  startScreen.classList.add("hidden");
  gameContainer.classList.remove("hidden");

  loadRoom(0);
});

// ===============================
// LOAD ROOM
// ===============================
function loadRoom(i) {
  const r = rooms[i];

  mainImage.src = r.img;
  roomTitle.textContent = r.title;
  roomText.textContent = r.text;

  // Clear old buttons
  choiceButtons.innerHTML = "";
  choiceButtons.style.textAlign = "center";   // CENTER BUTTONS

  // Create buttons
  r.choices.forEach(ch => {
    const b = document.createElement("button");
    b.className = "choiceBtn";

    // center styling
    b.style.display = "block";
    b.style.margin = "10px auto";
    b.style.padding = "14px 22px";
    b.style.fontSize = "18px";
    b.style.width = "60%";
    b.style.borderRadius = "10px";
    b.style.background = "#8b0000";
    b.style.border = "2px solid #ff4a4a";
    b.style.color = "white";
    b.style.boxShadow = "0 0 10px rgba(255,0,0,0.3)";
    b.style.cursor = "pointer";

    b.textContent = ch.text;
    b.onclick = () => loadRoom(ch.next);

    choiceButtons.appendChild(b);
  });

  // Exit resets back to story
  exitBtn.onclick = () => {
    bgm.pause();
    bgm.currentTime = 0;
    gameContainer.classList.add("hidden");
    startScreen.classList.remove("hidden");
  };
}

// Reset audio on reload
window.addEventListener("beforeunload", () => {
  bgm.pause();
  bgm.currentTime = 0;
});
