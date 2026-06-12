# 03｜Spine 绑定、动画与导出规范

项目：打工牛 · 实时工资计算器  
角色：打工牛 996 号  
前端运行环境：PixiJS + `@esotericsoftware/spine-pixi-v8`  
最终放置目录：`assets/spine/work-cow/`

---

## 1. 最终必须交付的 3 个运行时文件

请最终导出以下三个文件，文件名必须完全一致：

```text
assets/spine/work-cow/
├── work-cow.json
├── work-cow.atlas
└── work-cow.png
```

代码会按这个路径自动加载。  
不要改名，不要放子目录。

---

## 2. Spine 工程源文件

除运行时文件外，请额外交付源工程：

```text
work-cow.spine
```

源工程用于后续修改动画，不直接放入前端运行目录。

---

## 3. 骨骼结构

推荐骨骼结构：

```text
root
└── body
    ├── chest
    │   ├── neck
    │   │   └── head
    │   │       ├── eye_L
    │   │       ├── eye_R
    │   │       ├── eyelid_L
    │   │       ├── eyelid_R
    │   │       ├── ear_L
    │   │       ├── ear_R
    │   │       ├── horn_L
    │   │       └── horn_R
    │   │
    │   ├── arm_L_upper
    │   │   └── arm_L_forearm
    │   │       └── hand_L
    │   │
    │   ├── arm_R_upper
    │   │   └── arm_R_forearm
    │   │       └── hand_R
    │   │
    │   └── tie
    │
    ├── keyboard
    ├── monitor
    ├── coins_fx
    └── desk_front
```

要求：

- 双手必须有完整骨骼链，不允许只有手掌旋转。
- 头部、耳朵、牛角需要有轻微延迟感。
- 领带要能独立摆动。
- 桌子前景层必须能遮挡身体下半部分。
- 键盘光效和手部打字动作要同步。

---

## 4. 约束和网格要求

建议使用：

```text
IK:
- left_arm_ik
- right_arm_ik

Mesh Deform:
- head_base
- face_patch
- mouth
- tie
- ears

Transform Constraint:
- ear follow head
- horn follow head
```

正式版不要只做简单 rotate。  
头部、脸部、领带、耳朵建议有轻微 mesh deform，这样避免零件拼接感。

---

## 5. 必须包含的动画

动画名必须完全一致：

| 动画名 | 类型 | 说明 |
|---|---|---|
| `idle` | loop | 非工作时待机呼吸 |
| `typing` | loop | 正常工作敲键盘 |
| `coin_pop` | once | 金币到账，牛角发光 |
| `blink` | once / overlay | 眨眼 |
| `rest_eye` | once | 眼睛休息提醒 |
| `slack` | once | 摸鱼状态 |
| `happy` | once | 快下班兴奋 |
| `overtime` | loop | 加班黑化状态 |

如果动画名不一致，前端 `WorkCow` 控制器无法正常触发。

---

## 6. 动画细节要求

### `idle`

用途：非上班时间 / 节假日 / 设置页空闲。

要求：

- 身体轻微呼吸。
- 头部轻微上下浮动。
- 眼睛偶尔眨动。
- 手自然放在键盘旁。
- 显示器弱光呼吸。

建议时长：2 - 3 秒循环。

---

### `typing`

用途：上班中默认循环。

要求：

- 左右手交替敲键盘。
- 手部动作幅度小，不要夸张乱甩。
- 头部轻微点动。
- 肩膀有轻微联动。
- 键盘光点跟随敲击闪烁。
- 眼睛保持半睁，偶尔眨眼。

建议时长：1.5 - 2 秒循环。

---

### `coin_pop`

用途：工资增长触发的爽感反馈。

要求：

- 牛角轻微发光。
- 眼睛高光亮一下。
- 金币从键盘或屏幕旁边弹出。
- 脸颊轻微鼓起。
- 身体有一个很小的弹性反应。
- 结束后自然回到当前 base 动画。

建议时长：0.6 - 0.9 秒，一次性。

---

### `blink`

用途：自然眨眼，可叠加在 idle/typing 上。

要求：

- 上眼皮下压，下眼皮轻微上提。
- 不要直接把眼睛 scaleY 压扁。
- 左右眼可以有 1-2 帧时间差，更自然。

建议时长：0.12 - 0.18 秒，一次性。

---

### `rest_eye`

用途：工作 50 分钟后的护眼提醒。

要求：

- 小牛闭眼。
- 手暂停打字。
- 可以出现小气泡：`眼睛休息`。
- 表情放松。
- 结束后回到 typing。

建议时长：1.5 - 2.2 秒，一次性。

---

### `slack`

用途：摸鱼 / 偷偷放松。

要求：

- 小牛眼神侧看。
- 一只手稍微离开键盘。
- 可以出现手机或小表情。
- 动作要轻微，不要破坏整体高级感。

建议时长：1 - 1.5 秒，一次性。

---

### `happy`

用途：快下班 / 今日收益接近完成。

要求：

- 眼睛变亮。
- 身体轻微弹起。
- 牛角发光。
- 领带轻甩。
- 屏幕或键盘有一圈绿色光。
- 结束后回到 typing。

建议时长：0.8 - 1.2 秒，一次性。

---

### `overtime`

用途：超过下班时间，加班黑化。

要求：

- 眼神疲惫或眼神死。
- 手打字速度变慢。
- 领带下垂。
- 背后显示器变暗。
- 加一点暗红色氛围光。
- 不要太恐怖，仍然保持可爱。

建议时长：2 - 3 秒循环。

---

## 7. 动画混合

前端预期逻辑：

```text
base layer:
- idle
- typing
- overtime

overlay layer:
- coin_pop
- rest_eye
- slack
- happy
- blink
```

所以一次性动画结束后，不需要动画师做复杂跳转，前端会自动回到当前 base 动画。

---

## 8. 导出设置

请从 Spine 导出 JSON 运行时格式：

```text
Data:
- JSON
- Nonessential data: 可关闭
- Pretty print: 可关闭
- Scale: 1

Texture Atlas:
- Pack atlas: 开启
- Premultiply alpha: 按 Spine/PixiJS 推荐配置处理
- Max size: 2048 或 4096
- Padding: 2 - 4 px
- Bleed: 开启
```

贴图建议：

```text
work-cow.png
- 透明背景
- 单张图集优先
- 尺寸不超过 4096 × 4096
- Web 场景建议控制在 2048 × 2048 内
```

---

## 9. 前端加载约定

前端会加载：

```js
/assets/spine/work-cow/work-cow.json
/assets/spine/work-cow/work-cow.atlas
/assets/spine/work-cow/work-cow.png
```

动画调用名：

```js
playBase('idle')
playBase('typing')
playBase('overtime')

playOnce('coin_pop')
playOnce('rest_eye')
playOnce('happy')
playOnce('slack')
playOnce('blink')
```

请确保导出的 skeleton 中包含这些动画名。

---

## 10. 验收标准

### 静态验收

- 角色不像 SVG 拼图。
- 手臂与身体连接自然。
- 头部不是正圆。
- 耳朵、角有遮挡关系。
- 显示器不抢主体。

### 动画验收

- `idle` 播放 30 秒不僵硬。
- `typing` 循环 30 秒不机械。
- `coin_pop` 能自然叠加到 typing 上。
- `overtime` 氛围明显，但不丑不恐怖。
- 动画切换没有跳帧、错层、漂浮手。

### 前端验收

把最终三个文件放入：

```text
assets/spine/work-cow/
```

打开：

```text
http://127.0.0.1:8996/web/
```

应自动从 PNG fallback 切换到 Spine 骨骼动画。
