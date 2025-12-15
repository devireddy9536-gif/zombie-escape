// ===============================
// script.js — hearts lives + hint beside question (purple)
// 50/50 lifeline removed. "How to Play" added to start screen.
// ===============================

// ===== CONFIG =====
const START_LIVES = 3;               // starting lives (hearts)
const PENALTY_SECONDS = 15;          // wait time after a wrong choice
const RESPONSE_TIMEOUT_SECONDS = 20; // time to answer after life is deducted
const HINT_DISPLAY_SECONDS = 20;     // seconds the hint stays visible beside the question

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

const controlsContainer = document.getElementById("controls"); // optional container

// ===== State & UI handles =====
let msgEl = null;              // general message area (penalty/response textual messages)
let hintEl = null;             // separate element for hint text (will be placed beside title)
let hintTimeoutHandle = null;  // timeout handle for hint auto-hide
let penaltyInterval = null;    // penalty handle
let responseInterval = null;   // response timer handle
let responseTimerEl = null;    // visible small timer beside question

let livesEl = null;            // lives display element (hearts)
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

// ===== How to Play (added below backstory) =====
const howToPlay = `
HOW TO PLAY:
* You start with 3 lives (hearts).
* Each room gives you a riddle or choice.
* Pick the correct answer to move to the next room.
* A wrong answer:
   – Forces you to wait ${PENALTY_SECONDS} seconds.
   – Deducts 1 life after the wait.
   – Shows a hint (for ${HINT_DISPLAY_SECONDS} seconds).
* After losing a life, you have ${RESPONSE_TIMEOUT_SECONDS} seconds to answer correctly.
* If you fail to answer in time or lose all lives ? GAME OVER.
* Reach the Conclusion room to escape the lab!
`;
if (howToPlayEl) howToPlayEl.textContent = howToPlay.trim();

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

// ===== Ensure Controls (hearts UI + response timer) =====
function ensureControls() {
  // hearts display
  if (!livesEl) {
    livesEl = document.getElementById("livesEl");
    if (!livesEl) {
      livesEl = document.createElement("div");
      livesEl.id = "livesEl";
      livesEl.setAttribute("aria-live", "polite");
      if (controlsContainer) controlsContainer.appendChild(livesEl);
      else document.body.insertBefore(livesEl, choiceButtons);
    }
  }
  updateLivesUI();

  // response timer & hint elements
  ensureResponseTimerEl();
  ensureHintEl();
}

// ===== Load Room & Render Choices =====
function loadRoom(index) {
  if (typeof index !== "number" || index < 0 || index >= rooms.length) index = 0;
  currentRoomIndex = index;
  const room = rooms[index];

  clearAllTimersAndMessages();

  mainImage.src = room.img;
  mainImage.alt = room.title;
  roomTitle.textContent = room.title;
  roomText.textContent = room.text;

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
      if (btn.disabled || btn.style.display === "none") return;

      // clicking counts as answering: cancel response timer if active
      clearResponseTimer();

      if (choice.key === room.correct) {
        loadRoom(room.nextIndex);
      } else {
        // wrong -> start penalty then deduct life then start response timer if lives left
        startPenalty(PENALTY_SECONDS, () => {
          deductLife(); // heart will update & animate
          if (lives > 0) {
            showHintForRoom(currentRoomIndex);
            startResponseTimer(RESPONSE_TIMEOUT_SECONDS);
          } else {
            triggerGameOver("You have lost all your lives.");
          }
        });
      }
    });

    choiceButtons.appendChild(btn);
  });
}

// ===== Penalty (disable choices + countdown) =====
function startPenalty(seconds, onComplete) {
  if (penaltyInterval) return;
  if (!msgEl) createMsgEl();

  msgEl.style.color = "#ff6b6b";
  msgEl.style.fontSize = "20px";
  msgEl.style.textAlign = "center";
  msgEl.style.textShadow = "0 0 8px rgba(255,0,0,0.25)";

  disableChoices(true);

  let timeLeft = seconds;
  msgEl.textContent = ? Wrong! Wait ${timeLeft} seconds...;

  penaltyInterval = setInterval(() => {
    timeLeft--;
    if (timeLeft > 0) {
      msgEl.textContent = ? Wrong! Wait ${timeLeft} seconds...;
    } else {
      clearPenalty();
      if (typeof onComplete === "function") onComplete();
    }
  }, 1000);
}

