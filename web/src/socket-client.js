/**
 * socket-client.js — WebSocket 客户端
 *
 * 连接到后端 ws://HOST:PORT，接收 ticker_state 推送。
 * 支持自动重连，客户端 100ms 插值平滑金额。
 */

const WS_URL = `ws://${location.host}`;
let ws = null;
let reconnectTimer = null;
let reconnectDelay = 1000;
const MAX_RECONNECT_DELAY = 30000;

// 当前状态缓存
let _lastSalary = null;
let _lastMascot = null;

// 回调注册
let _onUpdate = null;

/** @param {(payload: {salary,mascot}) => void} fn */
export function connectTickerSocket(fn) {
  _onUpdate = fn;
  _connect();
}

function _connect() {
  if (ws) {
    try { ws.close(); } catch (_) { /* ignore */ }
  }

  ws = new WebSocket(WS_URL);

  ws.onopen = () => {
    console.log("[ws] connected");
    reconnectDelay = 1000;
    if (reconnectTimer) clearTimeout(reconnectTimer);
  };

  ws.onmessage = (e) => {
    try {
      const payload = JSON.parse(e.data);
      if (payload.type === "ticker_state") {
        _lastSalary = payload.salary;
        _lastMascot = payload.mascot;
        if (_onUpdate) _onUpdate(payload);
      }
    } catch (err) {
      console.warn("[ws] parse error:", err);
    }
  };

  ws.onclose = () => {
    console.log("[ws] disconnected, reconnecting in", reconnectDelay, "ms");
    reconnectTimer = setTimeout(() => {
      _connect();
      reconnectDelay = Math.min(reconnectDelay * 2, MAX_RECONNECT_DELAY);
    }, reconnectDelay);
  };

  ws.onerror = () => {
    // close 事件会处理重连
  };
}

/** 获取最近一次 salary */
export function getLastSalary() {
  return _lastSalary;
}

/** 发送工资配置到后端 */
export function sendConfig(cfg) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: "config", ...cfg }));
  }
}
