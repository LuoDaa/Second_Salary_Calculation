# 02｜PSD / AI 分层拆件规范

项目：打工牛 · 实时工资计算器  
角色：打工牛 996 号  
目标：为 Spine 2D 骨骼绑定准备可动画化分层资产

---

## 1. 文件要求

请交付：

```text
work-cow-layered.psd
或
work-cow-layered.ai
```

要求：

- 画布建议：`2048 × 2048 px`
- 透明背景
- 每个可动画部件必须单独图层
- 图层命名必须使用英文或拼音，不要使用“图层1/图层2”
- 所有图层不要合并
- 不要使用过多不可控滤镜
- 关键部件必须保留完整遮挡区域，方便 Spine 绑定

---

## 2. 总体分层结构

推荐分层如下：

```text
work-cow-layered.psd

00_reference/
  ref_safe_area
  ref_center_line

10_background/
  monitor_back
  monitor_screen
  monitor_glow
  screen_money_text
  screen_code_lines

20_horns_ears_back/
  horn_left_base
  horn_left_highlight
  horn_right_base
  horn_right_highlight
  ear_left_outer
  ear_left_inner
  ear_right_outer
  ear_right_inner

30_head/
  head_base
  face_shadow
  forehead_patch
  face_patch
  cheek_left
  cheek_right
  nose_area
  nostril_left
  nostril_right
  mouth_idle
  mouth_smile
  mouth_tired

40_eyes/
  eye_left_white
  eye_left_pupil
  eye_left_highlight
  eyelid_left_top
  eyelid_left_bottom
  eye_right_white
  eye_right_pupil
  eye_right_highlight
  eyelid_right_top
  eyelid_right_bottom

50_body/
  neck
  shirt_body
  shirt_collar_left
  shirt_collar_right
  vest_body
  shoulder_left
  shoulder_right
  tie_top
  tie_body
  badge_base
  badge_text_work_cow

60_arms/
  arm_left_upper
  sleeve_left
  arm_left_forearm
  hand_left
  finger_left_01
  finger_left_02
  arm_right_upper
  sleeve_right
  arm_right_forearm
  hand_right
  finger_right_01
  finger_right_02

70_desk_keyboard/
  desk_back
  keyboard_base
  key_row_01
  key_row_02
  key_row_03
  key_light_left
  key_light_right
  desk_front

80_fx/
  coin_01
  coin_02
  coin_03
  coin_glow
  green_rim_light
  sweat_drop
  dark_aura
  overtime_red_glow
```

---

## 3. 分层重点说明

### 头部

`head_base` 不能是正圆。  
需要是一个完整的、圆润但有轻微结构变化的头型。

必须拆出：

```text
head_base
forehead_patch
face_patch
nose_area
mouth_idle
mouth_smile
mouth_tired
cheek_left
cheek_right
```

原因：

- `head_base` 用于整体绑定。
- `forehead_patch` 可以随头部轻微变形。
- `mouth_*` 用于表情切换。
- `cheek_*` 可在 happy / coin_pop 时轻微放大。

---

## 4. 眼睛拆层

眼睛必须可以做眨眼，所以不要画死在脸上。

每只眼睛至少拆为：

```text
eye_left_white
eye_left_pupil
eye_left_highlight
eyelid_left_top
eyelid_left_bottom
```

眨眼动画中：

- 上眼皮向下
- 下眼皮轻微向上
- 瞳孔可以轻微移动
- coin_pop 时瞳孔可放大或高光增强

---

## 5. 手臂拆层

手臂是最容易产生拼接感的地方，必须拆完整连接链路：

```text
shoulder_left
arm_left_upper
sleeve_left
arm_left_forearm
hand_left
finger_left_01
finger_left_02
```

不能只给一个 `hand_left`。

要求：

- 上臂和前臂要有重叠区域。
- 袖口要覆盖手腕连接处。
- 手放在键盘上时要能看出从身体伸出来。
- 左右手动作幅度不要太大，适合小幅打字。

---

## 6. 桌子和键盘

桌子用于遮挡身体下半部分，但不能切断脖子。

分层建议：

```text
desk_back
keyboard_base
key_row_01
key_row_02
key_row_03
key_light_left
key_light_right
desk_front
```

`desk_front` 应在手和身体前方，用于形成遮挡层。  
`keyboard_base` 应在手下方。  
`key_light_*` 可以在 Spine 中做透明度闪烁。

---

## 7. 显示器

显示器是背景氛围，不要抢主体。

建议分层：

```text
monitor_back
monitor_screen
monitor_glow
screen_money_text
screen_code_lines
```

在 Spine 中可以做：

- 轻微 glow 呼吸
- 代码行滚动或透明度变化
- coin_pop 时金额闪一下

---

## 8. 特效层

特效层要独立，不能画死在角色主体上：

```text
coin_01
coin_02
coin_03
coin_glow
green_rim_light
sweat_drop
dark_aura
overtime_red_glow
```

用途：

- `coin_pop`：金币弹出、牛角发光、屏幕闪一下。
- `rest_eye`：眼睛休息，可用汗滴或小气泡。
- `overtime`：暗红光、疲惫眼神、领带下垂。

---

## 9. 尺寸和安全区

建议：

- 角色主体高度占画布 70% - 80%。
- 头部中心在画布垂直方向 40% 左右。
- 键盘和桌子在画布下方 70% - 90%。
- 左右保留 10% 安全边距。
- 不要让牛角、金币、耳朵贴边。

---

## 10. PSD/AI 验收标准

交付文件必须满足：

- 打开后图层命名清晰。
- 可动画部件没有被合并。
- 手臂连接完整。
- 耳朵和角在头部后层，有遮挡逻辑。
- 桌子遮挡身体下半部分，但不切断角色。
- 屏幕是背景，不抢主体。
- 所有部件适合导入 Spine。