function clearPenalty() {
  if (penaltyInterval) { clearInterval(penaltyInterval); penaltyInterval = null; }
  disableChoices(false);
}

// ===== Response Timer (visible beside the question) =====
function ensureResponseTimerEl() {
  if (responseTimerEl) return;
  responseTimerEl = document.createElement("div");
  responseTimerEl.id = "responseTimerEl";
  responseTimerEl.style.visibility = "hidden";
  responseTimerEl.style.display = "inline-block";
  responseTimerEl.style.minWidth = "64px";
  responseTimerEl.style.textAlign = "center";
  responseTimerEl.style.borderRadius = "8px";
  responseTimerEl.style.padding = "6px 8px";

  if (roomTitle && roomTitle.parentElement) roomTitle.parentElement.appendChild(responseTimerEl);
  else if (controlsContainer) controlsContainer.appendChild(responseTimerEl);
  else gameContainer.insertBefore(responseTimerEl, choiceButtons);
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
  responseTimerEl.textContent = ${timeLeft}s;
  msgEl.textContent = You have ${timeLeft} seconds to answer or the game will restart.;

  responseInterval = setInterval(() => {
    timeLeft--;
    if (timeLeft > 0) {
      responseTimerEl.textContent = ${timeLeft}s;
      msgEl.textContent = You have ${timeLeft} seconds to answer or the game will restart.;
    } else {
      clearResponseTimer();
      triggerGameOver("You didn't answer in time.");
    }
  }, 1000);
}

function clearResponseTimer() {
  if (responseInterval) { clearInterval(responseInterval); responseInterval = null; }
  if (responseTimerEl) responseTimerEl.style.visibility = "hidden";
}

// ===== Hint element (placed beside the question/title) =====
function ensureHintEl() {
  if (hintEl) return;

  hintEl = document.createElement("div");
  hintEl.id = "hintEl";

  // inline styling so it sits nicely next to the title (purple text)
  hintEl.style.fontSize = "15px";
  hintEl.style.padding = "6px 10px";
  hintEl.style.borderRadius = "8px";
  hintEl.style.background = "rgba(0,0,0,0.20)";
  hintEl.style.color = "#c48cff"; // purple hint color
  hintEl.style.display = "inline-block";
  hintEl.style.marginLeft = "10px";
  hintEl.style.minWidth = "160px";
  hintEl.style.textAlign = "left";
  hintEl.style.verticalAlign = "middle";
  hintEl.style.boxSizing = "border-box";
  hintEl.style.visibility = "hidden";

  if (roomTitle && roomTitle.parentElement) {
    roomTitle.parentElement.appendChild(hintEl);
  } else if (controlsContainer) {
    controlsContainer.appendChild(hintEl);
  } else {
    gameContainer.insertBefore(hintEl, choiceButtons);
  }
}

