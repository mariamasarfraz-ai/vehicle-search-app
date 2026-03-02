"use strict";

const VEHICLES = [
  { id: 1,  make: "Toyota",  model: "Corolla",   year: 2019, colour: "White",  fuel: "Petrol" },
  { id: 2,  make: "Toyota",  model: "Prius",     year: 2017, colour: "Silver", fuel: "Hybrid" },
  { id: 3,  make: "Honda",   model: "Civic",     year: 2020, colour: "Blue",   fuel: "Petrol" },
  { id: 4,  make: "Honda",   model: "CR-V",      year: 2021, colour: "Black",  fuel: "Hybrid" },
  { id: 5,  make: "Ford",    model: "Fiesta",    year: 2016, colour: "Red",    fuel: "Petrol" },
  { id: 6,  make: "Ford",    model: "Focus",     year: 2018, colour: "Grey",   fuel: "Diesel" },
  { id: 7,  make: "BMW",     model: "320i",      year: 2019, colour: "Black",  fuel: "Petrol" },
  { id: 8,  make: "BMW",     model: "X5",        year: 2022, colour: "White",  fuel: "Diesel" },
  { id: 9,  make: "Audi",    model: "A3",        year: 2018, colour: "Grey",   fuel: "Petrol" },
  { id: 10, make: "Audi",    model: "Q5",        year: 2020, colour: "Blue",   fuel: "Diesel" },
  { id: 11, make: "Tesla",   model: "Model 3",   year: 2021, colour: "White",  fuel: "Electric" },
  { id: 12, make: "Tesla",   model: "Model Y",   year: 2022, colour: "Black",  fuel: "Electric" },
  { id: 13, make: "Nissan",  model: "Leaf",      year: 2019, colour: "Green",  fuel: "Electric" },
  { id: 14, make: "Nissan",  model: "Qashqai",   year: 2017, colour: "White",  fuel: "Diesel" },
  { id: 15, make: "Hyundai", model: "i30",       year: 2018, colour: "Silver", fuel: "Petrol" },
  { id: 16, make: "Hyundai", model: "Kona",      year: 2020, colour: "Grey",   fuel: "Electric" },
  { id: 17, make: "Kia",     model: "Sportage",  year: 2021, colour: "Red",    fuel: "Hybrid" },
  { id: 18, make: "Kia",     model: "Ceed",      year: 2016, colour: "Blue",   fuel: "Petrol" },
  { id: 19, make: "Volkswagen", model: "Golf",   year: 2019, colour: "Grey",   fuel: "Diesel" },
  { id: 20, make: "Volkswagen", model: "Polo",   year: 2015, colour: "White",  fuel: "Petrol" },
  { id: 21, make: "Mercedes", model: "A180",     year: 2020, colour: "Black",  fuel: "Petrol" },
  { id: 22, make: "Peugeot", model: "208",       year: 2017, colour: "Yellow", fuel: "Petrol" }
];

const els = {
  form: document.getElementById("filtersForm"),
  q: document.getElementById("q"),
  make: document.getElementById("make"),
  fuel: document.getElementById("fuel"),
  colour: document.getElementById("colour"),
  yearMin: document.getElementById("yearMin"),
  yearMax: document.getElementById("yearMax"),
  sort: document.getElementById("sort"),
  resetBtn: document.getElementById("resetBtn"),
  results: document.getElementById("results"),
  status: document.getElementById("status"),
  empty: document.getElementById("emptyState"),
  chips: document.getElementById("activeChips"),
  dialog: document.getElementById("vehicleDialog"),
  dialogBody: document.getElementById("dialogBody"),
  dialogTitle: document.getElementById("dialogTitle"),
  closeDialogBtn: document.getElementById("closeDialogBtn"),
  backdrop: document.getElementById("dialogBackdrop"),
};

let lastFocusedElement = null;

function uniqSorted(values) {
  return [...new Set(values)].sort((a, b) => String(a).localeCompare(String(b)));
}
function normalise(text) {
  return String(text ?? "").trim().toLowerCase();
}
function parseYear(val) {
    if (val ===""  || val == null) return null;
  const n = Number(val);
  return Number.isFinite(n) ? n : null;
}
function matchesQuery(vehicle, q) {
  if (!q) return true;
  const hay = [vehicle.make, vehicle.model, vehicle.colour, vehicle.fuel, vehicle.year].join(" ");
  return normalise(hay).includes(normalise(q));
}
function sortVehicles(list, sortKey) {
  const copy = [...list];
  switch (sortKey) {
    case "yearDesc": return copy.sort((a, b) => b.year - a.year);
    case "yearAsc": return copy.sort((a, b) => a.year - b.year);
    case "makeAsc": return copy.sort((a, b) => a.make.localeCompare(b.make));
    case "modelAsc": return copy.sort((a, b) => a.model.localeCompare(b.model));
    default: return copy;
  }
}
function activeFilters(state) {
  const items = [];
  if (state.q) items.push({ key: "q", label: `Search: ${state.q}` });
  if (state.make) items.push({ key: "make", label: `Make: ${state.make}` });
  if (state.fuel) items.push({ key: "fuel", label: `Fuel: ${state.fuel}` });
  if (state.colour) items.push({ key: "colour", label: `Colour: ${state.colour}` });
  if (state.yearMin != null) items.push({ key: "yearMin", label: `From: ${state.yearMin}` });
  if (state.yearMax != null) items.push({ key: "yearMax", label: `To: ${state.yearMax}` });
  return items;
}

