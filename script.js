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

// store reference to any visible wrong-message element
let wrongMsgEl = null;

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
// ROOMS WITH CORRECT ANSWERS
// ===============================
const rooms = [
  {
    title: "Room 1",
    img: "img1.jpg",
    text: `Shelves soaked in dust and rusted steel,
Three doors whisper secrets concealed —
Which path hides truth within the maze?`,
    correct: "C",
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
    choices: [
      { key: "A", text: "Play Again" }
    ],
    nextIndex: 0
  }
];

// ===============================
// START GAME
// ===============================
commenceBtn.addEventListener("click", () => {
  // play audio (user-triggered)
  bgm.currentTime = 0;
  bgm.play().catch(()=>{});

  // show game
  startScreen.classList.add("hidden");
  gameContainer.classList.remove("hidden");

  // load room 0
  loadRoom(0);
});

// ===============================
// LOAD ROOM (render UI)
// ===============================
function loadRoom(index) {
  // defensive: ensure valid index
  if (typeof index !== "number" || index < 0 || index >= rooms.length) index = 0;
  const room = rooms[index];

  // update image & texts
  mainImage.src = room.img;
  mainImage.alt = room.title;
  roomTitle.textContent = room.title;
  roomText.textContent = room.text;

  // clear old choices & wrong message
  choiceButtons.innerHTML = "";
  if (wrongMsgEl) {
    wrongMsgEl.remove();
    wrongMsgEl = null;
  }

  // create centered choice buttons
  choiceButtons.style.textAlign = "center";
  room.choices.forEach(choice => {
    const btn = document.createElement("button");
    btn.className = "choiceBtn";
    btn.textContent = choice.text;

    // style: ensure appearance even if CSS missing
    btn.style.display = "block";
    btn.style.margin = "10px auto";
    btn.style.padding = "14px 22px";
    btn.style.width = "60%";
    btn.style.fontSize = "18px";

    btn.addEventListener("click", () => {
      if (choice.key === room.correct) {
        // correct -> go to nextIndex
        loadRoom(room.nextIndex);
      } else {
        // wrong -> show wrong message (and keep on same room)
        showWrongMessage();
      }
    });

    choiceButtons.appendChild(btn);
  });

  // exit button behavior -> return to backstory / stop music
  exitBtn.onclick = () => {
    try { bgm.pause(); bgm.currentTime = 0; } catch(e){}
    gameContainer.classList.add("hidden");
    startScreen.classList.remove("hidden");
  };
}

// ===============================
// WRONG MESSAGE
// ===============================
function showWrongMessage() {
  // do not duplicate
  if (wrongMsgEl) return;

  wrongMsgEl = document.createElement("div");
  wrongMsgEl.textContent = "❌ Wrong choice! Try again.";
  wrongMsgEl.style.color = "#ff6b6b";
  wrongMsgEl.style.textAlign = "center";
  wrongMsgEl.style.fontSize = "20px";
  wrongMsgEl.style.marginTop = "12px";
  wrongMsgEl.style.textShadow = "0 0 8px rgba(255,0,0,0.25)";

  // append after buttons area
  choiceButtons.appendChild(wrongMsgEl);

  // small pulse animation (optional)
  wrongMsgEl.animate(
    [{ transform: "scale(1)" }, { transform: "scale(1.03)" }, { transform: "scale(1)" }],
    { duration: 600, iterations: 1 }
  );
}

// stop audio when leaving page
window.addEventListener("beforeunload", () => {
  try { bgm.pause(); bgm.currentTime = 0; } catch(e){}
});
