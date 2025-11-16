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

// WRONG MESSAGE
let wrongMsg = null;

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
// ROOMS WITH CORRECT ANSWERS
// ===============================
const rooms = [
  {
    title: "Room 1",
    img: "img1.jpg",
    text: `
Shelves soaked in dust and rusted steel,
Three doors whisper secrets concealed —
Which path hides truth within the maze?
    `.trim(),
    correct: "C",
    choices: [
      { key: "A", text: "A) The burning iron gate" },
      { key: "B", text: "B) The frost-cracked doorway" },
      { key: "C", text: "C) The silent glass corridor" }
    ],
    next: 1
  },

  {
    title: "Room 2",
    img: "img2.jpg",
    text: `
Vials swirl like storms in jars,
Each glowing bright like dying stars —
Which vial guards the cure untold?
    `.trim(),
    correct: "B",
    choices: [
      { key: "A", text: "A) Silver vial" },
      { key: "B", text: "B) Emerald vial" },
      { key: "C", text: "C) Blackened vial" }
    ],
    next: 2
  },

  {
    title: "Room 3",
    img: "img3.jpg",
    text: `
Machines convulse in sleeping shells,
A watchdog hums through metal wells —
Which name unlocks the coded door?
    `.trim(),
    correct: "A",
    choices: [
      { key: "A", text: "A) Dr. Greyson" },
      { key: "B", text: "B) Keeper of Keys" },
      { key: "C", text: "C) The Pale Engineer" }
    ],
    next: 3
  },

  {
    title: "Room 4",
    img: "img4.jpg",
    text: `
Three pulses hum beneath the floor,
The mainframe chants a rhythmic score —
How many beats will break the core?
    `.trim(),
    correct: "A",
    choices: [
      { key: "A", text: "A) Three pulses" },
      { key: "B", text: "B) Five pulses" },
      { key: "C", text: "C) Four pulses" }
    ],
    next: 4
  },

  {
    title: "Room 5",
    img: "img5.jpg",
    text: `
Wind carries sparks of sound and bone,
The moon rewinds what time has shown —
Which number frees the buried tone?
    `.trim(),
    correct: "C",
    choices: [
      { key: "A", text: "A) 18" },
      { key: "B", text: "B) 21" },
      { key: "C", text: "C) 24" }
    ],
    next: 5
  },

  {
    title: "Ending",
    img: "img6.jpg",
    text: `
The moonlight fades. The halls grow still.
Congratulations — you escaped the lab.
To be continued...
    `.trim(),
    correct: "A",
    choices: [
      { key: "A", text: "Play Again" }
    ],
    next: 0
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

  // update visuals
  mainImage.src = r.img;
  roomTitle.textContent = r.title;
  roomText.textContent = r.text;

  // remove old content
  choiceButtons.innerHTML = "";
  choiceButtons.style.textAlign = "center";

  // remove old wrong message
  if (wrongMsg) wrongMsg.remove();
  wrongMsg = null;

  // create buttons
  r.choices.forEach(choice => {
    const btn = document.createElement("button");
    btn.textContent = choice.text;
    btn.className = "choiceBtn";

    btn.style.display = "block";
    btn.style.margin = "10px auto";
    btn.style.padding = "14px 22px";
    btn.style.fontSize = "18px";
    btn.style.width = "60%";
    btn.style.borderRadius = "10px";
    btn.style.background = "#8b0000";
    btn.style.border = "2px solid #ff4a4a";
    btn.style.color = "white";
    btn.style.cursor = "pointer";

    btn.onclick = () => {
      if (choice.key === r.correct) {
        loadRoom(r.next);
      } else {
        showWrongMessage();
      }
    };

    choiceButtons.appendChild(btn);
  });

  // exit button
  exitBtn.onclick = () => {
    bgm.pause();
    bgm.currentTime = 0;
    gameContainer.classList.add("hidden");
    startScreen.classList.remove("hidden");
  };
}

// ===============================
// WRONG ANSWER FEEDBACK
// ===============================
function showWrongMessage() {
  if (wrongMsg) return;

  wrongMsg = document.createElement("p");
  wrongMsg.textContent = "❌ Wrong choice! Try again.";
  wrongMsg.style.color = "#ff3b3b";
  wrongMsg.style.textAlign = "center";
  wrongMsg.style.fontSize = "20px";
  wrongMsg.style.marginTop = "10px";
  wrongMsg.style.textShadow = "0 0 10px rgba(255,0,0,0.6)";

  choiceButtons.appendChild(wrongMsg);
}
