// Core config
const GRID_SIZE = 5;
const BINGO_STORAGE_KEY = "cc_bingo_state_v2";
const ROUTE_STORAGE_KEY = "cc_route_state_v1";
const ROLES_STORAGE_KEY = "cc_roles_state_v1";
const LEADERBOARD_STORAGE_KEY = "cc_leaderboard_state_v1";

// Bingo items
const bingoItems = [
    [
        "Take a shot of fernet",
        "Take a selfie at the Li Po sign",
        "Let someone else pick your drink",
        "Take a group photo where everyone is Spiderman",
        "Teach a stranger a dance move",
    ],
    [
        "Get someone's business card",
        "Make someone outside the group laugh",
        "Do a Connor-style blind wine tasting, film it, and send it in the group chat",
        "Participate in karaoke",
        "Get the bar to sing happy birthday",
    ],
    [
        "Say 'Where's the chicken?' in a bar",
        "Order a drink in a fake accent",
        "FREE SPACE",
        "Play rock paper scissors with a stranger",
        "High-five someone not in your group",
    ],
    [
        "Leave an above-average tip",
        "Collect >5 coasters",
        "Play thumb war with a stranger",
        "Share one fun fact about the bar",
        "Take a before/after group photo",
    ],
    [
        "Tell a joke to someone and make them laugh",
        "Trade a secret with a stranger",
        "Take a selfie with the bartender",
        "Ask the bartender for their favorite drink and order it",
        "Take a final-bar group photo",
    ],
    ];

// Route config
const routeConfig = [
  {
    id: "li_po",
    name: "Li Po Lounge",
    meta: "Chinatown - dive / legendary cocktails",
    note: "Classic chaos starter. If you burn this, you earned the drink.",
  },
  {
    id: "vesuvio",
    name: "Vesuvio Cafe",
    meta: "Jack Kerouac Alley - beat / bohemian",
    note: "Great early or middle bar. Easy to cross paths with other hunters here.",
  },
  {
    id: "maggies",
    name: "Maggie's",
    meta: "North Beach - loud / sports / locals",
    note: "Easy place to lose people or accidentally sink too much time.",
  },
  {
    id: "tupelo",
    name: "Tupelo",
    meta: "North Beach - live music / blues-rock energy",
    note: "Solid mid-to-late stop; easy to burn if you arrive at the wrong time.",
  },
  {
    id: "legacy",
    name: "Legacy",
    meta: "North Beach - bar / lounge",
    note: "Good mid-route bar if you need a reset without killing momentum.",
  },
  {
    id: "april_jean",
    name: "April Jean",
    meta: "North Beach - newer spot / cocktails",
    note: "Nice wildcard choice; good place for Migs to hide in plain sight.",
  },
  {
    id: "devils_acre",
    name: "Devil's Acre",
    meta: "Columbus - Victorian apothecary",
    note: "Strong early bar; hints from here are extra confusing.",
  },
  {
    id: "lucky_spot",
    name: "The Lucky Spot",
    meta: "North Beach - small, chaotic energy",
    note: "If you burn this bar, it probably burns you right back.",
  },
  {
    id: "saloon",
    name: "The Saloon",
    meta: "North Beach - oldest bar / live blues",
    note: "Good late-night chaos. Finding Migs here feels cinematic.",
  },
];


// Role list
const rolesList = [
  "Lead Chicken",
  "Barnkeeper",
  "Oracle",
  "Archivist",
  "Saboteur",
  "Bard",
  "Timekeeper",
];

// ---------- State helpers ----------

function defaultBingoState() {
  const checked = Array.from({ length: GRID_SIZE }, () =>
    Array(GRID_SIZE).fill(false)
  );
  // Center free space
  checked[2][2] = true;
  return {
    playerName: "",
    checked,
  };
}

