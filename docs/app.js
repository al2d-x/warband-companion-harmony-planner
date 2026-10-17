import { companions, presets, skills } from "./data.js";
import { analyzeParty, buildExportText, companionName, selectionFromPreset, validateData } from "./logic.js";

const state = {
  selected: new Set(),
  query: "",
  relevantOnly: true,
};

const elements = {
  grid: document.querySelector("#companion-grid"),
  presets: document.querySelector("#preset-list"),
  selectedCount: document.querySelector("#selected-count"),
  search: document.querySelector("#search"),
  searchStatus: document.querySelector("#search-status"),
  clear: document.querySelector("#clear-button"),
  export: document.querySelector("#export-button"),
  relevantToggle: document.querySelector("#relevant-toggle"),
  skillGrid: document.querySelector("#skill-grid"),
  conflictList: document.querySelector("#conflict-list"),
  harmonyList: document.querySelector("#harmony-list"),
  conflictCount: document.querySelector("#conflict-count"),
  harmonyCount: document.querySelector("#harmony-count"),
  partyMetric: document.querySelector("#metric-party"),
  costMetric: document.querySelector("#metric-cost"),
  conflictMetric: document.querySelector("#metric-conflicts"),
  nobleMetric: document.querySelector("#metric-nobles"),
  skillMetric: document.querySelector("#metric-skills"),
  aboutButton: document.querySelector("#about-button"),
  aboutDialog: document.querySelector("#about-dialog"),
  companionDialog: document.querySelector("#companion-dialog"),
  companionDialogContent: document.querySelector("#companion-dialog-content"),
  toast: document.querySelector("#toast"),
};

const companionById = new Map(companions.map((companion) => [companion.id, companion]));
const skillById = new Map(skills.map((skill) => [skill.id, skill]));
let toastTimer;

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => elements.toast.classList.remove("visible"), 1800);
}

function activePresetId(analysis) {
  return presets.find((preset) =>
    preset.members.length === analysis.selectedIds.length &&
    preset.members.every((id) => analysis.selectedSet.has(id)))?.id;
}

function renderPresets(analysis) {
  const activeId = activePresetId(analysis);
  elements.presets.innerHTML = presets.map((preset) => {
    const shortName = preset.name.replace(/^Party\s+/i, "");
    return `
      <button class="preset-button${activeId === preset.id ? " active" : ""}" type="button"
        data-preset="${preset.id}" aria-pressed="${activeId === preset.id}"
        aria-label="Load ${escapeHtml(preset.name)}" title="Load ${escapeHtml(preset.name)}">
        <span>${escapeHtml(shortName)}</span><small>${preset.members.length}</small>
      </button>
    `;
  }).join("");
}

function renderCompanions(analysis) {
  const needle = state.query.trim().toLocaleLowerCase();
  const visible = companions.filter((companion) => {
    if (!needle) return true;
    return [
      companion.name,
      companion.objections,
      ...companion.skills.map((id) => skillById.get(id)?.name ?? id),
    ].join(" ").toLocaleLowerCase().includes(needle);
  });

  elements.searchStatus.textContent = needle ? `${visible.length} of ${companions.length}` : `${companions.length} total`;

  if (visible.length === 0) {
    elements.grid.innerHTML = '<div class="empty-search">No companion matches that search.</div>';
    return;
  }

  elements.grid.innerHTML = visible.map((companion) => {
    const selected = analysis.selectedSet.has(companion.id);
    const status = analysis.statuses[companion.id];
    const statusLabel = status === "conflict" ? "conflicts with current party" : status === "harmony" ? "has a friend in current party" : "neutral";
    return `
      <article class="companion-card${selected ? " selected" : ""} status-${status}"
        data-select="${companion.id}" role="checkbox" tabindex="0" aria-checked="${selected}"
        aria-label="${selected ? "Remove" : "Add"} ${escapeHtml(companion.name)}; ${statusLabel}">
        <div class="companion-name">${escapeHtml(companion.name)}</div>
        <div class="companion-meta">
          <span>${companion.cost} denars</span>
          ${companion.noble ? '<span class="noble">Noble</span>' : ""}
        </div>
        <div class="card-skills">${companion.skills.map((id) => `<span class="skill-pill">${escapeHtml(skillById.get(id)?.name ?? id)}</span>`).join("")}</div>
        <div class="card-relations">
          <div class="likes"><span>Likes </span><strong>${companion.likes.map(companionName).join(", ")}</strong></div>
          <div class="dislikes"><span>Avoids </span><strong>${companion.dislikes.map(companionName).join(", ")}</strong></div>
        </div>
        <button class="details-button" type="button" data-details="${companion.id}" aria-label="Details for ${escapeHtml(companion.name)}" title="Details">i</button>
      </article>
    `;
  }).join("");
}

function relationshipMarkup(records, emptyMessage) {
  if (records.length === 0) return `<div class="empty-state">${emptyMessage}</div>`;
  return records.map((record) => `
    <div class="relationship-row" title="${escapeHtml(record.reasons.join("; "))}">
      <strong>${record.names.map(escapeHtml).join(" × ")}</strong>
      <span>${record.reasons.map(escapeHtml).join(" · ")}</span>
    </div>
  `).join("");
}

