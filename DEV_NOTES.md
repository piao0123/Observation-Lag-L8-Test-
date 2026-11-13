# 项目开发与故障复盘笔记 (Development & Technical Notes)

本文档用于记录地图开发、渲染引擎适配及关卡设计过程中遇到的技术问题、根源分析与最佳解决方案，供日后维护及类似问题排查参考。

---

## 📌 记录 001：关卡物品 Label 标签精简与外观绘制冲突问题

### 1. 现象描述
在尝试对地图（如 `Level 0 - 测试关卡酒店大堂`）上的物品悬浮标签（Label）进行精简和防遮挡优化时，出现了以下矛盾现象：
- **第一次尝试**：直接修改物品/墙体对象的 `label` 属性（如将 `'VIP KING BED'` 缩短为 `'KING BED'`），结果地图上大量的物品外观发生了变样，失去了专属细节纹理，回退（Fallback）成了默认的普通方块/方桌。
- **第二次尝试**：将 `label` 全部原封不动还原回长字符串，物品的精细外观恢复了，但屏幕上再次充斥大量杂乱、相互遮挡重叠的文字标识（例如墙体的 `'SALON NORTH WALL'`、地毯与立柱文字等）。

---

### 2. 问题根源分析 (Root Cause Analysis)

通过深入分析渲染引擎 `src/js/engine.js` 的实现代码，发现引擎内部存在 **“双重绑定”** 机制：

1. **`label` 的双重职责**：
   - **职责 A（材质/图形识别码）**：`src/js/engine.js` 中的 `drawProps()` 和 `drawObstacle()` 强依赖 `p.label.toUpperCase().includes('...')` 来判断物品具体样式（例如识别到 `LUGGAGE RACK` 绘制行李搁架与包袋、识别到 `VIP KING BED` 绘制豪华大床与床头柜、识别到 `TELEVISION` 绘制电视桌机顶盒）。若修改或删减 `label` 字符串，引擎无法识别对应特征码，就会降级渲染成通用方块。
   - **职责 B（默认 HUD 显示文本）**：在没有配置 `displayName` 时，引擎默认提取 `p.label` 作为屏幕上浮动的 UI 文字标签。

2. **冲突本质**：直接修改 `label` 破坏了**职责 A**（导致物品图形损坏）；完全不修改 `label` 则破坏了**职责 B**（导致 HUD 界面文字冗余杂乱）。

---

### 3. 最终解决方案 (Final Architectural Solution)

利用渲染引擎 `drawPropTagLabel()` 和 `drawObstacle()` 中原生支持的解耦机制（`displayName`、`hideLabel`、`tagPosition`），实现 **图形绘制** 与 **UI 悬浮文本** 的彻底解耦：

#### 规范原则：
1. **`label` 字符串 100% 保持不动**：
   - 绝不为了界面好看而修改 `label`。保持原始的专用特征串（如 `VIP KING BED`、`GOLDEN BAGGAGE CART`、`GUEST ROOM WALL`），确保引擎 100% 正确触发高精图形绘制。
2. **使用 `displayName` 重新定义短别名**：
   - 需要在 UI 上显示更简短名称时，添加 `displayName` 属性（如 `displayName: 'KING BED'`、`displayName: 'CART'`）。引擎优先使用 `displayName` 进行文本测量与绘制。
3. **使用 `hideLabel: true` 隐藏无用/冗余文字**：
   - 针对墙体障碍物（如 `GUEST ROOM WALL`）、地毯背景（`rug`）、连排植株（`plant`）、密集办公椅（`office_chair`）、大理石立柱（`pillar`）等物体，显式添加 `hideLabel: true`，彻底消除界面文字噪音。
4. **使用 `tagPosition` 错开密集区标签方向**：
   - 在物品紧密摆放区（如 VIP 沙龙、客房内），指定 `tagPosition: 'left' | 'right' | 'top' | 'bottom'`，避免相邻物品的标签在同一个上方位置重叠。

---

### 4. 代码配置示例

```javascript
// ✅ 正确示范：图形与UI文本解耦
{ 
    type: 'bed', 
    x: 100, y: 150, w: 72, h: 46, 
    label: 'VIP KING BED',       // 1. 保留原始特征码 -> 触发引擎豪华大床绘制
    displayName: 'KING BED',     // 2. 界面仅显示精简别名
    tagPosition: 'bottom'        // 3. 错开悬浮位置
},
{ 
    type: 'rug', 
    x: 100, y: 150, w: 68, h: 46, 
    label: 'PERSIAN RUG',        // 保留波斯地毯特征码
    hideLabel: true              // 隐藏地毯上的文字标签
},
{ 
    x: 200, y: 300, w: 12, h: 100, 
    type: 'solid', 
    label: 'GUEST ROOM WALL',    // 保留墙体特征码
    hideLabel: true              // 隐藏墙面上的文字标签
}
```

---

*（后续若遇到其他模块或引擎逻辑的疑难问题，请按此格式继续追加记录）*

---

## 📌 记录 003：餐车（DINING & BISTRO CAR）布局重构与多次报错复盘

### 1. 此前多次修改未生效 / 呈现错误的根因分析 (Root Cause Analysis)

在对 **餐车（DINING & BISTRO CAR）** 的卡座与 L 形吧台进行反复迭代的过程中，出现了“代码改了但画面没变”、“地面出现未知棕色大方块”以及“形状朝向与草图不符”等问题，主要原因如下：

#### (1) 渲染函数中的条件拦截顺序问题 (Priority Overriding Bug)
* **现象**：修改了卡座与吧台的绘制代码后，游戏画面中的图案依然保持旧样子或变成带绿框的控制台。
* **根因**：在 `src/js/engine.js` 的 `drawProps()` 道具渲染主循环中，位置靠前的**通用通配符条件**抢先匹配到了物件：
  * `lbl.includes('BOOTH')` 抢先拦截了 `DINING BOOTH`，将其画成了“带双屏幕的安检/控制台”。
  * `lbl.includes('BAR')` 抢先拦截了 `BISTRO BAR`，将其画成了“紫色免税吧台矩形”。
* **后果**：写在函数后半段的精细绘制逻辑**完全被跳过，无法执行**。

#### (2) 底层地图硬编码的地板遮罩 (Hardcoded Floor Overlay)
* **现象**：卡座与吧台区域地面上始终覆盖着一块带橙色边框的暗棕色大方块。
* **根因**：在地图地板绘制函数（`engine.js` 第 8523 行）中，硬编码存在一段绘制“吧台区高光红木地台”的代码（`ctx.strokeRect(1740, 14, 260, mapH - 28)`），使用橙色 `#d97706` 描边。
* **后果**：无论道具层如何重绘，底层的棕色大方块都会透出来遮挡原木地板。

#### (3) 草图空间结构理解偏差
* **卡座结构**：最初误将卡座理解为一个整体组合框（类似大床外框），而草图要求的是 **3 个完全独立、互不相连的竖向长方形**（左椅 `[ ]` + 中间桌 `[   ]` + 右椅 `[ ]`），且桌椅间需留出暴露地板的空隙。
* **吧台朝向与宽度**：最初将 L 形转角翼角做在了左侧（West 端）且台面过宽，与草图 IMG_6915 中“主吧台在左、翼角在右侧（East 端）延伸至墙壁”的结构相反。

---

### 2. 最终解决方案 (Final Solutions Applied)

#### (1) 提升专用渲染逻辑优先级 (Priority Elevation)
* 将 `dining_booth`（餐车卡座）与 `train_bistro_bar`（L形吧台）的绘图逻辑**直接提升至 `drawProps()` 函数的最顶端**，置于所有通用 `BOOTH` / `BAR` 拦截条件之前。
* 确保餐车物件在进入主循环的第一时间被精准匹配并执行专属矢量绘制代码。

#### (2) 彻底清理底层硬编码遮罩 (Floor Overlay Cleanup)
* 彻底删除了 `engine.js` 地板渲染层中硬编码的橙框棕色地台绘制指令，恢复纯净、连续的优雅复古核桃木拼花地板。

#### (3) 严格按草图 (IMG_6915) 重构形状与高精细节 (Visual Reconstruction & Realistic Enhancements)
* **备餐区 (Preparation Area)**：
  * **备餐操作台 (PREP COUNTER)**：设计为深色胡桃木橱柜底座结合**食品级拉丝不锈钢操作台面**，内置双槽不锈钢洗水槽与铬合金鹅颈龙头，台面上摆放着**木质切菜砧板与柠檬/青柠切片**、叠放整齐的**青花瓷餐盘**以及 RGB 三色调味酱罐。
  * **冷藏展示柜 (PREP CABINET)**：深红木外框搭配**冰蓝照明玻璃展示窗**与不锈钢网架，内部陈列着水晶醒酒器、水果拼盘（红苹果与青葡萄）、精致法式草莓/蓝莓糕点托盘，并带有 **04°C 冷藏温度数字 LED 指示灯**。
* **三件套卡座 (Dining Booth)**：
  * 拆分为 **3 个独立竖向矩形**：左侧墨绿绒面椅子 `[ ]`、中间独立白台布桌 `[   ]`、右侧墨绿绒面椅子 `[ ]`。
  * 桌子与两侧椅子之间预留 **8px 完全透光的空隙**，可以清晰看到下方透出的拼花木地板。
  * **座椅细节**：深色暗红木靠背、**墨绿丝绒垫渐变**与立体拉花竖向缝线，边缘镶嵌**黄铜铆钉**。
  * **餐桌细节**：暗红木包边、洁白台布结合**中间金色丝绒桌旗**；桌中央设有一盏**复古 Art-Deco 黄铜台灯**，向台面投射柔和的暖光晕；桌面配有**金边瓷餐盘**、银质刀叉、晶莹剔透的**红酒高脚杯**以及桌中微型小花瓶。
* **L 形吧台 (Bistro Bar & Items)**：
  * **吧台收窄**：吧台宽度由 25px 缩减为 **18px**，整体更加精致合理。
  * **朝向修正 (IMG_6915)**：
    * **北部吧台 (NORTH)**：主吧台位于左侧，右侧 (East) 竖向翼角**向上延伸至北墙**，呈现 `━━━━━━┚` 结构。
    * **南部吧台 (SOUTH)**：主吧台位于左侧，右侧 (East) 竖向翼角**向下延伸至南墙**，呈现 `━━━━━━┓` 结构。
  * **真实酒吧台面道具重构与朝向优化 (Authentic Bar Top Items & Facing)**：
    * **朝向区分逻辑 (Bartender vs Customer)**：
      * **面向酒保 (Facing Bartender)**：生啤酒塔出酒龙头与防溅水网槽、防滑调酒垫、雪克壶、双头量酒器 (Jigger)、POS 液晶触控屏幕与小票打印机出票口，均统一面向酒保站在吧台内部的工作区。
      * **面向客人 (Facing Customer)**：已调好的马天尼鸡尾酒杯、带白色绵密泡沫的金黄生啤酒扎杯，以及 POS 终端的深色保护后壳，均推向客人所在的吧台外侧。
    * **三头生啤酒塔 (`Beer Tap Tower`)**：铬合金立柱配 3 个黄铜出酒龙头、黑把手与下方的防溅槽，呈现强烈真实酒吧标志。
    * **防滑调酒垫与雪克壶 (`Cocktail Shaker & Spill Mat`)**：黑橡胶网格防滑垫、银色 3 截式不锈钢雪克壶、双头漏斗量酒器 (Jigger)。
    * **晶莹鸡尾酒与扎啤 (`Cocktail & Draft Beer Glass`)**：粉红马天尼鸡尾酒杯（配红樱桃/橄榄）与带绵密白泡沫的金黄生啤酒扎杯。
    * **智能 POS 收银系统与小票打印机**：深色液晶触控 POS 终端与微型小票打印机。
    * **L 翼名酒展架与水晶醒酒器**：阶梯式名酒瓶阵列（琥珀威士忌、金边绿酒瓶、深蓝金酒、红酒瓶，带金属箔封口与高光）。
    * **氛围灯与吧椅**：吧台下沿暖色 LED 氛围灯带，以及沿服务边排列的黄铜底座红皮革旋转高脚吧椅。
  * **标签避让与位置优化 (Label Clearance & Layout Fix)**：
    * **吧椅无遮挡**：修正 `drawPropTagLabel` 逻辑，北部吧台标签设为 `tagPosition: 'top'` (贴靠北墙 `y:33`)，南部吧台标签设为 `tagPosition: 'bottom'` (贴靠南墙 `y:210`)，彻底解除了标签对高脚吧椅的遮挡。
    * **左上角车厢标题遮挡修复**：将 `CAR 02: DINING & BISTRO CAR` 车厢标题标签坐标优化调整至 `labelX: 1208, labelY: 18`，同时将 `PREP COUNTER` 道具标签位置下移至 `y: 54`，避开了准备操作台与车厢标题的重叠。

* **VIP 车厢 5 段式重构 (IMG_6932 草图布局)**：
  * **结构重构 (x: 2400 ~ 3600)**：根据手绘草图 `IMG_6932.heic` 将第 3 节 VIP 车厢从左至右精准划分为 5 个区域段：
    1. **吧台区 (`吧台`, x: 2400~2640)**：上下两侧对称分布 L 形 VIP 吧台。
    2. **座位区 1 (`座位`, x: 2640~2880)**：上下两侧各配置 2 组 VIP 专属重型真皮头等舱座椅 (`[□] [□]`)。
    3. **房间区 1 (`房间`, x: 2880~3120)**：上下两侧各配置 1 间豪华套房 (`[▬]`)，内置 King-Size 真皮大床、衣柜、独立梳妆台/茶几。
    4. **房间区 2 (`房间`, x: 3120~3360)**：上下两侧各配置 1 间豪华套房 (`[▬]`)，内置大床、写字台、老板椅与重型保险箱。
    5. **座位区 2 (`座位`, x: 3360~3600)**：上下两侧各配置 2 组 VIP 专属重型真皮头等舱座椅 (`[□] [□]`)。
  * **绿植完全移除**：彻底删除了走廊中的绿植障碍，保持过道完全畅通。
  * **VIP 头等舱座椅重新设计 (`vip_seat`)**：
    * 替代了原餐车卡座造型，全新设计了专属 VIP 豪华头等舱座椅（深紫红皇室真皮打孔软包、竖向拉花缝线、黄铜铆钉、电动延伸腿托、上下侧雕花扶手、镀铬杯架与独立大理石鸡尾酒茶几）。
    * **朝向修正**：靠背 (`backrest`) 位于左侧 (West)，座椅面朝右侧 (East)。
  * **套房豪华大床朝向修正 (`luxury_bed`)**：
    * **朝向修正**：床头 (`headboard`) 雕花暗红木框与高弹皮革软包位于左侧 (West)，双羽绒枕头靠左摆放；床身向右延伸，金色缎面床尾巾 (`bed runner`) 与床尾框 (`footboard`) 位于右侧 (East)。
  * **测试出生点修改**：将 `playerStart` 默认坐标修改至 `{ x: 2480, y: 120 }`（第 3 节 VIP 车厢吧台区中央），方便即时测试。

### 1. 修改内容与原因
1. **越界行李架清除与行李区重构**：
   - 原 `level0_test.js` 中存在坐标 `y: 16` 的行李架（外墙边界为 `margin: 40`），导致该物件直接越界渲染到了地图北侧墙体之外。将越界道具彻底移除，并重构行李寄存区的道具坐标，配置精细的行李架与摆放层次。
2. **行李车 (`baggage_cart`) 造型升级**：
   - 原行李车绘制较为简陋（两个分色方块）。重新设计为经典**奢华酒店金鸟笼行李推车（Bellman Birdcage Trolley）**：拥有 4 角橡胶轮与黄轴、深红天鹅绒铺底台面、金色全围护栏、精细皮质行李箱堆叠、以及顶部的金鸟笼弧形支架与金环。
3. **前台区域专有设施替换（钥匙房卡柜 `key_rack`）**：
   - 移除了前台接待区原本显得突兀的衣柜 (`wardrobe`)，替换为符合高级酒店前台定位的**礼宾部房卡/钥匙鸽子窝柜 (`key_rack`)**：深色红木背板、金边顶标、密集排列的房卡格、以及挂有红穗钥匙的黄铜钥匙扣细节。
4. **VIP 沙龙展示柜 (`display_cabinet`)**：
   - 将 VIP 沙龙内的衣柜 (`wardrobe`) 替换为**VIP 奢华玻璃展示柜 (`display_cabinet`)**：包括顶部暖色 LED 射灯柔光、水晶玻璃隔板、反光玻璃门板、以及内部展示的金奖杯、水晶酒壶与欧式瓷瓶。
5. **渲染拦截 Bug 修复与分支优先级提升**：
   - 之前 `drawProps` 中靠前的 `lbl.includes('BAGGAGE')` 和 `lbl.includes('CABINET')` 通用判定拦截了 `p.type === 'baggage_cart'` 与 `p.type === 'display_cabinet'`，导致定制绘制逻辑未被执行。已将所有 `p.type` 显式判定移至 `drawProps()` 的最顶部，确保新高精物件外形正常渲染。
6. **前台礼宾钥匙柜 (`key_rack`) 样式确立**：
   - 确认并保持前台右侧的 **礼宾房卡/钥匙柜 (`KEY RACK`)** 配置与精致外观（红木边框、黄铜 "KEYS" 铜牌顶标、密集房卡格子与挂有红穗钥匙的黄铜扣）。

---

### 📌 记录 004：Level 0 修改导致其他关卡物品外形全面混乱的重大事故深度复盘与防御规范

### 1. 事故本质与核心痛点（Core Failure Definition）
在针对 Level 0 进行视觉细节迭代时，直接修改底层共享渲染引擎（`src/js/engine.js`），使用了未加关卡限定的全局通配符（如 `includes('...')`）及全局粗暴覆盖逻辑，导致了**灾难性的跨关卡物品外观崩坏（Cross-Level Prop Visual Corruption）**：
- **这绝不是简单的“标签遮挡”界面小问题，而是最严重的全局渲染逻辑污染**。
- 修改单一一关（Level 0），由于破坏了共享判定链与参数约定，直接导致其他原本正常的关卡（Level 1 机场、Level 2 地铁、Level 3 银行、Level 4 游艇、Level 5 酒店）的核心设施**外形全部变样、材质张冠李戴、或直接退化回普通黑色方块/错误模型**！

#### 具体破坏清单：
1. **Level 2（地铁）**：地铁核心车厢由于全局 `conveyor` / `train` 条件被污染，外观被完全劫持为机场传送带。
2. **Level 4（游艇）**：豪华主卧与 VIP 柚木大理石盥洗台（Master Vanity）被降级或被列车粗糙洗手台覆盖，质感全失。
3. **Level 3（银行）**：银行现代金融接待前台被错误套用五星级酒店的红木红漆与黄铜复古大堂铃铛，颜色与金融机构安防风格严重不搭；且键盘与屏幕朝向外侧反转。
4. **Level 5（酒店）**：行李架与行李推车直接退化为无纹理黑块，卫生间的马桶（Toilet）和水槽（Sink）被错误修改为比例严重失真崩坏的扁平大方块（横向过宽，完全脱离真实卫浴比例）；VIP 沙龙展示柜被破坏。

---

### 2. 事故根因剖析（Root Cause Analysis）

#### 根因一：认知偏差——把“全局物品外观破坏”误当成“表面标签遮挡”
- **认知错误**：此前反思时本末倒置，片面纠结于 HUD 文字层遮挡，而没有第一时间深刻认识到其他关卡核心资产外观被污染彻底毁掉的严重性。
- **真因**：底层共享渲染函数（`drawProps`、`drawObstacle`）未对各个关卡建立严格的边界隔离，导致“牵一发而动全身”。

#### 根因二：全局单体渲染管线缺乏关卡环境命名空间（Lack of Level Scoping）
- **失误**：在为 Level 0 编写逻辑时，直接使用 `lbl.includes('VANITY')`、`lbl.includes('CABINET')`、`lbl.includes('TRAIN')` 或未限定关卡的 `p.type === 'counter'`。
- **后果**：Level 2、3、4、5 含有类似命名时，被强行分流进不属于自己的绘图分支，导致外形完全错乱。