function showHintForRoom(index) {
  const room = rooms[index];
  if (!room) return;

  ensureHintEl();

  // If this room already had a shown hint, show a brief 'try again' text instead.
  if (hintedRooms.has(index)) {
    if (!msgEl) createMsgEl();
    msgEl.textContent = "You can try again.";
    msgEl.style.color = "#ffffff";
    setTimeout(() => { if (msgEl) { msgEl.remove(); msgEl = null; } }, 1400);
    return;
  }

  // Mark as hinted once
  hintedRooms.add(index);

  // show the hint beside the question
  hintEl.innerHTML = <strong>Hint:</strong> ${room.hint || "Look closely at the wording in the poem."};
  hintEl.style.visibility = "visible";

  // clear any previous timeout
  if (hintTimeoutHandle) {
    clearTimeout(hintTimeoutHandle);
    hintTimeoutHandle = null;
  }

  // hide automatically after configured seconds
  hintTimeoutHandle = setTimeout(() => {
    if (hintEl) {
      hintEl.style.visibility = "hidden";
      hintEl.innerHTML = "";
    }
    hintTimeoutHandle = null;
  }, HINT_DISPLAY_SECONDS * 1000);
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

// ===== Hearts Lives UI & animation =====
function updateLivesUI() {
  if (!livesEl) return;
  const heart = "??";
  let html = "";
  for (let i = 0; i < lives; i++) html += <span class="heart">${heart}</span>;
  livesEl.innerHTML = html || <span style="opacity:0.6">No lives</span>;
}

// call when deducting a life
function deductLife() {
  const prev = lives;
  lives = Math.max(0, lives - 1);
  updateLivesUI();

  // animate last heart (if any)
  if (prev > lives && livesEl) {
    const hearts = livesEl.querySelectorAll(".heart");
    const last = hearts[hearts.length - 1] || null;
    if (last) {
      last.animate(
        [{ transform: "scale(1.25)", opacity: 1 }, { transform: "scale(1)", opacity: 0.4 }],
        { duration: 600, easing: "ease-out" }
      );
    } else {
      // small shake on livesEl if none left
      livesEl.animate([{ transform: "translateY(-4px)" }, { transform: "translateY(0)" }], { duration: 300 });
    }
  }
}

// ===== Utilities continued =====
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// ===== Game Over UI & flow =====
function triggerGameOver(message) {
  clearAllTimersAndMessages();

  const existing = document.getElementById("gameOverOverlay");
  if (existing) existing.remove();

  const overlay = document.createElement("div");
  overlay.id = "gameOverOverlay";
  overlay.style.position = "absolute";
  overlay.style.left = "0";
  overlay.style.top = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.display = "flex";
  overlay.style.flexDirection = "column";
  overlay.style.justifyContent = "center";
  overlay.style.alignItems = "center";
  overlay.style.background = "rgba(0,0,0,0.75)";
  overlay.style.color = "#fff";
  overlay.style.zIndex = "9999";
  overlay.style.padding = "20px";
  overlay.style.boxSizing = "border-box";

  const msg = document.createElement("div");
  msg.innerHTML = <h2 style="margin:0 0 12px 0;">Game Over</h2><p style="margin:0 0 18px 0; text-align:center;">${message}</p>;
  overlay.appendChild(msg);

  const playAgainBtn = document.createElement("button");
  playAgainBtn.textContent = "Play Again";
  playAgainBtn.style.padding = "10px 16px";
  playAgainBtn.style.fontSize = "16px";
  playAgainBtn.style.cursor = "pointer";
  playAgainBtn.onclick = () => {
    try { overlay.remove(); } catch (e) {}
    hintedRooms.clear();
    lives = START_LIVES;
    updateLivesUI();
    loadRoom(0);
  };
  overlay.appendChild(playAgainBtn);

  const exitBtnLocal = document.createElement("button");
  exitBtnLocal.textContent = "Exit to Backstory";
  exitBtnLocal.style.marginTop = "10px";
  exitBtnLocal.style.padding = "8px 12px";
  exitBtnLocal.style.cursor = "pointer";
  exitBtnLocal.onclick = () => {
    try { overlay.remove(); } catch(e){}
    try { bgm.pause(); bgm.currentTime = 0; } catch(e){}
    gameContainer.classList.add("hidden");
    startScreen.classList.remove("hidden");
  };
  overlay.appendChild(exitBtnLocal);

  gameContainer.style.position = gameContainer.style.position || "relative";
  gameContainer.appendChild(overlay);
}

// ===== Cleanup timers/messages =====
function clearAllTimersAndMessages() {
  if (penaltyInterval) { clearInterval(penaltyInterval); penaltyInterval = null; }
  if (responseInterval) { clearInterval(responseInterval); responseInterval = null; }
  if (msgEl) { msgEl.remove(); msgEl = null; }

  if (hintTimeoutHandle) { clearTimeout(hintTimeoutHandle); hintTimeoutHandle = null; }
  if (hintEl) { hintEl.style.visibility = "hidden"; hintEl.innerHTML = ""; }

  if (responseTimerEl) { responseTimerEl.style.visibility = "hidden"; }
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