function loadBingoState() {
  try {
    const raw = localStorage.getItem(BINGO_STORAGE_KEY);
    if (!raw) return defaultBingoState();
    const parsed = JSON.parse(raw);
    if (!parsed.checked || parsed.checked.length !== GRID_SIZE) {
      parsed.checked = defaultBingoState().checked;
    }
    if (typeof parsed.playerName !== "string") parsed.playerName = "";
    return parsed;
  } catch {
    return defaultBingoState();
  }
}

function saveBingoState(state) {
  localStorage.setItem(BINGO_STORAGE_KEY, JSON.stringify(state));
}

function loadRouteState() {
  try {
    const raw = localStorage.getItem(ROUTE_STORAGE_KEY);
    if (!raw) {
      return routeConfig.reduce((acc, route) => {
        acc[route.id] = false;
        return acc;
      }, {});
    }
    const parsed = JSON.parse(raw);
    routeConfig.forEach((r) => {
      if (parsed[r.id] === undefined) parsed[r.id] = false;
    });
    return parsed;
  } catch {
    return routeConfig.reduce((acc, route) => {
      acc[route.id] = false;
      return acc;
    }, {});
  }
}

function saveRouteState(state) {
  localStorage.setItem(ROUTE_STORAGE_KEY, JSON.stringify(state));
}

function loadRolesState() {
  try {
    const raw = localStorage.getItem(ROLES_STORAGE_KEY);
    if (!raw) {
      return {
        participantsRaw: "",
        assignments: [],
      };
    }
    const parsed = JSON.parse(raw);
    if (!parsed.assignments) parsed.assignments = [];
    if (typeof parsed.participantsRaw !== "string") {
      parsed.participantsRaw = "";
    }
    return parsed;
  } catch {
    return {
      participantsRaw: "",
      assignments: [],
    };
  }
}

function saveRolesState(state) {
  localStorage.setItem(ROLES_STORAGE_KEY, JSON.stringify(state));
}

function loadLeaderboardState() {
  try {
    const raw = localStorage.getItem(LEADERBOARD_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function saveLeaderboardState(state) {
  localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(state));
}

// ---------- Bingo logic ----------

function countChecked(checked) {
  let c = 0;
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (checked[r][col]) c++;
    }
  }
  return c;
}

function checkBingo(checked) {
  // rows
  for (let r = 0; r < GRID_SIZE; r++) {
    if (checked[r].every((v) => v)) return true;
  }
  // columns
  for (let c = 0; c < GRID_SIZE; c++) {
    let full = true;
    for (let r = 0; r < GRID_SIZE; r++) {
      if (!checked[r][c]) {
        full = false;
        break;
      }
    }
    if (full) return true;
  }
  // diagonals
  let diag1 = true;
  let diag2 = true;
  for (let i = 0; i < GRID_SIZE; i++) {
    if (!checked[i][i]) diag1 = false;
    if (!checked[i][GRID_SIZE - 1 - i]) diag2 = false;
  }
  return diag1 || diag2;
}

// ---------- UI setup ----------

document.addEventListener("DOMContentLoaded", () => {
  setupTabs();
  setupBingo();
  setupRoute();
  setupRoles();
  setupHost();
});

// Tabs
function setupTabs() {
  const buttons = document.querySelectorAll(".nav-btn");
  const tabs = document.querySelectorAll(".tab");

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.tab;
      buttons.forEach((b) => b.classList.remove("active"));
      tabs.forEach((tab) => tab.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(target).classList.add("active");
    });
  });
}

