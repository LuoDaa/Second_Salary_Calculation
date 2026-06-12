/**
 * main.js — 前端入口
 *
 * 初始化顺序:
 *   1. PixiJS 画布
 *   2. WorkCow 角色
 *   3. WebSocket 连接
 *   4. UI 状态循环
 */

import { createPixiApp } from "./pixi-app.js";
import { WorkCow } from "./cow-spine.js";
import { connectTickerSocket, sendConfig } from "./socket-client.js";
import { updateTickerUI } from "./ticker-ui.js";

/** @type {WorkCow|null} */
let cow = null;

async function main() {
  const theater = document.querySelector("#cowTheater");
  if (!theater) {
    console.error("[main] #cowTheater not found");
    return;
  }

  // 1. PixiJS
  const app = await createPixiApp(theater);

  // 2. WorkCow
  cow = new WorkCow(app);
  await cow.load();
  cow.mount();

  // 3. WebSocket
  connectTickerSocket((payload) => {
    updateTickerUI(payload.salary);
    cow.applyState(payload.mascot);
  });

  // 4. 挂载 sendConfig 到 window（供旧按钮调用）
  window.sendConfig = () => {
    const monthSalary = Number(document.getElementById("salary")?.value) || 20000;
    const startTime = document.getElementById("startTime")?.value || "09:00";
    const endTime = document.getElementById("endTime")?.value || "18:00";
    const restMode = document.querySelector('input[name="restDay"]:checked')?.value || "double";
    sendConfig({ monthSalary, startTime, endTime, restMode });
  };

  console.log("[main] ready");
}

document.addEventListener("DOMContentLoaded", main);
