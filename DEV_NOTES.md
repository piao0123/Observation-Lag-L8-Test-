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