// Bingo
function setupBingo() {
  const bingoState = loadBingoState();
  const gridEl = document.getElementById("bingoGrid");
  const statusEl = document.getElementById("statusMessage");
  const nameInput = document.getElementById("playerName");
  const resetButton = document.getElementById("resetButton");
  const claimBingoButton = document.getElementById("claimBingoButton");

  // Populate name
  if (bingoState.playerName) {
    nameInput.value = bingoState.playerName;
  }
  nameInput.addEventListener("input", () => {
    bingoState.playerName = nameInput.value.trim();
    saveBingoState(bingoState);
  });

  // Build grid
  gridEl.innerHTML = "";
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const tile = document.createElement("button");
      tile.classList.add("bingo-tile");
      if (row === 2 && col === 2) {
        tile.classList.add("free");
      }

      const text = bingoItems[row][col];
      tile.dataset.row = row;
      tile.dataset.col = col;
      tile.innerHTML = `<span>${text}</span>`;

      if (bingoState.checked[row][col]) {
        tile.classList.add("checked");
      }

      tile.addEventListener("click", () => {
        toggleTile(tile, bingoState, statusEl);
      });

      gridEl.appendChild(tile);
    }
  }

  updateStatus(bingoState, statusEl);

  resetButton.addEventListener("click", () => {
    const fresh = defaultBingoState();
    fresh.playerName = bingoState.playerName; // preserve name
    saveBingoState(fresh);
    setupBingo();
  });

  claimBingoButton.addEventListener("click", () => {
    const name = bingoState.playerName || "Unnamed";
    const hasBingo = checkBingo(bingoState.checked);
    if (!hasBingo) {
      statusEl.textContent =
        "You have not completed a full row, column, or diagonal yet.";
      statusEl.classList.remove("success");
      statusEl.classList.add("warning");
      return;
    }
    // Log locally on this device as well
    logBingoToLocalLeaderboard(name);
    statusEl.textContent = "Bingo logged. Flex on the group.";
    statusEl.classList.remove("warning");
    statusEl.classList.add("success");
    // Also rebuild host view in case it's the same device
    renderLeaderboard();
  });
}

function toggleTile(tile, state, statusEl) {
  const row = Number(tile.dataset.row);
  const col = Number(tile.dataset.col);
  const isFree = row === 2 && col === 2;

  if (!isFree) {
    state.checked[row][col] = !state.checked[row][col];
  }
  tile.classList.toggle("checked", state.checked[row][col]);
  saveBingoState(state);
  updateStatus(state, statusEl);
}

function updateStatus(state, statusEl) {
  const hasBingo = checkBingo(state.checked);
  if (hasBingo) {
    statusEl.textContent = "Bingo achieved. Hit the button to log it.";
    statusEl.classList.remove("warning");
    statusEl.classList.add("success");
  } else {
    const count = countChecked(state.checked);
    statusEl.textContent = `Tiles checked: ${count} / 25`;
    statusEl.classList.remove("success");
    statusEl.classList.remove("warning");
  }
}

// Route
function setupRoute() {
  const routeState = loadRouteState();
  const routeListEl = document.getElementById("routeList");
  routeListEl.innerHTML = "";

  routeConfig.forEach((route) => {
    const card = document.createElement("div");
    card.classList.add("route-item");

    const header = document.createElement("div");
    header.classList.add("route-header");

    const nameSpan = document.createElement("div");
    nameSpan.classList.add("route-name");
    nameSpan.textContent = route.name;

    const metaSpan = document.createElement("div");
    metaSpan.classList.add("route-meta");
    metaSpan.textContent = route.meta;

    header.appendChild(nameSpan);
    header.appendChild(metaSpan);

    const toggleRow = document.createElement("label");
    toggleRow.classList.add("route-toggle");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = !!routeState[route.id];

    const toggleText = document.createElement("span");
    toggleText.textContent = checkbox.checked ? "Visited" : "Not yet";

    checkbox.addEventListener("change", () => {
      routeState[route.id] = checkbox.checked;
      toggleText.textContent = checkbox.checked ? "Visited" : "Not yet";
      saveRouteState(routeState);
    });

    toggleRow.appendChild(checkbox);
    toggleRow.appendChild(toggleText);

    const notes = document.createElement("div");
    notes.classList.add("route-notes");
    notes.textContent = route.note;

    card.appendChild(header);
    card.appendChild(toggleRow);
    card.appendChild(notes);

    routeListEl.appendChild(card);
  });
}

