// ===============================
// script.js
// ===============================

// ===== CONFIG =====
const START_LIVES = 3;               // starting lives
const PENALTY_SECONDS = 15;          // wait time after a wrong choice
const RESPONSE_TIMEOUT_SECONDS = 20; // time to answer after life is deducted

// ===== DOM ELEMENTS =====
const bgm = document.getElementById("bgm");
const startScreen = document.getElementById("startScreen");
const backstoryTextEl = document.getElementById("backstoryText");
const commenceBtn = document.getElementById("commenceBtn");

const gameContainer = document.getElementById("gameContainer");
const mainImage = document.getElementById("mainImage");
const roomTitle = document.getElementById("roomTitle");
const roomText = document.getElementById("roomText");
const choiceButtons = document.getElementById("choiceButtons");
const exitBtn = document.getElementById("exitBtn");

const controlsContainer = document.getElementById("controls"); // from updated HTML

// ===== State & UI handles =====
let lifelineBtn = null;
let lifelineUsed = false;

let msgEl = null;              // message area below choices
let penaltyInterval = null;    // 15s penalty handle
let responseInterval = null;   // response timer handle
let responseTimerEl = null;    // visible small timer beside question

let livesEl = null;            // lives display element
let lives = START_LIVES;

let currentRoomIndex = 0;
const hintedRooms = new Set(); // track which rooms already showed hint

// ===== Backstory =====
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
backstoryTextEl.textContent = backstory.trim();

// ===== Rooms (questions/choices) =====
const rooms = [
  {
    title: "Room 1",
    img: "img1.jpg",
    text: `Shelves soaked in dust and rusted steel,
Three doors whisper secrets concealed —
Which path hides truth within the maze?`,
    correct: "C",
    hint: "Notice the word 'silent' — a glass corridor wouldn't creak.",
    choices: [
      { key: "A", text: "A) The burning iron gate" },
      { key: "B", text: "B) The frost-cracked doorway" },
      { key: "C", text: "C) The silent glass corridor" }
    ],
    nextIndex: 1
  },

  {
    title: "Room 2",
    img: "img2.jpg",
    text: `Vials swirl like storms in jars,
Each glowing bright like dying stars —
Which vial guards the cure untold?`,
    correct: "B",
    hint: "The 'emerald' color usually suggests life/healing in puzzles.",
    choices: [
      { key: "A", text: "A) Silver vial" },
      { key: "B", text: "B) Emerald vial" },
      { key: "C", text: "C) Blackened vial" }
    ],
    nextIndex: 2
  },

  {
    title: "Room 3",
    img: "img3.jpg",
    text: `Machines convulse in sleeping shells,
A watchdog hums through metal wells —
Which name unlocks the coded door?`,
    correct: "A",
    hint: "The scientist's name is a typical answer when 'Dr.' appears.",
    choices: [
      { key: "A", text: "A) Dr. Greyson" },
      { key: "B", text: "B) Keeper of Keys" },
      { key: "C", text: "C) The Pale Engineer" }
    ],
    nextIndex: 3
  },

  {
    title: "Room 4",
    img: "img4.jpg",
    text: `Three pulses hum beneath the floor,
The mainframe chants a rhythmic score —
How many beats will break the core?`,
    correct: "A",
    hint: "The poem says 'Three pulses' — literal reading is safest.",
    choices: [
      { key: "A", text: "A) Three pulses" },
      { key: "B", text: "B) Five pulses" },
      { key: "C", text: "C) Four pulses" }
    ],
    nextIndex: 4
  },

  {
    title: "Room 5",
    img: "img5.jpg",
    text: `Wind carries sparks of sound and bone,
The moon rewinds what time has shown —
Which number frees the buried tone?`,
    correct: "C",
    hint: "Try the largest number — it often frees the final tone in numeric riddles.",
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
    text: `The moonlight dims. The halls grow still.
Congratulations — you escaped the lab.
To be continued...`,
    correct: "A",
    hint: "Well done! Click Play Again to try different choices.",
    choices: [
      { key: "A", text: "Play Again" }
    ],
    nextIndex: 0
  }
];

