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
// CONFIG: lives and response timeout (edit these numbers if you want)
// ===============================
const START_LIVES = 3;               // player starts with 3 lives
const PENALTY_SECONDS = 15;          // wait time after wrong choice
const RESPONSE_TIMEOUT_SECONDS = 20; // time to answer after life is deducted

// lifeline button (created dynamically)
let lifelineBtn = null;
let lifelineUsed = false;

// message and interval handles
let msgEl = null;              // message area below choices
let penaltyInterval = null;    // 15s penalty interval handle
let responseInterval = null;   // response timer interval handle

// lives & UI element to show them
let lives = START_LIVES;
let livesEl = null;

// track which rooms have already shown a hint (avoid duplicates)
const hintedRooms = new Set();

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
backstoryTextEl.textContent = backstory.trim();

// ===============================
// ROOMS WITH CORRECT ANSWERS + HINTS
// (kept your original questions/choices — only added hint field)
// ===============================
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
    // Ending / success screen
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

// ===============================
// START GAME
// ===============================
let currentRoomIndex = 0;

commenceBtn.addEventListener("click", () => {
  // reset game state
  lifelineUsed = false;
  hintedRooms.clear();
  lives = START_LIVES;
  updateLivesUI();

  // play audio (user-triggered)
  bgm.currentTime = 0;
  bgm.play().catch(()=>{});

  // show game
  startScreen.classList.add("hidden");
  gameContainer.classList.remove("hidden");

  // ensure control UI (lifeline + lives) exists
  ensureControls();

  // load first room
  loadRoom(0);
});

// ensure controls area (lifeline button + lives display)
function ensureControls() {
  // create a small controls wrapper at top of game container
  let controls = gameContainer.querySelector("#controls");
  if (!controls) {
    controls = document.createElement("div");
    controls.id = "controls";
    controls.style.display = "flex";
    controls.style.justifyContent = "space-between";
    controls.style.alignItems = "center";
    controls.style.padding = "8px 12px";
    controls.style.maxWidth = "900px";
    controls.style.margin = "8px auto 0 auto";
    gameContainer.insertBefore(controls, gameContainer.firstChild);
  }

  // lifeline button
  if (!lifelineBtn) {
    lifelineBtn = document.createElement("button");
    lifelineBtn.id = "lifelineBtn";
    lifelineBtn.textContent = "50/50 Lifeline";
    lifelineBtn.title = "Remove two wrong choices (one-time use)";
    lifelineBtn.style.marginRight = "8px";
    lifelineBtn.style.padding = "6px 10px";
    lifelineBtn.style.fontSize = "14px";
    lifelineBtn.style.cursor = "pointer";
    lifelineBtn.addEventListener("click", () => {
      if (lifelineUsed) return;
      applyFiftyFifty();
    });
    controls.appendChild(lifelineBtn);
  } else {
    // re-attach if missing
    if (!controls.contains(lifelineBtn)) controls.appendChild(lifelineBtn);
  }

  // lives display
  if (!livesEl) {
    livesEl = document.createElement("div");
    livesEl.id = "livesEl";
    livesEl.style.fontSize = "16px";
    livesEl.style.fontWeight = "700";
    livesEl.style.padding = "6px 8px";
    livesEl.style.borderRadius = "8px";
    livesEl.style.background = "rgba(0,0,0,0.25)";
    livesEl.style.color = "#fff";
    livesEl.style.minWidth = "120px";
    livesEl.style.textAlign = "center";
    controls.appendChild(livesEl);
  }
  updateLivesUI();
}

// update lives UI text
function updateLivesUI() {
  if (!livesEl) return;
  livesEl.textContent = `Lives: ${lives}`;
  if (lives === 1) {
    livesEl.style.background = "rgba(180,30,30,0.8)";
  } else if (lives <= 0) {
    livesEl.style.background = "rgba(60,60,60,0.8)";
  } else {
    livesEl.style.background = "rgba(0,0,0,0.25)";
  }
}

