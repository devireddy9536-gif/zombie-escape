// ===============================
// script.js — hearts lives + hint beside question (purple)
// Exit button appears ONLY in last room
// ===============================

// ===== CONFIG =====
const START_LIVES = 3;
const PENALTY_MINUTES = 1;
const RESPONSE_TIMEOUT_SECONDS = 20;
const HINT_DISPLAY_SECONDS = 20;

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

// 🔒 Hide exit initially
exitBtn.style.display = "none";

// ===== STATE =====
let lives = START_LIVES;
let livesEl = null;
let currentRoomIndex = 0;
let penaltyInterval = null;
let responseInterval = null;
let msgEl = null;
let hintEl = null;
let hintTimeoutHandle = null;
let responseTimerEl = null;
const hintedRooms = new Set();

// ===== BACKSTORY =====
backstoryTextEl.textContent = `
Beneath the moon that bleeds like fire,
The village hums a broken choir.
A hidden lab below the stone,
Where cursed machines still breathe and groan.
`.trim();

// ===== HOW TO PLAY =====
howToPlayEl.textContent = `
HOW TO PLAY:
• You start with 3 lives (❤️).
• Choose the correct answer to move on.
• Wrong answer:
   – Wait ${PENALTY_SECONDS}s
   – Lose 1 life
   – Get a hint
• Answer within ${RESPONSE_TIMEOUT_SECONDS}s or lose.
• Exit appears only at the end.
`.trim();

// ===== ROOMS =====
const rooms = [
  {
    title: "Room 1",
    img: "img1.jpg",
    text: "Three doors whisper secrets concealed.",
    correct: "C",
    hint: "Glass makes no sound.",
    choices: [
      { key: "A", text: "Burning iron gate" },
      { key: "B", text: "Frozen door" },
      { key: "C", text: "Silent glass corridor" }
    ],
    nextIndex: 1
  },
  {
    title: "Room 2",
    img: "img2.jpg",
    text: "Which vial contains the cure?",
    correct: "B",
    hint: "Green = life.",
    choices: [
      { key: "A", text: "Silver vial" },
      { key: "B", text: "Emerald vial" },
      { key: "C", text: "Black vial" }
    ],
    nextIndex: 2
  },
  {
    title: "Room 3",
    img: "img3.jpg",
    text: "Who built the machine?",
    correct: "A",
    hint: "Doctor names unlock labs.",
    choices: [
      { key: "A", text: "Dr. Greyson" },
      { key: "B", text: "The Keeper" },
      { key: "C", text: "Engineer" }
    ],
    nextIndex: 3
  },
  {
    title: "Room 4",
    img: "img4.jpg",
    text: "How many pulses break the core?",
    correct: "A",
    hint: "Read literally.",
    choices: [
      { key: "A", text: "Three" },
      { key: "B", text: "Five" },
      { key: "C", text: "Four" }
    ],
    nextIndex: 4
  },
  {
    title: "Room 5",
    img: "img5.jpg",
    text: "Which number frees the tone?",
    correct: "C",
    hint: "Largest number wins.",
    choices: [
      { key: "A", text: "18" },
      { key: "B", text: "21" },
      { key: "C", text: "24" }
    ],
    nextIndex: 5
  },
  {
    title: "Conclusion",
    img: "img6.jpg",
    text: "You escaped the lab. Well done.",
    correct: "A",
    hint: "",
    choices: [{ key: "A", text: "Play Again" }],
    nextIndex: 0
  }
];

// ===== START GAME =====
commenceBtn.onclick = () => {
  hintedRooms.clear();
  lives = START_LIVES;
  ensureControls();
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

  // ✅ EXIT ONLY ON LAST ROOM
  exitBtn.style.display = (index === rooms.length - 1) ? "inline-block" : "none";

  renderChoices(room);
}

// ===== RENDER CHOICES =====
function renderChoices(room) {
  choiceButtons.innerHTML = "";
  room.choices.forEach(choice => {
    const btn = document.createElement("button");
    btn.className = "choiceBtn";
    btn.textContent = choice.text;
    btn.onclick = () => {
      clearResponseTimer();
      if (choice.key === room.correct) {
        loadRoom(room.nextIndex);
      } else {
        startPenalty();
      }
    };
    choiceButtons.appendChild(btn);
  });
}

// ===== PENALTY =====
function startPenalty() {
  disableChoices(true);
  let t = PENALTY_SECONDS;
  msg(`Wrong! Wait ${t}s`);

  penaltyInterval = setInterval(() => {
    t--;
    msg(`Wrong! Wait ${t}s`);
    if (t <= 0) {
      clearInterval(penaltyInterval);
      penaltyInterval = null;
      deductLife();
      disableChoices(false);
      if (lives <= 0) gameOver();
      else {
        showHint();
        startResponseTimer();
      }
    }
  }, 1000);
}

// ===== RESPONSE TIMER =====
function startResponseTimer() {
  let t = RESPONSE_TIMEOUT_SECONDS;
  responseTimerEl.style.visibility = "visible";
  responseTimerEl.textContent = `${t}s`;

  responseInterval = setInterval(() => {
    t--;
    responseTimerEl.textContent = `${t}s`;
    if (t <= 0) gameOver();
  }, 1000);
}

function clearResponseTimer() {
  clearInterval(responseInterval);
  responseInterval = null;
  responseTimerEl.style.visibility = "hidden";
}

// ===== HINT =====
function showHint() {
  if (hintedRooms.has(currentRoomIndex)) return;
  hintedRooms.add(currentRoomIndex);
  hintEl.textContent = "Hint: " + rooms[currentRoomIndex].hint;
  hintEl.style.visibility = "visible";
  setTimeout(() => hintEl.style.visibility = "hidden", HINT_DISPLAY_SECONDS * 1000);
}

// ===== UI HELPERS =====
function ensureControls() {
  if (!livesEl) {
    livesEl = document.createElement("div");
    controlsContainer.appendChild(livesEl);
  }
  if (!hintEl) {
    hintEl = document.createElement("div");
    hintEl.style.color = "#c48cff";
    controlsContainer.appendChild(hintEl);
  }
  if (!responseTimerEl) {
    responseTimerEl = document.createElement("div");
    controlsContainer.appendChild(responseTimerEl);
  }
}

function updateLivesUI() {
  livesEl.innerHTML = "❤️".repeat(lives);
}

function deductLife() {
  lives--;
  updateLivesUI();
}

// ===== GAME OVER =====
function gameOver() {
  alert("GAME OVER");
  exitBtn.style.display = "none";
  startScreen.classList.remove("hidden");
  gameContainer.classList.add("hidden");
  bgm.pause();
}

// ===== UTILS =====
function msg(t) {
  if (!msgEl) {
    msgEl = document.createElement("div");
    choiceButtons.appendChild(msgEl);
  }
  msgEl.textContent = t;
}

function disableChoices(state) {
  document.querySelectorAll(".choiceBtn").forEach(b => b.disabled = state);
}

function clearAll() {
  clearInterval(penaltyInterval);
  clearInterval(responseInterval);
  penaltyInterval = responseInterval = null;
  if (msgEl) msgEl.remove(), msgEl = null;
  if (hintEl) hintEl.style.visibility = "hidden";
  if (responseTimerEl) responseTimerEl.style.visibility = "hidden";
}

// ===== EXIT BUTTON =====
exitBtn.onclick = () => {
  bgm.pause();
  exitBtn.style.display = "none";
  gameContainer.classList.add("hidden");
  startScreen.classList.remove("hidden");
};

