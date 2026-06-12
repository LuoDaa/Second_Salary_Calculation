/**
 * money-effects.js — 金币 / 金额动效
 *
 * 纯 CSS / DOM 特效，不由 Spine 控制。
 */

/** 弹出 +¥x.xx 气泡 */
export function spawnMoneyPop(container, amount) {
  const el = document.createElement("div");
  el.className = "money-pop";
  el.textContent = "+¥" + amount.toFixed(2);

  container.appendChild(el);

  requestAnimationFrame(() => {
    el.classList.add("show");
  });

  setTimeout(() => {
    el.remove();
  }, 1200);
}

/** 触发里程碑 Toast */
export function showMilestoneToast(text) {
  const existing = document.querySelector(".milestone-toast");
  if (existing) existing.remove();

  const el = document.createElement("div");
  el.className = "milestone-toast";
  el.innerHTML = `<span>🎉</span><span>${text}</span>`;

  document.body.appendChild(el);

  requestAnimationFrame(() => {
    el.classList.add("show");
  });

  setTimeout(() => {
    el.classList.remove("show");
    setTimeout(() => el.remove(), 400);
  }, 2500);
}
