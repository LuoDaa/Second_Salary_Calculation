/**
 * cow-spine.js — WorkCow 角色控制器
 *
 * 优先加载 Spine 骨骼动画（/assets/spine/work-cow/）。
 * 若 Spine 加载失败，回退至静态 PNG（/assets/spine/work-cow/work-cow-fallback.png）。
 *
 * API:
 *   load()                  → 加载资产
 *   playBase(name)          → 切换循环动画 (idle|typing|overtime)
 *   playOnce(name)          → 播放一次性动画 (coin_pop|rest_eye|happy|slack)
 *   applyState(payload)     → 根据后端 mascot 状态自动切换
 */

import { Assets, Container, Graphics, Sprite } from "pixi.js";

const BASE_ANIMS = ["idle", "typing", "overtime"];
const ONCE_ANIMS = ["coin_pop", "rest_eye", "happy", "slack", "blink"];

export class WorkCow {
  /** @param {import('pixi.js').Application} app */
  constructor(app) {
    this.app = app;
    this.container = new Container();
    this.spine = null;         // Spine 实例
    this.fallbackSprite = null; // 静态 PNG Sprite
    this.fallbackGlow = null;
    this.fallbackCoins = [];
    this.fallbackBaseScale = 1;
    this.currentBase = "idle";
    this.isSpineReady = false;
    this.lastTriggerAt = {};
    this.motionTime = 0;
    this.onceMotion = null;
    this.tickerFn = (ticker) => this._tick(ticker.deltaTime / 60);
  }

  // ── 加载 ──
  async load() {
    try {
      await this._loadSpine();
      this.isSpineReady = true;
      console.log("[cow] Spine loaded successfully");
      return;
    } catch (e) {
      console.warn("[cow] Spine load failed, using PNG fallback:", e.message);
    }

    await this._loadFallback();
    this.isSpineReady = false;
    console.log("[cow] PNG fallback loaded");
  }

  async _loadSpine() {
    const meta = await fetch("/assets/spine/work-cow/work-cow.json", { cache: "no-store" }).then((r) => r.json());
    if (meta?.skeleton?.hash === "placeholder-for-designer") {
      throw new Error("placeholder Spine skeleton, waiting for production Spine export");
    }

    const { Spine } = await import("@esotericsoftware/spine-pixi-v8");

    await Assets.load([
      { alias: "workCowData", src: "/assets/spine/work-cow/work-cow.json" },
      { alias: "workCowAtlas", src: "/assets/spine/work-cow/work-cow.atlas" },
    ]);

    this.spine = Spine.from({
      skeleton: "workCowData",
      atlas: "workCowAtlas",
    });

    this.spine.state.setAnimation(0, "idle", true);
    this.container.addChild(this.spine);
  }

  async _loadFallback() {
    const tex = await Assets.load("/assets/spine/work-cow/work-cow-fallback-v2.png");
    this.fallbackGlow = new Graphics()
      .ellipse(0, 0, 190, 72)
      .fill({ color: 0x7cffb2, alpha: 0.12 });
    this.fallbackGlow.y = -74;
    this.container.addChild(this.fallbackGlow);

    this.fallbackSprite = new Sprite(tex);
    this.fallbackSprite.anchor.set(0.5, 1);
    this.container.addChild(this.fallbackSprite);
  }

  // ── 挂载到舞台 ──
  mount() {
    this.app.stage.addChild(this.container);
    this.app.ticker.add(this.tickerFn);
    this._resize();
    window.addEventListener("resize", () => this._resize());
  }

  _resize() {
    const w = this.app.screen.width;
    const h = this.app.screen.height;

    if (this.isSpineReady && this.spine) {
      this.spine.x = w / 2;
      this.spine.y = h * 0.88;
      this.spine.scale.set(0.58);
    } else if (this.fallbackSprite) {
      this.fallbackSprite.x = w / 2;
      this.fallbackSprite.y = h;
      const sw = Math.min(w * 0.88 / this.fallbackSprite.texture.width, h * 0.95 / this.fallbackSprite.texture.height);
      this.fallbackBaseScale = sw;
      this.fallbackSprite.scale.set(sw);
      if (this.fallbackGlow) {
        this.fallbackGlow.x = w / 2;
        this.fallbackGlow.y = h * 0.86;
        this.fallbackGlow.scale.set(Math.max(0.75, sw * 1.45));
      }
    }
  }

  // ── 切换循环动画 ──
  playBase(name) {
    if (!BASE_ANIMS.includes(name)) return;
    if (this.currentBase === name) return;

    this.currentBase = name;

    if (this.isSpineReady && this.spine) {
      this.spine.state.setAnimation(0, name, true);
    }
  }

