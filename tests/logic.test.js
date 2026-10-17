import assert from "node:assert/strict";
import test from "node:test";

import { companions, presets, skills } from "../docs/data.js";
import { analyzeParty, buildExportText, selectionFromPreset, validateData } from "../docs/logic.js";

test("recovered data is internally consistent", () => {
  assert.equal(companions.length, 16);
  assert.equal(skills.length, 24);
  assert.deepEqual(validateData(), []);
});

test("all four original presets contain eight unique, conflict-free companions", () => {
  for (const preset of presets) {
    const analysis = analyzeParty(preset.members);
    assert.equal(analysis.selected.length, 8, preset.name);
    assert.equal(new Set(preset.members).size, 8, preset.name);
    assert.equal(analysis.conflicts.length, 0, preset.name);
  }
});

test("preset costs match the recovered application", () => {
  const expected = { a: 2500, b: 2200, c: 1100, d: 800 };
  for (const preset of presets) assert.equal(analyzeParty(selectionFromPreset(preset.id)).totalCost, expected[preset.id]);
});

test("Klethi contributes Path-finding despite the original spelling bug", () => {
  assert.equal(analyzeParty(["klethi"]).skillCounts.pathfinding, 1);
});

test("conflict takes precedence over harmony", () => {
  const result = analyzeParty(["deshavi", "klethi", "borcha"]);
  assert.equal(result.statuses.deshavi, "conflict");
  assert.equal(result.statuses.klethi, "conflict");
  assert.equal(result.conflicts.length, 2);
});

test("mutual likes form one harmony pair", () => {
  const result = analyzeParty(["deshavi", "klethi"]);
  assert.equal(result.affinities.length, 1);
  assert.equal(result.conflicts.length, 0);
  assert.equal(result.statuses.deshavi, "harmony");
  assert.equal(result.statuses.klethi, "harmony");
});

test("analysis is order-independent and removes duplicate selections", () => {
  const first = analyzeParty(["rolf", "baheshtur", "rolf"]);
  const second = analyzeParty(["baheshtur", "rolf"]);
  assert.deepEqual(first.selectedIds, second.selectedIds);
  assert.deepEqual(first.conflicts, second.conflicts);
  assert.deepEqual(first.affinities, second.affinities);
  assert.equal(first.selected.length, 2);
});

test("export identifies providers using skill labels", () => {
  const text = buildExportText(analyzeParty(["klethi", "jeremus"]));
  assert.match(text, /Path-finding: Klethi/);
  assert.match(text, /Surgery: Jeremus/);
  assert.doesNotMatch(text, /undefined/);
});
