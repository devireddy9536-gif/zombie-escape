// ===============================
// script.js — hearts lives + hint beside question (purple)
// Exit button visible ONLY on Conclusion page
// ===============================

// ===== CONFIG =====
const START_LIVES = 3;
const PENALTY_MINUTES = 1;
const RESPONSE_TIMEOUT_SECONDS = 20;
const HINT_DISPLAY_MINUTES = 1;

// ===== DOM ELEMENTS =====
const bgm = document.getElementById("bgm");
const startScreen = document.getElementById("startScreen");
const backstoryTextEl = document.getElementById("backstoryText");
const howToPlayEl = document.getElementById("howToPlay");
const commenceBtn = document.getElementById("commenceBtn");

const gameContainer = document.getElementById("gameContainer");
const mainImage = document.getElementById("mainImage");
const roomTitle = document.getElementById("roomTitle");
const roomText = document.getElementById("roomText");
const choiceButtons = document.getElementById("choiceButtons");
const exitBtn = document.getElementById("exitBtn");
const controlsContainer = document.getElementById("controls");

// ===== INITIAL STATE =====
exitBtn.style.display = "none";

let lives = START_LIVES;
let livesEl = null;
let currentRoomIndex = 0;
let hintedRooms = new Set();

let msgEl = null;
let hintEl = null;
let hintTimeoutHandle = null;
let penaltyInterval = null;
let responseInterval = null;
let responseTimerEl = null;

// ===== BACKSTORY =====
backstoryTextEl.textContent = `
Beneath the moon that bleeds like fire,
The village hums a broken choir.
A hidden lab below the stone,
Where cursed machines still breathe and groan.
The Wolfsong Virus, born of night,
Twists human bones beneath red light.
Your fate decides if you escape…
`.trim();

// ===== HOW TO PLAY =====
if (howToPlayEl) {
  howToPlayEl.textContent = `
HOW TO PLAY:
• You start with 3 lives ❤️
• Choose the correct option to advance
• Wrong answer:
  – Wait ${PENALTY_SECONDS}s
  – Lose 1 life
  – Receive a hint
• After losing a life, answer within ${RESPONSE_TIMEOUT_SECONDS}s
• Lose all lives → Game Over
• Reach the final room to escape!
`.trim();
}

// ===== ROOMS =====
const rooms = [
  {
    title: "Room 1",
    img: "img1.jpg",
    text: "Three doors whisper secrets.\nWhich path is safe?",
    correct: "C",
    hint: "Glass corridors are silent.",
    choices: [
      { key: "A", text: "A) Burning gate" },
      { key: "B", text: "B) Frozen door" },
      { key: "C", text: "C) Silent glass corridor" }
    ],
    nextIndex: 1
  },
  {
    title: "Room 2",
    img: "img2.jpg",
    text: "Vials glow with strange power.\nWhich one heals?",
    correct: "B",
    hint: "Green usually represents life.",
    choices: [
      { key: "A", text: "A) Silver vial" },
      { key: "B", text: "B) Emerald vial" },
      { key: "C", text: "C) Black vial" }
    ],
    nextIndex: 2
  },
  {
    title: "Room 3",
    img: "img3.jpg",
    text: "A name unlocks the system.",
    correct: "A",
    hint: "Doctors often leave their names behind.",
    choices: [
      { key: "A", text: "A) Dr. Greyson" },
      { key: "B", text: "B) Gatekeeper" },
      { key: "C", text: "C) Engineer X" }
    ],
    nextIndex: 3
  },
  {
    title: "Room 4",
    img: "img4.jpg",
    text: "The floor pulses beneath you.\nHow many beats?",
    correct: "A",
    hint: "Read the poem carefully.",
    choices: [
      { key: "A", text: "A) Three" },
      { key: "B", text: "B) Five" },
      { key: "C", text: "C) Four" }
    ],
    nextIndex: 4
  },
  {
    title: "Room 5",
    img: "img5.jpg",
    text: "A final number unlocks the exit.",
    correct: "C",
    hint: "The highest value is often correct.",
    choices: [
      { key: "A", text: "A) 18" },
      { key: "B", text: "B) 21" },
      { key: "C", text: "C) 24" }
    ],
    nextIndex: 5
  },
  {
    title: "Conclusion",
    img: "img6.jpg",
    text: "You escaped the lab.\nThe moon fades.\nCongratulations!",
    correct: "A",
    hint: "",
    choices: [
      { key: "A", text: "Play Again" }
    ],
    nextIndex: 0
  }
];

