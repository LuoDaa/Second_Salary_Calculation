/**
 * mascot-state-engine.js
 *
 * 根据 salary 状态计算出 mascot 情绪 + 触发器列表。
 * 后端不参与动画细节，只输出状态和触发器。
 * 前端收到后播放对应动画。
 */

/* ── Trigger cooldown ── */
const cooldownMap = new Map();

function canTrigger(name, cooldownMs) {
  const now = Date.now();
  const last = cooldownMap.get(name) || 0;
  if (now - last < cooldownMs) return false;
  cooldownMap.set(name, now);
  return true;
}

/* ── Mood 计算 ── */
function calcMood(salary) {
  const phase = salary.phase;

  if (phase === "overtime") return 12;
  if (phase === "holiday" || phase === "weekend") return 75;
  if (phase === "off" || phase === "after_work") return 68;
  if (phase === "before_work") return 48;

  // working
  const p = salary.progress || 0;
  if (p >= 90) return 95;
  if (p >= 70) return 76;
  if (p >= 40) return 60;
  if (p <= 10) return 38;
  return 50;
}

/* ── Mascot 状态主函数 ── */
function getMascotState(salary) {
  const triggers = [];

  if (canTrigger("blink", 4800)) {
    triggers.push("blink");
  }

  // coin_pop: 挣钱节奏
  if (salary.phase === "working" && canTrigger("coin", 2500)) {
    triggers.push("coin");
  }

  // rest_eye: 每 50 分钟提醒休息
  const elapsedMin = Math.floor((salary.elapsedSeconds || 0) / 60);
  if (
    salary.phase === "working" &&
    elapsedMin > 0 &&
    elapsedMin % 50 === 0 &&
    canTrigger("rest", 30 * 60 * 1000) // 冷却 30 分钟
  ) {
    triggers.push("rest");
  }

  // happy: 快下班
  if (
    salary.phase === "working" &&
    salary.progress >= 90 &&
    canTrigger("happy", 10 * 60 * 1000)
  ) {
    triggers.push("happy");
  }

  // slack: 加班摸鱼
  if (salary.phase === "overtime" && canTrigger("slack", 90 * 1000)) {
    triggers.push("slack");
  }

  return {
    isWorking: salary.phase === "working",
    isOvertime: salary.phase === "overtime",
    mood: calcMood(salary),
    state: salary.phase,
    progress: salary.progress,
    triggers,
  };
}

/* ── 初始状态（未开始前）── */
function getInitialMascotState() {
  return {
    isWorking: false,
    isOvertime: false,
    mood: 50,
    state: "idle",
    progress: 0,
    triggers: [],
  };
}

module.exports = { getMascotState, getInitialMascotState };