// Roles
function setupRoles() {
  const rolesState = loadRolesState();
  const textarea = document.getElementById("participantNames");
  const randomizeBtn = document.getElementById("randomizeRolesButton");
  const clearBtn = document.getElementById("clearRolesButton");
  const resultEl = document.getElementById("rolesResult");

  if (rolesState.participantsRaw) {
    textarea.value = rolesState.participantsRaw;
  }
  renderRolesResult(rolesState.assignments, resultEl);

  textarea.addEventListener("input", () => {
    rolesState.participantsRaw = textarea.value;
    saveRolesState(rolesState);
  });

  randomizeBtn.addEventListener("click", () => {
    const participants = parseParticipants(textarea.value);
    if (participants.length === 0) {
      resultEl.textContent = "Add at least one name to assign roles.";
      return;
    }
    rolesState.assignments = assignRoles(participants);
    saveRolesState(rolesState);
    renderRolesResult(rolesState.assignments, resultEl);
  });

  clearBtn.addEventListener("click", () => {
    rolesState.participantsRaw = "";
    rolesState.assignments = [];
    saveRolesState(rolesState);
    textarea.value = "";
    renderRolesResult([], resultEl);
  });
}

function parseParticipants(raw) {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function assignRoles(participants) {
  // Shuffle roles
  const rolesShuffled = [...rolesList];
  for (let i = rolesShuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rolesShuffled[i], rolesShuffled[j]] = [rolesShuffled[j], rolesShuffled[i]];
  }

  const assignments = [];
  for (let i = 0; i < participants.length; i++) {
    const role = rolesShuffled[i % rolesShuffled.length];
    assignments.push({ name: participants[i], role });
  }
  return assignments;
}

function renderRolesResult(assignments, container) {
  container.innerHTML = "";
  if (!assignments || assignments.length === 0) {
    container.textContent = "No roles assigned yet.";
    return;
  }
  assignments.forEach((a) => {
    const row = document.createElement("div");
    row.classList.add("role-row");

    const nameSpan = document.createElement("span");
    nameSpan.classList.add("role-row-name");
    nameSpan.textContent = a.name;

    const roleSpan = document.createElement("span");
    roleSpan.classList.add("role-row-role");
    roleSpan.textContent = a.role;

    row.appendChild(nameSpan);
    row.appendChild(roleSpan);
    container.appendChild(row);
  });
}

// Host / leaderboard
function setupHost() {
  const hostNameInput = document.getElementById("hostPlayerName");
  const logButton = document.getElementById("hostLogBingoButton");
  const clearButton = document.getElementById("hostClearLeaderboardButton");

  logButton.addEventListener("click", () => {
    const name = hostNameInput.value.trim();
    if (!name) return;
    logBingoToLocalLeaderboard(name);
    hostNameInput.value = "";
    renderLeaderboard();
  });

  clearButton.addEventListener("click", () => {
    saveLeaderboardState([]);
    renderLeaderboard();
  });

  renderLeaderboard();
}

function logBingoToLocalLeaderboard(name) {
  const leaderboard = loadLeaderboardState();
  const now = new Date();
  leaderboard.push({
    name,
    timestamp: now.toISOString(),
  });
  // sort by time
  leaderboard.sort((a, b) =>
    a.timestamp < b.timestamp ? -1 : a.timestamp > b.timestamp ? 1 : 0
  );
  saveLeaderboardState(leaderboard);
}

function renderLeaderboard() {
  const leaderboard = loadLeaderboardState();
  const container = document.getElementById("leaderboardBody");
  if (!container) return;
  container.innerHTML = "";
  if (leaderboard.length === 0) {
    container.textContent = "No Bingos logged yet.";
    return;
  }
  leaderboard.forEach((entry, index) => {
    const row = document.createElement("div");
    row.classList.add("leaderboard-row");

    const nameSpan = document.createElement("span");
    nameSpan.classList.add("leaderboard-name");
    nameSpan.textContent = `${index + 1}. ${entry.name}`;

    const timeSpan = document.createElement("span");
    timeSpan.classList.add("leaderboard-time");
    const t = new Date(entry.timestamp);
    const timeStr = t.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    timeSpan.textContent = timeStr;

    row.appendChild(nameSpan);
    row.appendChild(timeSpan);
    container.appendChild(row);
  });
}

