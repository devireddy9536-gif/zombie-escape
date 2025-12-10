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

// lifeline button (created dynamically)
let lifelineBtn = null;
let lifelineUsed = false;

// store reference to any visible message element / countdown interval
let msgEl = null;           // used for wrong / hint messages
let penaltyInterval = null;

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

// track which rooms have already shown a hint (avoid duplicates)
const hintedRooms = new Set();

// ===============================
// START GAME
// ===============================
commenceBtn.addEventListener("click", () => {
  // reset lifeline state when starting game
  lifelineUsed = false;
  hintedRooms.clear();

  // play audio (user-triggered)
  bgm.currentTime = 0;
  bgm.play().catch(()=>{});

  // show game
  startScreen.classList.add("hidden");
  gameContainer.classList.remove("hidden");

  // ensure lifeline button exists and is visible
  ensureLifelineBtn();

  // load room 0
  loadRoom(0);
});

// create lifeline button dynamically (once)
function ensureLifelineBtn() {
  if (lifelineBtn) {
    lifelineBtn.style.display = "inline-block";
    lifelineBtn.disabled = false;
    return;
  }

  lifelineBtn = document.createElement("button");
  lifelineBtn.id = "lifelineBtn";
  lifelineBtn.textContent = "50/50 Lifeline";
  lifelineBtn.title = "Remove two wrong choices (one-time use)";
  lifelineBtn.style.display = "inline-block";
  lifelineBtn.style.margin = "8px";
  lifelineBtn.style.padding = "8px 12px";
  lifelineBtn.style.fontSize = "16px";
  lifelineBtn.style.cursor = "pointer";

  const appendTarget = gameContainer.querySelector("#controls") || gameContainer;
  appendTarget.insertBefore(lifelineBtn, choiceButtons);

  lifelineBtn.addEventListener("click", () => {
    if (lifelineUsed) return;
    applyFiftyFifty();
  });
}

// ===============================
// LOAD ROOM (render UI)
// ===============================
let currentRoomIndex = 0;
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
  if (msgEl) {
    clearPenalty(); // stop any running penalty
    msgEl.remove();
    msgEl = null;
  }

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

      if (choice.key === room.correct) {
        // correct -> go to nextIndex
        loadRoom(room.nextIndex);
      } else {
        // wrong -> start 30s penalty and after that show hint
        startPenalty(30, () => showHintForRoom(index));
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
// ===============================
function startPenalty(seconds, onComplete) {
  // if already in penalty, do nothing
  if (penaltyInterval) return;

  // create or reuse message element
  if (!msgEl) {
    msgEl = document.createElement("div");
    msgEl.style.textAlign = "center";
    msgEl.style.fontSize = "20px";
    msgEl.style.marginTop = "12px";
    choiceButtons.appendChild(msgEl);
  }

  // style as warning
  msgEl.style.color = "#ff6b6b";
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
      // show hint if provided
      if (typeof onComplete === "function") onComplete();
    }
  }, 1000);
}

function clearPenalty() {
  if (penaltyInterval) {
    clearInterval(penaltyInterval);
    penaltyInterval = null;
  }
  disableChoices(false);
}

// disable or enable all choice buttons
function disableChoices(state) {
  const buttons = Array.from(choiceButtons.querySelectorAll(".choiceBtn"));
  buttons.forEach(btn => {
    btn.disabled = state;
    // visual disabled hint
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

  // create message element if missing
  if (!msgEl) createMsgEl();

  // style as hint (greenish)
  msgEl.style.color = "#9ad88e";
  msgEl.style.textShadow = "0 0 6px rgba(0,0,0,0.6)";
  msgEl.innerHTML = `<strong>Hint:</strong> ${room.hint || "Think again — look for a keyword in the poem."}`;

  // leave choices enabled for retry (they're already re-enabled by clearPenalty)
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

// stop audio when leaving page
window.addEventListener("beforeunload", () => {
  try { bgm.pause(); bgm.currentTime = 0; } catch(e){}
});
