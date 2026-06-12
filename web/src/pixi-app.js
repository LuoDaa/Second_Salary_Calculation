/**
 * pixi-app.js — PixiJS 画布初始化
 *
 * 在 #cowTheater 容器内创建透明背景的 PixiJS Application。
 * 返回 app 实例供 cow-spine.js 挂载 Spine。
 */

import { Application } from "pixi.js";

/** @returns {Promise<Application>} */
export async function createPixiApp(container) {
  const app = new Application();

  await app.init({
    resizeTo: container,
    backgroundAlpha: 0,
    antialias: true,
    autoDensity: true,
    resolution: Math.min(window.devicePixelRatio || 1, 2),
  });

  container.appendChild(app.canvas);
  return app;
}
