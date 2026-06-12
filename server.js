/**
 * 打工牛服务端
 * Express 静态文件 + WebSocket 实时状态推送
 *
 * 架构：
 *   salary-engine.js   → 工资计算（纯数字）
 *   mascot-state-engine.js → 小牛状态判断（Trigger / Mood）
 *   WebSocket          → 每 1s 推送完整状态给所有客户端
 */

const path = require("path");
const express = require("express");
const http = require("http");
const { WebSocketServer } = require("ws");

const { calcSalaryState } = require("./server/salary-engine");
const { getMascotState, getInitialMascotState } = require("./server/mascot-state-engine");

const PORT = Number(process.env.PORT || 8996);
const HOST = "0.0.0.0";

// ── Express 静态服务 ──

const app = express();
app.use(express.json());

// 禁用缓存，确保每次刷新拿到最新文件
app.use((req, res, next) => {
  res.set({
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
    "Pragma": "no-cache",
    "Expires": "0",
    "Surrogate-Control": "no-store",
  });
  next();
});

app.get("/", (req, res) => {
  res.redirect(302, "/web/index.html");
});

app.get("/web", (req, res) => {
  res.redirect(301, "/web/");
});

app.get("/web/", (req, res) => {
  res.redirect(302, "/web/index.html");
});

// 所有文件走静态目录（web/src、assets、pet.html 等）
app.use(express.static(path.join(__dirname)));

// ES module imports: /node_modules/xxx → node_modules/xxx
app.use("/node_modules", express.static(path.join(__dirname, "node_modules")));

// ── HTTP Server ──

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// ── 全局配置（所有客户端共享）──

let config = {
  monthSalary: 0,
  startTime: "09:00",
  endTime: "18:00",
  restMode: "double",
};

// ── WebSocket 连接管理 ──

wss.on("connection", (ws, req) => {
  const ip = req.socket.remoteAddress || "unknown";
  console.log(`[ws] client connected: ${ip}`);

  // 立即推送当前状态
  const payload = buildPayload();
  ws.send(JSON.stringify(payload));

  // 客户端发来的配置更新
  ws.on("message", (raw) => {
    try {
      const msg = JSON.parse(raw.toString());
      if (msg.type === "config") {
        config = {
          monthSalary: Number(msg.monthSalary) || config.monthSalary,
          startTime: msg.startTime || config.startTime,
          endTime: msg.endTime || config.endTime,
          restMode: msg.restMode || config.restMode,
        };
        console.log("[ws] config updated:", config);
      }
    } catch (e) {
      console.warn("[ws] invalid message:", raw.toString());
    }
  });

  ws.on("close", () => {
    console.log(`[ws] client disconnected: ${ip}`);
  });
});

// ── 状态构建 ──

function buildPayload() {
  const salary = calcSalaryState(config);
  const mascot = getMascotState(salary);
  return {
    type: "ticker_state",
    salary,
    mascot,
  };
}

// ── 定时广播（1s 一次，金额平滑交给前端）──

function broadcast() {
  const payload = buildPayload();
  const raw = JSON.stringify(payload);

  for (const client of wss.clients) {
    if (client.readyState === 1) {
      client.send(raw);
    }
  }
}

setInterval(broadcast, 1000);

// ── 启动 ──

server.listen(PORT, HOST, () => {
  console.log(`┌─────────────────────────────────────────┐`);
  console.log(`│  🐮 打工牛 · 实时工资计算器             │`);
  console.log(`│  HTTP + WS: http://${HOST}:${PORT}                │`);
  console.log(`│  Press Ctrl+C to stop                    │`);
  console.log(`└─────────────────────────────────────────┘`);
});