function renderRelationships(analysis) {
  elements.conflictCount.textContent = analysis.conflicts.length;
  elements.harmonyCount.textContent = analysis.affinities.length;
  elements.conflictList.innerHTML = relationshipMarkup(analysis.conflicts, "No clashes.");
  elements.harmonyList.innerHTML = relationshipMarkup(analysis.affinities, "No positive ties yet.");
}

function renderSkills(analysis) {
  const visibleSkills = state.relevantOnly ? skills.filter(({ partyRelevant }) => partyRelevant) : skills;
  elements.skillGrid.innerHTML = visibleSkills.map((skill) => {
    const providers = analysis.selected.filter((companion) => companion.skills.includes(skill.id));
    const providerNames = providers.map(({ name }) => escapeHtml(name)).join(", ");
    return `
      <article class="skill-card" title="${providerNames || "Not covered"}">
        <h4>${escapeHtml(skill.name)}</h4>
        <small>${skill.type} · ${skill.attribute}</small>
        <div class="skill-providers${providers.length === 0 ? " missing" : ""}">${providerNames || "Not covered"}</div>
      </article>
    `;
  }).join("");
}

function renderMetrics(analysis) {
  const countLabel = analysis.selected.length === 1 ? "companion" : "companions";
  elements.selectedCount.textContent = `${analysis.selected.length} ${countLabel}`;
  elements.partyMetric.textContent = `${analysis.selected.length} / ${companions.length}`;
  elements.costMetric.textContent = `${analysis.totalCost.toLocaleString("en-US")} denars`;
  elements.conflictMetric.textContent = String(analysis.conflicts.length);
  elements.nobleMetric.textContent = String(analysis.nobleCount);
  elements.skillMetric.textContent = `${analysis.coveredRelevantSkillCount} / ${analysis.relevantSkillCount}`;
  elements.clear.disabled = analysis.selected.length === 0;
  elements.export.disabled = analysis.selected.length === 0;
}

function render() {
  const analysis = analyzeParty(state.selected);
  renderMetrics(analysis);
  renderPresets(analysis);
  renderCompanions(analysis);
  renderRelationships(analysis);
  renderSkills(analysis);
}

function toggleCompanion(id) {
  if (state.selected.has(id)) state.selected.delete(id);
  else state.selected.add(id);
  render();
}

function openCompanionDetails(id) {
  const companion = companionById.get(id);
  if (!companion) return;
  elements.companionDialogContent.innerHTML = `
    <p class="eyebrow">Companion details</p>
    <h2>${escapeHtml(companion.name)}</h2>
    <div class="modal-meta">
      <span class="modal-tag">${companion.cost} denars</span>
      <span class="modal-tag">${companion.noble ? "Noble" : "Commoner"}</span>
    </div>
    <h3>Starting skills</h3>
    <div class="card-skills">${companion.skills.map((id) => `<span class="skill-pill">${escapeHtml(skillById.get(id)?.name ?? id)}</span>`).join("")}</div>
    <div class="modal-relations">
      <div class="likes"><span>Likes</span><strong>${companion.likes.map(companionName).join(", ")}</strong></div>
      <div class="dislikes"><span>Dislikes</span><strong>${companion.dislikes.map(companionName).join(", ")}</strong></div>
    </div>
    <h3>Objects to</h3>
    <p>${escapeHtml(companion.objections)}</p>
  `;
  elements.companionDialog.showModal();
}

function exportParty() {
  const analysis = analyzeParty(state.selected);
  if (analysis.selected.length === 0) return;
  const blob = new Blob([buildExportText(analysis)], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "warband-companion-party.txt";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
  showToast("Party plan exported");
}

elements.grid.addEventListener("click", (event) => {
  const detailsButton = event.target.closest("[data-details]");
  if (detailsButton) {
    event.stopPropagation();
    openCompanionDetails(detailsButton.dataset.details);
    return;
  }
  const card = event.target.closest("[data-select]");
  if (card) toggleCompanion(card.dataset.select);
});

elements.grid.addEventListener("keydown", (event) => {
  if (event.target.closest("[data-details]")) return;
  const card = event.target.closest("[data-select]");
  if (card && (event.key === "Enter" || event.key === " ")) {
    event.preventDefault();
    toggleCompanion(card.dataset.select);
  }
});

elements.presets.addEventListener("click", (event) => {
  const button = event.target.closest("[data-preset]");
  if (!button) return;
  state.selected = new Set(selectionFromPreset(button.dataset.preset));
  render();
  showToast(`Party ${button.textContent.trim()} loaded`);
});

elements.search.addEventListener("input", (event) => {
  state.query = event.target.value;
  renderCompanions(analyzeParty(state.selected));
});

elements.clear.addEventListener("click", () => {
  state.selected.clear();
  render();
});

elements.export.addEventListener("click", exportParty);
elements.relevantToggle.addEventListener("change", (event) => {
  state.relevantOnly = event.target.checked;
  renderSkills(analyzeParty(state.selected));
});
elements.aboutButton.addEventListener("click", () => elements.aboutDialog.showModal());

for (const dialog of [elements.aboutDialog, elements.companionDialog]) {
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
}

const dataProblems = validateData();
if (dataProblems.length > 0) {
  console.error("Invalid recovered dataset:", dataProblems);
  showToast("The companion dataset could not be loaded safely.");
} else {
  render();
}
