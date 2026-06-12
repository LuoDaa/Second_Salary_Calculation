/**
 * ticker-ui.js — 金额面板 UI 更新
 *
 * 接收后端 salary 数据，驱动 DOM 更新。
 * 使用 requestAnimationFrame 做客户端平滑插值。
 */

import { spawnMoneyPop } from "./money-effects.js";

// DOM 缓存
const els = {};
const $ = (id) => {
  if (!els[id]) els[id] = document.getElementById(id);
  return els[id];
};

// 插值状态
let displayedEarned = 0;
let lastServerEarned = 0;
let lastServerTime = 0;
let lastPerSecond = 0;
let rafId = null;

/** 格式化金额 (¥xxx.xxxx) */
function fmt(val) {
  return "¥" + val.toFixed(4);
}

/** 更新所有 UI */
export function updateTickerUI(salary) {
  if (!salary) return;

  // 记录服务端值用于插值
  lastServerEarned = salary.earnedToday || 0;
  lastServerTime = performance.now();
  lastPerSecond = salary.perSecond || 0;

  // 启动 RAF 平滑循环
  if (!rafId) {
    _smoothLoop();
  }

  // 非插值字段直接更新
  const ps = salary.perSecond || 0;
  $("valPerSecond") && ($("valPerSecond").textContent = fmt(ps));
  $("valPerMinute") && ($("valPerMinute").textContent = fmt(ps * 60));
  $("valPerHour") && ($("valPerHour").textContent = fmt(ps * 3600));
  $("valMonth") && ($("valMonth").textContent = "¥" + (salary.monthSalary || 0).toLocaleString());

  // 进度条
  const pct = Math.min((salary.progress || 0), 100);
  $("progressFill") && ($("progressFill").style.width = pct + "%");
  $("progressPct") && ($("progressPct").textContent = pct.toFixed(1) + "%");

  // 状态标签
  $("phaseBadge") && ($("phaseBadge").textContent = _phaseLabel(salary.phase));

  // 计时器
  if (salary.elapsedSeconds !== undefined) {
    const h = Math.floor(salary.elapsedSeconds / 3600);
    const m = Math.floor((salary.elapsedSeconds % 3600) / 60);
    const s = Math.floor(salary.elapsedSeconds % 60);
    $("elapsedTime") && ($("elapsedTime").textContent =
      String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0"));
  }

  // Coin pop effect
  if (salary.earnedToday !== undefined && displayedEarned > 0) {
    const diff = salary.earnedToday - displayedEarned;
    if (diff > 0.05) {
      const container = $("tickerPanel");
      if (container) spawnMoneyPop(container, diff);
    }
  }
}

function _smoothLoop() {
  rafId = requestAnimationFrame(_smoothLoop);

  const now = performance.now();
  const dt = (now - lastServerTime) / 1000; // seconds since last server push
  const target = lastServerEarned + dt * lastPerSecond;
  displayedEarned += (target - displayedEarned) * 0.22;

  const el = $("valEarned");
  if (el) el.textContent = fmt(displayedEarned);
}

function _phaseLabel(phase) {
  const map = {
    before_work: "⏳ 上班前",
    working: "💼 工作中",
    overtime: "🌙 加班中",
    holiday: "🎉 假期",
    after_work: "🏠 已下班",
  };
  return map[phase] || phase || "—";
}

/** 停止平滑循环 */
export function stopSmooth() {
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  displayedEarned = 0;
}
