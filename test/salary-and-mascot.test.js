const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const { calcSalaryState } = require("../server/salary-engine");
const { getMascotState } = require("../server/mascot-state-engine");

test("salary engine returns numeric ticker state", () => {
  const state = calcSalaryState({
    monthSalary: 22000,
    startTime: "09:00",
    endTime: "18:00",
    restMode: "double",
  });

  assert.equal(typeof state.earnedToday, "number");
  assert.equal(typeof state.perSecond, "number");
  assert.equal(typeof state.progress, "number");
  assert.ok(state.dailySeconds > 0);
  assert.ok(["holiday", "before_work", "working", "overtime"].includes(state.phase));
});

test("mascot state exposes production animation triggers", () => {
  const mascot = getMascotState({
    phase: "working",
    progress: 55,
    elapsedSeconds: 3600,
  });

  assert.equal(mascot.isWorking, true);
  assert.equal(mascot.isOvertime, false);
  assert.equal(typeof mascot.mood, "number");
  assert.ok(Array.isArray(mascot.triggers));
  for (const trigger of mascot.triggers) {
    assert.ok(["blink", "coin", "rest", "happy", "slack"].includes(trigger));
  }
});

test("placeholder Spine skeleton is explicitly detectable", () => {
  const jsonPath = path.join(__dirname, "..", "assets", "spine", "work-cow", "work-cow.json");
  const skeleton = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

  assert.equal(skeleton.skeleton.hash, "placeholder-for-designer");
  assert.ok(fs.existsSync(path.join(__dirname, "..", "assets", "spine", "work-cow", "work-cow-fallback-v2.png")));
});