// ===== Start Game Handler =====
commenceBtn.addEventListener("click", () => {
  // reset
  lifelineUsed = false;
  hintedRooms.clear();
  lives = START_LIVES;
  updateLivesUI();

  // autoplace controls if not already
  ensureControls();

  // play audio if allowed
  try { bgm.currentTime = 0; bgm.play().catch(() => {}); } catch (e) {}

  startScreen.classList.add("hidden");
  gameContainer.classList.remove("hidden");

  loadRoom(0);
});

// ===== Ensure Controls (lifeline button + lives UI) =====
function ensureControls() {
  // lifeline
  if (!lifelineBtn) {
    lifelineBtn = document.createElement("button");
    lifelineBtn.id = "lifelineBtn";
    lifelineBtn.textContent = "50/50 Lifeline";
    lifelineBtn.title = "Remove two wrong choices (one-time use)";
    lifelineBtn.addEventListener("click", () => {
      if (lifelineUsed) return;
      applyFiftyFifty();
    });
    // append to controls container
    if (controlsContainer) controlsContainer.appendChild(lifelineBtn);
    else document.body.insertBefore(lifelineBtn, choiceButtons);
  } else if (controlsContainer && !controlsContainer.contains(lifelineBtn)) {
    controlsContainer.appendChild(lifelineBtn);
  }

  // lives display
  if (!livesEl) {
    livesEl = document.createElement("div");
    livesEl.id = "livesEl";
    if (controlsContainer) controlsContainer.appendChild(livesEl);
    else document.body.insertBefore(livesEl, choiceButtons);
  }
  updateLivesUI();

  // responseTimerEl placement (adjacent to roomTitle)
  ensureResponseTimerEl();
}

// ===== Load Room & Render Choices =====
function loadRoom(index) {
  // validate index
  if (typeof index !== "number" || index < 0 || index >= rooms.length) index = 0;
  currentRoomIndex = index;
  const room = rooms[index];

  // stop & clear timers/messages
  clearAllTimersAndMessages();

  // update UI text & image
  mainImage.src = room.img;
  mainImage.alt = room.title;
  roomTitle.textContent = room.title;
  roomText.textContent = room.text;

  // render choices immediately (no pre-question countdown)
  renderChoicesForRoom(room);
}

// create choice buttons for the given room
function renderChoicesForRoom(room) {
  choiceButtons.innerHTML = "";
  choiceButtons.style.display = "block";

  room.choices.forEach(choice => {
    const btn = document.createElement("button");
    btn.className = "choiceBtn";
    btn.textContent = choice.text;
    btn.dataset.key = choice.key;
    btn.dataset.correct = (choice.key === room.correct) ? "true" : "false";

    btn.addEventListener("click", () => {
      // ignore disabled/hidden
      if (btn.disabled || btn.style.display === "none") return;

      // if response timer is running, clicking cancels the response timer (counts as answer)
      clearResponseTimer();

      if (choice.key === room.correct) {
        loadRoom(room.nextIndex);
      } else {
        // wrong -> start penalty then deduct life then start response timer if lives left
        startPenalty(PENALTY_SECONDS, () => {
          deductLife();
          if (lives > 0) {
            showHintForRoom(currentRoomIndex);
            startResponseTimer(RESPONSE_TIMEOUT_SECONDS);
            // choices are re-enabled in clearPenalty()
          } else {
            triggerGameOver("You have lost all your lives.");
          }
        });
      }
    });

    choiceButtons.appendChild(btn);
  });

  // update lifeline UI
  if (lifelineBtn) {
    lifelineBtn.disabled = lifelineUsed;
    lifelineBtn.style.opacity = lifelineUsed ? "0.6" : "1";
  }
}

// ===== Penalty (disable choices + 30s countdown) =====
function startPenalty(seconds, onComplete) {
  if (penaltyInterval) return; // already running

  if (!msgEl) createMsgEl();
  msgEl.style.color = "#ff6b6b";
  msgEl.style.fontSize = "20px";
  msgEl.style.textAlign = "center";
  msgEl.style.textShadow = "0 0 8px rgba(255,0,0,0.25)";

  disableChoices(true);

  let timeLeft = seconds;
  msgEl.textContent = `❌ Wrong! Wait ${timeLeft} seconds...`;

  penaltyInterval = setInterval(() => {
    timeLeft--;
    if (timeLeft > 0) {
      msgEl.textContent = `❌ Wrong! Wait ${timeLeft} seconds...`;
    } else {
      clearPenalty();
      if (typeof onComplete === "function") onComplete();
    }
  }, 1000);
}

