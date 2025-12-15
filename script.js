// ===============================
// CONFIG
// ===============================
const START_LIVES = 3;
const PENALTY_SECONDS = 60;          // 1 minute
const RESPONSE_TIMEOUT_SECONDS = 20; // 20 sec
const HINT_DISPLAY_SECONDS = 20;     // 20 sec

// ===============================
// DOM ELEMENTS
// ===============================
const bgm = document.getElementById("bgm");

const startScreen = document.getElementById("startScreen");
const gameContainer = document.getElementById("gameContainer");

const backstoryText = document.getElementById("backstoryText");
const howToPlay = document.getElementById("howToPlay");
const commenceBtn = document.getElementById("commenceBtn");

const mainImage = document.getElementById("mainImage");
const roomTitle = document.getElementById("roomTitle");
const roomText = document.getElementById("roomText");
const choiceButtons = document.getElementById("choiceButtons");

const livesEl = document.getElementById("livesEl");
const responseTimerEl = document.getElementById("responseTimerEl");
const exitBtn = document.getElementById("exitBtn");

// ===============================
// STATE
// ===============================
let lives = START_LIVES;
let currentRoom = 0;
let penaltyTimer = null;
let responseTimer = null;
let hintTimeout = null;

// ===============================
// TEXT
// ===============================
backstoryText.textContent = `
Beneath the moon that bleeds like fire,
The village hums a broken choir.
A hidden lab below the stone,
Where cursed machines still breathe and groan.
`.trim();

howToPlay.textContent = `
HOW TO PLAY:
• You start with 3 lives (hearts).
• Each room gives you a riddle or choice.
• Pick the correct answer to move to the next room.
• A wrong answer:
   – Forces you to wait 60 seconds.
   – Deducts 1 life after the wait.
   – Shows a hint for 20 seconds.
• After losing a life, you have 20 seconds to answer correctly.
• If you fail to answer in time or lose all lives → GAME OVER.
• Reach the Conclusion room to escape the lab!
`.trim();

// ===============================
// ROOMS (UNCHANGED QUESTIONS)
// ===============================
const rooms = [
  {
    title: "Room 1",
    img: "img1.jpg",
    text: "Three doors whisper secrets,\nCold breath crawling through stone—\nWhich path is safe?",
    correct: "C",
    hint: "Glass corridors make no sound.",
    choices: ["A) Burning gate", "B) Frozen door", "C) Silent glass corridor"],
    next: 1
  },
  {
    title: "Room 2",
    img: "img2.jpg",
    text: "Vials glow with dying light,\nShadows twist within the glass—\nWhich one heals?",
    correct: "B",
    hint: "Green often symbolizes life.",
    choices: ["A) Silver vial", "B) Emerald vial", "C) Black vial"],
    next: 2
  },
  {
    title: "Room 3",
    img: "img3.jpg",
    text: "A name sleeps in the wires,\nEchoes haunt the steel halls—\nWho built the machine?",
    correct: "A",
    hint: "The scientist left his name.",
    choices: ["A) Dr. Greyson", "B) Gatekeeper", "C) Engineer X"],
    next: 3
  },
  {
    title: "Room 4",
    img: "img4.jpg",
    text: "The floor beats like a heart,\nRhythms shake the darkened core—\nHow many pulses?",
    correct: "A",
    hint: "The poem tells you directly.",
    choices: ["A) Three", "B) Five", "C) Four"],
    next: 4
  },
  {
    title: "Room 5",
    img: "img5.jpg",
    text: "Numbers burn in silence,\nTime bleeds from the final lock—\nWhich one frees you?",
    correct: "C",
    hint: "The highest number.",
    choices: ["A) 18", "B) 21", "C) 24"],
    next: 5
  },
  {
    title: "Conclusion",
    img: "img6.jpg",
    text: "The doors collapse behind you,\nThe red moon fades to ash—\nYou escaped.",
    correct: "A",
    hint: "",
    choices: ["Play Again"],
    next: 0
  }
];

// ===============================
// START GAME
// ===============================
commenceBtn.onclick = () => {
  lives = START_LIVES;
  updateLives();
  startScreen.classList.add("hidden");
  gameContainer.classList.remove("hidden");
  bgm?.play().catch(() => {});
  loadRoom(0);
};