// ===============================
// LOAD ROOM (render UI)
// ===============================
function loadRoom(index) {
  // defensive: ensure valid index
  if (typeof index !== "number" || index < 0 || index >= rooms.length) index = 0;
  currentRoomIndex = index;
  const room = rooms[index];

  // update image & texts
  mainImage.src = room.img;
  mainImage.alt = room.title;
  roomTitle.textContent = room.title;
  roomText.textContent = room.text;

  // clear old choices & messages
  choiceButtons.innerHTML = "";
  clearAllTimersAndMessages();

  // create centered choice buttons
  choiceButtons.style.textAlign = "center";
  room.choices.forEach(choice => {
    const btn = document.createElement("button");
    btn.className = "choiceBtn";
    btn.textContent = choice.text;
    btn.dataset.key = choice.key;
    btn.dataset.correct = (choice.key === room.correct) ? "true" : "false";

    // style: ensure appearance even if CSS missing
    btn.style.display = "block";
    btn.style.margin = "10px auto";
    btn.style.padding = "14px 22px";
    btn.style.width = "60%";
    btn.style.fontSize = "18px";
    btn.style.cursor = "pointer";

    btn.addEventListener("click", () => {
      // ignore clicks while penalty running or if button is disabled/hidden
      if (btn.disabled || btn.style.display === "none") return;

      // If a response timer is running, clicking counts as answering (so cancel it)
      clearResponseTimer();

      if (choice.key === room.correct) {
        // correct -> go to nextIndex
        loadRoom(room.nextIndex);
      } else {
        // wrong -> start penalty then deduct life then start response timer (if lives remain)
        startPenalty(PENALTY_SECONDS, () => {
          // after penalty finishes: deduct a life
          deductLife();

          // if lives remain, show hint (once) and start response timer
          if (lives > 0) {
            showHintForRoom(currentRoomIndex);
            startResponseTimer(RESPONSE_TIMEOUT_SECONDS);
            // choices are already re-enabled by clearPenalty inside startPenalty's finish
          } else {
            // no lives left -> game over
            triggerGameOver("You have lost all your lives.");
          }
        });
      }
    });

    choiceButtons.appendChild(btn);
  });

  // reset lifeline button visibility if already used
  if (lifelineBtn) {
    lifelineBtn.disabled = lifelineUsed;
    lifelineBtn.style.opacity = lifelineUsed ? "0.6" : "1";
  }

  // exit button behavior -> return to backstory / stop music
  exitBtn.onclick = () => {
    try { bgm.pause(); bgm.currentTime = 0; } catch(e){}
    gameContainer.classList.add("hidden");
    startScreen.classList.remove("hidden");
  };
}

