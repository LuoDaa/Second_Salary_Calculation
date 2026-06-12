/**
 * 工资计算引擎 —— 纯纯的数字计算，不碰 DOM / 动画 / 状态机
 * 输入 config → 输出 { earnedToday, perSecond, progress, phase, … }
 */

function parseTodayTime(timeText) {
  const [hour, minute] = timeText.split(":").map(Number);
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d;
}

function getWorkDays(mode) {
  if (mode === "single") return 26;
  if (mode === "none") return 30;
  return 22; // double
}

function isWorkday(date, mode) {
  const day = date.getDay();
  if (mode === "none") return true;
  if (mode === "single") return day !== 0;
  return day !== 0 && day !== 6; // Mon-Fri
}

/**
 * @param {object} config
 * @param {number} config.monthSalary  税后月薪
 * @param {string} config.startTime    "09:00"
 * @param {string} config.endTime      "18:00"
 * @param {string} config.restMode     "double" | "single" | "none"
 * @returns {object} salaryState
 */
function calcSalaryState(config) {
  const now = new Date();

  const start = parseTodayTime(config.startTime || "09:00");
  const end = parseTodayTime(config.endTime || "18:00");

  const workDays = getWorkDays(config.restMode || "double");
  const dailySeconds = Math.max((end - start) / 1000, 1);
  const perSecond = Number(config.monthSalary || 0) / workDays / dailySeconds;

  const todayIsWorkday = isWorkday(now, config.restMode || "double");

  let elapsedSeconds = 0;
  let phase = "off";

  if (!todayIsWorkday) {
    phase = "holiday";
  } else if (now < start) {
    phase = "before_work";
  } else if (now >= start && now <= end) {
    phase = "working";
    elapsedSeconds = (now - start) / 1000;
  } else {
    // 下班后
    phase = "after_work";
    elapsedSeconds = dailySeconds;
    // 检查是否为工作日但已下班
    if (todayIsWorkday) {
      phase = "overtime"; // 还在公司就是加班模式
    }
  }

  const progress = Math.min(100, Math.max(0, elapsedSeconds / dailySeconds * 100));
  const earnedToday = elapsedSeconds * perSecond;

  // 月度预估
  const dayOfMonth = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const workDaysPassed = Math.round(workDays * (dayOfMonth / daysInMonth));
  const workDaysLeft = Math.max(0, workDays - workDaysPassed);
  const monthEarned = earnedToday + (perSecond * 3600 * 8) * Math.max(0, workDaysPassed - 1); // naive

  return {
    now: now.toISOString(),
    phase,
    isWorking: phase === "working",
    isOvertime: phase === "overtime",
    isWeekend: !todayIsWorkday,
    earnedToday,
    perSecond,
    perMinute: perSecond * 60,
    perHour: perSecond * 3600,
    dailyTarget: perSecond * dailySeconds,
    progress,
    elapsedSeconds,
    dailySeconds,
    monthSalary: config.monthSalary,
    workDays,
    workDaysLeft,
  };
}

module.exports = { calcSalaryState, getWorkDays, isWorkday };
