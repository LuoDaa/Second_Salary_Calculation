# Rive 小牛人桌宠完整设计规格

目标：做一个真正连续动画的小牛人桌宠，不再使用“单张图片切换动作”的廉价方案。

## 角色定位

角色名：打工牛

视觉方向：

- 动漫 / Q 版 / 高级 App Mascot
- 大头小身，比例约 1.6 头身
- 圆润、干净、统一，不要拼贴感
- 奶油白 + 暖棕牛斑
- 金色小牛角、粉色耳内、粉色鼻口
- 深海军蓝办公马甲或小西装
- 薄荷绿领带，作为品牌识别色
- 表情友好，有一点“打工人灵魂”

禁忌：

- 不要真实牛
- 不要低龄儿童贴纸风
- 不要过度复杂纹理
- 不要明显肢体拼接断层
- 不要文字贴在身体上

## Rive 画布

- 尺寸：1024 x 1024
- 安全区：角色完整站在中心，顶部和底部各留 8% 空白
- 原点：角色脚底中心
- 输出文件：`assets/mascot/calf-worker.riv`

## 图层结构

建议按以下层级绘制并绑定，便于骨骼动画。

```text
root
  shadow
  tail
  body
    torso
    belly_highlight
    suit_left
    suit_right
    shirt
    tie
  legs
    leg_l
    leg_r
    shoe_l
    shoe_r
  arms
    upper_arm_l
    forearm_l
    hand_l
    upper_arm_r
    forearm_r
    hand_r
  props
    laptop
    cup
    snack
    phone
    water_sign
  head
    head_base
    patch_l
    patch_r
    ear_l_outer
    ear_l_inner
    ear_r_outer
    ear_r_inner
    horn_l
    horn_r
    hair
    eye_l
    eye_r
    eyelid_l
    eyelid_r
    eyebrow_l
    eyebrow_r
    muzzle
    nostril_l
    nostril_r
    mouth_smile
    mouth_open
    blush_l
    blush_r
  fx
    coin_1
    coin_2
    sweat
    sleepy_bubble
```

## 骨骼 / 变换点

核心骨骼：

- `root`
- `body`
- `head`
- `ear_l`, `ear_r`
- `tail`
- `upper_arm_l`, `forearm_l`, `hand_l`
- `upper_arm_r`, `forearm_r`, `hand_r`
- `leg_l`, `leg_r`

绑定要点：

- 头部以脖子位置为旋转中心
- 耳朵以耳根为旋转中心
- 尾巴以尾根为旋转中心
- 手臂以肩膀和肘部为旋转中心
- 道具跟随手部或在对应动作中显示/隐藏

## 状态机

State Machine 名称：

```text
PetState
```

Inputs 全部使用 Trigger：

```text
action_idle
action_typing
action_drink
action_slack
action_eat
action_happy
action_reminder
```

状态：

```text
Idle
Typing
Drink
Slack
Eat
Happy
Reminder
```

状态转换：

- Any State -> 对应动作状态
- 动作结束后自动回 Idle
- Idle 可循环
- Typing 可循环 4-8 秒
- Drink / Eat / Happy / Reminder 播放一次后回 Idle
- Slack 可循环 3-6 秒后回 Idle

## 动作设计

### Idle

时长：2.4 秒循环

动作：

- 身体上下轻微呼吸 2px
- 头部轻微左右摆动 1.5 度
- 尾巴轻摆
- 每 3-5 秒眨眼一次
- 领带轻微摆动

关键帧：

```text
0%   body y 0, head rotate -1
50%  body y -2, head rotate 1
100% body y 0, head rotate -1
```

### Typing

时长：0.7 秒循环

动作：

- 显示 laptop
- 双手交替敲键盘
- 眼睛专注，眉毛轻微下压
- 身体小幅前倾
- 旁边偶尔弹出金币小特效

关键帧：

```text
0%   left hand down, right hand up
50%  left hand up, right hand down
100% left hand down, right hand up
```

### Drink

时长：1.8 秒一次

动作：

- 显示 cup
- 右手拿杯子到嘴边
- 头部微微后仰
- 眼睛变舒缓
- 完成后轻轻点头

### Slack

时长：2.6 秒循环

动作：

- 显示 phone 或墨镜
- 身体后仰
- 眼睛半眯
- 一只手拿手机，另一只手摸鱼姿势
- 尾巴慢摆

### Eat

时长：2 秒一次

动作：

- 显示 snack
- 手把零食送到嘴边
- 嘴巴张合两次
- 腮帮子轻微鼓起
- 表情有一点心虚

### Happy

时长：1.2 秒一次

动作：

- 小跳一下
- 眼睛变弯月笑
- 金币从两侧弹出
- 领带和耳朵跟随弹跳

### Reminder

时长：2 秒一次

动作：

- 举起小牌子或水杯
- 表情认真
- 头部点两下
- 用于“该喝水了 / 休息一下”

## Web 触发规则

桌宠页和主页面统一使用：

```js
playPetAction("typing")
playPetAction("drink")
playPetAction("slack")
playPetAction("eat")
playPetAction("happy")
playPetAction("reminder")
```

行为调度：

- 运行中默认 `typing`
- 每 30-90 秒随机一次：
  - 40% typing
  - 18% drink
  - 18% slack
  - 14% eat
  - 10% happy
- 每小时提醒触发 `reminder`
- 工资金额跳动明显时可触发 `happy`

## Rive Runtime 接入

最终 `.riv` 文件放入：

```text
assets/mascot/calf-worker.riv
```

页面加载优先级：

1. 存在 `.riv`：使用真正 Rive 动画
2. 不存在 `.riv`：回退到当前 PNG 小牛人

## 验收标准

必须满足：

- 动作连续，不是简单换图
- 角色风格统一，没有肢体拼贴感
- 每个动作能看懂在干嘛
- PWA / 手机浏览器 / 桌宠小窗都能运行
- 低端机器不明显掉帧
- 桌宠窗口 360x520 内主体清晰可见

