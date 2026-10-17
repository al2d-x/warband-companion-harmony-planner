import { companions, presets, skills } from "./data.js";

const companionById = new Map(companions.map((companion) => [companion.id, companion]));
const skillById = new Map(skills.map((skill) => [skill.id, skill]));

export function companionName(id) {
  return companionById.get(id)?.name ?? id;
}

export function selectionFromPreset(presetId) {
  const preset = presets.find((entry) => entry.id === presetId);
  return preset ? [...preset.members] : [];
}

function orderedSelection(selectedIds) {
  const wanted = new Set(selectedIds);
  return companions.filter(({ id }) => wanted.has(id));
}

function relationshipBetween(left, right) {
  const reasons = [];
  if (left.dislikes.includes(right.id)) reasons.push(`${left.name} dislikes ${right.name}`);
  if (right.dislikes.includes(left.id)) reasons.push(`${right.name} dislikes ${left.name}`);

  if (reasons.length > 0) return { type: "conflict", reasons };

  const affinities = [];
  if (left.likes.includes(right.id)) affinities.push(`${left.name} likes ${right.name}`);
  if (right.likes.includes(left.id)) affinities.push(`${right.name} likes ${left.name}`);
  return affinities.length > 0 ? { type: "harmony", reasons: affinities } : null;
}

export function analyzeParty(selectedIds = []) {
  const selected = orderedSelection(selectedIds);
  const selectedSet = new Set(selected.map(({ id }) => id));
  const skillCounts = Object.fromEntries(skills.map(({ id }) => [id, 0]));
  const conflicts = [];
  const affinities = [];

  for (const companion of selected) {
    for (const skillId of companion.skills) skillCounts[skillId] += 1;
  }

  for (let leftIndex = 0; leftIndex < selected.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < selected.length; rightIndex += 1) {
      const left = selected[leftIndex];
      const right = selected[rightIndex];
      const relationship = relationshipBetween(left, right);
      if (!relationship) continue;
      const record = { ids: [left.id, right.id], names: [left.name, right.name], reasons: relationship.reasons };
      if (relationship.type === "conflict") conflicts.push(record);
      else affinities.push(record);
    }
  }

  const statuses = Object.fromEntries(companions.map((candidate) => {
    let hasHarmony = false;
    let hasConflict = false;

    for (const member of selected) {
      if (candidate.id === member.id) continue;
      const relationship = relationshipBetween(candidate, member);
      if (relationship?.type === "conflict") hasConflict = true;
      if (relationship?.type === "harmony") hasHarmony = true;
    }

    return [candidate.id, hasConflict ? "conflict" : hasHarmony ? "harmony" : "neutral"];
  }));

  const relevantSkills = skills.filter(({ partyRelevant }) => partyRelevant);

  return {
    selected,
    selectedIds: selected.map(({ id }) => id),
    selectedSet,
    skillCounts,
    conflicts,
    affinities,
    statuses,
    totalCost: selected.reduce((sum, { cost }) => sum + cost, 0),
    nobleCount: selected.filter(({ noble }) => noble).length,
    coveredSkillCount: skills.filter(({ id }) => skillCounts[id] > 0).length,
    coveredRelevantSkillCount: relevantSkills.filter(({ id }) => skillCounts[id] > 0).length,
    relevantSkillCount: relevantSkills.length,
  };
}

export function buildExportText(analysis) {
  const lines = [
    "Warband Companion Harmony Planner",
    "==================================",
    "",
    `Companions (${analysis.selected.length}): ${analysis.selected.map(({ name }) => name).join(", ") || "None"}`,
    `Recruitment cost: ${analysis.totalCost} denars`,
    `Nobles: ${analysis.nobleCount}`,
    `Conflicts: ${analysis.conflicts.length}`,
    "",
    "Skill coverage:",
  ];

  for (const skill of skills) {
    const providers = analysis.selected.filter((companion) => companion.skills.includes(skill.id));
    if (providers.length > 0) lines.push(`- ${skill.name}: ${providers.map(({ name }) => name).join(", ")}`);
  }

  lines.push("", "Conflicts:");
  if (analysis.conflicts.length === 0) lines.push("- None");
  else analysis.conflicts.forEach((conflict) => lines.push(`- ${conflict.names.join(" / ")}: ${conflict.reasons.join("; ")}`));

  lines.push("", "Generated locally; no party data was transmitted.");
  return `${lines.join("\n")}\n`;
}

export function validateData() {
  const problems = [];
  const companionIds = new Set(companions.map(({ id }) => id));
  const skillIds = new Set(skills.map(({ id }) => id));

  if (companionIds.size !== companions.length) problems.push("Companion IDs must be unique.");
  if (skillIds.size !== skills.length) problems.push("Skill IDs must be unique.");

  for (const companion of companions) {
    for (const relatedId of [...companion.likes, ...companion.dislikes]) {
      if (!companionIds.has(relatedId)) problems.push(`${companion.name} references unknown companion ${relatedId}.`);
    }
    for (const skillId of companion.skills) {
      if (!skillById.has(skillId)) problems.push(`${companion.name} references unknown skill ${skillId}.`);
    }
  }

  for (const preset of presets) {
    if (new Set(preset.members).size !== preset.members.length) problems.push(`${preset.name} contains duplicate members.`);
    for (const memberId of preset.members) {
      if (!companionIds.has(memberId)) problems.push(`${preset.name} references unknown companion ${memberId}.`);
    }
  }

  return problems;
}
