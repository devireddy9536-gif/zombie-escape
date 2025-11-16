// ---------------------------
// BACKSTORY + GAMEPLAY LOGIC
// ---------------------------

// UI References
const bgm = document.getElementById("bgm");

const startScreen = document.getElementById("startScreen");
const backstoryBox = document.getElementById("backstoryBox");
const commenceBtn = document.getElementById("commenceBtn");

const gameContainer = document.getElementById("gameContainer");
const mainImage = document.getElementById("mainImage");
const roomTitle = document.getElementById("roomTitle");
const roomText = document.getElementById("roomText");
const choiceButtons = document.getElementById("choiceButtons");
const exitBtn = document.getElementById("exitBtn");

// ---------------- BACKSTORY INTRO ----------------

const backstory = `
A century ago, beneath the blood-red sky,
Red Moon Village began to die.
A secret lab beneath the broken stone
Turned frightened men to flesh and bone.
The Wolfsong curse began to rise —
Now shadows live with hollow eyes.
`;

backstoryBox.textContent = backstory.trim();

// --------------- GAME ROOMS (7 TOTAL) ---------------
const rooms = [
  {
    title: "Room 1 — The Flooded Archive",
    img: "img1.jpg",
    text:
`Through shattered doors the cold wind creeps,
Where dusty echoes never sleep.
A shadow moves behind the wood —
Which path will grant you something good?`,
    choices: [
      {text:"Trace the wet footprints deeper", next:1},
      {text:"Lift a fallen ledger to read", next:2},
      {text:"Follow a distant dripping sound", next:3}
    ]
  },

  {
    title: "Room 2 — The Echoing Lab",
    img: "img2.jpg",
    text:
`Bubbling metal hums and sighs,
Glass like eyes reflects the skies.
A vial glows with sickly light —
Which lure will lead you through the night?`,
    choices: [
      {text:"Open the glowing vial", next:4},
      {text:"Smash the instruments in rage", next:5},
      {text:"Back away into the hall", next:0}
    ]
  },

  {
    title: "Room 3 — The Dormant Husk",
    img: "img3.jpg",
    text:
`In rafters where the spiders lie,
Something stirs and breathes a lie.
A door may open or remain sealed —
Which choice keeps your fate concealed?`,
    choices: [
      {text:"Kick the old door open", next:4},
      {text:"Crawl beneath the crate and wait", next:0},
      {text:"Climb up to peer through cracks", next:5}
    ]
  },

  {
    title: "Room 4 — Red Moon Valley",
    img: "img7.jpg",
    text:
`The valley bleeds a crimson light,
As zombies rise to greet the night.
Their hollow moans shake dust and bone —
Run or fight, survive alone?`,
    choices: [
      {text:"Stand and face the rising dead", next:6},
      {text:"Sprint into the blood-red fog", next:5},
      {text:"Search for higher ground", next:4}
    ]
  },

  {
    title: "Room 5 — The Shadowed Lab",
    img: "img4.jpg",
    text:
`Machines remember names and sin,
The record shows what once had been.
A drawer hides one last keycard bright —
What do you take into the night?`,
    choices: [
      {text:"Take the keycard and run", next:6},
      {text:"Read the names until you faint", next:5},
      {text:"Smear the red vial on your arm", next:7}
    ]
  },

  {
    title: "Room 6 — Zombie Ambush",
    img: "img5.jpg",
    text:
`Shadows lengthen — teeth gleam grey,
The dead recall their hunted prey.
A choice of action cracks the seam —
Which strike breaks the waking dream?`,
    choices: [
      {text:"Fight with all you have", next:6},
      {text:"Run and climb the fallen wall", next:6},
      {text:"Throw a flare to blind their sight", next:4}
    ]
  },

  {
    title: "Room 7 — Mountain Escape (Ending)",
    img: "img6.jpg",
    text:
`You climb beyond where shadows roam,
The mountain winds now call you home.
The moonlight fades; the curse undone —
Congratulations, you escaped.
To be continued…`,
    choices: [
      {text:"Play Again", next:0}
    ]
  },

  {
    title: "Room X — Consumed",
    img: "img5.jpg",
    text:
`A crimson sting, a sudden fall,
The moon devours the last one called.
All fades to hush — your story ends.
Perhaps again, where fate rescinds.`,
    choices: [
      {text:"Try Again", next:0}
    ]
  }
];

// -------------- START THE GAME --------------
commenceBtn.addEventListener("click", () => {
  bgm.currentTime = 0;
  bgm.play().catch(()=>{});

  startScreen.classList.add("hidden");
  gameContainer.classList.remove("hidden");
  loadRoom(0);
});

// -------------- LOAD ROOM LOGIC --------------
function loadRoom(i) {
  if (i < 0 || i >= rooms.length) i = 0;
  const r = rooms[i];

  mainImage.src = r.img;
  roomTitle.textContent = r.title;
  roomText.textContent = r.text;

  // Build 3 choices
  choiceButtons.innerHTML = "";
  r.choices.forEach(choice => {
    const btn = document.createElement("button");
    btn.className = "choiceBtn";
    btn.textContent = choice.text;
    btn.onclick = () => loadRoom(choice.next);
    choiceButtons.appendChild(btn);
  });

  // Exit → back to story
  exitBtn.onclick = () => {
    try { bgm.pause(); bgm.currentTime = 0; } catch(e){}
    gameContainer.classList.add("hidden");
    startScreen.classList.remove("hidden");
  };
}

// Stop music when page closes
window.addEventListener("beforeunload", () => {
  try { bgm.pause(); bgm.currentTime = 0; } catch(e){}
});