  // ── 一次性动画 ──
  playOnce(name) {
    if (!ONCE_ANIMS.includes(name)) return;
    if (this.isSpineReady && this.spine) {
      this.spine.state.setAnimation(1, name, false);
      this.spine.state.addEmptyAnimation(1, 0.25, 0);
      return;
    }
    this.onceMotion = { name, t: 0 };
    if (name === "coin_pop" || name === "happy") this._spawnFallbackCoin();
  }

  // ── 根据后端状态切换 ──
  applyState(mascot) {
    if (!mascot) return;

    // 选择 base 循环
    if (mascot.isOvertime) {
      this.playBase("overtime");
    } else if (mascot.isWorking) {
      this.playBase("typing");
    } else {
      this.playBase("idle");
    }

    // 触发一次性动画（带冷却）
    for (const trigger of mascot.triggers || []) {
      this._fire(trigger);
    }
  }

  _fire(trigger) {
    const map = {
      coin: "coin_pop",
      rest: "rest_eye",
      happy: "happy",
      slack: "slack",
      blink: "blink",
    };
    const anim = map[trigger];
    if (!anim) return;

    const now = Date.now();
    const last = this.lastTriggerAt[trigger] || 0;
    if (now - last < 600) return; // 前端也加一层冷却

    this.lastTriggerAt[trigger] = now;
    this.playOnce(anim);
  }

  _tick(dt) {
    if (this.isSpineReady || !this.fallbackSprite) return;

    this.motionTime += dt;
    const t = this.motionTime;
    const base = this.currentBase;

    let bob = Math.sin(t * 2.1) * 4;
    let rot = Math.sin(t * 1.35) * 0.012;
    let scaleX = 1;
    let scaleY = 1;
    let tint = 0xffffff;

    if (base === "typing") {
      bob = Math.sin(t * 8.6) * 2.6 + Math.sin(t * 2.2) * 2.2;
      rot = Math.sin(t * 5.4) * 0.01;
      scaleX = 1 + Math.sin(t * 8.6) * 0.004;
      scaleY = 1 - Math.sin(t * 8.6) * 0.004;
    } else if (base === "overtime") {
      bob = Math.sin(t * 1.2) * 1.5;
      rot = Math.sin(t * 0.9) * 0.006;
      tint = 0xffd4d4;
    }

    if (this.onceMotion) {
      this.onceMotion.t += dt;
      const p = Math.min(1, this.onceMotion.t / 0.72);
      const punch = Math.sin(p * Math.PI);
      if (this.onceMotion.name === "happy" || this.onceMotion.name === "coin_pop") {
        bob -= punch * 18;
        scaleX += punch * 0.035;
        scaleY += punch * 0.035;
      } else if (this.onceMotion.name === "rest_eye" || this.onceMotion.name === "slack") {
        rot += punch * 0.035;
        scaleY -= punch * 0.018;
      } else if (this.onceMotion.name === "blink") {
        scaleY -= punch * 0.012;
      }
      if (p >= 1) this.onceMotion = null;
    }

    const baseScale = this.fallbackBaseScale;
    this.fallbackSprite.y = this.app.screen.height + bob;
    this.fallbackSprite.rotation = rot;
    this.fallbackSprite.scale.set(baseScale * scaleX, baseScale * scaleY);
    this.fallbackSprite.tint = tint;

    if (this.fallbackGlow) {
      this.fallbackGlow.alpha = base === "overtime" ? 0.2 + Math.sin(t * 2) * 0.06 : 0.1 + Math.sin(t * 1.8) * 0.035;
      this.fallbackGlow.tint = base === "overtime" ? 0xff6565 : 0x7cffb2;
    }

    this._tickFallbackCoins(dt);
  }

  _spawnFallbackCoin() {
    const coin = new Graphics()
      .circle(0, 0, 10)
      .fill({ color: 0xf7c948, alpha: 1 })
      .circle(-3, -3, 3)
      .fill({ color: 0xfff2a3, alpha: 0.75 });
    coin.x = this.app.screen.width * 0.58;
    coin.y = this.app.screen.height * 0.62;
    coin.life = 0;
    this.fallbackCoins.push(coin);
    this.container.addChild(coin);
  }

  _tickFallbackCoins(dt) {
    for (let i = this.fallbackCoins.length - 1; i >= 0; i--) {
      const coin = this.fallbackCoins[i];
      coin.life += dt;
      coin.y -= 72 * dt;
      coin.x += Math.sin(coin.life * 8) * 0.8;
      coin.rotation += 7 * dt;
      coin.alpha = Math.max(0, 1 - coin.life / 1.1);
      if (coin.life >= 1.1) {
        this.fallbackCoins.splice(i, 1);
        coin.destroy();
      }
    }
  }

  destroy() {
    this.app.ticker.remove(this.tickerFn);
    if (this.spine) this.spine.destroy();
    this.container.destroy({ children: true });
  }
}