#### 根因三：道具比例缺乏真实世界人机工效与尺寸约束（Proportion & Scale Defect）
- **失误**：修改卫浴道具时随意指定宽高（例如将马桶宽度设为 25px、水槽设为 24px），导致马桶比例呈扁平巨型方块，失真严重。
- **后果**：打破了游戏世界既定的比例标尺，视觉效果崩坏。

---

### 3. 彻底整改措施与实施落地（Actionable Remediation）

#### 措施一：在渲染引擎中建立严格的关卡隔离环境常量（Strict Level Scope Isolation）
- 在 `src/js/engine.js` 统一提取并严格使用：
  ```javascript
  const isAirportLevel = currentLevel && (currentLevel.id === 'level1_airport' || currentLevel.id === 1);
  const isSubwayLevel = currentLevel && (currentLevel.id === 'level2_subway' || currentLevel.id === 2);
  const isBankLevel = currentLevel && (currentLevel.id === 'level3_bank' || currentLevel.id === 3);
  const isYachtLevel = currentLevel && (currentLevel.id === 'level4_yacht' || currentLevel.id === 4);
  const isHotelLevel = currentLevel && (currentLevel.id === 'level5_hotel' || currentLevel.id === 5);
  const isTrainLevel = currentLevel && (currentLevel.id === 'level0_test' || currentLevel.id === 0);
  ```
- 凡带有特殊风格的道具分支，必须严格绑定对应的关卡常量，禁止任何跨关卡污染。

#### 措施二：重构 Level 3 银行前台专属金融科技质感（Bank Reception Desk & Office Chair）
- **彻底去除与银行格调不搭的酒店红木与黄铜铃**。
- **台面材质**：采用银行高安防冷夜黑钛合金双色渐变（`#1E293B` 至 `#0F172A`）与皇家蓝高光包边（`rgba(59, 130, 246, 0.85)`）。
- **防窥挡板**：钛黑防弹隐私挡板，镶嵌一条发光的冷蓝光纤安全防伪导光条（`rgba(56, 189, 248, 0.9)`）。
- **专业金融办公外设（正确朝向北面工作人员）**：
  - 超薄钛黑金融液晶终端，屏幕实时显示青蓝开户/安保数据流（`#38BDF8`）；
  - 银行专属签约文件夹（深海蓝 `#1E3A8A` 文件夹、金属票夹与白色业务单据）；
  - 现代对讲叫号终端与数字状态 LED；
  - 办公椅全面替换为银灰五星底座与深蓝黑透气人体工学坐垫，完全契合银行冷色调。

#### 措施三：纠正 Level 5 酒店卫生间道具比例（Standard Ergonomic Sanitary Proportions）
- **马桶（Toilet）尺寸规范化**：
  - 尺寸重定为标准的纵向黄金规格：**宽 12px，进深 16px**（`facing: 'down'`），北侧紧贴 3px 蓄水箱，南侧为修长内凹的真实陶瓷座便圈，带有水纹微蓝高光与冲水黄铜按键。彻底告别崩坏的扁平宽矩形。
- **水槽（Sink）尺寸规范化**：
  - 尺寸重定为标准规格：**宽 14px，进深 12px**（`facing: 'down'`），采用奢华雅士白大理石台面（`#E2E8F0`）、椭圆下沉式瓷盆、北侧镀铬冷热水龙头与微型按压洗手液瓶。

#### 措施四：建立不可逾越的改动防御铁律
1. **先查影响范围**：改动 `engine.js` 任何公共分支前，必须全局 grep 确认哪些关卡包含该 type / label。
2. **严禁无界模糊匹配**：不得使用无环境限定的全局通配符。
3. **改一验全**：任何涉及物品外观与比例的改动，必须逐关遍历验证，严禁只看单关导致其他关卡资产被污染。

---

## 📌 记录 005：Level 8 隔离测试关卡 · 全新三联方形隔间战术控制台实现规范

### 1. 依据手绘草稿 IMG_7697 规范设计
根据手绘设计稿 `IMG_7697`，在 Level 8 实现全新三联方形隔间战术控制台（`drawTripleCubicleWorkstation`）：
1. **三联方形隔间（Triple Square Cubicles）**：
   - 4 根贯通式纵向重装金属隔断侧壁（`x: -132, -44, 44, 132`），贯通前后深度 90px，形成 3 个独立的方形工作舱。
   - 侧壁具备前后双金属端头、发光状态指示灯与双层防静电耐磨地席。
2. **每个隔间前部的三连高清战术显示屏（Three Connected Screens per Bay）**：
   - 每个隔间前沿对称装配 3 块紧密连接的高精度战术显示屏（三舱共 9 块屏）。
   - 隔间之间与隔间内部按专业职能分别显示：
     - **左舱（TAC-BAY 01）**：RF 无线电通信频谱柱状图、扇区动态雷达扫描、99% 卫星上行数据流。
     - **中舱（TAC-BAY 02）**：反应堆动力示波曲线、全域战术瞄准准星与锁定光标、防御护盾 100% 状态条。
     - **右舱（TAC-BAY 03）**：无人机集群巡逻多边形、网络防火墙入侵拦截矩阵、480V 变电冷却仪表。
   - 屏幕之间采用一体化钛合金铰链锁扣连接，带有细密水平扫描线与 45° 玻璃反光。
3. **屏幕后方的机械键盘（Mechanical Keyboard）**：
   - 屏幕后方正中凹槽设 4 排独立机械键帽背光阵列，带红色 ESC 键、长条空格键与下方手势触控板。
4. **键盘左右两侧的多排控制按钮（Left & Right Control Panels）**：
   - **左操作板**：第 1 排 3 枚背光方型按键、第 2 排 3 枚联动翘板开关（带状态微灯）、第 3 排 2 枚带金属护盖安全拨动开关。
   - **右操作板**：双线性推子电位器（带金属滑块与刻度槽）、高精度旋转刻度旋钮、2×2 战术微动矩阵按键、带黄黑警示圈的大型红色紧急制动按钮（E-STOP）。
5. **再后方的人体工学五星滚轮座椅（Operator Ergonomic Swivel Seat）**：
   - 针对角色身形比例全面扩大重构：坐垫外径拓宽至 `26px × 20px`（配备加厚侧翼包裹），扶手外跨扩展至 `32px`，靠背拓宽至 `23px × 12px`，底座轮爪扩展至 `30px`，完美承托角色 `18px ~ 22px` 的重型战术防弹衣身形。

### 2. 严格尺寸约束控制（Strict Scale Constraints）
- 依据要求：“尺寸可以稍大点 大概圆形控制台的2.2-2.25倍”。
- 原圆形控制台外径为 `124px`（`R_out = 62`）。
- 2.2 ~ 2.25 倍目标区间为 `272.8px ~ 279px`。
- 本三联隔间总横向宽度严格设计为 **276px**（每个隔间轴距 `92px`，3 隔间总宽 276px），精确达到圆形控制台的 **2.226 倍**，完美契合 2.2-2.25 倍比例。

### 3. 严格关卡隔离制度与出生点优化（Spawn & Isolation）
- 本次改动全部封装于独立文件 `src/js/levels/level8_test.js`（并同步 `public/js/levels/level8_test.js`）的道具 `draw` 自定义闭包内，绝不污染全局渲染管线。
- **角色刷新位置优化**：将出生点重新校准至北侧大厅完全开阔平整区域（`x: 1600, y: 975`），彻底远离中央圆弧缺口与障碍物边缘，面朝北方三联工作站，随时可自由进出三个方形隔间。

---

## 📌 记录 006：Level 8 三联方形隔间战术控制台细节精调（座椅对齐、屏幕放大、2.2倍宽约束）

### 1. 修改背景与需求
- 用户反馈：“座椅又有点大了 跟其他控制台的座椅大小相同即可 然后把新控制台的屏幕稍作大点 然后整体横向尺寸还是控制在圆形控制台的2.2倍左右”。

### 2. 实施技术细节
1. **座椅规格回归与其他控制台完全统一**：
   - 参考 Level 8 正圆控制台（`drawCircularPodWorkstation`）原装战术转椅尺寸标准：
     - **座垫本体**：由 26×20 回调为 `20px × 15px`（`roundRect(-10, -8, 20, 15, 4)`）。
     - **座垫内部软垫**：`16px × 11px`（`roundRect(-8, -6, 16, 11, 2.5)`），带中央双缝线。
     - **左右扶手外跨**：外沿间距收紧为 `22.4px`（`[-11, 9]` 扶手，厚度 2.4px、深 10px）。
     - **人体工学靠背**：由 23×12 调整为 `18px × 9px`（`roundRect(-9, 4, 18, 9, 3.5)`）。
     - **腰部护托**：`12px × 4.5px`。
     - **五星脚轮**：轮爪半径回调至 `11.0px`，轮子半径 `1.5px`，液压升降柱 `2.6px`。
   - 彻底解决了座椅偏大突兀的问题，与关卡内其他主控台座椅规模风格达成 100% 视觉统一度。

2. **前部战术三连屏幕显著做大（Enlarged Tactical Screens）**：
   - 单屏尺寸由原先的 `25.0px × 14.5px` **显著做大至 27.5px × 16.5px**（面积提升超 25%）。
   - 纵向起始位置微移至 `y = -44.0`，与桌面北沿紧密咬合；
   - 隔间内三联横向坐标调整为 `sx = [-28.0, 0, 28.0]`，三屏紧密拼接，中间铰链扣位同步微调至 `±14.0px`；
   - 屏内频谱示波器、雷达准星、护盾状态、无人机图层等战术 HUD 等比放大展现，更具大屏监控的压迫感与科技感。

3. **整体横向尺寸严格控制在 2.2 倍左右（Strict 2.20x Scale Constraint）**：
   - 正圆控制台外径为 `124px`，2.2 倍标准线为 `272.8px`。
   - 三隔间轴间距设为 `bayPitch = 91px`，**总宽度精确定在 273px**（273 / 124 = **2.2016 倍**）。
   - 4 根重型金属隔断侧壁坐标相应校准至 `[-136.5, -45.5, 45.5, 136.5]`，完美满足 2.2 倍的横向宽度约束。

4. **关卡隔离与构建状态**：
   - 改动仅作用于 `level8_test.js`，已完成 `src/` 与 `public/` 同步。
   - 经 `compile_applet` 和 `lint_applet` 联合校验无任何错误。

## 📌 记录 007：Level 8 隔离测试关卡 · 全新五联装服务器集群道具绘制与出生点优化

### 1. 需求概述
- 用户需求：“在测试关卡level 8绘制一个服务器集群（道具）由五个服务器机柜横向排列在一起组成 每个机柜的宽度大概和游戏角色模型差不多宽 机柜内包含多台服务器（纵向排列的一格一格的窄长方形）蜂窝状散热网格和闪烁的led指示灯点 机柜的外壳颜色注意和level 8房间本身的颜色契合 另外调整level 8角色的开场刷新点到更空旷的位置 防止被卡住 最后注意严格遵守关卡间隔离 对level 8的改动不要对其他任何关卡造成任何影响”。

### 2. 实施技术规范
1. **五联装机柜结构与角色尺度对齐**：
   - 角色模型肩膀/防弹衣宽约为 `24-28px`。我们将每个独立服务器机柜宽度设定为 `28px`，深度为 `42px`。
   - 5 个服务器机柜横向一体化排列，总宽 `140px`，总高 `42px`。
   - 包含底座减震导轨、接缝分界线与顶部双路高亮光纤管槽（绿蓝双色光纤）。

2. **契合 Level 8 房间配色（Emerald-Gunmetal Theme）**：
   - 机柜外壳采用 Level 8 重型军工深翡翠暗钢与碳黑复合装甲（`#021410`、`#041f18`、`#062a21`），搭配 `#0d4a3c`、`#059669` 与 `#10b981` 科技边缘倒角。
   - 四角设置带六角微型钛合金螺栓加固件与右侧安全磁吸锁把手。
   - 顶部激光雕刻独立微型机柜标识：`SRV-01` 至 `SRV-05`，配有顶置双色状态小指示灯塔。

3. **机柜内部纵向多层服务器抽屉**：
   - 每个机柜内纵向整齐堆叠 7 台窄长方形服务器刀片抽屉（1U/2U，`18px × 4px`），带双侧机架安装耳、拉手与热插拔硬盘盒。

4. **高精度蜂窝状散热网格（Honeycomb Cooling Mesh）**：
   - 在各服务器进气区精确雕刻真实正六角形蜂窝阵列微孔（直径约 1.2px，按六角密铺排布），透出底层科技暗绿散热风道微光。

5. **动态多色闪烁 LED 指示灯点**：
   - 包含常亮/微呼吸电源绿灯（`#10b981` / `#34d399`）、高速随机突发闪烁的 NVMe/Disk I/O 冰蓝灯（`#00E5FF`）、网络集群同步脉冲绿灯，以及少量节点特定的琥珀色警示灯。

6. **开场刷新点调整至极度空旷开阔位置**：
   - 原出生点 `{ x: 1600, y: 995 }` 夹在讲台（y=960）与圆台顶弧（y=1020）之间仅有 30 余像素狭缝，极易卡死。
   - 优化调整为南大厅开阔主入口 `{ x: 1600, y: 1820 }`，四周拥有一百多像素的无障碍自由移动空域，彻底杜绝开局卡住。
   - 将服务器集群道具安置于南大厅西侧 `(1420, 1800)`，角色开局即可直接在视口内清晰检视该道具并测试实体掩体碰撞。

7. **关卡隔离原则**：
   - 所有改动 100% 封闭在 `level8_test.js` 内，完全不影响 Level 0 至 Level 7 的任何数据或渲染逻辑。

## 📌 记录 008：Level 8 隔离测试关卡 · 服务器集群 2.35 倍尺度放大与丰富多彩指示灯矩阵

### 1. 需求与反馈
- 用户反馈：“外形对了 但实在是太小了 至少放大到现在的2-3倍 单个机柜的宽度得和角色相当 甚至还略宽 指示灯颜色可以多样一些 别都差不多颜色 看着比较单调”。

### 2. 实施技术规范
1. **2.35 倍宏大尺度放大（单机柜宽显著超越角色模型）**：
   - 角色肩宽防弹衣约为 `26px`。单个机柜宽度由 28px 放大至 `66px`（约为角色宽度的 2.54 倍，显著宽厚），单柜纵深由 42px 放大至 `96px`。
   - 5 个服务器机柜横向排列一体化并联，总宽度由 140px **放大至 330px**（放大 2.36 倍，完全符合 2-3 倍规范），总深度达 `96px`，压迫感与机房体量感显著提升。
   - 包含重型钢槽减震基座、膨胀地脚螺栓与顶部 5px 宽大型四路多彩光纤管线桥架。

