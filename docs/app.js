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
  skillMetric: document.querySelector("#metric-skills"),
  toast: document.querySelector("#toast"),
};

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
  toastTimer = setTimeout(() => elements.toast.classList.remove("visible"), 2200);
}

function activePresetId(analysis) {
  return presets.find((preset) =>
    preset.members.length === analysis.selectedIds.length &&
    preset.members.every((id) => analysis.selectedSet.has(id)))?.id;
}

function renderPresets(analysis) {
  const activeId = activePresetId(analysis);
  elements.presets.innerHTML = presets.map((preset) => `
    <button class="preset-button${activeId === preset.id ? " active" : ""}" type="button" data-preset="${preset.id}" aria-pressed="${activeId === preset.id}">
      <span>${escapeHtml(preset.name)}</span><small>${preset.members.length}</small>
    </button>
  `).join("");
}

function renderCompanions(analysis) {
  const needle = state.query.trim().toLocaleLowerCase();
  const visible = companions.filter((companion) => {
    if (!needle) return true;
    const searchable = [
      companion.name,
      companion.objections,
      ...companion.skills.map((id) => skillById.get(id)?.name ?? id),
    ].join(" ").toLocaleLowerCase();
    return searchable.includes(needle);
  });

  elements.searchStatus.textContent = needle ? `${visible.length} of ${companions.length} companions shown` : "";
  if (visible.length === 0) {
    elements.grid.innerHTML = '<div class="empty-search">No companion matches that search.</div>';
    return;
  }

  elements.grid.innerHTML = visible.map((companion) => {
    const selected = analysis.selectedSet.has(companion.id);
    const status = analysis.statuses[companion.id];
    return `
      <article class="companion-card${selected ? " selected" : ""} status-${status}" data-companion="${companion.id}">
        <div class="card-top">
          <div>
            <div class="companion-name">${escapeHtml(companion.name)}</div>
            <div class="companion-meta">
              <span class="tag">${companion.cost} denars</span>
              ${companion.noble ? '<span class="tag noble">Noble</span>' : ""}
            </div>
          </div>
          <button class="select-box" type="button" data-select="${companion.id}" aria-pressed="${selected}" aria-label="${selected ? "Remove" : "Add"} ${escapeHtml(companion.name)}">${selected ? "✓" : "+"}</button>
        </div>
        <div class="card-skills">${companion.skills.map((id) => `<span class="skill-pill">${escapeHtml(skillById.get(id)?.name ?? id)}</span>`).join("")}</div>
        <div class="card-relations">
          <div class="likes"><span>Likes</span><strong>${companion.likes.map(companionName).join(", ")}</strong></div>
          <div class="dislikes"><span>Dislikes</span><strong>${companion.dislikes.map(companionName).join(", ")}</strong></div>
        </div>
        <p class="objection"><strong>Objects to:</strong> ${escapeHtml(companion.objections)}</p>
      </article>
    `;
  }).join("");
}

function relationshipMarkup(records, emptyMessage) {
  if (records.length === 0) return `<div class="empty-state">${emptyMessage}</div>`;
  return records.map((record) => `
    <div class="relationship-row">
      <strong>${record.names.map(escapeHtml).join(" × ")}</strong>
      <span>${record.reasons.map(escapeHtml).join(" · ")}</span>
    </div>
  `).join("");
}

function renderRelationships(analysis) {
  elements.conflictCount.textContent = analysis.conflicts.length;
  elements.harmonyCount.textContent = analysis.affinities.length;
  elements.conflictList.innerHTML = relationshipMarkup(analysis.conflicts, "No clashes in the current selection.");
  elements.harmonyList.innerHTML = relationshipMarkup(analysis.affinities, "Add companions to reveal positive ties.");
}

function renderSkills(analysis) {
  const visibleSkills = state.relevantOnly ? skills.filter(({ partyRelevant }) => partyRelevant) : skills;
  elements.skillGrid.innerHTML = visibleSkills.map((skill) => {
    const providers = analysis.selected.filter((companion) => companion.skills.includes(skill.id));
    return `
      <article class="skill-card">
        <h4>${escapeHtml(skill.name)}</h4>
        <small>${skill.type} · ${skill.attribute}</small>
        <div class="skill-providers${providers.length === 0 ? " missing" : ""}">${providers.length ? providers.map(({ name }) => escapeHtml(name)).join(", ") : "Not covered"}</div>
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

function exportParty() {
  const analysis = analyzeParty(state.selected);
  if (analysis.selected.length === 0) return;
  const blob = new Blob([buildExportText(analysis)], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "warband-companion-party.txt";
  link.click();
  URL.revokeObjectURL(url);
  showToast("Party plan exported");
}

elements.grid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-select]");
  if (button) toggleCompanion(button.dataset.select);
});

elements.presets.addEventListener("click", (event) => {
  const button = event.target.closest("[data-preset]");
  if (!button) return;
  state.selected = new Set(selectionFromPreset(button.dataset.preset));
  render();
  showToast(`${button.textContent.trim().replace(/\d+$/, "").trim()} loaded`);
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

const dataProblems = validateData();
if (dataProblems.length > 0) {
  console.error("Invalid recovered dataset:", dataProblems);
  showToast("The companion dataset could not be loaded safely.");
} else {
  render();
}