// ===============================
// PENALTY (disable choices + countdown)
// startPenalty(seconds, onComplete)
// ===============================
function startPenalty(seconds, onComplete) {
  // if already in penalty, do nothing
  if (penaltyInterval) return;

  // create or reuse message element
  if (!msgEl) createMsgEl();

  // style as warning
  msgEl.style.color = "#ff6b6b";
  msgEl.style.textAlign = "center";
  msgEl.style.fontSize = "20px";
  msgEl.style.textShadow = "0 0 8px rgba(255,0,0,0.25)";

  disableChoices(true);

  let timeLeft = seconds;
  msgEl.textContent = `❌ Wrong! Wait ${timeLeft} seconds...`;

  penaltyInterval = setInterval(() => {
    timeLeft--;
    if (timeLeft > 0) {
      msgEl.textContent = `❌ Wrong! Wait ${timeLeft} seconds...`;
    } else {
      // finish penalty
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

// ===============================
// RESPONSE TIMER (player must answer within time after penalty)
// ===============================
function startResponseTimer(seconds) {
  // clear any existing response timer
  clearResponseTimer();

  if (!msgEl) createMsgEl();
  msgEl.style.color = "#ffd166"; // warning color for response window
  msgEl.style.textShadow = "0 0 6px rgba(0,0,0,0.5)";

  let timeLeft = seconds;
  msgEl.textContent = `You have ${timeLeft} seconds to answer or the game will restart.`;

  responseInterval = setInterval(() => {
    timeLeft--;
    if (timeLeft > 0) {
      msgEl.textContent = `You have ${timeLeft} seconds to answer or the game will restart.`;
    } else {
      // response window expired -> force restart (game over)
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
  // remove response message if present (we let other messages appear)
  if (msgEl) {
    msgEl.remove();
    msgEl = null;
  }
}

// ===============================
// Deduct life and update UI
// ===============================
function deductLife() {
  lives = Math.max(0, lives - 1);
  updateLivesUI();
}

// ===============================
// Disable or enable all choice buttons
// ===============================
function disableChoices(state) {
  const buttons = Array.from(choiceButtons.querySelectorAll(".choiceBtn"));
  buttons.forEach(btn => {
    btn.disabled = state;
    btn.style.opacity = state ? "0.6" : "1";
    btn.style.cursor = state ? "not-allowed" : "pointer";
  });
}

// ===============================
// HINT: show hint for room after penalty (only once per room)
// ===============================
function showHintForRoom(index) {
  const room = rooms[index];
  if (!room) return;

  // if already hinted for this room, show a brief 'try again' message instead
  if (hintedRooms.has(index)) {
    if (!msgEl) createMsgEl();
    msgEl.textContent = "You can try again.";
    msgEl.style.color = "#ffffff";
    msgEl.style.textShadow = "0 0 6px rgba(0,0,0,0.6)";
    setTimeout(() => {
      if (msgEl) { msgEl.remove(); msgEl = null; }
    }, 1400);
    return;
  }

  hintedRooms.add(index);

  if (!msgEl) createMsgEl();

  // style as hint (greenish)
  msgEl.style.color = "#9ad88e";
  msgEl.style.textShadow = "0 0 6px rgba(0,0,0,0.6)";
  msgEl.innerHTML = `<strong>Hint:</strong> ${room.hint || "Think again — look for a keyword in the poem."}`;

  // remove hint after a few seconds so UI stays clean
  setTimeout(() => {
    if (msgEl) { msgEl.remove(); msgEl = null; }
  }, 5000);
}

function createMsgEl() {
  msgEl = document.createElement("div");
  msgEl.style.textAlign = "center";
  msgEl.style.fontSize = "18px";
  msgEl.style.marginTop = "12px";
  choiceButtons.appendChild(msgEl);
}

// ===============================
// LIFELINE: 50/50 (remove two wrongs)
// ===============================
function applyFiftyFifty() {
  // already used?
  if (lifelineUsed) return;

  const buttons = Array.from(choiceButtons.querySelectorAll(".choiceBtn"));
  if (buttons.length < 3) {
    lifelineUsed = true;
    if (lifelineBtn) lifelineBtn.disabled = true;
    return;
  }

  // collect wrong buttons (visible and not already hidden)
  const wrongBtns = buttons.filter(b => b.dataset.correct !== "true" && b.style.display !== "none");

  const toHideCount = Math.min(2, wrongBtns.length);

  // shuffle wrongBtns and hide first toHideCount
  shuffleArray(wrongBtns);
  for (let i = 0; i < toHideCount; i++) {
    const btn = wrongBtns[i];
    btn.style.display = "none";
  }

  lifelineUsed = true;
  if (lifelineBtn) {
    lifelineBtn.disabled = true;
    lifelineBtn.style.opacity = "0.6";
  }

  // small feedback
  if (!msgEl) createMsgEl();
  msgEl.style.color = "#9ad88e";
  msgEl.textContent = "Lifeline used: two wrong options removed.";
  setTimeout(() => {
    if (msgEl) { msgEl.remove(); msgEl = null; }
  }, 2200);
}

// simple Fisher-Yates shuffle
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// ===============================
// GAME OVER handling (show message + Play Again)
// ===============================
function triggerGameOver(message) {
  clearAllTimersAndMessages();
  // Show a simple game over overlay inside gameContainer
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
  overlay.style.background = "rgba(0,0,0,0.7)";
  overlay.style.color = "#fff";
  overlay.style.zIndex = "9999";
  overlay.style.padding = "20px";
  overlay.style.boxSizing = "border-box";

  const msg = document.createElement("div");
  msg.innerHTML = `<h2 style="margin:0 0 12px 0;">Game Over</h2><p style="margin:0 0 18px 0; text-align:center;">${message}</p>`;
  overlay.appendChild(msg);

  const playAgainBtn = document.createElement("button");
  playAgainBtn.textContent = "Play Again";
  playAgainBtn.style.padding = "10px 16px";
  playAgainBtn.style.fontSize = "16px";
  playAgainBtn.style.cursor = "pointer";
  playAgainBtn.onclick = () => {
    // clean up overlay and reset to starting state
    try { overlay.remove(); } catch (e) {}
    lifelineUsed = false;
    hintedRooms.clear();
    lives = START_LIVES;
    updateLivesUI();
    loadRoom(0);
  };
  overlay.appendChild(playAgainBtn);

  // Add a small Exit to Backstory button
  const exitToBackBtn = document.createElement("button");
  exitToBackBtn.textContent = "Exit to Backstory";
  exitToBackBtn.style.marginTop = "10px";
  exitToBackBtn.style.padding = "8px 12px";
  exitToBackBtn.style.cursor = "pointer";
  exitToBackBtn.onclick = () => {
    try { overlay.remove(); } catch(e){}
    try { bgm.pause(); bgm.currentTime = 0; } catch(e){}
    gameContainer.classList.add("hidden");
    startScreen.classList.remove("hidden");
  };
  overlay.appendChild(exitToBackBtn);

  // ensure position: gameContainer is positioned relative so overlay sits inside
  gameContainer.style.position = gameContainer.style.position || "relative";
  gameContainer.appendChild(overlay);
}

// clear penalty, response timers and message elements
function clearAllTimersAndMessages() {
  if (penaltyInterval) { clearInterval(penaltyInterval); penaltyInterval = null; }
  if (responseInterval) { clearInterval(responseInterval); responseInterval = null; }
  if (msgEl) { msgEl.remove(); msgEl = null; }
  // re-enable buttons just in case
  disableChoices(false);
}

// stop audio when leaving page
window.addEventListener("beforeunload", () => {
  try { bgm.pause(); bgm.currentTime = 0; } catch(e){}
});