2. **多色绚丽动态 LED 指示灯系统（告别单调，战术色彩丰富）**：
   - 告别原本以单色绿色为主的单一感，构建了全频谱工业级战术 LED 光效：
     * **纯正翡翠绿 (#00FF66 / #10b981)**：电源正常/系统健康呼吸灯
     * **极光冰蓝 / 天蓝 (#00E5FF / #38bdf8)**：高速 NVMe/SSD 突发读写灯
     * **皇家宝蓝 (#3b82f6 / #2563eb)**：集群互联与内存总线灯
     * **赛博霓虹紫 / 品红 (#c084fc / #d946ef)**：量子加密/神经网络协处理器灯
     * **战术琥珀金 / 橙色 (#fbbf24 / #f59e0b)**：存储负载与奇偶校验警示灯
     * **警戒深红 / 珊瑚红 (#ef4444 / #f43f5e)**：硬件中断与温控看门狗红灯
     * **纯白高亮光标 (#ffffff)**：光纤收发器脉冲频闪
     * **荧光黄绿 (#a3e635)**：辅助能源与副链路指示
   - 5 大机柜各具专业分工（SRV-01 加密、SRV-02 神经网络、SRV-03 核心主数据库、SRV-04 雷达融合、SRV-05 威胁推演），配装彩色门楣标号与彩色双信标灯塔。
   - 各服务器抽屉右侧配备红黄绿 3 阶垂直彩条 VU 柱状表以及 4 色独立动态频闪 LED 点，Master 核心节点还特别配备动态示波微型 LCD 视窗。

3. **高密度正六边形蜂窝散热网格升级**：
   - 进气网孔宽度扩展至 16.5px，精雕微型正六边形蜂窝孔（半径 0.85px），配装暗绿科技散热内腔。

4. **开场站位与机群空间布局精调**：
   - 将 330px 宽的五联装服务器集群置于南大厅中央机房阵列席位 `(1600, 1865)`，两侧留出各 135px 宽敞通道。
   - 角色开场刷新点定为 `(1600, 1740)`，出生于开阔正前方（相距 77px），开局即能正视整个发光服务器阵列，且能向四面八方自由通行，绝对不卡死。

---

## 📌 记录 009：Level 8 隔离测试关卡 · 全新大圆会议桌系统（深色木纹、一圈平板/文件夹/笔、点亮灯珠灯环、环绕16席转椅）

### 1. 需求与核心目标
- 用户需求：“在测试关卡level 8尝试绘制新的道具 将地图中间的大圆形改成大圆会议桌（形状保持原样 但颜色和质感换位深色木制 类似已经做好的讲台道具）会议桌上排满一圈平板电脑 文件夹和笔 大圆形上面的圆环形灯环保持原本的形状和颜色 但尝试做出一颗一颗灯珠和点亮的效果 大圆形四周的四个圆弧给改成环绕着大圆形会议桌的多个座位（改完后把四个圆弧本身删掉）数量和位置应当和会议桌上摆放的物品一一对应 注意严格遵守关卡隔离 对level 8的任何改动不要对其他任何关卡造成任何影响”。

### 2. 实施技术规范与细节
1. **大圆会议桌主体（保留原 155px 半径与正圆碰撞，重构深色红木/黑胡桃木质感）**：
   - 严格保持圆心 `cx = 1600, cy = 1200`，半径 `radius = 155px`。
   - 延续讲台（`command_podium`）深色红木/黑胡桃木材质基因：
     - 4 阶受光径向木色底阶（`#4a1c12` -> `#34130a` -> `#220b06` -> `#110402`）。
     - 8 圈带微波起伏的同心自然树木年轮（`rgba(92, 34, 18, 0.42)` 与 `rgba(18, 5, 2, 0.52)`）。
     - 24 条放射状微细木质射线，搭配 45° 缎光清漆高光漫反射（Polished Lacquer Satin Sheen）。
     - 外沿采用双重倒角防撞黑檀重包边，配合 `#10b981` 翡翠金属装饰细环与席位分区金铜嵌条。
   - 会议桌中央设计有 360° 全向音频微网格（44px 钛合金圆环）与全息投影透镜（脉冲光环与十字微准星）。

2. **圆环形发光灯环升级（保持原 143px 形状与天空蓝/青蓝配色，实现 64 颗独立点亮发光灯珠）**：
   - 严格保持半径 `143px`，配色保持经典的 `rgba(56, 189, 248, ...)` 天空蓝与 `#00E5FF` 青蓝。
   - 底层具有 14px 宽柔和桌面泛光投影与 7.5px 导轨凹槽。
   - 沿 360° 环周精密排布 **64 颗独立微型 LED 发光灯珠**：
     - 每颗灯珠均具备深色金属固定座（`r = 2.2px`）、动态发光微脉冲光晕（`r = 3.8px`）、高饱和电光青蓝发光透镜（`#00E5FF`，`r = 1.35px`），以及极其明亮纯白的点亮发光极小亮点核心（`#ffffff`，`r = 0.65px`）。

3. **会议桌上一圈高精办公用品（12 席平板电脑、机密文件夹与金属笔）与严格朝向校准**：
   - 席位数与四周座椅严格保持 1:1 对应（12 席），均布于 `r = 118px`：
   - **严格朝向校准**：
     - **金属行政签字笔**：遵循人机工学放置规范，**笔帽与笔尖朝向桌子中心（+y），笔尾朝向座椅（-y）**，包含钛黑金属笔杆、中段镀铬饰环、深色金属笔帽与笔夹、向桌心尖锐聚拢的纯金锥形笔尖与白亮铱金微光点。
     - **TOP SECRET 机密文件夹**：文件夹顶部（镀金金属票夹、TOP SECRET 红色印章）朝向桌子中心（+y），公文横向正文打印线条顺着向下延伸至座椅侧（-y），深蓝黑真皮封套配 4 角黄铜金属护角。
     - **平板电脑 / 战术终端**：顶部边框（微型前置摄像头、光线传感器、战术状态栏）朝向桌子中心（+y），底部触控条朝向座椅侧（-y）；高科技战术蓝光液晶屏，动态扫描线与实时示波曲线。

4. **环绕会议桌的 12 席高管战术人体工学转椅（尺寸放大至与其它工作台一致，彻底删除 4 个圆弧）**：
   - 彻底删除原 `CURVED ARC NE`, `CURVED ARC SE`, `CURVED ARC SW`, `CURVED ARC NW` 障碍物。
   - 座椅尺寸全面放大，达到与其他控制台（`drawSectorWorkstation` / `drawTripleCubicleWorkstation`）相当的工效尺寸：
     - **座垫规格**：放大至宽 24px，进深 17px，高级炭黑真皮渐变与翡翠战术包边缝线。
     - **人体工学双扶手**：宽 2.8px，进深 13px，左右外跨度达 28.8px。
     - **加宽雕刻高背与腰托**：靠背宽 22px，面向桌心；配备柔软腰靠垫与背部合金龙骨。
     - **重型五星滚轮底座**：轮臂跨度扩大至 14.5px 半径，配备中心镀铬液压立柱与 5 个双轮静音尼龙脚轮。
   - 席位数量由 16 精调为 12 席，与桌上物品 1:1 严格对应，间距宽裕舒展无任何拥挤。
   - 采用 15° 半席位角度偏移，使正北（12点）与正南（6点）拥有宽达 105px 的主通行干道，角色自由巡视通行绝对畅通。

5. **严格关卡隔离**：
   - 仅在 `drawObstacle` 增加通用 `obs.draw` 委托支持，所有几何、材质与动效均完全内聚在 `level8_test.js` 内部闭包，绝不污染 Level 0 至 Level 7 的任何数据或渲染管线。




## 📌 记录 010：Level 7/8 新道具必须做动静分离（Static/Dynamic Split）

### 1. 背景：为什么 L7/L8 和其他关卡不一样

- **老关卡（L0–L6）**：道具是**纯数据**（x/y/w/h/label），绘制代码全在 `engine.js` 的 `drawProps()` 里（10,688 行巨型函数）。单个道具几乎零绘制成本。
- **L7/L8 新道具**：每个控制台自带 **500–700 行自定义 `draw` 函数**（圆形舱 738 行、三联 620 行、扇形 517 行、讲台 405 行、服务器集群 399 行），每帧 60 次全部重画。
- **后果**：L7 每帧 Canvas 调用从 ~3,800 暴涨到 ~16,500（3 个服务器集群加入后），MacBook Air（Intel HD 6000）帧率直接崩掉。

### 2. 核心原则：新道具必须自带动静分离

**任何带动画的新控制台/道具，创建时就必须拆成两个函数**，不要等到卡了再补：

| 函数 | 职责 | 每帧调用 |
|------|------|---------|
| `drawXxxWorkstation(ctx, ...)` | 只画**静态**部分（外壳、屏幕边框、按钮、座椅、标签） | 首次 1 次，之后从缓存读 |
| `drawXxxWorkstationDynamic(ctx, ...)` | 只画**动态**部分（雷达扫描、频谱柱、LED 闪烁、波形、指针） | 每帧 1 次 |

### 3. 标准实现模板（照抄，改名字就行）

```javascript
// ============ 1. 静态函数：加 freezeTime 参数 + 缓存 ============
function drawCircularPodWorkstation(ctx, cx, cy, angle = 0, scale = 1.0, label = '', freezeTime = null) {
    // freezeTime !== null 时：用固定时间画静态帧（供缓存用），不依赖 Date.now()
    const time = freezeTime !== null ? freezeTime : Date.now() * 0.001;
    // ... 只画静态部分：外壳、屏幕、按钮、座椅 ...
    // 动态元素（雷达/频谱/LED）一律不要画在这里，移到 Dynamic 函数
}

// ============ 2. 动态函数：只画会动的东西 ============
function drawCircularPodWorkstationDynamic(ctx, cx, cy, angle = 0, scale = 1.0, label = '') {
    const time = Date.now() * 0.001;
    // 只画动态元素，例如：
    // - 雷达扫描线：angle = (time * 2.5) % (Math.PI * 2)
    // - LED 闪烁：alpha = 0.5 + 0.5 * Math.sin(time * 3)
    // - 频谱柱：height = base + Math.sin(time * 3.2 + i) * amp
    // - 波形：y = Math.sin(x * 0.1 + time * 2) * 5
}

// ============ 3. get 函数：建缓存 + 挂 draw ============
function getCircularPodWorkstation(cx, cy, angle = 0, scale = 1.0, label = '') {
    // ... 生成 points 碰撞多边形等 ...
    const prop = {
        type: 'circular_pod',
        x: cx, y: cy, angle, scale,
        // ... 其他字段 ...
        draw: function(ctx) {
            // 首次：用 freezeTime=0 画静态帧到离屏 canvas，存进缓存
            if (!this.__podCache_) {
                const c = document.createElement('canvas');
                c.width = 200; c.height = 200; // 按道具尺寸定
                const cctx = c.getContext('2d');
                cctx.translate(100, 100); // 移到中心
                drawCircularPodWorkstation(cctx, 0, 0, 0, 1.0, '', 0);
                this.__podCache_ = c;
            }
            // 每帧：贴缓存图 + 只画动态层
            ctx.save();
            ctx.translate(cx, cy);
            if (angle) ctx.rotate(angle);
            if (scale !== 1.0) ctx.scale(scale, scale);
            ctx.drawImage(this.__podCache_, -100, -100);
            drawCircularPodWorkstationDynamic(ctx, 0, 0, 0, 1.0, '');
            ctx.restore();
        }
    };
    return prop;
}
```

### 4. 判断什么是动态、什么是静态

| 动态（进 Dynamic 函数） | 静态（进主函数 + 缓存） |
|---|---|
| 用 `Date.now()` / `time` 驱动的任何东西 | 外壳、边框、底座 |
| 雷达扫描线、旋转指针 | 屏幕边框、屏幕底色 |
| LED 闪烁、呼吸灯 | 按钮、键盘、座椅 |
| 频谱柱、波形图、示波器 | 标签文字、刻度、装饰线 |
| 任何 `Math.sin(time * ...)` / `Math.cos(time * ...)` | 任何不随时间变化的图形 |

**一句话检验**：把 `time` 固定成 0，画面还变不变？变就是动态，不变就是静态。

### 5. 已完成的动静分离（参考实现）

| 道具 | 静态函数 | 动态函数 | 缓存字段 | 效果 |
|------|---------|---------|---------|------|
| 扇形控制台 | drawSectorWorkstation | drawSectorWorkstationDynamic | `__wsCache_` | -85% |
| 圆形舱 | drawCircularPodWorkstation | drawCircularPodWorkstationDynamic | `__podCache_` | -85% |
| 三联控制台 | drawTripleCubicleWorkstation | drawTripleCubicleWorkstationDynamic | `__tripleCache_` | -90% |
| 讲台 | drawPodium | （无动态元素，不需要） | — | — |

### 6. 待做（不要忘）

- **服务器集群** `drawServerCluster`（399 行）：LED 闪烁、光纤脉冲、示波器是动态的，蜂窝散热、机柜外壳、标签是静态的。**必须补动静分离**，否则 L7 每帧多 ~10,000 次调用。
- **蓝图**（746 行匿名 draw）：324 条扫描线 + 3 个径向渐变每帧新建，**必须预渲染**成离屏 canvas。

### 7. 违反后果

- 不做动静分离的新道具，每放一个，L7 每帧增加 **2,000–5,000 次** Canvas 调用。
- 3 个服务器集群 = +12,000 次/帧，MacBook Air 从 30fps 跌到 10fps 以下。
- **创建新道具时就必须同时写好 Dynamic 函数和缓存逻辑，不要事后补。**

---

## 📌 记录 011：Level 7 独立武器系统（WEAPONS 单例隔离）

### 1. 问题根源

`engine.js` 的 `WEAPONS`（约 99 行）是**所有关卡共用的单一全局对象**。直接改它（比如改步枪伤害）会同时改掉 L1–L8 所有关卡的武器。2026-11-03 已发生多次：用户在 AI Studio 改 L7 武器，结果其他关卡的武器也被改了。

### 2. 解决方案：覆盖表模式（不要改 WEAPONS 本身）

```javascript
// engine.js，WEAPONS 定义之后
const LEVEL7_WEAPON_OVERRIDES = {
    // 填武器 id → 要覆盖的属性，L7 里自动生效，其他关卡完全不受影响
    // 示例：1: { damage: 35, cooldown: 8 }  // 只改 L7 的步枪伤害和射速
};
```

`getEffectiveWeapon(wp)`（约 121 行）里已有 L7 分支：
```javascript
if (levelId === 'level7_lab') {
    const override = LEVEL7_WEAPON_OVERRIDES[wp.id];
    if (override) return { ...wp, ...override };
    return wp;
}
```

### 3. 武器 id 对照表

| id | 武器 | 原版数值（damage/cooldown/range） |
|----|------|----------------------------------|
| 1 | 步枪 RIFLE | 28 / 9f / 650 |
| 2 | 手枪 PISTOL | 34 / 11f / 450 |
| 3 | 冲锋枪 SMG | 16 / 6f / 380 |
| 4 | 狙击枪 SNIPER | 140 / 45f / 1100 |
| 5 | 手榴弹 GRENADE | 130 / 65f / 400 |
| 6 | 机枪 MACHINE_GUN | 42 / 7f / 800 |
| 7 | UAV空袭 UAV | 99999 / 20f / 2000 |
| 8 | 重型三管猎枪 | 32×12 / 35f / 380 |
| 9 | 符文光镰 | 88 / 36f / 560 |
| 10 | 地狱熔岩阵 | 170 / 65f / 680 |
| 11 | 灵魂汲取 | 26 / 7f / 420 |

### 4. 铁律

- **绝不直接改 `WEAPONS` 对象**——改一个数，全关卡跟着变。
- **L7 改武器只填 `LEVEL7_WEAPON_OVERRIDES`**——用 `{ ...wp, ...override }` 返回副本，原对象不动。
- **L0 已有同样模式**（`getEffectiveWeapon` 里的 `level0_test` 分支），L7 照抄这个思路。
- 以后如果 L8 也要独立武器，照样加 `LEVEL8_WEAPON_OVERRIDES` + 一个分支，不要动 WEAPONS。

---

## 📌 记录 012：Level 7 专属敌人系统（覆盖表模式）

### 1. 问题根源

敌人初始值在 `spawnWave()`（engine.js 约 1917 行）里写死，`hp: 100`、`patrolSpeed: 1.0 + Math.random() * 0.3` 这些数所有关卡共用。直接改会污染所有关卡（和 2026-11-03 的 WEAPONS 事故一样）。

### 2. 解决方案：覆盖表 + 应用函数

```javascript
// engine.js，WEAPONS 覆盖表旁边
const LEVEL7_ENEMY_OVERRIDES = {
    // 按类型填：guard 普通守卫 / observer 观察者 / jammer 干扰者
    // 示例：guard: { hp: 150, maxHp: 150, patrolSpeed: 1.5 }
};
```

`spawnWave()` 里每个敌人创建后调一次（已接好）：
```javascript
applyLevel7EnemyOverrides(newEnemy); // 只在 level7_lab 生效，其他关卡原样通过
```

### 3. 铁律

- **改 L7 敌人数值只填 `LEVEL7_ENEMY_OVERRIDES`**，绝不改 `spawnWave()` 里的初始值。
- **全新敌人类型（新 AI 行为）**：不要往覆盖表里加，先在这里登记设计，再在 engine.js 里加独立的 `drawAgentL7` / 行为分支，不要动原有敌人逻辑和 `drawAgent` 原函数。
- 以后 L8 要独立敌人，照样加 `LEVEL8_ENEMY_OVERRIDES` + 一个分支。

---

## 📌 记录 013：Level 7 专属角色模型切换（modelVariant）

### 1. 机制（已铺好，2026-11-05）

```javascript
// player 对象里已加字段
player.modelVariant = 'default'; // 'default' 默认模型 / 'special' 特殊模型

// 切换函数（已挂 window）
setPlayerModelVariant('special'); // 切特殊模型
setPlayerModelVariant('default'); // 切回默认
getPlayerModelVariant();          // 查当前模型
```

### 2. 渲染分支点

`drawAgent()`（engine.js 约 24077 行）里已有分支点：
```javascript
const isL7SpecialModel = isPlayer && (getCurrentLevelId() === 'level7_lab') && player.modelVariant === 'special';
```

### 3. 铁律

- **现在两个分支画一样的模型（占位）**，等特殊模型设计好后，只改 `isL7SpecialModel` 为真时那个分支里的颜色/形状。
- **不要改 `isPlayer` 判断本身**，不要在其他地方加模型分支，所有模型切换走 `player.modelVariant` 这一个字段。
- 切换触发条件（按键、拾取、剧情点）由关卡设计定，调 `setPlayerModelVariant()` 就行，不用改引擎。

---
## Record 014：角色模型新画法（参考用，未启用，2026-11-06）

v1–v7 实验版 drawAgent 里加过的人物模型优化，v8 已换回原版画法（用户 verdict：渐变/描边没质变）。
以下代码存档，日后设计**新敌人**外观时参考，不要直接启用到玩家/现有敌人身上。

### 1. lightenColor 辅助函数（hex 提亮）
```js
function lightenColor(hex, amt) {
    const n = hex.replace('#', '');
    const r = Math.min(255, parseInt(n.substring(0, 2), 16) + amt);
    const g = Math.min(255, parseInt(n.substring(2, 4), 16) + amt);
    const b = Math.min(255, parseInt(n.substring(4, 6), 16) + amt);
    return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}
```

### 2. 身体/头盔径向渐变（Section 1.5，放在颜色分支后、四肢前）
```js
    // ------------------- 1.5 实验优化：身体渐变 + 描边光晕 (2026-11-06) -------------------
    // 只给玩家和普通守卫加（恶魔/干扰者/观察者保持原样）
    const isStandardAgent = isPlayer || (!isDemon && !isJammer && !isObserver);
    // 身体主色径向渐变：中心亮 → 边缘暗（立体感）
    let bodyGrad = null;
    let helmetGrad = null;
    if (isStandardAgent) {
        bodyGrad = ctx.createRadialGradient(0, 0, 2, -1, 0, 14);
        bodyGrad.addColorStop(0, lightenColor(baseTacticalColor, 40));
        bodyGrad.addColorStop(1, baseTacticalColor);
        helmetGrad = ctx.createRadialGradient(-0.5, 0, 1, -0.5, 0, 9);
        helmetGrad.addColorStop(0, lightenColor(gearColor, 35));
        helmetGrad.addColorStop(1, gearColor);
    }
```

### 3. 躯干渐变填充 + 光晕描边 + 胸前背心横纹（替代原版 3.1）
```js
    // 实验优化：身体渐变 + 光晕描边（只给玩家/普通守卫）
    if (isStandardAgent && bodyGrad) {
        ctx.fillStyle = bodyGrad;
        ctx.shadowColor = mainColor;
        ctx.shadowBlur = 8;
    } else {
        ctx.fillStyle = baseTacticalColor;
    }
    ctx.strokeStyle = mainColor;
    ctx.lineWidth = isInBlind ? 2.8 : 1.8;
    ctx.beginPath();
    ctx.roundRect(-10, -10, 18, 20, 4.5);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0; // 光晕只作用于躯干基底，后续不再发光
    // 实验优化：胸前战术背心横纹（两条亮色横线，区别于 MOLLE 织带）
    if (isStandardAgent) {
        ctx.strokeStyle = mainColor;
        ctx.globalAlpha = alpha * 0.85;
        ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(-6, -3); ctx.lineTo(4, -3); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-6, 2); ctx.lineTo(4, 2); ctx.stroke();
        ctx.globalAlpha = alpha;
    }
```

### 4. 头盔渐变 + 反光带（替代原版 7.2 头盔 fillStyle）
```js
    // 实验优化：头盔渐变（只给玩家/普通守卫）
    ctx.fillStyle = (isStandardAgent && helmetGrad) ? helmetGrad : gearColor;
    ctx.beginPath(); ctx.arc(-0.5, 0, 8.8, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = mainColor; ctx.lineWidth = 1.6; ctx.stroke();
    // 实验优化：头盔反光带（亮色细横带，横贯头盔中部）
    if (isStandardAgent) {
        ctx.fillStyle = mainColor;
        ctx.globalAlpha = alpha * 0.9;
        ctx.fillRect(-8.5, -1.2, 16, 2.2);
        ctx.globalAlpha = alpha;
    }
```

### 5. 2026-11-09 更新：反光条改版 + 启用到 L8 敌人（用户指令）
- 反光条改版：原沿朝向轴贯穿全头的细带 `fillRect(-8.5, -1.2, 16, 2.2)` → 横着的窄长方形，位于头盔中后部：`fillRect(-6.1, -4.5, 2.2, 9)`（侧向 9px，x -6.1~-3.9，头盔中后部）。
- 启用范围：仅 L7/L8 默认敌人（`isNewModelEnemy = !isPlayer && (level7_lab || level8_test) && !isDemon && !isJammer && !isObserver`，engine.js drawAgent 内，2026-11-09 Record 019 扩展到 L7）；主角、其他关卡、恶魔/干扰者/观察者保持原样。`lightenColor` 函数体已补回 engine.js（v8 回退时只剩注释）。
- 本 Record 第 4 节的原版反光条代码仍作存档，上面改版后的为准。
- 注意：此改动做在损管清理副本 ~/workspace/observation-lag-l8-cleanup/ 里，不在 merged 里（2026-11-09 用户纠正：新版本里的改动一律走清理副本）。
- 2026-11-09 默认敌人（用户纠正：L8 本来就只用新敌人，旧干扰者纯属遗留）：出生逻辑改成 L8 每波全部刷新默认敌人——新模型 + 红色半弧护盾（80 点一次性护盾，先挡伤害，破了弧就没了），无盲区技能；旧干扰者/观察者不再在 L8 出现（第 5 波的暗幕者日志也不在 L8 显示）。护盾绘制条件改成 `enemyShield > 0 && (isJammer || (isLevel8 && isNewModelEnemy))`，颜色沿用 L8 红色；其他关卡出生与护盾不变。上一轮为 L8 干扰者加的紫色跳过、门控去 `!isJammer` 已无意义，随本次改动恢复原样。L7 移植见 Record 019（L7 每波固定 5 只：2 特工 + 3 默认）。

## Record 015：西装特工新敌人（2026-11-09，用户指令）
- 设计：黑白西装 + 防弹衣 + 携行具 + 夜视仪 + 枪；无其他装备、无状态光环。
- 实现（engine.js drawAgent）：新敌人标记 `isSuited`（出生时定，drawAgent 末尾参数，敌人绘制调用点传 `e.isSuited`）；2–7 节整体包进 `if (!isSuited)`，西装分支插在 7 节守卫之后、`ctx.restore()` 之前；血条（第 1 节）、盲区轮廓、第 8 节文字标识照常走，L8 现有默认敌人与其他关卡一行不改。
- 西装分支只画：黑皮鞋（保留步态摆动）、黑西装外套 + 白衬衫 + 细黑领带、敞开式防弹衣两片插板（中间露衬衫+领带）、携行具（两条织带 + 两个小弹匣包）、标准步枪深色版、黑手套 + 枪口焰、简化头盔（只有盔体 + 横向反光条，与 L8 新模型同款位置）、单耳耳麦（单侧耳罩 + 麦克风杆）、GPNVG-18 四目夜视仪（绿镜片 #22ff88）。无背包/天线、MOLLE、杂物包、肩章、ARC 导轨、护目镜、状态光环。
- 出生（L8 混刷看效果）：每波首名必为西装特工，其余 40% 概率；西装特工无护盾（shield 0），其余行为与普通敌人一致；L8 默认敌人本身不受影响。
- 配色：外套 #0d0d10、衬衫 #f2f2f2、防弹衣 #1c1e22、夜视仪镜片 #22ff88。

## Record 016：L8 默认敌人改配色 + L8 检查模式（2026-11-09，用户指令）
- 改配色（细节不动，照西装特工 Record 015 方案）：配色分支后加 L8 默认敌人覆盖——baseTacticalColor #0d0d10、vestColor #1c1e22、plateColor #232529、gearColor #232529、gearColor2 #17181c；mainColor 保持 #FF3344（反光条/描边仍红）；身体/头盔渐变自动跟新底色走；枪械/靴子/手套/头盔/背包等全部跟 gear 色走，自动变深。背心横纹改白 #f2f2f2（呼应白衬衫）；夜视仪镜片（7.5）L8 默认敌人改经典绿 #22ff88（西装特工同款）。主角、其他关卡、西装特工本身不受影响。
- 检查模式（engine.js 顶部开关 `INSPECT_MODE = true`，验收完改回 false；2026-11-09 Record 019 扩展到 L7）：仅 level7_lab / level8_test 生效。敌人更新里 `playerIsHidden` 强制为真——永不索敌/追击/开火，只巡逻；刷新数量与波次不动。敌弹命中玩家时直接消失，不造成伤害。L8 无激光/岩浆/恶魔/三头犬近战，故其他伤害点无需处理；摄像头报警仍可能触发（只会让敌人进入戒备态，不影响无视玩家）。

## Record 017：L8 主角改配色 + 防毒面具状态（2026-11-09，用户指令）
- 主角改配色（细节不动，照西装特工 Record 015 方案）：配色分支后加 L7/L8 玩家覆盖——baseTacticalColor #0d0d10、vestColor #1c1e22、plateColor #232529、gearColor #232529、gearColor2 #17181c；mainColor 不动（L7/L8 玩家主色已是翡翠绿 #10b981）：反光条/描边/镜片仍绿，与敌人红加以区分。2026-11-09 Record 019：L7 主角同样改近黑系（与 L8 主角同款），L7 原翡翠绿 tint 覆盖被近黑覆盖块取代。
- 绿反光条：7.2 反光条条件扩到 L7/L8 玩家（同款位置/尺寸，mainColor 上色即绿）。
- 防毒面具状态：沿 Record 013 的 player.modelVariant 机制，新值 'gasmask'（setter 放行；drawAgent 分支点 isGasMaskModel，L7/L8 玩家限定；铁律不变——所有模型切换只走这一个字段）。该状态下 7.3 护目镜与 7.4/7.5 夜视仪不画，改画近黑色全面罩：面罩主体（前伸出头盔）+ 两侧滤毒罐（绿描边）+ 中央滤毒盒（两道加强筋）+ 目镜（2026-11-09 用户改：两片圆镜片 → 整体式全景镜片，深色镜面 + 绿描边保留）+ 头带；头盔/绿反光条/耳机保留。切换键 G（只在 L7/L8 生效，切换时打 log；2026-11-09 Record 019 扩展到 L7）。

## Record 018：默认敌人描红处改 L8 主题色（2026-11-09，用户指令）
- L8 主题色 = 翡翠绿 #10b981（武器栏主题色、主角主色同款）。
- 保持红色：全息瞄具激光点、枪口消焰指示、头盔反光条、血条（血条本来就是红，不动）。
- 保持绿色：夜视仪镜片 #22ff88（已改过，不动）。
- 改主题色：躯干基底描边 + 红光晕、肩章、手套描边、耳机描边、头盔描边、头顶护盾条、半弧护盾（外弧/辉光 #10b981、内弧 #A7F3D0、节点 #34D399）。
- 实现：L8 默认敌人的 mainColor 改为 #10b981（描边类自动跟）；三处保红点（瞄具点、枪口指示、反光条）硬编码 '#FF3344'（条件 isNewModelEnemy && !isSuited）；头顶护盾条按同条件改 #10b981。玩家与西装特工不动：主角 mainColor 本来就是 #10b981 且配色块独立；西装特工被 !isSuited 排除在 mainColor 改动之外（其瞄具点/枪口指示/反光条仍走 mainColor #FF3344）。背心横纹仍白（上轮已改白，不在本次改动内）。

## Record 019：L8 改动移植到 L7 + L7 道具/刷新/巡逻临时调整（2026-11-09，用户指令）
- 移植范围：Record 014 新敌人模型、Record 015 西装特工、Record 016 配色（默认敌人近黑 + 白横纹 + 绿镜片）与检查模式、Record 017 主角近黑配色 + 绿反光条 + 防毒面具状态（G 键切换）、Record 018 主题色（描红处改 #10b981，瞄具点/枪口指示/反光条/血条仍红，夜视仪仍绿）全部扩展到 L7。实现：drawAgent 内 `isLevel8` 常量删除，统一用已有的 `isL78Level`（level7_lab || level8_test）；`isL8DefaultEnemy` → `isDefaultEnemy`、`isL8GasMaskModel` → `isGasMaskModel`、`L8_INSPECT_MODE` / `isL8InspectMode` → `INSPECT_MODE` / `isInspectMode`。L7 玩家此前翡翠绿 tint 被近黑覆盖块取代；L7 'special' 模型（modelVariant，手动切换）不受影响，G 键在 L7 按 default↔gasmask 切换。
- L7 刷新：每波固定 5 只（L8 仍固定 10 只，其他关卡 2+wave）：前 2 只西装特工（无护盾），后 3 只默认敌人（新模型 + 80 点半弧护盾，无盲区技能）；旧干扰者/观察者不再在 L7 出现（第 5 波暗幕者日志也不在 L7 显示）。L7 专属敌人覆盖表 LEVEL7_ENEMY_OVERRIDES 仍为空，无冲突。
- L7 刷新/巡逻位置：敌人固定只在中间房间刷新（出生点中心 1600,1200 不变）与巡逻——新增 `l7MiddleRoomWaypointIndices()` / `randomL7MiddleRoomWaypoint()`（中间房间 x 1055~2145，按 level7_lab zones 定义；14 个中间航点 x 1125~2075；两边空房间航点 x ≤950 / ≥2250 被排除）；出生航点、selectNextWaypoint 候选、clampEntitiesOnResize 兜底三处统一取中间房间航点。
- L7 道具临时调整（缓解敌人卡墙，用户定，先这样）：① 全部道具挡子弹——checkLineObstacleIntersection 的道具循环在 L7 不再只认玻璃门，全部有碰撞道具（闭合时；openProgress > 0.4 的开门仍放行；noCollision 的蓝图背景仍跳过）都挡子弹；中央会议桌本来就是 solid 障碍物，已挡子弹，不动。② 敌人可直接越过——checkEnemyWallCollision 在 L7 跳过全部道具（含闭合的重型防爆门）与中央会议桌（CENTRAL CONFERENCE TABLE，桌心 1600,1200 半径 155）；墙体（solid/poly_wall 等）仍挡敌人。出生点另加守卫：不落在会议桌上（距桌心 < 175 拒绝重抽）。注意：手雷本来就被矩形道具挡（另有 hitProp 检查），本次对 L7 手雷无实质变化；敌人穿越闭合防爆门时会有穿门画面，属临时缓解，待用户定正式方案。
- 检查模式：INSPECT_MODE = true 现对 L7/L8 同时生效（玩家无敌、敌人无视玩家只巡逻）；验收完改回 false。
- 验证：node --check + npm run build 通过；验证版 ~/workspace/your_files/L8-新敌人模型版.html（md5 35a761e6ceaf259916f0cf32d0c076c9）；正式版 L7-正式版.html 未动；merged 未动。

## Record 020：子弹被掩体挡住时加命中火花（2026-11-09，用户指令）
- 问题：此前子弹命中非玻璃墙体/道具时直接消失、没有任何击中效果（只有玻璃有青色小爆 `createExplosion(next, 4, '#00CCFF')`）；L7 道具改成挡子弹后，子弹打上去就消失，用户反馈缺命中反馈。
- 改法：玩家子弹与敌方子弹两处循环，非玻璃命中分支在 splice 之前加 `createExplosion(命中点, 4, '#FFCC66')`（暖黄小火花，4 粒，与玻璃小爆同量级）；全关卡通用，不只 L7。手雷不受影响（手雷命中墙体本来就爆炸）。
- 验证：node --check + npm run build 通过；验证版 ~/workspace/your_files/L8-新敌人模型版.html（md5 3208f9fd76788925a57c7d739449d2c5）。

## Record 021：关卡重组 V1（2026-11-09，用户指令）
- 新副本 `~/workspace/observation-lag-restructure-v1/`（复制损管清理副本最新版，含 Record 020 击中火花）；输出 `~/workspace/your_files/L8-新敌人模型版V1.html`（md5 00159f5266ae1dd1902f138a020908e9）。原 `L8-新敌人模型版.html`（md5 3208f9fd...）未动。以后改动顺着 V2/V3 走。
- 基线说明：新副本首次 build 与清理副本 md5 不同，只因 Tailwind 扫描了清理副本根目录下一个 stray html（`视界滞后·L7正式版V1.html`）多生成了少量 CSS；src 经 diff 确认完全一致。
- Phase 1（level7_lab.js 瘦身为中间房间独立关，id 保持 `level7_lab`）：删 E 区 6 堵两侧外墙；4 个门洞用与门同形的实墙封死（D2，type solid，可挡子弹/敌人/视线）；4 扇重型防爆门拆除；蓝图第 1 节三眼地坪改为中间梯形（1055,470)-(2145,470)-(1896,1960)-(1304,1960)，删第 4 节两侧大圆弧；航点 26→14（只留中间），区域 3→1。家具（工作站/圆舱/隔间/服务器）全在中间房间，不动。playerStart (1600,1835) 与出生中心 (1600,1200) 不变。
- Phase 2（原 L7 全图另存为测试关卡 level7_test.js）：id `level7_test`、全局 `LEVEL_7_TEST`、地图变量 `level7TestMapWidth/Height`、蓝图缓存键改为 `__l7TestBlueprintCache`（避免与 L7 的 `__l7BlueprintCache` 撞缓存）。注册：levelManager 占 L8 原位（最后一位）、main.tsx import、loadCurrentLevel 与 getLevelBounds 分支。
- 门控迁移（engine.js）：`level8_test`→`level7_test` 共 48 处，`level8MapWidth/Height`→`level7TestMapWidth/Height` 各 7 处。例外：① 消毒通道联动系统整块删除（102 行，L8 专属死代码——通道与防爆门已在损管清理中删除，props 找不到故永不执行）；② isTrainLevel 不再包含测试关卡（测试关卡用 L7 地图，道具画法跟 L7 走）；③ getLevelTargetWave：测试关卡沿用 L8 的 1 波目标；④ 出生：测试关卡每波 10 只（L8 值，首名+40% 西装特工），L7 仍 5 只（2 特工+3 默认）。`isL78Level` 名字未改（现指 L7 或测试关卡），属命名债。
- L8 删除：level8_test.js 文件、main.tsx import、levelManager 条目、loadCurrentLevel/getLevelBounds 分支、App.tsx isL78 的 id 判断、translations.ts 4 处 L8 条目（中英 × 选关/简报）改为测试关卡；test_engine.cjs 的 2 处引用同步改为 level7_test。全仓扫 `level8_test`/`level8Map`/`LEVEL_8_TEST` 在 src 内为 0。
- UI：App.tsx 默认选中仍为第 8 位（现为测试关卡）；选关列表与简报按序号取，测试关卡占原 L8 的第 8 位。L7 的简报文案未改（仍大致描述中间房间，后续可再改词）。
- 验证：node --check（engine/levelManager/两关卡文件）+ build 通过；headless 冒烟（复用 verify_harness，--levels 7,8 --checks errors）：2/2 PASS，零页面错误。仍待用户进游戏手动验证（L7 房间是否密封、测试关卡是否可玩、选关列表是否显示测试关卡）。

## Record 022：重组 V2（2026-11-09，用户指令，基于 V1 继续改）
- 同一副本 `observation-lag-restructure-v1/` 继续改；输出 `~/workspace/your_files/L8-新敌人模型版V2.html`（md5 ec22173ec1db4e44da91677c06862389），V1（md5 00159f52...）未动。
- 中央圆桌手雷越过：圆桌 obstacle 加 `grenadePass: true`（L7 与测试关卡同一张桌子，行为一致）；手雷循环引爆条件加 `!hitObs.grenadePass`。只对手雷，子弹仍被圆桌挡（子弹线检不认该标记）。手雷按步进移动，越桌时逐帧忽略圆桌命中，穿过其 footprint。
- 圆形控制台玻璃墙：checkLineObstacleIntersection 的 props 循环新增 `_isGlassPod`（type === 'circular_pod_workstation'）；非 L7 关卡也不再跳过（测试关卡同样生效）；points 分支把命中报为 type 'glass'，子弹循环按玻璃处理（穿过、伤害 ×0.7、青色碎玻璃爆点 4 粒，与以前关卡的玻璃完全一致）。手雷仍在玻璃控制台上引爆（玻璃挡手雷）；视线不挡（canSee 只认障碍物+重型门）；移动碰撞不变（仍挡玩家，敌人本来就可越过道具）。
- 门加回常闭：拆 D2 封墙；4 扇重型防爆门从测试关卡复制回 L7，加 `alwaysClosed: true`；engine 门更新循环遇 alwaysClosed 直接置 openProgress=0、noCollision=false 并跳过感应开合。门对玩家/子弹/视线仍为关闭状态；敌人仍可越过（L7 临时规则：敌人跳过全部道具，含闭合防爆门）。测试关卡的门不动（仍可正常开合）。
- 测试关卡显示名改为 Level 8：level7_test.js 的 name/nameEn 改为“第 8 关 · 测试关卡”/“Level 08 · Test Sandbox”；translations.ts 4 处条目 id 改为 'level8'、标题/徽章/代号改为第 8 关。内部 id 仍为 level7_test（engine 60+ 处门控、LEVEL_7_TEST、地图变量、蓝图缓存键均不动，避免来回改；显示名与内部 id 的对应关系见此记录）。
- 验证：node --check + build 通过；headless 冒烟（--levels 7,8 --checks errors）2/2 PASS，零页面错误。待用户手动验证：手雷扔圆桌是否越过、打圆形控制台是否穿过+伤害衰减+青色爆点、4 扇门是否常闭、选关第 8 位是否显示 Level 8。

## Record 023：重组 V3（2026-11-09，用户指令，基于 V2 继续改）
- 同一副本 `observation-lag-restructure-v1/` 继续改；输出 `~/workspace/your_files/L8-新敌人模型版V3.html`（md5 3c95f9577fe0370e24fe5dd0920e5b01），V2（md5 ec22173e...）未动。
- 卡门根因与修复：查了门行为逻辑——L7 里 checkEnemyWallCollision 跳过全部道具（含闭合防爆门），寻路网格/直线可走性/移动滑步都走同一函数，所以门本身不挡敌人，门逻辑是干净的。根因是 4 个中间房间航点正好落在 4 扇防爆门的多边形内（门洞里）：敌人出生/巡逻被随机指到门洞（randomL7MiddleRoomWaypoint 无视线检查），走到门洞后被两侧斜墙的墙角夹住，沿墙滑步解不出来，时不时卡在门边。修复：4 个航点内移到空旷地板（1125,920→1215,920；2075,920→2000,920；1295,1835→1400,1835；1905,1835→1800,1835），敌人不再自己往门洞里走。注意：敌人追玩家时仍可能被玩家引到门边，那是既有沿墙滑步/卡住恢复（stuckFrames>12 换航点）处理的偶发情况，不动用户已解决的墙卡逻辑。
- L7 3 个摄像头（level7_lab.js cameras，测试关卡不加）：
  - 外形：沿用 drawCamera 原画法，theme 'l7' 变体：scale 0.75（只缩支架与机身，不缩视锥）、机身偏黑（#0d0d10）+ 翡翠描边 #10b981、云台翡翠描边、镜片/指示灯改翡翠绿 #22ff88、视锥改翡翠 rgba(16,185,129)；报警仍红。drawCamera 的视锥半径改用 cam.fovRange（无则 320，与旧行为一致），1/2 号的 360 探测与画出的锥一致。
  - 1 号 (1350,820) 讲台上方空档，baseAngle 1.91、sweepRange π/4、fovRange 360，覆盖左上门 + 会议桌左上；2 号 (1850,820) 右上扇形控制台上方空档，baseAngle π−1.91、sweepRange π/4、fovRange 360，覆盖右上门 + 会议桌右上；sweepTimer 0 vs π 反相错开（1 号扫左时 2 号扫右，中间桌子露出躲避空档）。
  - 3 号 (1600,1780) 最下方服务器上方，baseAngle π/2（朝南）、sweepRange 1.45（±83°，摆动幅度最大）、sweepSpeed 0.01（放慢）、fovRange 320，覆盖左下右下两扇门；sweepTimer π/2 起始指向一侧门（开局不直指玩家出生点）。
  - 注意：摄像头探测只看距离+角度，不做视线遮挡（原游戏行为）；3 号在玩家出生点 (1600,1835) 正北 55px，扫到正南时会覆盖出生点，开局它指向一侧门，给玩家约 2 秒离开时间，站着不动会被发现。
- 验证：node --check + build 通过；headless 冒烟（--levels 7,8 --checks errors）2/2 PASS，零页面错误。待用户手动验证：敌人是否还卡门边、3 个摄像头位置/视野/摆动与躲避空档、摄像头配色。

## Record 024：重组 V4（2026-11-09，用户指令，基于 V3 继续改）
- 同一副本 `observation-lag-restructure-v1/` 继续改；输出 `~/workspace/your_files/L8-新敌人模型版V4.html`（md5 7abdece67d9c61b279bf78f87ffae640），V3（md5 3c95f957...）未动。
- 根因（实读两套系统）：摄像头有两层“光”——① engine drawCamera 的翡翠视锥（getVisionConePolygon 裁剪，含墙/桌/L7 家具/闭合门，遮挡正确）；② lighting.js 的 coneGlow 辉光（visibilityPolygon + buildSegments）。lighting 的 buildSegments 只认 desk/conveyor，不认重型防爆门和 L7 家具，辉光穿门穿家具、残留满射程（写死 330），且颜色是亮绿（与引擎翡翠视锥不一致）。探测也一样：只看距离+角度，不做视线遮挡，墙后也被扫到就报警。报警横幅没有 level7 分支，掉进 else 的机场文案。
- 修复：
  - lighting.js buildSegments：补闭合重型门（openProgress<=0.4，按 w/h 矩形）+ L7 家具 5 类（circular_pod_workstation / triple_cubicle_workstation / command_podium / sector_workstation / server_cluster，按 points 边或 w/h 矩形，跳过 noCollision）。辉光现在被门和家具挡住，与引擎视锥一致。
  - lighting.js 摄像头辉光：射程跟 cam.fovRange（之前写死 330；1/2 号 360、3 号 320、其他关默认 330 不变），L7 用翡翠色 '16,185,129'（之前亮绿），顶点按 scale 缩（16.5*scale，与引擎镜片位置一致）。报警仍红。
  - engine.js 新增 isCameraLineBlocked（走与渲染同一套视线段 getVisionBlockingSegments + getRayIntersection，含墙/桌/L7 家具/闭合门）；摄像头探测加视线遮挡（距离+角度+视线都满足才报警）。canSee 只认墙+重型门、不认 L7 家具，所以不用 canSee。
  - engine.js triggerGlobalAlarm：加 level7_lab / level7_test 分支——“🚨 顶石科研中心安全警报 - 科研中心已进入全面封锁 🚨”/“🚨 APEX RESEARCH COMPLEX SECURITY ALARM - FACILITY IN FULL LOCKDOWN 🚨”。枪声等其他报警也走同一分支（不再是机场文案）。
- 验证：node --check（engine + lighting）+ build 通过；headless（--levels 7,8 --checks errors,cone）4/4 PASS，零页面错误；cone 检查 L7 segs=206（门+家具已进光照段）、3 个摄像头视锥多边形正常。待用户手动验证：辉光是否还穿门穿家具、墙后被扫还报不报警、横幅文案、辉光颜色与射程是否与视锥一致。

## Record 025：重组 V5（2026-11-09，用户指令，基于 V4 继续改）
- 同一副本 `observation-lag-restructure-v1/` 继续改；输出 `~/workspace/your_files/L8-新敌人模型版V5.html`（md5 0f162bf23be991ab0baa3e4a1f905a6a），V4（md5 7abdece6...）未动。
- 根因：V1 重组把 level8_test 改名 level7_test（内部 id）时，漏了 src/index.css——LEVEL 7/8 THEME OVERRIDES 里的 5 条规则还写着 `body[data-level="level8_test"]`，而 loadCurrentLevel 给 body 挂的是实际 id level7_test，所以测试关（Level 8）的 .hud-overlay / .status-box / .bar-outer / #score-count / .log-panel 全都匹配不上翡翠绿 #10b981，掉回普通关卡绿 #00FF66。App.tsx 的 isL78 判断本身是对的（index 8 与 id level7_test 都在内），问题只在 CSS 这一处。教训：V1 的全仓扫漏了 .css 文件；以后改名要扫全部文件类型。
- 修复：index.css 5 处 level8_test → level7_test（hud-overlay、status-box、bar-outer、score-count、log-panel 全部回到翡翠绿）。顺带补 App.tsx 语言切换时重写横幅的那处（同样缺 L7 分支，切语言会把 V4 修好的横幅打回机场文案）——已加 level7_lab/level7_test 分支（顶石科研中心）。
- 验证：build 通过；headless（--levels 7,8 --checks errors）2/2 PASS，零页面错误；全仓确认 src 内已无 level8_test 残留。待用户手动验证：Level 8 左下战斗日志与各 UI 边框是否为翡翠绿、切语言后横幅是否还是顶石科研中心。

## Record 026：重组 V6（2026-11-10，用户指令，基于 V5 继续改）
- 同一副本 `observation-lag-restructure-v1/` 继续改；输出 `~/workspace/your_files/L8-新敌人模型版V6.html`（md5 aad2e31cfaaa431d7a1e49095fe070c9），V5（md5 0f162bf2...）未动。
- 问题 1（视野穿透）：根因——玩家看敌人（inSight）与敌人看玩家（checkVisible/近身判定/榴弹锁定）都只用 canSee，canSee 只认墙+重型门，不认 L7 家具；渲染的视锥用 getVisionBlockingSegments（含家具）。所以视锥被家具挡住了、敌人却还看得见/打得着（双向，用户怀疑的反向也存在）。修复：新增通用 isLineBlockedByVision（V4 的 isCameraLineBlocked 抽成通用，摄像头仍走原名），加到：玩家 inSight、敌人 checkVisible（索敌/射击/近战/扑击/巡逻返回共用此一处）、L7 榴弹锁定、两处近身判定（dist<110）。导航（航点可见性）仍用 canSee，不动（墙卡方案 DO NOT TOUCH）。
- 问题 2（视锥边缘）：根因——① 圆形控制台在视线段里直接用 16 边形碰撞点，边缘明显是多边形，与渲染的标准圆对不上（中央圆桌是 obs.circle，已用 48 边形）；② 重型防爆门在视线段里用 w/h 矩形（正的 14x122），不用真实的斜多边形，边缘是正过来的。修复：engine getVisionBlockingSegments：圆形控制台用 48 边形逼近（半径取碰撞点到圆心距离，缓存 _visionCircleCache，与中央圆桌一致）；重型门有 points 时用真实多边形，无 points 才回落 w/h 矩形。lighting.js buildSegments 同样两处（门斜多边形、圆形控制台 48 边形，与引擎一致）。L7/L8 共用同一套代码，两关一并修好。
- 可活动空间（Node 网格采样 10px，玩家半径 14，读关卡几何）：L7 中间房间 zone 1,231,700 px²，可活动 782,900 px²（63.6%），被挡 448,800 px²；L8 原全图 zone 3,892,400 px²，可活动 3,211,000 px²（82.5%），其中中间房间 759,100 px²（61.6%）、西间 1,226,100 px²（92.2%）、东间 1,225,800 px²（92.1%）。L7 是 L8 的 24.4%，L8 比 L7 多 2,428,100 px²（约 4.10 倍）。中间房间在两关里都是最挤的（约 62-64%），东西两间很空（92%）。脚本 /tmp/measure_walkable.mjs。
- 验证：node --check（engine + lighting）+ build 通过；headless（--levels 7,8 --checks errors,cone）4/4 PASS，零页面错误；cone 检查 L7 segs=334（圆形控制台 48 边形已进段集，V4 时 206）、L8 segs=358。待用户手动验证：躲在圆形控制台/服务器后敌人是否还看得见、视锥扫过圆形控制台与侧门时边缘是否平滑/倾斜、敌人隔着家具是否还发现/射击玩家。

## Record 027：清理旧版本 + 可活动空间与之前关卡对比（2026-11-10，用户指令）
- 清理：~/workspace/your_files/ 里 41 个旧游戏版本 HTML 已移入回收站（trash_id 20261110-022338-596f5bb7bfa04744b3d0faa32b81594a，2026-12-10 到期，可恢复）：V1–V4、原版 L8-新敌人模型版.html，以及 11/3–11/5 的全部旧系列（L7 移植版/三联版/圆形舱版/优化版等）。现只留 V5（symlink）与 V6。正式版 L7-正式版.html 与损管清理版 L8-损管清理版.html 的 your_files/ 链接也一并移除（目标文件仍在 ~/workspace/goals/goal/files/，未动）；参考图（.png）与文档（.md）未动。
- 可活动空间（Node 网格采样 10px，玩家半径 14，与之前关卡 L0–L6 对比，不与 L8 比）：L0 地狱 2,040,100 px²（88.7%）、L1 机场 262,400（67.9%）、L2 地铁 455,000（71.8%）、L3 银行 373,100（66.5%）、L4 游艇 809,000（58.7%）、L5 酒店 263,300（58.6%）、L6 列车 783,100（51.2%）、L7 782,900（63.6%）。结论：L7 与 L6（1.00 倍）、L4（1.03 倍）基本持平，远大于 L1/L2/L3/L5，仅小于 L0（2.61 倍，教程/地狱关大开阔图）；可活动占比 63.6% 居中，高于 L4/L5/L6，低于 L0/L1/L2/L3。L7 并不比之前关卡挤，挤的感觉主要来自家具全集中在一间房。脚本 /tmp/measure_walkable_all.mjs。

## Record 028：重组 V7（2026-11-10，用户指令，基于 V6 继续改）
- 同一副本 `observation-lag-restructure-v1/` 继续改；输出 `~/workspace/your_files/L8-新敌人模型版V7.html`（md5 11e829485ae3c0e31d6840ecf6dc1e87），V6（md5 aad2e31c...）未动。
- 版本规则（用户 2026-11-10 定）：以后用户确认完成、可传 GitHub 之后，只留最新两个版本，之前全删（进回收站），再继续下一版。
- 敌人角色互换：原默认敌人（近黑 + 80 点一次性半弧盾）改为特殊敌人（新字段 `isSpecial`）；西装特工（`isSuited`）改为默认敌人。外观不动（特殊敌人仍走 `!isSuited` 近黑模型 + 翡翠半弧盾，特工仍走西装模型）。护甲条件由 `(isDefaultEnemy && !isSuitedEnemy)` 改为 `isSpecialEnemy`——特殊敌人仍 80 点一次性半弧盾，特工 0。
- 新刷怪规律（L7/L8 统一）：普通（特工）= 2+wave 只；特殊前 5 波只刷 1–2 只（1–2 波 1 只，3–5 波 2 只），5 波后按普通:特殊 = 3:2（special = round(normal*2/3)）。第 1 波 3 普通+1 特殊（共 4 只），第 2 波 4+1，第 3 波 5+2，第 4 波 6+2，第 5 波 7+2，第 6 波 8+5，第 7 波 9+6（正好 3:2），第 8 波 10+7。前 `specialCount` 只为特殊，其余为特工（第 1 波首名即特殊，第一波就能看到）。
- 数值（用户确认版）：特殊敌人血量 70、特工 80（均低于普通关卡敌人 100，不算护甲）；追击速度特殊 1.9、特工 1.8（原 1.5）；巡逻速度均 +0.3（1.3–1.6，巡逻移动用 patrolSpeed*1.3）；射速只改特殊：`max(28, 45-wave*2)` 帧（第 1 波 43 帧、后期封顶 28 帧；原 58/38 帧），特工射速不变（仍 `max(38, 60-wave*2)`）。护甲仍一次性（无回复逻辑）。
- 特殊敌人盲区诱捕（复用干扰者盲区机制）：新增 `triggerSpecialBlind`（只近身触发，持续 540 帧=9 秒、冷却 360 帧=6 秒、半径 130、固定在发动点）；`inJammerBlindZone` 与 `isLineBlockedByJammerZone` 扩展为 `(isJammer || isSpecial)`，玩家在内视野缩至 43°/160px、移速 ×0.45、发不出盲区、视线被阻断；盲区维护循环（持续/冷却/近身 dist<=85 触发）同样扩展，消散粒子走翡翠。受击触发与开场 8% 自带仍只认 `isJammer`，特殊敌人没有（只近身诱捕）。特殊敌人盲区激活时留在圈内机动游弋（追击与巡逻两处分支均已扩展，闪避拖尾粒子走翡翠）。
- 特殊敌人盲区颜色（翡翠，对上 L7 主题色 #10b981）：渲染与干扰者共用同一块，`isSpecial` 时走翡翠——渐变深绿黑（rgba(2,18,12,0.98)→(4,36,24,0.95)→(6,60,40,0.90)→(16,120,80,0.75)）、外圈 #10b981/阴影 #059669、内圈 rgba(167,243,208,0.35)、倒计时弧 rgba(52,211,153,0.85)、标签 `EMERALD TRAP [Xs]`（rgba(167,243,208,0.95)）。干扰者仍为紫色（#C084FC/#A855F7，标签 VOID OCCLUSION）。toggleBlindZone 的盲区压制拦截同样区分（特殊敌人时文案“特殊敌人翡翠盲区压制”+翡翠粒子）。
- 特殊敌人新技能·圆形虚线框：半径 200（`SPECIAL_NOBLIND_RADIUS`），跟随特殊敌人；渲染为翡翠虚线圆（[8,6]、线宽 2、阴影 #059669）+ 极淡翡翠底色（rgba(16,185,129,0.05)）。玩家在框内无法发动盲区：新增 `isPlayerInSpecialNoBlindCircle()`，接在 toggleBlindZone 现有禁发检查点之后（日志“处于特殊敌人虚线干扰框内，战术盲区发生器被压制无法启动！”+ 警报音 + 翡翠粒子）。
- 敌人扔手雷（仅限 L8 测试，L7 与其他关卡不实装）：L8（level7_test）里特殊敌人与特工可扔，条件为已警觉、看得见玩家、距离 60–400、冷却 8 秒（480 帧）；手雷向玩家位置投掷（速度 9、射程=到玩家距离），延迟 3 秒（fuse 180 帧）爆炸，伤害 100、爆炸半径 120（中心满伤、边缘 60%，与玩家手雷同一衰减公式）；爆炸只伤玩家不伤敌人（有盾时盾扣满伤、血扣 30%，无盾血扣满伤）。手雷撞墙/到射程也立即引爆（与玩家手雷一致）。检查模式下玩家无敌：手雷爆炸只显示、不扣血（isInspectMode 门控）。
- 手雷 UI（新建，无现成方向指示可复用）：敌方手雷画红色实心圆 + 脉冲警示环；新增 `drawEnemyGrenadeIndicator`——屏幕内在手雷上方显示 `GRENADE Xs` 倒计时，屏幕外在屏幕边缘画红色箭头指方向 + 秒数（按相机 cameraX/cameraY 与画布 width/height 换算，夹到边缘 30px 内）。
- 检查模式调整（用户指令）：取消敌人无视（playerIsHidden 去掉 `isInspectMode() ||`，敌人正常索敌/追击/开火，方便测试新机制）；玩家无敌保留（敌弹命中处 `isInspectMode()` 仍删弹，不造成伤害；敌方手雷伤害同样门控）。
- 验证：node --check + build 通过；headless（--levels 7,8 --checks errors,cone）4/4 PASS，零页面错误；cone L7 segs=334、L8 segs=358（与 V6 一致）；刷怪公式 Node 直算验证（第 1 波 3+1、第 7 波 9+6 正好 3:2）。待用户手动验证：第 1 波是否 3 特工+1 特殊、特殊敌人血量/速度/射速体感、近身是否触发翡翠盲区（标签 EMERALD TRAP）、虚线框内是否发不出盲区、L8 敌人是否扔手雷（3 秒延迟、屏幕内外 UI 提示）、L7 是否不扔手雷、敌人是否正常追击开火（玩家仍无敌不掉血）。

## Record 029：重组 V8（2026-11-10，用户反馈四处修复，基于 V7 继续改）
- 同一副本 `observation-lag-restructure-v1/` 继续改；输出 `~/workspace/your_files/L8-新敌人模型版V8.html`（md5 c202a7dc6ea0c9aa9e45de4340191808），V7（md5 11e82948...）未动。
- 问题 1（玩家进敌方盲区时视野缩了、灯光没缩，割裂）：根因——玩家战术视锥（drawTacticalFOV）用 getPlayerEffectiveFOV（盲区内 43°/160px），但 lighting.js 的玩家辉光直接用 pl.fov/pl.viewDistance 全尺寸；且 pl.__inBlindZone 只认玩家自己的盲区，敌方盲区内它为 false，辉光照画不误。修复：engine 在 __drawLightingPass 的 G 里加 playerEffFov（getPlayerEffectiveFOV() 的返回值）；lighting.js 玩家辉光优先用 G.playerEffFov，无则回落 pl.fov/pl.viewDistance。敌人辉光本来就走 e.__fovAngle/e.__fovRange（引擎每帧按实际视野写），不受影响。此修复走共享 lighting 代码，所有含 jammer 的关卡（L3/L5/L7/L8 等）一并修好。注意：玩家自己盲区内仍不画辉光（__inBlindZone 门控不变）。
- 问题 2（特殊敌人被自己的盲区定住）：根因——盲区冻结分支 `(inZone || inJammerZone) && !isObserver && !isJammer && !isCerberus && !isDemon` 把特殊敌人当普通敌人，误入自己盲区（inJammerZone 为真）即被定住（0.12 慢速迷茫游走 + return 跳过索敌/开火）。修复：冻结条件加 `!e.isSpecial`（与干扰者同理）。特殊敌人在自己盲区内恢复正常移动：警觉时走 V7 已加的盲区内机动（追击 1.45/爆发 2.4，留在圈内打），未警觉时走圈内游弋（0.85，随机点位，不必一直处于盲区中心）；巡逻分支的 0.35 减速（`!isJammer && inJammerZone`）不受影响（盲区激活时走游弋分支不走巡逻）。confusedTimer（玩家自己盲区迷惑敌人）未动。
- 问题 3（敌方盲区内玩家伤害累积）：新增 player.pendingBlindDamage / pendingBlindShieldDamage（重开时清零）。敌弹命中玩家时，若玩家在敌方盲区内（inJammerBlindZone.inZone，干扰者与特殊敌人通用），伤害不立即扣（护盾与血量都只累积），头顶画红色 `PENDING -X`（仅血量部分）；update() 每帧跟踪玩家是否在敌方盲区，刚离开所有敌方盲区时一并结算（先扣护盾、再扣血，log 写明两项数额，血量归零即 Game Over）。与玩家自己盲区内敌人 pendingDamage 同理（单值累积、结算时走护盾优先）。检查模式下敌弹直接消失，不产生累积。注意：目前只覆盖敌弹（普通子弹与地狱火球），敌方手雷爆炸伤害未纳入累积（走原立即扣血）。
- 问题 4（敌方手雷快得像导弹、弹道太直）：三处改——① 投掷速度 9 → 5（慢速抛物线投掷）；② 抛物线视觉：飞行中按 traveled/maxDist 算抛物线高度 gz = 4×28×t×(1−t)（最高 28px），手雷画在 (x, y−gz)，地面画阴影椭圆（随高度缩小），落地后 gz=0；③ 落地后才开始计时：新增 landed 字段，飞行中撞墙或到射程即 landed=true、引信置 180（不立即爆炸），已落地时每帧只减引信、归零才引爆（traveled=maxDist 走原爆炸分支）；drawEnemyGrenadeIndicator 飞行中不显示倒计时（`!g.landed` 直接 return），落地后才显示 GRENADE Xs / 边缘箭头。玩家手雷不动（仍立即引爆）。
- 验证：node --check（engine + lighting）+ build 通过；headless（--levels 7,8 --checks errors,cone）4/4 PASS，零页面错误；cone L7 segs=334、L8 segs=358（与 V6/V7 一致）。待用户手动验证：进干扰者/特殊敌人盲区后玩家视锥与辉光是否一起缩小（L3/L5/L7/L8）、特殊敌人被自己盲区罩住后是否自由移动打人、盲区内被击中是否只累积（头顶 PENDING、血条不动）且出盲区后一并扣血、L8 手雷是否抛物线慢飞、落地后才开始 3 秒倒计时。

## Record 030：重组 V9（2026-11-10，用户反馈四处修复，基于 V8 继续改）
- 同一副本 `observation-lag-restructure-v1/` 继续改；输出 `~/workspace/your_files/L8-新敌人模型版V9.html`（md5 201127efcf1e714255cf2b52950ce5fa），V8（md5 c202a7dc...）未动。
- 问题 1（特殊敌人在自己盲区内乱转圈）：根因两处——① 追击分支盲区内移动是“绕玩家 60px 转圈”（combatAngle = angleFromPlayer + sin(walkCycle)*0.75）；② 盲区触发（triggerSpecialBlind / triggerJammerBlind）不设 alert，敌人未必进追击分支，落到巡逻游弋分支（0.85 随机点）也在圈内乱转。修复（干扰者与特殊敌人通用，Jammer 发动时机不动）：① 维护循环里玩家在盲区内时强制敌人警觉（alert=true，alertCooldown≥120），保证进追击分支；② 追击分支盲区内改风筝战术——与被定住的玩家拉开到 110px 远程射击，并躲出玩家缩小后的视野（算玩家有效视野半角 + 角度差，在视野内就绕到玩家身后 angle+PI，否则保持当前角度只调距离），目标点仍约束在盲区安全圈内（safeZoneRad）；③ 玩家脱离盲区即关闭（距盲区中心 > 半径 130 时 jammerBlindActive=false、冷却 360，不必等 9 秒耗完）。Jammer 发动条件（受击/近身/开场）与 triggerJammerBlind 均未动。
- 问题 2（手雷计时器不稳、受帧数影响）：根因——引信按帧减（180 帧 = 60fps 下 3 秒，30fps 下变 6 秒），抛物线飞行也按帧移动（低帧率飞得慢），总时长 60fps 约 4.3 秒、30fps 约 8.7 秒。修复：引信与飞行均按 window.__frameFactor（gameLoop 每帧算的 dt/(1/60)，60fps=1、30fps=2）缩放——引信 `g.fuse -= ff`，飞行 `next = pos + v*ff`、`traveled += |v|*ff`。倒计时显示仍 `fuse/60` 秒（fuse 以 60fps 帧为单位，ff 使其按真实时间走）。引信时长未变（落地后 3 秒；用户说的“5 秒”为飞行+引信总时长约数）。
- 问题 3（玩家盲区内布雷不显示）：根因——drawTraps() 画在道具层（line 27060），玩家的盲区暗圈（rgba(4,14,9,0.92)，line 27075）在它之后画，把圈内的雷盖住了。修复：drawTraps() 移到盲区暗色遮罩之后（虚线框渲染后、玩家视锥之前，line 27224），雷画在所有盲区暗圈之上。isObjectRevealed 恒为 true，不是原因。另：陷阱吸引由只吸引观察者扩展为观察者 + 特殊敌人（L7/L8 没有观察者，之前雷形同虚设）；击杀日志按类型区分（“特殊敌人已被陷阱消灭”/“观察者已被陷阱消灭”）。布雷操作本身未变（自己盲区内 + 手雷武器 + 右键，点在盲区内且无掩体）。
- 问题 4（敌方手雷改橙色）：与玩家布下的雷同色 #FF6600——手雷本体 #FF3344 → #FF6600，脉冲环 rgba(255,51,68) → rgba(255,102,0)，倒计时/边缘箭头文字 rgba(255,51,68,0.95) → rgba(255,102,0,0.95)（两处）。
- 验证：node --check + build 通过；headless（--levels 7,8 --checks errors,cone）4/4 PASS，零页面错误；cone L7 segs=334、L8 segs=358（与 V6–V8 一致）。待用户手动验证：特殊敌人/干扰者盲区内是否拉开距离远程打、是否绕到玩家视野外、玩家跑出盲区后盲区是否立即关闭、L8 手雷倒计时在不同帧率下是否稳定 3 秒、自己盲区内右键布雷是否可见（L7 与其他关）、雷是否吸引特殊敌人、敌方手雷是否为橙色。

## Record 031：重组 V10（2026-11-10，用户反馈五处，基于 V9 继续改）
- 同一副本 `observation-lag-restructure-v1/` 继续改；输出 `~/workspace/your_files/L8-新敌人模型版V10.html`（md5 362696ee1a8497a299a43db91ed5b99c），V9（md5 201127ef...）未动。
- 问题 1（敌方盲区内玩家伤害累积测不了）：根因——检查模式下敌弹命中前直接 splice 消失（line 5394 `if (isInspectMode()) { splice; continue; }`），子弹根本打不到玩家，PENDING 永不累积。改为：① 检查模式下敌弹仍命中处于敌方盲区内的玩家（盲区外仍无敌、敌弹消失），以便测试；② 伤害改即时扣（血/甲立即减），PENDING 计数只作显示（命中时同步累积，头顶 PENDING -X 照常显示）；③ 离开盲区时只清零计数并 log 本次累积（不再结算，伤害已即时扣过）；④ 检查模式下血减完自动回满不死（hp/shield 回满 + log，代替 Game Over；非检查模式正常 Game Over）。地狱火球/有盾/无盾三支均按此改。
- 问题 2（布雷粒子）：布雷时 `createExplosion(tx,ty,8,'#FF6600')` 只有 8 粒太小看不见，改 24 粒（更明显）；布雷击杀爆裂由红 `#FF3300` 改橙 `#FF6600`（与爆炸/布雷同色统一）。
- 问题 3（敌方手雷飞不到玩家）：根因——敌人一见玩家（≤400px）就扔，手雷射程（maxDist=min(dist,400)）在墙/玩家移动时不够。改为：敌人靠近玩家再扔（≤320px 才扔，>60px），射程拉长（maxDist=min(dist,600)，留余量）。
- 问题 4（5 秒延时太长）：引信 3 秒 → 2 秒（投掷物 fuse/fuseMax 180→120，撞墙/到射程落地重置 180→120，fuse 缺省值 180→120；倒计时仍 fuse/60 显示，现 2.0s）。飞行仍按 frameFactor（V9）。
- 问题 5（手雷移植到 L7）：投掷条件由仅 `level7_test` 改为 `level7_test || level7_lab`（L7/L8 通用）。检查模式 INSPECT_MODE 本就覆盖 L7/L8（line 88），L7 内手雷不扣血（与 L8 同）。
- 验证：node --check + build 通过；headless（--levels 7,8 --checks errors,cone）4/4 PASS，零页面错误；cone L7 segs=334、L8 segs=358（与 V6–V9 一致）。待用户手动验证：敌方盲区内被击中是否即时扣血且头顶 PENDING 累积、血空是否自动回满、离开盲区是否只清零不结算、布雷时橙色爆裂是否明显、布雷击杀爆裂是否橙色、L7/L8 敌人是否在 ≤320px 才扔手雷、引信是否约 2 秒、L7 是否有手雷。

## Record 032：重组 V11（2026-11-10，用户反馈四处，基于 V10 继续改）
- 同一副本 `observation-lag-restructure-v1/` 继续改；输出 `~/workspace/your_files/L8-新敌人模型版V11.html`（md5 c8c561edcdb0ef48da570481e18d1cef），V10（md5 362696ee...）未动。
- 问题 1（布雷没粒子/没音效 + 雷一直留在场上）：根因之一——soundManager.js 的 `playTrap()` 是空壳（`playTrap() {}`），布雷时根本没声音。修复：① 实现 `playTrap()`（短促“咔哒”+低频闷响，triangle 振荡器 420→120Hz、0.12s）；② 布雷爆裂更明显（30 粒 + 8 颗大颗粒 size 6、寿命 50 帧，暗区里也看得见；V10 的 24 粒仍不明显）；③ 盲区关闭时布下的雷全部自动引爆（在 `closeBlindZone` 末尾：每颗雷橙色爆裂 25 粒 + 120px 内敌人即死 + 一次爆炸音效 + 震屏 + log“盲区关闭，N 颗布下的雷全部引爆”，然后 traps 清空；只伤敌人不伤玩家）。粒子绘制层级本身没问题（particles 在盲区暗圈之后画，V9 已确认），问题在音效空壳 + 粒子太小太短。
- 问题 2（手雷总延时约 2 秒）：引信由 2 秒（120 帧）改为 1 秒（60 帧），飞行约 1 秒，总计约 2 秒（投掷物 fuse/fuseMax 120→60，撞墙/到射程落地重置 120→60，fuse 缺省值 120→60；倒计时仍 fuse/60 显示，现 1.0s）。飞行仍按 frameFactor（V9）。
- 问题 3（降低扔手雷概率）：投掷改为 50% 概率（`Math.random() < 0.5` 才扔；没扔也等 8 秒再试，避免每帧重掷——cooldown 在随机判定前就置 480）。
- 问题 4（盲区伤害累积+清算“还是没做出来”）：承认 V10 改错了——V10 把伤害改成即时扣是误读用户反馈（用户上一条“改成依然减血”的本意是“锁血导致测不了，修好让它能测”，不是放弃累积+清算）。V11 恢复 V8 机制：盲区内被击中只累积不扣血（PENDING 计数显示），出盲区一并清算扣血（先护盾后血量 + log）；同时保留 V10 的检查模式可测修复（敌弹仍命中盲区内玩家，盲区外仍无敌）与回满兜底（清算致死时检查模式自动回满不死，非检查模式正常 Game Over；子弹命中致死处也保留回满兜底）。
- 验证：node --check（engine + soundManager）+ build 通过；headless（--levels 7,8 --checks errors,cone）4/4 PASS，零页面错误；cone L7 segs=334、L8 segs=358（与 V6–V10 一致）。待用户手动验证：布雷时是否有橙色爆裂+“咔哒”声、盲区关闭时雷是否全炸且 120px 内敌人死、敌方盲区内被击中是否只累积不扣血（头顶 PENDING 数字涨、血条不动）、出盲区是否一并清算扣血（log 显示护盾/血量各减多少）、血空是否回满、手雷总延时是否约 2 秒、敌人扔手雷是否明显变少。

## Record 033：重组 V12（2026-11-10，纠正 V11 误读，基于 V11 继续改）
- 同一副本 `observation-lag-restructure-v1/` 继续改；输出 `~/workspace/your_files/L8-新敌人模型版V12.html`（md5 765bb00d04c9dee5eaab57f97ed8c5b3），V11（md5 c8c561ed...）未动。
- 误读纠正：用户上一条“布雷的时候没有粒子爆裂效果 雷炸的时候才有效果和音效”是在描述他想达到的效果（布雷无特效、雷炸才有特效+音效），不是想改的；V11 把它当成 bug 修了（粒子加码到 30 粒+大颗粒、新写 playTrap 音效），完全反了。V12 全部撤回：布雷时只放雷 + 日志，什么也没有（去掉 createExplosion、8 颗大颗粒、playTrap 调用）；soundManager.js 的 playTrap 恢复空壳（`playTrap() {}`）。雷炸时（踩雷击杀、盲区关闭全炸）仍是正常橙色爆炸特效 + playExplosion 音效（未动）。V11 的其余三处（盲区累积+清算、手雷总延时约 2 秒、投掷概率 50%、盲区关闭全雷自爆）未动。
- 验证：node --check（engine + soundManager）+ build 通过；headless（--levels 7,8 --checks errors,cone）4/4 PASS，零页面错误；cone L7 segs=334、L8 segs=358。待用户手动验证：布雷时是否什么也没有（无粒子、无音效），雷炸时是否正常爆炸特效+音效。

## Record 034：重组 V13（2026-11-10，用户反馈两处，基于 V12 继续改）
- 同一副本 `observation-lag-restructure-v1/` 继续改；输出 `~/workspace/your_files/L8-新敌人模型版V13.html`（md5 29a1c0e30321f2e573a7c97c871f166f），V12（md5 765bb00d...）未动。
- 问题 1（PENDING 文字被盲区盖住）：根因——PENDING 文字画在 Jammer/特殊敌人盲区暗圈之前，玩家正在该盲区内，暗圈（0.75–0.98 不透明度径向渐变）把它盖住了。修复：把 PENDING 文字移到 `drawTraps()` 之后（所有盲区遮罩、虚线框、陷阱都已画完），画在最上层。
- 问题 2（字太大）：字体由 `bold 13px monospace` 缩小为 `bold 10px monospace`（位置仍为玩家头顶 y-30，颜色仍为红 rgba(255,51,68,0.95)）。
- 验证：node --check + build 通过；headless（--levels 7,8 --checks errors,cone）4/4 PASS，零页面错误；cone L7 segs=334、L8 segs=358。待用户手动验证：敌方盲区内被击中时头顶 PENDING -X 是否看得见、字号是否合适。

## Record 035：重组 V14（2026-11-11，用户定方向：地面微差地砖 + 墙体填色，只在 L8 中间房间试）
- 同一副本 `observation-lag-restructure-v1/` 继续改；输出 `~/workspace/your_files/L8-新敌人模型版V14.html`（md5 de4481afbb4edc607fe57a1fa01f84a8），V13（md5 29a1c0e3...）未动。
- 地面（level7_test.js）：中间房间梯形（1055,470 / 2145,470 / 1896,1960 / 1304,1960）上叠加微差地砖图案填充（50px 一格，2x2 共 4 格微差深绿：#05100c / #0a1f18 / #040d0a / #081a14；离屏 100x100 canvas 做模板，createPattern repeat，缓存于 window.__l8TilePattern）。只在 level7_test.js 里加，level7_lab 与 L8 两边房间不动（大眼三房底色仍是整块 #05100c，地砖只盖中间梯形）。
- 墙体（engine.js applyObstacleTheme 的 level7_test 分支）：包围盒中心落在中间房间（x 1055–2145，y 470–1960）的墙换填色——普通墙 #051914→#0f1f2a（深灰蓝），矮墙 #064e3b→#1a2f42；描边不动（普通墙 #10b981、矮墙 #34d399）；包围盒中心不在中间房间的墙（两边房间）与 level7_lab 全部不动。判定用 ensureObstacleBBox 中心。
- 验证：node --check（engine + level7_test）+ build 通过；headless（--levels 7,8 --checks errors,cone）4/4 PASS，零页面错误；cone L7 segs=334、L8 segs=358。另用一次性截图确认：L8 中间房间地砖已渲染（可见纵向深浅条纹，图案已缓存），无页面错误。待用户手动验证：L8 中间房间地砖是否够明显、墙体填色与地面区分度够不够、两边房间与 L7 是否确实没变。

## Record 036：重组 V15（2026-11-11，用户反馈：V14 太复杂，改简单方格+渐变立体感）
- 同一副本 `observation-lag-restructure-v1/` 继续改；输出 `~/workspace/your_files/L8-新敌人模型版V15.html`（md5 11beda8e98a2a220275c092634211629），V14（md5 de4481af...）未动。
- 地面（level7_test.js）：撤掉 V14 的 4 色地砖图案（100x100、4 格微差深绿），改回简单方格（像 L1/L2）：50x50 单格模板，底色仍为 #05100c，方格边缘带渐变（径向渐变：中心 rgba(52,211,153,0.08) 略亮、边缘 rgba(0,0,0,0.12) 略暗，斜面感、不扁平）+ 翡翠方格边线 rgba(16,185,129,0.28)；图案缓存改用 window.__l8GridPattern。只盖中间房间梯形，两边房间与 level7_lab 不动。
- 墙体（engine.js applyObstacleTheme 的 level7_test 分支）：撤掉 V14 的扁平纯色填色（#0f1f2a / #1a2f42），改渐变立体感——按障碍物包围盒做纵向线性渐变（上亮下暗，模拟顶光）：普通墙 #16283a→#0a141f，矮墙 #22394f→#12202e；描边不动；只改包围盒中心在中间房间（x 1055–2145，y 470–1960）的墙，两边房间与 level7_lab 不动。
- 验证：node --check（engine + level7_test）+ build 通过；headless（--levels 7,8 --checks errors,cone）4/4 PASS，零页面错误；cone L7 segs=334、L8 segs=358。另用一次性截图确认：L8 中间房间简单方格已渲染（翡翠细线 50px 方格，清晰简洁），无页面错误。待用户手动验证：方格是否够简洁、边缘渐变/立体感够不够、墙体渐变是否看得出深度、两边房间与 L7 是否确实没变。

## Record 037：重组 V16（2026-11-11，用户反馈：地砖去翡翠色、墙体改回深绿、同步 L7、手雷范围圈+修屏外箭头）
- 同一副本 `observation-lag-restructure-v1/` 继续改；输出 `~/workspace/your_files/L8-新敌人模型版V16.html`（md5 28ae94e5f420780235e8d08a8a46d620），V15（md5 11beda8e...）未动。
- 地砖去翡翠色（level7_test + level7_lab）：径向渐变中心由翡翠 rgba(52,211,153,0.08) 改为中性提亮 rgba(255,255,255,0.05)，边缘 rgba(0,0,0,0.15) 不变；底色仍 #05100c，方格边线翡翠 rgba(16,185,129,0.28) 不动；图案缓存改名 window.__l78GridPattern（L7/L8 共享）。
- 同步移植到 L7（level7_lab）：中间房间梯形上叠同一方格图案（与 L8 完全相同）；墙体渐变同步（见下）。
- 墙体改回深绿（engine.js applyObstacleTheme）：撤掉 V14/V15 的灰蓝渐变（#16283a→#0a141f / #22394f→#12202e），改深绿渐变（上亮下暗）：普通墙 #0a1f18→#020a07，矮墙 #0d2b22→#04100b；L8 只改中间房间（包围盒中心判定），L7 整个图就是中间房间、全用渐变；描边不动。
- 手雷落地加爆炸范围虚线圆（engine.js 敌方手雷渲染，L7/L8 通用）：g.landed 时在落点画橙色虚线圆（rgba(255,102,0,0.55)，线宽 1.5，虚线 [8,6]，半径 g.blastRadius || 120）。
- 修屏外箭头指向（drawEnemyGrenadeIndicator）：之前用 vw/2 与 vh/2 分别缩放 x/y，点不在中心到手雷的射线上（宽屏时 x 被拉得更远），箭头看起来歪；改为射线与屏幕矩形求交（按 dx/dy 分别求 t 取最小正值），箭头落在中心到手雷的连线上，正好指向手雷；旋转角 ang 不变。
- 验证：node --check（engine + level7_test + level7_lab）+ build 通过；headless（--levels 7,8 --checks errors,cone）4/4 PASS，零页面错误；cone L7 segs=334、L8 segs=358。一次性截图确认：L7 方格已渲染（深色中性，无翡翠 tint）、L7 恰好抓到一颗真实敌方手雷落地（GRENADE 0.5s），橙色爆炸范围虚线圆已画出、半径约 120。待用户手动验证：地砖是否够深色、墙体深绿渐变是否看得出深度、L7 移植是否一致、手雷范围圈与屏外箭头是否指得准。

## Record 038：重组 V17（2026-11-11，用户反馈 V16 仍见翡翠、墙体无渐变——已定位原因）
- 同一副本 `observation-lag-restructure-v1/` 继续改；输出 `~/workspace/your_files/L8-新敌人模型版V17.html`（md5 9e1bd5d0ef73d6f3ffada5bfdb0257b1），V16（md5 28ae94e5...）未动。
- 原因定位（已向用户说明）：①地砖仍见翡翠——方格边线仍是翡翠 rgba(16,185,129,0.28)，每格描一圈、整地都显翡翠（中心渐变 V16 已是中性，但边线没改）；②地砖渐变对比太低（白 5%/黑 15%）；③墙体渐变两端都近黑（#0a1f18→#020a07），看不出。
- 地砖（level7_test + level7_lab，两处同改）：边线改中性浅色 rgba(255,255,255,0.12)（无色相，只是一条亮缝，深色地板上看得见、不带绿）；渐变加对比——中心白 9%、边缘黑 22%。
- 墙体（engine.js，L7 与 L8 中间房间同改）：改三段式渐变——顶部亮带（0% #225e41 / 矮墙 #276b4a，22% 收进底色 #0a1f18 / #0d2b22），再到底部近黑（#020a07 / #04100b）；亮带集中在顶缘，再高的墙也看得见立体感；描边翡翠不动。
- 验证：node --check（engine + level7_test + level7_lab）+ build 通过；headless（--levels 7,8 --checks errors,cone）4/4 PASS，零页面错误；cone L7 segs=334、L8 segs=358。一次性截图确认：L8 地砖已是中性灰白方格（无翡翠）、墙体顶缘亮带可见（上亮下暗）。待用户手动验证：地砖是否彻底无翡翠、墙体渐变是否够明显。

## Record 039：重组 V18（2026-11-11，用户纠正：我过度解读了）
- 同一副本 `observation-lag-restructure-v1/` 继续改；输出 `~/workspace/your_files/L8-新敌人模型版V18.html`（md5 19832abdd3d0530bce85b5434f7c3aa4），V17（md5 9e1bd5d0...）未动。
- 用户纠正：边线翡翠绿没问题、不需要改（V17 改中性是过度解读，已改回）；地砖中间的问题是白色提亮叠在深绿底上显翡翠绿，中心应是“浅色效果的深色”。
- 地砖（level7_test + level7_lab，两处同改）：撤掉底色 + 白/黑径向叠加，改直接用深色之间的径向渐变（中心 #0a1f18 略浅、边缘 #020a07 更深），不再用白色提亮；方格边线改回翡翠 rgba(16,185,129,0.28)。墙体不动（用户：先这样）。
- 验证：node --check（level7_test + level7_lab）+ build 通过；headless（--levels 7,8 --checks errors,cone）4/4 PASS，零页面错误；cone L7 segs=334、L8 segs=358。一次性截图确认：L8 地砖中心已是深色（无翡翠 tint）、翡翠方格边线恢复。待用户手动验证：地砖中心是否够深色、渐变是否自然。

## Record 040：重组 V19（2026-11-11，用户反馈：地砖渐变太夸张、墙体渐变方向错了）
- 同一副本 `observation-lag-restructure-v1/` 继续改；输出 `~/workspace/your_files/L8-新敌人模型版V19.html`（md5 c356011894070b772d055eb26fd3662b），V18（md5 19832abd...）未动。
- 地砖（level7_test + level7_lab，两处同改）：中心再暗一点（#0a1f18→#051410），边缘仍 #020a07；渐变弱化，只留一点立体感。翡翠边线不动。
- 墙体（engine.js，L7 与 L8 中间房间同改）：渐变方向错了——之前是上下一长条（纵向三段亮带），改横向（左右，沿墙体横向宽）；同步弱化——改两段式低对比（左略亮、右更深）：普通墙 #081a14→#020a07，矮墙 #0a2018→#04100b；描边翡翠不动。
- 验证：node --check（engine + level7_test + level7_lab）+ build 通过；headless（--levels 7,8 --checks errors,cone）4/4 PASS，零页面错误；cone L7 segs=334、L8 segs=358。一次性截图确认：L8 地砖更暗、渐变更弱，墙体横向渐变已换。待用户手动验证：地砖立体感是否刚好、墙体横向渐变方向与弱化程度是否对。

## Record 041：重组 V20（2026-11-11，用户反馈 V19 墙体“改错了、反了”——已用探针定位真相）
- 同一副本 `observation-lag-restructure-v1/` 继续改；输出 `~/workspace/your_files/L8-新敌人模型版V20.html`（md5 77a20c6afa1e3f59f9bc0978c67a6fab），V19（md5 c3560118...）未动。
- 探针真相（已向用户说明）：用 createLinearGradient 包装探针实测——横向渐变确实只创建在中间房间墙上（x 1048–2152 一带，如 [1048,1117]、[1132,1285]、[1915,2068]），两边房间外墙（WEST/EAST EYE OUTER WALL，x 145–1060 / 2140–3055）一次都没创建，拿的是扁平填色；判定逻辑没反。用户说的“反了”是 V19 渐变太淡：左 #081a14 与扁平填色 #051914 几乎同色，等于没渐变，中间房间/L7 看起来“没变化”；从两边房间看过去，正好看到中间房间边界墙的渐变，误以为是两边房间的墙。
- 修法（engine.js，L7 与 L8 中间房间同改）：横向渐变对比加大到看得见——左 #0a1f18→右 #020a07（普通墙），矮墙 #0d2b22→#04100b；仍是深色、横向。地砖不动（V19 的 #051410 中心已定）。
- 验证：node --check（engine）+ build 通过；headless（--levels 7,8 --checks errors,cone）4/4 PASS，零页面错误；cone L7 segs=334、L8 segs=358。一次性截图确认：L8 中间房间边界墙横向渐变已看得见（左略亮、右更深）。待用户手动验证：中间房间与 L7 墙体渐变是否看得见、两边房间外墙是否确实还是扁平。

## Record 042：重组 V21（2026-11-11，用户再纠：“眼见为实、中间房间都分不清、依然没改过来”——认错，根因找到了）
- 同一副本 `observation-lag-restructure-v1/` 继续改；输出 `~/workspace/your_files/L8-新敌人模型版V21.html`（md5 364944200c5b0d986239a85e7b3c7417），V20（md5 77a20c6a...）未动。
- 认错：V20 我拿探针说“判定没反”是错的——探针只证明渐变被创建在中间房间墙上，没证明它看得见。根因：薄斜墙是 14px 厚的平行四边形（如 #4：长边 807px、短边 14px），V19/V20 的横向渐变按包围盒宽（153px）定义，墙体本身只占其中 14px，只取了渐变的 9%，肉眼等于没有；中间房间看起来“没变化”是对的。两边房间外墙本是扁平填色，但从两边看过去正好看到中间房间边界墙，用户误以为是两边房间的墙——这部分是我的解释没说清，但“没改过来”本身没错。
- 修法（engine.js，新增 createWallThicknessGradient helper，L7 与 L8 中间房间同用）：渐变改按墙体厚度方向定义——找最长边、取其法线为厚度方向，沿法线取所有点的投影最小/最大作渐变两端（横跨墙体厚度，不再按包围盒宽）；颜色仍是深色横向（普通墙 #0a1f18→#020a07，矮墙 #0d2b22→#04100b）；points 不足时回落到包围盒横向渐变。两边房间外墙仍扁平填色。地砖不动。
- 验证：node --check（engine）+ build 通过；headless（--levels 7,8 --checks errors,cone）4/4 PASS，零页面错误；cone L7 segs=334、L8 segs=358。一次性截图确认：中间房间内墙 #4 横跨厚度的渐变已看得见，西侧外墙 #9 仍是扁平。待用户手动验证：中间房间与 L7 墙体渐变是否真的看得见、两边房间外墙是否确实还是扁平。

## Record 043：重组 V22（2026-11-11，用户：墙体不用管了，恢复原来深色；L7 简介太老，重写中英文；调出 L7/L8 全部战斗日志）
- 同一副本 `observation-lag-restructure-v1/` 继续改；输出 `~/workspace/your_files/L8-新敌人模型版V22.html`（md5 47a9038f6ef352040197219760f46020），V21（md5 36494420...）未动。
- ① 墙体：恢复原来深色扁平填色，移除 V14–V21 新加的渐变效果。engine.js：删掉 createWallThicknessGradient helper；L7（level7_lab）与 L8（level7_test）墙体分支改回 `ctx.fillStyle = (obs.type === 'low_wall') ? '#064e3b' : '#051914'; ctx.fill();`。描边不动。地砖不动（V19 的深色渐变+翡翠边线）。
- ② L7 改名指挥中心、去 Apex（translations.ts + engine.js + level7_lab.js + level7_test.js）：
  - 选关：L7 '第 7 关 · 指挥中心' / 'Level 07 · Command Center'；简介按 L7 地图实际元素重写（梯形主控大厅、中央环形会议桌、扇形指挥终端与三联工作站、3 台监控摄像头、4 扇重型防爆门）。
  - 简报：code 'SECTOR 07 // COMMAND CENTER'；intel 三条（梯形主控大厅+环形会议桌/扇形终端；3 台摄像头覆盖 4 扇防爆门与会议桌、4 联圆形工作站+三联隔间；近黑特种敌人半弧护盾+翡翠盲区诱捕、西装特工）；objective '坚守梯形指挥大厅，肃清 5 波精锐防卫部队' / 'Defend the trapezoidal command hall and eliminate 5 waves of elite defenders'；notice 提到摄像头报警与翡翠盲区诱捕。
  - L8：选关/简报里的“顶石科研中心/Apex Research Complex”改“指挥中心/Command Center”；其余不动。
  - 报警横幅（engine.js）：'🚨 指挥中心安全警报 - 指挥中心已进入全面封锁 🚨' / '🚨 COMMAND CENTER SECURITY ALARM - FACILITY IN FULL LOCKDOWN 🚨'。
  - level7_lab.js：name '第 7 关 · 指挥中心'、nameEn 'Level 07 · Command Center'、人员屏 'APEX (COMMANDER)'→'OVERLORD (COMMANDER)'、Zone '顶石中央指挥大厅 (Room 01)'→'中央指挥大厅 (Room 01)'；level7_test.js 同步（header、WEST/EAST EYE APEX CAP→TIP CAP、人员屏、三个 Zone 去顶石前缀）。内部 id 'apex_chamber_1' 未动（非显示名，改 id 有断 Zone 逻辑风险）；L0 的 Floating Apex Power Crystal 与一条 L0 背景注释未动（与 L7 无关）。
- ③ L7/L8 战斗日志已调出（见本次回复）：共 86 条唯一 addLog 字符串，筛出 L7/L8 实际会出现的约 60 条，分 10 类列出；**发现 10 条 L7/L8 核心日志无英文翻译**（特殊敌人翡翠诱捕、虚线干扰框、敌方手雷投掷/爆炸、弹匣更换、弹药耗尽、盲区结算、布雷自爆、拾取弹药、检查模式回满），英文模式下仍显示中文——待用户决定是否补英文。
- 验证：node --check（engine、level7_lab、level7_test）+ build 通过；headless（--levels 7,8 --checks errors,cone）4/4 PASS，零页面错误；cone L7 segs=334、L8 segs=358。

## Record 044：重组 V23（2026-11-11，用户：补缺英文；干扰者确认，不出现就别再日志里出现）
- 同一副本 `observation-lag-restructure-v1/` 继续改；输出 `~/workspace/your_files/L8-新敌人模型版V23.html`（md5 397db0768d85439c88933b3e98b28f96），V22（md5 47a9038f...）未动。
- ① 补英文（engine.js，LOG_TRANSLATION_MAP + translateLogMessage）：10 条静态——特殊敌人翡翠诱捕、虚线干扰框、敌方手雷投掷/爆炸、弹匣更换、弹药耗尽、检查模式回满、误入特殊敌人翡翠盲区、特殊敌人/西装特工陷阱击杀；3 条模板规则（带动态数字，静态 map 无法匹配）——敌方盲区结算（护盾 -X，血量 -Y）、盲区关闭布雷自爆（X 颗）、拾取弹药 (+X)。验证：10/10 静态条目、3/3 模板规则均在源码中。
- ② 干扰者确认（读 spawnWave 刷怪分支，L7/L8 只出特殊敌人与西装特工，isJammer/isObserver 恒 false，2026-11-09 用户定）：纯干扰者日志（受击发动/近身引爆/击毙消散/压制分支）均由 isJammer 门控，在 L7/L8 里本就不会出现，无需改。但有两处共用机制会误报：
  - 误入敌方盲区（5072 行）：玩家开着自己盲区误入敌方盲区时，特殊敌人翡翠盲区也走“误入暗幕干扰区”+紫色粒子。已改：先取 jzState，按 jzState.jammer.isSpecial 分文案（特殊敌人翡翠盲区/暗幕干扰区）与粒子色（翡翠 #10b981/紫 #C084FC）；**保持原 if/else-if/else 结构**（jzState 先算再判 inZone），盲区能量照常扣。
  - 陷阱击杀（5920 行）：`e.isSpecial ? "特殊敌人..." : "观察者..."`，西装特工被陷阱杀会误报“观察者已被陷阱消灭”。已改：特殊→“特殊敌人已被陷阱消灭”，西装特工→“西装特工已被陷阱消灭”，其余（其他关卡的观察者）→“观察者已被陷阱消灭”；三条英文一并补进 map。
- 验证：node --check（engine）+ build 通过；headless（--levels 7,8 --checks errors,cone）4/4 PASS，零页面错误；cone L7 segs=334、L8 segs=358。待用户手动验证：英文模式下 L7/L8 日志是否全英文、陷阱杀西装特工与误入翡翠盲区的文案是否正确。

## Record 045：重组 V24（2026-11-11，用户：确认日志里不要说观察者）
- 同一副本 `observation-lag-restructure-v1/` 继续改；输出 `~/workspace/your_files/L8-新敌人模型版V24.html`（md5 0b9a671a503ca3777a2d222605fb7932），V23（md5 397db076...）未动。
- 确认：全代码只有一处 addLog 提到“观察者”——陷阱击杀（5948 行）。陷阱只吸引观察者 + 特殊敌人；L7/L8 没有观察者，所以能走到这行的只有特殊敌人，之前 V23 的分类型文案在 L7/L8 里本就只会出“特殊敌人已被陷阱消灭”。为彻底堵死，改成分关卡：L7/L8 里非特殊敌人一律“西装特工已被陷阱消灭”，“观察者已被陷阱消灭”只在其他关卡（观察者真实存在，1–6 关 3 波后刷）出现。LOG_TRANSLATION_MAP 里的“观察者已被陷阱消灭”条目保留（供 1–6 关用），与 L7/L8 无关；图鉴里的 observerTitle（敌人图鉴通用条目，非日志）未动。
- 验证：node --check（engine）+ build 通过；headless（--levels 7,8 --checks errors,cone）4/4 PASS，零页面错误；cone L7 segs=334、L8 segs=358。

## Record 046：版本清理（2026-11-11，用户发话：只留最新 V24、V23）
- 按用户 2026-11-10 版本保留规则执行：~/workspace/your_files/ 里 V5–V22 共 18 个构建全部进回收站（30 天可恢复，2026-12-11 到期），只留 V23（md5 397db076...）与 V24（md5 0b9a671a...）。
- 其中 V5、V10–V13 是指向 ~/workspace/goals/goal/files/ 的符号链接，trash 时只移除了链接本身，未动目标文件。
- 清理后 your_files/ 仅剩 2 个构建：V23、V24。下版 V25。

## Record 047：重组 V25（2026-11-11，用户：L1–L6 武器栏改成 L7 样式；5 张新参考图做图标）
- 同一副本 `observation-lag-restructure-v1/` 继续改；输出 `~/workspace/your_files/L8-新敌人模型版V25.html`（md5 34494ccfaa258c31d45cc54127fc15b3），V24（md5 0b9a671a...）与 V23 保留在 your_files/。
- 新图标（用户提供的 5 张参考图，全部正侧面、无倾斜）：步枪 AR-15（图1）、手枪 Glock 45（图2）、冲锋枪 B&T APC9（图3）、狙击枪 AXMC（图4）、手雷（图5）。做法：去白底（自适应阈值=四角背景亮度−8，最大连通域+填洞）→ 白色剪影透明底 PNG → 替换 WEAPON_PHOTO 1–5 号。狙击枪按用户要求截断枪管+护木：从包围盒左端切掉 38%（消音器+大段枪管），成品 1100x351（3.13:1），图标槽内不再显小。图标文件留存在副本内 `weapon-icons/weapon_{1..5}_{rifle,pistol,smg,sniper,grenade}.png`。
- L1–L6 武器栏改成 L7 样式：drawWeaponIcons 的 !isL78 分支内分流——L0 保持原版 46x46 不动；L1–L6 新 110x45（照片图标、翡翠 #10b981/选中天蓝 #38bdf8、武器名+键位 [1]–[5]、右下角 ∞ 表示弹药无限，无 AUTO/SEMI、无弹药耗尽红框）。连杀奖励（右下角橙色）不动。drawWeaponSilhouette 改成分流：只有 L0 用原版 fillRect 画法，L1–L8 一律照片/SVG。
- 冲突修复：id 3 在 L1–L6 是冲锋枪、在 L7/L8 是 GEN-12 霰弹枪，共用一个 WEAPON_PHOTO[3] 会串味。已从 V24 恢复旧霰弹枪照片，存为 WEAPON_PHOTO.shotgun；drawWeaponSilhouette 按关卡分流——L7/L8 的 id 3 用 shotgun 照片，L1–L6 的 id 3 用新 B&T APC 照片。L7 截图已确认霰弹枪图标恢复，L1 截图确认步枪新照片图标正常。
- 验证：node --check + build 通过；headless（--levels 0,1,7,8 --checks errors,cone）8/8 PASS，零页面错误；L1/L7 武器栏截图已目视确认。L0 未动（冒烟 cone L0 正常）。

## Record 048：重组 V26（2026-11-11，用户：L1–L6 武器默认全解锁）
- 同一副本 `observation-lag-restructure-v1/` 继续改；输出 `~/workspace/your_files/L8-新敌人模型版V26.html`（md5 a54ff242369fd7cc70948177e95e6455），V25（md5 34494ccf...）与 V23 保留在 your_files/。
- initMapLayout 的 L1–L6 分支：unlockedWeapons 从只含步枪改成 5 把全解锁（与 L7/L8 一致）；开局当前武器仍为步枪（原有 currentWeapon 复位逻辑不动）。L0、L7/L8 分支未动。
- 验证：node --check + build 通过；headless（--levels 1,7 --checks errors,cone）4/4 PASS，零页面错误；L1 武器栏截图确认 5 把全解锁、图标均为新照片（3 号位为 B&T APC 冲锋枪，非霰弹枪）。

## Record 049：重组 V27（2026-11-11，用户：修 V25/V26 把 L7/L8 图标也换掉的错）
- 事故：V25 替换 WEAPON_PHOTO 1–5 时动了 L1–L8 共用的照片，导致 L7/L8 图标跟着变了（只修了 id 3 霰弹枪，没修 1/2/4/5）。用户 11:21 叫停并要求立即修。
- 修复：从 V24 恢复 L7/L8 的旧照片 1/2/4/5，存为 WEAPON_PHOTO.l78_1 / l78_2 / l78_4 / l78_5（霰弹枪已是 WEAPON_PHOTO.shotgun）；drawWeaponSilhouette 的 photoKey 按关卡分流——L7/L8 一律用旧照片，L1–L6 用用户新给的照片。L1–L6 的 110x45 武器栏与全解锁（V25/V26 内容）保留，L0 未动。
- 输出 `~/workspace/your_files/L8-新敌人模型版V27.html`（md5 a56e73e831bb13b8671bd34bc83e21dc），V26（md5 a54ff242...）与 V23 保留在 your_files/。
- 验证：node --check + build 通过；headless（--levels 0,1,7,8 --checks errors,cone）8/8 PASS，零页面错误；L1/L7 武器栏截图目视确认两边图标已不同——L1 为新图（AR-15/Glock/B&T APC/AXMC/手雷），L7 为旧图（步枪/手枪/霰弹枪/狙击枪/榴弹均为 V24 原样）。

## Record 050：重组 V28（2026-11-11，用户：新图标糊、扳机护圈没镂空、L1–L6 颜色错成 L7 翡翠）
- 图标重做 v4：亮度图先轻微高斯模糊（radius 1.5）再阈值，抹掉照片纹理噪点造成的锯齿边缘；仍只填 <80px 小洞，扳机护圈等结构洞保留镂空。手枪扳机护圈洞（1996px）与冲锋枪/狙击枪/手雷的结构洞均保留；步枪扳机护圈洞较小（81px），仍保留。图标文件已覆盖 `weapon-icons/`，并重新写入 WEAPON_PHOTO 1–5（L1–L6 用；L7/L8 的 l78_*/shotgun 未动）。
- 颜色修正：L1–L6 的 110x45 武器栏改回自己的绿/黄——图标与框线 #00FF66（选中 #FFFF00），框底 rgba(4,16,10,0.88)（选中 rgba(0,255,102,0.28)）；不再用 L7/L8 的翡翠 #10b981 / 天蓝 #38bdf8。L7/L8 未动。
- 输出 `~/workspace/your_files/L8-新敌人模型版V28.html`（md5 038f087481cb9678d26784532081c80a），V27（md5 a56e73e8...）与 V23 保留在 your_files/。
- 验证：node --check + build 通过；headless（--levels 0,1,7,8 --checks errors,cone）8/8 PASS，零页面错误；L1/L7 武器栏截图确认——L1 为亮绿/黄色新图标，L7 为翡翠色旧图标，未变。

## Record 051：重组 V29（2026-11-11，用户给剪影合图：别再找借口，狙击枪不截、塞不下就缩小）
- 图标来源改用用户给的剪影合图（`E16DA28D-B10F-458C-B632-0710835D1A59.jpeg`，黑剪影白底，5 块各为一个连通域）：按连通域切分（从上到下狙击/步枪/手枪/冲锋枪/手雷），黑→白、底→透明，不做任何填洞/闭运算/模糊——剪影本身已干净，扳机护圈镂空原样保留。旧的照片阈值图标（v3/v4）全部作废。
- 狙击枪不截断：整枪保留（804x158，5.09:1），进 90x24 格子时按比例缩小（用户原话：塞不下就缩小）。其余步枪 2.92:1、手枪 1.44:1、冲锋枪 1.42:1、手雷 0.76:1。
- L1–L6 颜色仍为 V28 的绿/黄（#00FF66/#FFFF00）；L7/L8 未动（l78_*/shotgun）。
- 输出 `~/workspace/your_files/L8-新敌人模型版V29.html`（md5 56e6e6e5c0a650f134719b9189f5c624），V28（md5 038f0874...）与 V23 保留在 your_files/。
- 验证：node --check + build 通过；headless（--levels 0,1,7,8 --checks errors,cone）8/8 PASS，零页面错误；L1/L7 武器栏截图确认——L1 为合图剪影新图标（亮绿/黄），L7 为翡翠色旧图标，未变。

## Record 052：测试版V1（2026-11-11，用户：smg 稍放大；L1–L6/L7–L8/L0 三者武器隔离写进代码并写明；新版改名“测试版V1”，旧序号太多）
- SMG 放大：L1–L6 的冲锋枪（id 3）显示放大 1.3 倍（drawWeaponSilhouette 内 iconScale，只在非 L7/L8 分支生效）。L7/L8 的霰弹枪同为 id 3，不受影响。
- 武器图标三级隔离（写进代码，engine.js，旧混装 WEAPON_PHOTO 已删除）：
  - L0 地狱关：不用任何照片图标，走 drawWeaponSilhouetteOriginal（fillRect 剪影）。
  - L1–L6：WEAPON_PHOTO_L16（用户剪影合图；id 3 = 冲锋枪）。
  - L7/L8：WEAPON_PHOTO_L78（V24 旧照片；id 3 = GEN-12 霰弹枪）。
  - 三套互不共用：改 L1–L6 只动 WEAPON_PHOTO_L16，改 L7/L8 只动 WEAPON_PHOTO_L78，改 L0 不动照片表。drawWeaponSilhouette 按关卡（isL78）选表；getWeaponPhoto 拆成 getWeaponPhotoL16 / getWeaponPhotoL78，各自缓存。
  - 教训（V25 事故根源）：之前 WEAPON_PHOTO 是 L1–L8 混装的一张表，改 L1–L6 会连带改 L7/L8；分表后结构上不再可能。
- 版本改名：新版起用“测试版V1”编号（用户：旧 V23–V29 序号太多），输出 `~/workspace/your_files/L8-测试版V1.html`（md5 cc7367364582e6ed29f640f27d406224）。旧 V23–V29 文件仍在 your_files/，未删（等用户确认清理）。
- 验证：node --check + build 通过；headless（--levels 0,1,7,8 --checks errors,cone）8/8 PASS，零页面错误；L0/L1/L7 武器栏截图确认——L0 为原版 fillRect（46x46 红框）未动，L1 为合图剪影（亮绿/黄，SMG 已放大），L7 为翡翠色旧照片未动（与 V28/V29 的 L7 截图逐字节相同）。

## Record 053：测试版V2（2026-11-11，用户：L1–L6 恢复默认只有步枪；未解锁改成图标变暗，不要黑屏加问号）
- L1–L6 默认解锁恢复为只有步枪（initMapLayout 的 else 分支，撤销 V26 全解锁；其余武器靠关卡掉落解锁）。L7/L8 分支仍全解锁，不动。
- L1–L6 武器栏未解锁格：不再画黑底问号，改为图标+武器名+键位整体变暗（#555，可预览是哪把武器；无 ∞）。已解锁格不变。
- 输出 `~/workspace/your_files/L8-测试版V2.html`（md5 2a0b31a390c70dbae412c19167eea19c）。
- 验证：node --check + build 通过；headless（--levels 0,1,7,8 --checks errors,cone）8/8 PASS，零页面错误；L1/L7 武器栏截图确认——L1 只有步枪亮黄选中，其余 4 把图标变暗可辨，L7 全解锁翡翠/天蓝未动（与测试版V1 的 L7 截图逐字节相同）。

## Record 054：测试版V3（2026-11-11，用户：L1–L6 图标仍略模糊变形，换了 5 张高清图重做；歪了就略旋转确保正侧面；尺寸不变、不截短；敌人掉落武器卡片同步改；注意关卡隔离）
- 图标换源：5 张新高清剪影单图（pfyxoepfyxoepfyx=步枪、13xfp613xfp613xf=手枪、poj6j6poj6j6poj6=冲锋枪、2up8up2up8up2up8=狙击枪、380e4s380e4s380e=手雷），黑→白、底→透明，不做填洞/闭运算/模糊，不截断（狙击枪 5.05:1 整枪保留，进格子按比例缩小）。尺寸/比例与上一版一致的思路：只裁包围盒。
- 旋转矫正：先用最小包围盒法算出 SMG −4°、狙击枪 +4°，但放大目视+水平参考线确认那是错的（包围盒被弹匣/脚架等斜向部件带偏，−4° 后的 SMG 明显歪了）；5 张原图均为正侧面，最终旋转 0°，不旋转。教训：别拿包围盒面积当正侧面判据，以枪管水平目视为准。
- 只动 WEAPON_PHOTO_L16（1–5 号），WEAPON_PHOTO_L78 未动。敌人掉落武器卡片（44x30 黄框）走同一 drawWeaponSilhouette，按关卡选表——L1–L6 自动用新图标，L7/L8 仍用旧照片，无需另改。
- 输出 `~/workspace/your_files/L8-测试版V3.html`（md5 7c7de3066e212fc9cf4a7a3d3771c34c）。
- 验证：node --check + build 通过；headless（--levels 0,1,7,8 --checks errors,cone）8/8 PASS，零页面错误；L1/L7 武器栏截图确认——L1 为新高清剪影（亮绿/黄，SMG 仍 1.3 倍，扳机护圈镂空清晰），L7 为翡翠色旧照片未动（与测试版V1/V2 的 L7 截图逐字节相同）。

## Record 055：测试版V4（2026-11-11，用户：V3 更差，步枪护木变形）
- 根因：V3（v6）只做了黑→白阈值，没去细齿。步枪护木导轨齿缝、散热孔是 <9px 的高频细节，图标 1100px 缩到武器栏 70x24（约 15 倍）时低于奈奎斯特极限，锯齿成一团“融化”的 blob——不是阈值问题（80/128/180 三阈值护木形态一致），也不是旋转问题。
- 修复（v7 脚本 /tmp/make_weapon_icons_v7.py）：9x9 闭运算并掉导轨齿缝（护木顶边变直）+ 只填 <300px 小洞（填掉散热孔，保留扳机护圈等结构大洞：步枪 1346px、手枪 14894px、冲锋枪 4989px、狙击枪 1828px、手雷 6710px 均保留）。5 张全部重做，只动 WEAPON_PHOTO_L16，L78 未动。
- 输出 `~/workspace/your_files/L8-测试版V4.html`（md5 28c5591a7b48e999b71dfd5acfe53c56）。
- 验证：node --check + build 通过；headless（--levels 0,1,7,8 --checks errors,cone）8/8 PASS，零页面错误；L1/L7 武器栏截图确认——L1 护木已是干净直边，L7 为翡翠色旧照片未动（与测试版V1/V2/V3 的 L7 截图逐字节相同）。

## Record 056：测试版V5（2026-11-11，用户：L1 掉落一些武器卡片，看效果）
- TEST ONLY：在 initMapLayout 末尾加 L1 专属测试刷卡——开局在玩家出生点右侧（x+120 起，间隔 70px，y+100 避开航班信息牌）一字排开 5 张武器卡（步枪/手枪/冲锋枪/狙击枪/手雷），timer Infinity 不消失；先清旧卡再刷（testCard 标记，防 resize/重开重复）。验收后删除本块。只影响 L1，L7/L8 与其他关卡未动。
- 输出 `~/workspace/your_files/L8-测试版V5.html`（md5 f6b658156dfd771266d77ca56573bd66）。
- 验证：node --check + build 通过；headless（--levels 0,1,7,8 --checks errors,cone）8/8 PASS，零页面错误；L1 全屏截图确认 5 张黄框卡片一字排开（图标为测试版V4 高清剪影，扳机护圈镂空清晰，狙击枪完整）。

## Record 057：测试版V6（2026-11-11，用户：掉落卡片完全不对——尺寸应和武器栏相同；现在挤在一起还各种出格；还特别亮莫名其妙）
- 根因（三点全在掉落卡绘制分支，与图标本身无关）：
  1. 卡片只有 44x30，武器栏格子是 110x45；
  2. SMG 有 1.3 倍放大，44x30 里实际画成 50x39，出格；且 5 张卡间距 70px 小于卡宽，视觉上挤在一起；
  3. 分支设了 ctx.shadowColor='#FFFF00' 且未清 shadowBlur，整张卡黄光晕特别亮；武器栏不用阴影。
- 修复（只动 item.type==='weapon' 分支，全关卡通用）：卡片改 110x45（居中 -55,-22.5），底 rgba(4,16,10,0.88)、绿边 #00FF66、线宽 1.2，与 L1–L6 武器栏同款；图标走武器栏同款 90x24 区域（-45,-10.5），SMG 1.3 倍也被 110x45 框住，不再出格；shadowBlur=0、shadowColor=transparent，去掉黄光晕。测试刷卡间距改 125px（卡宽 110+15）。
- 输出 `~/workspace/your_files/L8-测试版V6.html`（md5 2adc057549f43a160dc13454e46ec28d）。
- 验证：node --check + build 通过；headless（--levels 0,1,7,8 --checks errors,cone）8/8 PASS，零页面错误；L1 全屏截图确认 5 张 110x45 暗底绿边卡片一字排开，图标全部框内、无溢出、无黄光晕。

## Record 058：测试版V7（2026-11-11，用户：掉落卡改回原来黄色）
- 只改颜色：掉落卡边框与图标改回原来黄色（#FFFF00，线宽 1.5，底 rgba(10,20,15,0.9)）；110x45 尺寸与 90x24 图标区不动；黄光晕仍不清回来（shadowBlur=0、shadowColor=transparent，之前“特别亮”就是它）。
- 输出 `~/workspace/your_files/L8-测试版V7.html`（md5 79780e87277ed873b0eb2e2ca8f44d16）。
- 验证：node --check + build 通过；headless（--levels 0,1,7,8 --checks errors,cone）8/8 PASS，零页面错误；L1 全屏截图确认 5 张 110x45 黄边黄图标卡片一字排开，无光晕。

## Record 059：测试版V8（2026-11-11，用户：掉落卡还是大了，和左下图标一样大，复制一下改改）
- 根因：V6/V7 的 110x45 是世界单位，世界渲染会被 viewScale（=min(宽/1280,高/720)）放大；大窗口下 viewScale>1，卡片屏上比 110px 的武器栏格子大。不是 110 这个数错，是没除 viewScale。
- 修复（只动 item.type==='weapon' 分支）：卡片与图标区世界尺寸全部除以 viewScale（vs=min(width/1280,height/720)），线宽也除以 vs；屏上正好 110x45，与左下武器栏格子同屏尺寸，任意窗口大小都一样。颜色仍原来黄色，无光晕。
- 输出 `~/workspace/your_files/L8-测试版V8.html`（md5 f8ca7fce86f2df6510bc3cc60799202c）。
- 验证：node --check + build 通过；headless（--levels 0,1,7,8 --checks errors,cone）8/8 PASS，零页面错误；1280x720 与 1920x1080 两档截图确认掉落卡屏上宽均为 110px，与武器栏格子一致。

## Record 060：测试版V9（2026-11-11，用户：跟左下图标比，卡片内图标明显变形严重；实在不行就复制过去改改）
- 根因：V8 把图标框除以 viewScale 后世界框变小（如 60x16），drawWeaponSilhouette 的离屏按拟合尺寸建（步枪仅 47x16），1100px 原图压进去再放大回 70px，形状糊掉/拉伸；武器栏是 90x24 屏上框、离屏 71x24，没这个问题。不是比例错（实测掉落步枪 70x24、2.92:1，与原图 2.95:1 一致），是离屏分辨率太低。
- 修复（drawWeaponSilhouette，全局，武器栏与掉落卡同享）：离屏超采样 2 倍建（dw*2 x dh*2），再以 5 参数 drawImage 缩回 dw x dh；掉落卡与武器栏图标同源同画法，形状一致。卡片 110x45（除以 viewScale，屏上与武器栏同大）与黄色无光晕不动。
- 输出 `~/workspace/your_files/L8-测试版V9.html`（md5 cf993f4373280288561fff59c017b58b）。
- 验证：node --check + build 通过；headless（--levels 0,1,7,8 --checks errors,cone）8/8 PASS，零页面错误；1920x1080 下掉落卡行与武器栏行并排对比，5 把图标形状与武器栏一致（步枪 70x24、2.92:1）。

## Record 061：视界滞后-L8-正式版V1（2026-11-11，用户：卡片恢复正常掉落规律；L7 无敌移除、L8 不变；新版改名“视界滞后-L8-正式版V1”）
- 掉落恢复正常：删除 initMapLayout 里的 TEST ONLY 测试刷卡块（L1 开局 5 张卡，testCard 标记）；敌人击杀掉落（weapon/ammo/medkit/battery，timer 700）原样不动。构建内 testCard 出现 0 次。
- L7 无敌移除、L8 不变：isInspectMode() 的关卡条件从 level7_lab||level7_test 改为仅 level7_test；INSPECT_MODE 仍 true。L7 恢复正常（敌弹命中扣血、手雷扣血、死亡正常），L8 仍无敌（盲区外敌弹消失、手雷不扣血、清算致死回满）。
- 掉落卡最终形态（测试版V6–V9 的成果，保留）：110x45 黄边黄图标、无光晕；世界尺寸除以 viewScale，屏上与武器栏格子同大；图标离屏超采样 2 倍，形状与武器栏一致。
- 输出 `~/workspace/your_files/视界滞后-L8-正式版V1.html`（md5 1e953e5cfa3bd47111264e19d3d86d4c）。
- 验证：node --check + build 通过；headless（--levels 0,1,7,8 --checks errors,cone）8/8 PASS，零页面错误；源码确认 isInspectMode 仅 level7_test、构建内 testCard 为 0。

## Record 062：GitHub 推送（2026-11-11，用户：正式版传到 Observation-Lag-L8-Test-，只保留正式版和V9，再早的版本都删了）
- 推送：视界滞后-L8-正式版V1.html（md5 1e953e5c）与 L8-测试版V9.html（md5 cf993f43）到 piao0123/Observation-Lag-L8-Test- main，commit 711154481dc2221beb4c4f9cd3824d080c0b1b3c。
- 删除：视界滞后·L7正式版V1.html（更早的版本），commit 877d95e3ee4b861d4ef892afa1aa5c2008162340。
- 仓库现状：构建版本只剩 视界滞后-L8-正式版V1.html 与 L8-测试版V9.html；源码（src/、package.json 等）与 index.html 未动。同步记录 ~/workspace/github-push-l8-test.muse-github-snapshot-sync.json。

## Record 063：纠错——“只保留正式版和V9”是说本地，不是指 GitHub（2026-11-11，用户纠正）
- 我错了：上一条把“只保留正式版和V9”理解成仓库里只留两份，往 Observation-Lag-L8-Test- 里塞了正式版V1+V9，还删了仓库里的 L7正式版V1。用户原意：GitHub 一个仓库只放一个版本（正式版V1）；“只留两份、删更早的”指的是我这边本地 your_files/。
- 已纠正：
  - GitHub：已删 L8-测试版V9.html（commit 4dbf608220ce173e372d0e6359de44c318954485），仓库构建版本只剩 视界滞后-L8-正式版V1.html（index.html 是项目入口页，未动）。L7正式版V1 已删未恢复——仓库现在只有一个构建版本，符合“一个仓库一个版本”。
  - 本地 your_files/：V23–V29 与测试版V1–V8 共 15 个构建全部进回收站（30 天可恢复，2026-12-11 到期），只留 视界滞后-L8-正式版V1.html 与 L8-测试版V9.html。

## Record 064：六套控制台锚点实测（2026-11-13，用户指令：把控制台量一遍作为锚点）
- 背景：2026-11-09 画风剖析只拆了会议桌一只标本，提示词锚点实际只钉了会议桌；用户指出应参考几个控制台。本次用同一口径量完 engine.js 内全部六套控制台/大型道具主函数（Dynamic 变体为薄壳，只量主函数）。测量脚本 /tmp/measure_consoles.cjs。
- 实测表（行号为重组副本 engine.js；色数=去重字面值 hex+rgba；色相数=去重 RGB 三元组，忽略 alpha 差异）：

| 函数 | 行数 | 行号 | lineWidth 中位/最大 | >1.5 数 | 色数 | 色相数 | 图元数 | 平均明度 |
|---|---|---|---|---|---|---|---|---|
| drawSectorWorkstation（扇形工作站） | 518 | 6602–7119 | 1.0 / 3.5 | 2 | 38 | 32 | 119 | 0.27 |
| drawCircularPodWorkstation（圆形工作站） | 732 | 7210–7941 | 1.0 / 2.4 | 6 | 48 | 40 | 169 | 0.34 |
| drawTripleCubicleWorkstation（三联隔间） | 619 | 8070–8688 | 0.8 / 1.8 | 1 | 60 | 49 | 140 | 0.26 |
| drawPodium（讲台） | 404 | 8844–9247 | 0.8 / 2.0 | 3 | 45 | 36 | 78 | 0.25 |
| drawConferenceTableSystem（会议桌） | 610 | 9254–9863 | 0.8 / 14 | 6 | 76 | 57 | 106 | 0.24 |
| drawServerCluster（服务器阵列） | 284 | 9945–10228 | 0.8 / 2.0 | 2 | 41 | 39 | 50 | 0.29 |

- 六套共享的锚点技法（已逐一核对粗线上下文，全部符合）：
  1. 细线为主：中位 0.8–1.0，0.4–1.0 是主力区间。
  2. 粗线只作打底/光晕，必叠细线：扇形 3.5 为深色基环（#064e3b）；椅子五星底座 2.2–2.4 为深色辐条打底；会议桌灯环 14 为低 alpha 光晕、7.5 为灯槽基座、0.8 双侧描边+2.4 发光管；圆形推子 2.4 深色打底后同一路径立即叠 0.6 高光线。粗线从不单独描轮廓。
  3. 深色为主：平均明度 0.24–0.34，三分之二以上颜色明度 <0.35；高亮高饱和色每函数仅 0–6 个，只作 LED/点缀。
  4. 分层装配：save/restore 成对出现（每函数 1–19 对），阴影→底座→高光→反光逐层画。
  5. 零件密度高：单函数图元 50–169 个；会议桌 64 颗独立灯珠、12 把椅子（每把五星底座+5 脚轮+液压柱+座垫+靠背+扶手）。
- 订正 11-09 记录：当日称会议桌“仅 33 色”无法复现——merged 与重组两副本同一函数实测均为 76 字面值/57 色相，33 应为窄口径或误数，以本次为准。新道具侧 99 色因 /tmp/l8test 已灭失无法复核，11-09 的新旧色数对比不再引用；定性结论（新道具高饱和色作主体、旧控制台深色为主）由本次明度分析支撑。
- 状态：锚点数据已备好，提示词改版等用户再给提示词并告知改法。

## Record 065：缓冲区通道分步提示词定版 + 联动逻辑复活计划（2026-11-13，用户定）
- 分步：原 5 步砍掉骨架步（通道已存在，改为往里填东西），定为 4 步——①更衣区道具 ②消毒区道具（静态）③气密防爆门全新设计 ④联动复活与验证。锚点为三联隔间 drawTripleCubicleWorkstation（Record 064 实测最优）；每步自带关卡现状+位置坐标+隔离要求，换会话不怕丢上下文。
- 位置坐标（实测三方一致）：通道中心 (767,985)，720×122，角 2.96027；内端 (1121,920)、外端 (413,1050)；更衣区 s 0–355、消毒区 s 365–720；门1 (767,985)、门2 (413,1050)。与联动逻辑投影原点 (1121,920)/法线 (-0.983607,0.180328) 一致。
- 联动逻辑存档：仅存于清理副本 engine.js L4562–4665（重组/merged 副本无），状态机 idle→air_spray(180帧)→liquid_spray(180帧)→done，门1 近95px开/进消毒区锁定关，门2 喷完解锁，openProgress>0.4 取消碰撞；休眠原因 door1/door2 对象被删，守卫不通过。复活条件：补回 id 为 airtight_door_1/2 的对象（带 cx/cy/openProgress/wheelAngle/isLocked）；guard 关卡 id 为 level8_test，移植须核对实际 id。
- 交付：整合包 ~/workspace/your_files/缓冲区通道-分步提示词完整包.md（851 行，4 步提示词全文 + 锚点代码 + 逻辑存档）；单拆文件 三联隔间锚点-drawTripleCubicleWorkstation.js、缓冲区联动逻辑-存档.js 保留作备份。状态：待用户投喂 AI Studio 验证。

## Record 066：外墙 + 联动逻辑移植 + 源码推送 GitHub（2026-11-13，用户指令：V1 是对的，通道内容删了重做，只留外墙和门联动逻辑）
- 背景：11-11 只推了构建 HTML、源码未推，AI Studio 读仓库源码仍是旧版；且仓库源码（level8_test 线）与重组副本（level7_test 线）已分叉——仓库有缓冲区全套内容物但缺 V1 全部改进，重组有 V1 改进但无通道外墙/联动逻辑。用户定：通道内容物本来就要删了重做，只留外墙 + 门联动逻辑，里面全重铺；V1 为准。
- 移植（脚本 /tmp/port_wall_logic.py，原文提取零转录）：①清理副本 drawBufferCorridorSystem 壳函数（64 行，仅地坪/网格/警戒带，无内容物）→ level7_test.js；②通道北墙/南墙 poly_wall（BUFFER CORRIDOR NORTH/SOUTH ARMORED WALL）→ level7_test.js obstacles；③buffer_corridor_system 通道对象 → level7_test.js props 末尾；④联动逻辑块 → engine.js update() 门循环后，守卫 id 由 level8_test 改 level7_test，其余一字未动。ff/currentLevelId/props/player 在 update() 内均已存在，同名同义。
- 验证：node --check 双文件通过；npm run build 成功；复用冒烟 levels 0,1,7,8 / errors,cone 8/8 PASS、零页面错误。逻辑休眠中（门对象未建，守卫不通过），待第 3 步重建门对象后自动复活。
- 推送：重组副本源码全量覆盖 Observation-Lag-L8-Test-（level8_test.js 删除，改由 level7_test.js 承接；.aistudio/、release-itch.zip、正式版V1.html 不动）。