// ===== START GAME =====
commenceBtn.onclick = () => {
  lives = START_LIVES;
  hintedRooms.clear();
  updateLivesUI();
  startScreen.classList.add("hidden");
  gameContainer.classList.remove("hidden");
  bgm.play().catch(()=>{});
  loadRoom(0);
};

// ===== LOAD ROOM =====
function loadRoom(index) {
  currentRoomIndex = index;
  const room = rooms[index];

  clearAll();

  mainImage.src = room.img;
  roomTitle.textContent = room.title;
  roomText.textContent = room.text;

  // ✅ EXIT BUTTON ONLY ON LAST ROOM
  exitBtn.style.display = room.title === "Conclusion" ? "inline-block" : "none";

  renderChoices(room);
}

// ===== RENDER CHOICES =====
function renderChoices(room) {
  choiceButtons.innerHTML = "";

  room.choices.forEach(c => {
    const btn = document.createElement("button");
    btn.textContent = c.text;
    btn.className = "choiceBtn";

    btn.onclick = () => {
      clearResponseTimer();
      if (c.key === room.correct) {
        loadRoom(room.nextIndex);
      } else {
        startPenalty(() => {
          lives--;
          updateLivesUI();
          if (lives <= 0) gameOver("You lost all lives.");
          else {
            showHint(room);
            startResponseTimer();
          }
        });
      }
    };

    choiceButtons.appendChild(btn);
  });
}

// ===== PENALTY =====
function startPenalty(done) {
  disableChoices(true);
  let t = PENALTY_SECONDS;
  showMsg(`Wrong! Wait ${t}s`);

  penaltyInterval = setInterval(() => {
    t--;
    showMsg(`Wrong! Wait ${t}s`);
    if (t <= 0) {
      clearInterval(penaltyInterval);
      disableChoices(false);
      done();
    }
  }, 1000);
}

// ===== RESPONSE TIMER =====
function startResponseTimer() {
  let t = RESPONSE_TIMEOUT_SECONDS;
  showMsg(`Answer in ${t}s`);

  responseInterval = setInterval(() => {
    t--;
    showMsg(`Answer in ${t}s`);
    if (t <= 0) {
      clearInterval(responseInterval);
      gameOver("Time up!");
    }
  }, 1000);
}

// ===== HINT =====
function showHint(room) {
  if (hintedRooms.has(currentRoomIndex)) return;
  hintedRooms.add(currentRoomIndex);

  if (!hintEl) {
    hintEl = document.createElement("div");
    hintEl.style.color = "#c48cff";
    roomTitle.after(hintEl);
  }

  hintEl.textContent = "Hint: " + room.hint;
  setTimeout(() => hintEl.textContent = "", HINT_DISPLAY_SECONDS * 1000);
}

// ===== UI HELPERS =====
function showMsg(t) {
  if (!msgEl) {
    msgEl = document.createElement("div");
    choiceButtons.appendChild(msgEl);
  }
  msgEl.textContent = t;
}

function updateLivesUI() {
  if (!livesEl) {
    livesEl = document.createElement("div");
    controlsContainer.appendChild(livesEl);
  }
  livesEl.innerHTML = "❤️".repeat(lives) || "No lives";
}

function disableChoices(s) {
  document.querySelectorAll(".choiceBtn").forEach(b => b.disabled = s);
}

// ===== GAME OVER =====
function gameOver(msg) {
  alert("Game Over: " + msg);
  exitBtn.style.display = "none";
  startScreen.classList.remove("hidden");
  gameContainer.classList.add("hidden");
}

// ===== CLEANUP =====
function clearAll() {
  if (msgEl) msgEl.textContent = "";
  if (penaltyInterval) clearInterval(penaltyInterval);
  if (responseInterval) clearInterval(responseInterval);
}

// ===== EXIT BUTTON =====
exitBtn.onclick = () => {
  bgm.pause();
  bgm.currentTime = 0;
  gameContainer.classList.add("hidden");
  startScreen.classList.remove("hidden");
};