function clearPenalty() {
  if (penaltyInterval) {
    clearInterval(penaltyInterval);
    penaltyInterval = null;
  }
  // re-enable choices so player can answer in response-window
  disableChoices(false);
}

// ===== Response Timer (visible beside the question) =====
function ensureResponseTimerEl() {
  if (responseTimerEl) return;

  // create element and append after roomTitle area (we placed a flex container there in HTML)
  responseTimerEl = document.createElement("div");
  responseTimerEl.id = "responseTimerEl";
  responseTimerEl.style.visibility = "hidden";
  // append to the same parent as the h2 (textBox div's title wrapper)
  if (roomTitle && roomTitle.parentElement) {
    // append to the parent (styled with flex) so it appears to the right
    roomTitle.parentElement.appendChild(responseTimerEl);
  } else if (controlsContainer) {
    controlsContainer.appendChild(responseTimerEl);
  } else {
    gameContainer.insertBefore(responseTimerEl, choiceButtons);
  }
}

function startResponseTimer(seconds) {
  clearResponseTimer();
  ensureResponseTimerEl();

  responseTimerEl.style.visibility = "visible";
  responseTimerEl.style.background = "rgba(255, 209, 102, 0.95)";
  responseTimerEl.style.color = "#000";

  if (!msgEl) createMsgEl();
  msgEl.style.color = "#ffd166";
  msgEl.style.textShadow = "0 0 6px rgba(0,0,0,0.5)";

  let timeLeft = seconds;
  responseTimerEl.textContent = `${timeLeft}s`;
  msgEl.textContent = `You have ${timeLeft} seconds to answer or the game will restart.`;

  responseInterval = setInterval(() => {
    timeLeft--;
    if (timeLeft > 0) {
      responseTimerEl.textContent = `${timeLeft}s`;
      msgEl.textContent = `You have ${timeLeft} seconds to answer or the game will restart.`;
    } else {
      // expired
      clearResponseTimer();
      triggerGameOver("You didn't answer in time.");
    }
  }, 1000);
}

function clearResponseTimer() {
  if (responseInterval) {
    clearInterval(responseInterval);
    responseInterval = null;
  }
  // hide the small visual timer (keep msgEl alone to be removed by callers when appropriate)
  if (responseTimerEl) {
    responseTimerEl.style.visibility = "hidden";
  }
}

// ===== Lifeline: 50/50 =====
function applyFiftyFifty() {
  if (lifelineUsed) return;

  const buttons = Array.from(choiceButtons.querySelectorAll(".choiceBtn"));
  if (buttons.length < 3) {
    lifelineUsed = true;
    if (lifelineBtn) lifelineBtn.disabled = true;
    return;
  }

  const wrongBtns = buttons.filter(b => b.dataset.correct !== "true" && b.style.display !== "none");
  const toHideCount = Math.min(2, wrongBtns.length);

  shuffleArray(wrongBtns);
  for (let i = 0; i < toHideCount; i++) {
    wrongBtns[i].style.display = "none";
  }

  lifelineUsed = true;
  if (lifelineBtn) {
    lifelineBtn.disabled = true;
    lifelineBtn.style.opacity = "0.6";
  }

  if (!msgEl) createMsgEl();
  msgEl.style.color = "#9ad88e";
  msgEl.textContent = "Lifeline used: two wrong options removed.";
  setTimeout(() => {
    if (msgEl) { msgEl.remove(); msgEl = null; }
  }, 2000);
}