// ===============================
// LOAD ROOM
// ===============================
function loadRoom(index) {
  clearAllTimers();

  currentRoomoom = index;
  const r = rooms[index];

  roomTitle.textContent = r.title;
  mainImage.src = r.img;
  responseTimerEl.classList.add("hidden");

  typeWriterPoem(r.text);

  exitBtn.style.display = r.title === "Conclusion" ? "inline-block" : "none";

  renderChoices(r);
}

// ===============================
// TYPEWRITER POEM
// ===============================
function typeWriterPoem(text) {
  roomText.textContent = "";
  const lines = text.split("\n");
  let l = 0, c = 0;

  function type() {
    if (l >= lines.length) return;

    if (c < lines[l].length) {
      roomText.textContent += lines[l][c++];
      setTimeout(type, 35);
    } else {
      roomText.textContent += "\n";
      l++; c = 0;
      setTimeout(type, 400);
    }
  }
  type();
}

// ===============================
// RENDER CHOICES
// ===============================
function renderChoices(room) {
  choiceButtons.innerHTML = "";

  room.choices.forEach((txt, i) => {
    const btn = document.createElement("button");
    btn.className = "choiceBtn";
    btn.textContent = txt;

    btn.onclick = () => {
      const key = String.fromCharCode(65 + i);
      if (key === room.correct) {
        loadRoom(room.next);
      } else {
        startPenalty(room);
      }
    };

    choiceButtons.appendChild(btn);
  });
}

// ===============================
// PENALTY + HINT
// ===============================
function startPenalty(room) {
  disableChoices(true);

  let t = PENALTY_SECONDS;
  showMessage(`❌ Wrong choice! Wait ${t}s`);

  penaltyTimer = setInterval(() => {
    t--;
    showMessage(`❌ Wrong choice! Wait ${t}s`);

    if (t <= 0) {
      clearInterval(penaltyTimer);
      lives--;
      updateLives();
      disableChoices(false);

      if (lives <= 0) {
        gameOver("You lost all lives.");
      } else {
        showHint(room);
        startResponseTimer();
      }
    }
  }, 1000);
}

// ===============================
// RESPONSE TIMER
// ===============================
function startResponseTimer() {
  let t = RESPONSE_TIMEOUT_SECONDS;
  responseTimerEl.classList.remove("hidden");
  responseTimerEl.textContent = `${t}s`;

  responseTimer = setInterval(() => {
    t--;
    responseTimerEl.textContent = `${t}s`;

    if (t <= 0) {
      clearInterval(responseTimer);
      gameOver("You failed to answer in time.");
    }
  }, 1000);
}

// ===============================
// HINT
// ===============================
function showHint(room) {
  const hint = document.createElement("div");
  hint.style.color = "#c48cff";
  hint.style.marginTop = "10px";
  hint.textContent = "Hint: " + room.hint;
  choiceButtons.appendChild(hint);

  hintTimeout = setTimeout(() => {
    hint.remove();
  }, HINT_DISPLAY_SECONDS * 1000);
}

// ===============================
// UI HELPERS
// ===============================
function updateLives() {
  livesEl.textContent = "❤️".repeat(lives);
}

function showMessage(msg) {
  let el = document.getElementById("penaltyMsg");
  if (!el) {
    el = document.createElement("div");
    el.id = "penaltyMsg";
    el.style.marginTop = "10px";
    el.style.color = "#ff6b6b";
    choiceButtons.appendChild(el);
  }
  el.textContent = msg;
}

function disableChoices(state) {
  document.querySelectorAll(".choiceBtn").forEach(b => b.disabled = state);
}

function clearAllTimers() {
  clearInterval(penaltyTimer);
  clearInterval(responseTimer);
  clearTimeout(hintTimeout);
  const m = document.getElementById("penaltyMsg");
  if (m) m.remove();
}

// ===============================
// GAME OVER
// ===============================
function gameOver(msg) {
  alert("GAME OVER\n" + msg);
  startScreen.classList.remove("hidden");
  gameContainer.classList.add("hidden");
}

// ===============================
// EXIT
// ===============================
exitBtn.onclick = () => {
  bgm?.pause();
  bgm.currentTime = 0;
  startScreen.classList.remove("hidden");
  gameContainer.classList.add("hidden");
};