function renderChips(state) {
  els.chips.innerHTML = "";
  const items = activeFilters(state);

  if (items.length === 0) {
    const span = document.createElement("span");
    span.className = "muted";
    span.textContent = "No active filters.";
    els.chips.appendChild(span);
    return;
  }

  for (const item of items) {
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.innerHTML = `<span>${item.label}</span>`;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.setAttribute("aria-label", `Remove filter: ${item.label}`);
    btn.textContent = "×";
    btn.addEventListener("click", () => {
      if (item.key === "q") els.q.value = "";
      if (item.key === "make") els.make.value = "";
      if (item.key === "fuel") els.fuel.value = "";
      if (item.key === "colour") els.colour.value = "";
      if (item.key === "yearMin") els.yearMin.value = "";
      if (item.key === "yearMax") els.yearMax.value = "";
      update();
    });

    chip.appendChild(btn);
    els.chips.appendChild(chip);
  }
}

function vehicleCard(vehicle) {
  const li = document.createElement("li");
  li.className = "card";

  const title = document.createElement("h3");
  title.textContent = `${vehicle.make} ${vehicle.model}`;

  const meta = document.createElement("div");
  meta.className = "meta";
  meta.innerHTML = `
    <span class="badge">Year: ${vehicle.year}</span>
    <span class="badge">Colour: ${vehicle.colour}</span>
    <span class="badge">Fuel: ${vehicle.fuel}</span>
  `;

  const actions = document.createElement("div");
  actions.className = "card-actions";

  const detailsBtn = document.createElement("button");
  detailsBtn.type = "button";
  detailsBtn.textContent = "View details";
  detailsBtn.addEventListener("click", () => openDialog(vehicle));

  const saveBtn = document.createElement("button");
  saveBtn.type = "button";
  saveBtn.className = "secondary";
  saveBtn.setAttribute("aria-pressed", "false");
  saveBtn.textContent = "Save";
  saveBtn.addEventListener("click", () => {
    const pressed = saveBtn.getAttribute("aria-pressed") === "true";
    saveBtn.setAttribute("aria-pressed", String(!pressed));
    saveBtn.textContent = !pressed ? "Saved" : "Save";
  });

  actions.append(detailsBtn, saveBtn);
  li.append(title, meta, actions);
  return li;
}

function renderResults(list, state) {
  els.results.innerHTML = "";
  els.status.textContent = `${list.length} vehicle${list.length === 1 ? "" : "s"} found.`;
  renderChips(state);

  if (list.length === 0) {
    els.empty.hidden = false;
    return;
  }
  els.empty.hidden = true;

  for (const v of list) els.results.appendChild(vehicleCard(v));
}

function openDialog(vehicle) {
  lastFocusedElement = document.activeElement;
  els.dialogTitle.textContent = `${vehicle.make} ${vehicle.model} (${vehicle.year})`;
  els.dialogBody.innerHTML = `
    <p><strong>Make:</strong> ${vehicle.make}</p>
    <p><strong>Model:</strong> ${vehicle.model}</p>
    <p><strong>Year:</strong> ${vehicle.year}</p>
    <p><strong>Colour:</strong> ${vehicle.colour}</p>
    <p><strong>Fuel type:</strong> ${vehicle.fuel}</p>
    <hr />
    <p class="muted">Tip: press <kbd>Esc</kbd> to close.</p>
  `;
  els.backdrop.hidden = false;
  els.dialog.showModal();
  els.closeDialogBtn.focus();
}
function closeDialog() {
  if (els.dialog.open) els.dialog.close();
  els.backdrop.hidden = true;
  if (lastFocusedElement && typeof lastFocusedElement.focus === "function") lastFocusedElement.focus();
}

els.closeDialogBtn.addEventListener("click", closeDialog);
els.backdrop.addEventListener("click", closeDialog);
els.dialog.addEventListener("cancel", (e) => {
  e.preventDefault();
  closeDialog();
});

function getStateFromInputs() {
  return {
    q: els.q.value.trim(),
    make: els.make.value,
    fuel: els.fuel.value,
    colour: els.colour.value,
    yearMin: parseYear(els.yearMin.value),
    yearMax: parseYear(els.yearMax.value),
    sort: els.sort.value
  };
}
function filterVehicles(state) {
  let list = VEHICLES.filter(v => {
    if (!matchesQuery(v, state.q)) return false;
    if (state.make && v.make !== state.make) return false;
    if (state.fuel && v.fuel !== state.fuel) return false;
    if (state.colour && v.colour !== state.colour) return false;
    if (state.yearMin != null && v.year < state.yearMin) return false;
    if (state.yearMax != null && v.year > state.yearMax) return false;
    return true;
  });
  return sortVehicles(list, state.sort);
}
function update() {
  const state = getStateFromInputs();
  const results = filterVehicles(state);
  renderResults(results, state);
}
function populateDropdowns() {
  for (const m of uniqSorted(VEHICLES.map(v => v.make))) {
    const opt = document.createElement("option");
    opt.value = m;
    opt.textContent = m;
    els.make.appendChild(opt);
  }
  for (const c of uniqSorted(VEHICLES.map(v => v.colour))) {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    els.colour.appendChild(opt);
  }
}
function resetAll() {
  els.form.reset();
  els.q.value = "";
  els.make.value = "";
  els.fuel.value = "";
  els.colour.value = "";
  els.yearMin.value = "";
  els.yearMax.value = "";
  els.sort.value = "relevance";
  update();
}

els.form.addEventListener("input", update);
els.form.addEventListener("change", update);
els.resetBtn.addEventListener("click", resetAll);

populateDropdowns();
update();