// ===== Hints (only once per room) =====
function showHintForRoom(index) {
  const room = rooms[index];
  if (!room) return;

  if (hintedRooms.has(index)) {
    if (!msgEl) createMsgEl();
    msgEl.textContent = "You can try again.";
    msgEl.style.color = "#fff";
    setTimeout(() => { if (msgEl) { msgEl.remove(); msgEl = null; } }, 1400);
    return;
  }

  hintedRooms.add(index);

  if (!msgEl) createMsgEl();
  msgEl.style.color = "#9ad88e";
  msgEl.innerHTML = `<strong>Hint:</strong> ${room.hint || "Think again — look for a keyword in the poem."}`;

  setTimeout(() => { if (msgEl) { msgEl.remove(); msgEl = null; } }, 5000);
}

// ===== Utilities =====
function createMsgEl() {
  if (msgEl) return;
  msgEl = document.createElement("div");
  msgEl.style.textAlign = "center";
  msgEl.style.fontSize = "18px";
  msgEl.style.marginTop = "12px";
  choiceButtons.appendChild(msgEl);
}

function disableChoices(state) {
  const buttons = Array.from(choiceButtons.querySelectorAll(".choiceBtn"));
  buttons.forEach(btn => {
    btn.disabled = state;
    btn.style.opacity = state ? "0.6" : "1";
    btn.style.cursor = state ? "not-allowed" : "pointer";
  });
}

function deductLife() {
  lives = Math.max(0, lives - 1);
  updateLivesUI();
}

function updateLivesUI() {
  if (!livesEl) return;
  livesEl.textContent = `Lives: ${lives}`;
  if (lives === 1) livesEl.style.background = "rgba(180,30,30,0.85)";
  else if (lives <= 0) livesEl.style.background = "rgba(60,60,60,0.85)";
  else livesEl.style.background = "rgba(0,0,0,0.25)";
}

// simple Fisher-Yates shuffle
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// ===== Game Over UI & flow =====
function triggerGameOver(message) {
  clearAllTimersAndMessages();

  // If overlay already present, remove it first
  const existing = document.getElementById("gameOverOverlay");
  if (existing) existing.remove();

  const overlay = document.createElement("div");
  overlay.id = "gameOverOverlay";

  const msg = document.createElement("div");
  msg.innerHTML = `<h2>Game Over</h2><p>${message}</p>`;
  overlay.appendChild(msg);

  const playAgainBtn = document.createElement("button");
  playAgainBtn.textContent = "Play Again";
  playAgainBtn.addEventListener("click", () => {
    try { overlay.remove(); } catch (e) {}
    lifelineUsed = false;
    hintedRooms.clear();
    lives = START_LIVES;
    updateLivesUI();
    loadRoom(0);
  });
  overlay.appendChild(playAgainBtn);

  const exitBtnLocal = document.createElement("button");
  exitBtnLocal.textContent = "Exit to Backstory";
  exitBtnLocal.style.marginTop = "10px";
  exitBtnLocal.addEventListener("click", () => {
    try { overlay.remove(); } catch(e){}
    try { bgm.pause(); bgm.currentTime = 0; } catch(e){}
    gameContainer.classList.add("hidden");
    startScreen.classList.remove("hidden");
  });
  overlay.appendChild(exitBtnLocal);

  // attach overlay to container and ensure positioning
  gameContainer.style.position = gameContainer.style.position || "relative";
  gameContainer.appendChild(overlay);
}

// ===== Cleanup timers/messages =====
function clearAllTimersAndMessages() {
  if (penaltyInterval) { clearInterval(penaltyInterval); penaltyInterval = null; }
  if (responseInterval) { clearInterval(responseInterval); responseInterval = null; }
  if (msgEl) { msgEl.remove(); msgEl = null; }
  if (responseTimerEl) {
    responseTimerEl.style.visibility = "hidden";
    // preserve element for re-use rather than removing entirely
  }
  disableChoices(false);
}

// ===== Exit button handling =====
exitBtn.addEventListener("click", () => {
  try { bgm.pause(); bgm.currentTime = 0; } catch(e){}
  gameContainer.classList.add("hidden");
  startScreen.classList.remove("hidden");
});

// ===== Stop audio when leaving page =====
window.addEventListener("beforeunload", () => {
  try { bgm.pause(); bgm.currentTime = 0; } catch(e){}
});

