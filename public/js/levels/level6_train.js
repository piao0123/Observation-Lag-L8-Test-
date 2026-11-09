// =========================================================================
// LEVEL 6: 现代装甲特快列车正式关卡 (7200px × 240px ARMORED EXPRESS TRAIN)
// =========================================================================
// 🚂 真实列车 6 大车厢区域按顺序严格布局 (FROM LEFT TO RIGHT):
// 1. 客舱 (PASSENGER COACH, 0 ~ 1200):
//    - 双排现代航空客运座椅、随身行李架、乘务员不锈钢送餐推车、饮水机、报刊架、车尾卫生间隔断。
// 2. 餐车 (DINING & BISTRO CAR, 1200 ~ 2400):
//    - 4组双人西式就餐卡座 (白亚麻桌布/高脚红酒杯/调光台灯)、L型红木饮品吧台 (双头咖啡机/POS终端/陈列酒架)、不锈钢备餐厨房 (燃气灶/洗手水槽/冷藏柜)。
// 3. VIP 舱室 (VIP LUXURY SUITES, 2400 ~ 3600):
//    - 3 间独立奢华套房 (Suite 1: 总统真皮大床与卫浴台; Suite 2: 环形会客沙发与全息电视; Suite 3: 私人书房写字台与重型机械保险箱)。
// 4. 控制室 (TRAIN CONTROL BRIDGE, 3600 ~ 4800):
//    - 中央 3D 运行全息沙盘投影台、弧形多联屏自动驾驶中控台、通信加密服务器机柜阵列、安防监控台。
// 5. 引擎室 (ENGINE & POWER CORE, 4800 ~ 6000):
//    - 双联八角形磁流体动力涡轮引擎、380V 高压变电配电柜、高压冷却液循环管线、重型机修工具台。
// 6. 货仓 (CARGO & FREIGHT HOLD, 6000 ~ 7200):
//    - 重型海运/军用集装箱、工业黄色液压叉车、绑扎木托盘货物堆垛、车尾液压升降尾门与紧急撤离点。
// =========================================================================

window.level6MapWidth = 7200;
window.level6MapHeight = 240;

const LEVEL_TRAIN = {
    id: "level6_train",
    name: "第 6 关 · 装甲特快列车",
    nameEn: "Level 06 · Armored Express Train",
    themeColor: "#0f172a",
    gridColor: "rgba(56, 189, 248, 0.25)",
    accentColor: "#38bdf8",
    playerStart: { x: 120, y: 120 }, // 默认出生点设定在第6节车厢 (战备货运与步战车运输车厢 西侧入口)
    
    getMapLayout: (width, height) => {
        const mapW = window.level6MapWidth || window.level0MapWidth || 7200;
        const mapH = window.level6MapHeight || window.level0MapHeight || 240;
        
        return {
            obstacles: [
                // =========================================================
                // 全局列车外层重装甲外壳外墙 (Outer Train Hull Walls)
                // =========================================================
                // 北侧列车装甲外壳 (y: 0~10)
                { x: 0, y: 0, w: mapW, h: 10, type: 'solid', label: 'NORTH ARMORED HULL', hideLabel: true },
                // 南侧列车装甲外壳 (y: 230~240)
                { x: 0, y: mapH - 10, w: mapW, h: 10, type: 'solid', label: 'SOUTH ARMORED HULL', hideLabel: true },
                // 车尾装甲后舱门 (x: 0~10)
                { x: 0, y: 0, w: 10, h: mapH, type: 'solid', label: 'REAR BULKHEAD', hideLabel: true },
                // 车头装甲前舱壁 (x: 7190~7200)
                { x: mapW - 10, y: 0, w: 10, h: mapH, type: 'solid', label: 'FRONT BULKHEAD', hideLabel: true },

                // =========================================================
                // 1. 客舱 (PASSENGER COACH, 0 ~ 1200) - 按用户草图精确设定
                // =========================================================
                // 隔板 1: 洗手池右侧 (x: 235) - 矮墙 (low_wall)
                { x: 235, y: 10, w: 8, h: 55, type: 'low_wall' },
                { x: 235, y: 175, w: 8, h: 55, type: 'low_wall' },
                // 隔板 2: 座椅2与座椅3之间 (x: 540)
                { x: 540, y: 10, w: 8, h: 55, type: 'low_wall' },
                { x: 540, y: 175, w: 8, h: 55, type: 'low_wall' },
                // 隔板 3: 座椅4与座椅5之间 (x: 870)
                { x: 870, y: 10, w: 8, h: 55, type: 'low_wall' },
                { x: 870, y: 175, w: 8, h: 55, type: 'low_wall' },
                // 客舱 -> 餐车 1号气密车厢连接门框 (x: 1188~1200)
                { x: 1188, y: 10, w: 12, h: 65, type: 'solid' },
                { x: 1188, y: 165, w: 12, h: 65, type: 'solid' },

                // =========================================================
                // 2. 餐车 (DINING & BISTRO CAR, 1200 ~ 2400) - 按草图布局
                // =========================================================
                // 酒吧区战术物理碰撞 (invisible: true 隐形碰撞，彻底解决地面棕色大方块)
                { x: 1380, y: 10, w: 25, h: 55, type: 'low_wall', invisible: true },
                { x: 1380, y: 40, w: 180, h: 25, type: 'low_wall', invisible: true },
                { x: 1380, y: 175, w: 180, h: 25, type: 'low_wall', invisible: true },
                { x: 1380, y: 175, w: 25, h: 55, type: 'low_wall', invisible: true },
                // 玻璃隔断 1 (分隔酒吧区 与 用餐区 1, x: 1600)
                { x: 1600, y: 10, w: 8, h: 65, type: 'glass', label: 'GLASS PARTITION BAR-N', hideLabel: true },
                { x: 1600, y: 165, w: 8, h: 65, type: 'glass', label: 'GLASS PARTITION BAR-S', hideLabel: true },
                // 玻璃隔断 2 (分隔用餐区 1 与 用餐区 2, x: 1980)
                { x: 1980, y: 10, w: 8, h: 65, type: 'glass', label: 'GLASS PARTITION MID-N', hideLabel: true },
                { x: 1980, y: 165, w: 8, h: 65, type: 'glass', label: 'GLASS PARTITION MID-S', hideLabel: true },
                // 餐车 -> VIP舱室 2号豪华气密移门 (x: 2388~2400)
                { x: 2388, y: 10, w: 12, h: 65, type: 'solid' },
                { x: 2388, y: 165, w: 12, h: 65, type: 'solid' },

                // =========================================================
                // 3. VIP 舱室 (VIP LUXURY SUITES, 2400 ~ 3600) - 按草图 IMG_6932 5段式布局
                // =========================================================
                // 1. 吧台区战术物理碰撞 (x: 2400~2640, 隐形碰撞)
                { x: 2420, y: 40, w: 180, h: 20, type: 'low_wall', invisible: true },
                { x: 2420, y: 180, w: 180, h: 20, type: 'low_wall', invisible: true },

                // 2. 隔断 1 (分隔 吧台区 <-> 座位区1, x: 2640)
                { x: 2640, y: 10, w: 8, h: 65, type: 'solid', label: 'BAR PARTITION N', hideLabel: true },
                { x: 2640, y: 165, w: 8, h: 65, type: 'solid', label: 'BAR PARTITION S', hideLabel: true },

                // 3. 隔断 2 (分隔 座位区1 <-> 房间区1, x: 2880)
                { x: 2880, y: 10, w: 8, h: 65, type: 'solid', label: 'ROOM 1 WALL N', hideLabel: true },
                { x: 2880, y: 165, w: 8, h: 65, type: 'solid', label: 'ROOM 1 WALL S', hideLabel: true },

                // 4. 隔断 3 (分隔 房间区1 <-> 房间区2, x: 3120)
                { x: 3120, y: 10, w: 8, h: 65, type: 'solid', label: 'ROOM 2 WALL N', hideLabel: true },
                { x: 3120, y: 165, w: 8, h: 65, type: 'solid', label: 'ROOM 2 WALL S', hideLabel: true },

                // 5. 隔断 4 (分隔 房间区2 <-> 座位区2, x: 3360)
                { x: 3360, y: 10, w: 8, h: 65, type: 'solid', label: 'SEATING 2 WALL N', hideLabel: true },
                { x: 3360, y: 165, w: 8, h: 65, type: 'solid', label: 'SEATING 2 WALL S', hideLabel: true },

                // VIP舱室 -> 控制室 3号生物识别移门 (x: 3588~3600)
                { x: 3588, y: 10, w: 12, h: 65, type: 'solid' },
                { x: 3588, y: 165, w: 12, h: 65, type: 'solid' },

                // =========================================================
                // 4. 控制室 (TRAIN CONTROL BRIDGE, 3600 ~ 4800) - 按草图 IMG_6933 3大分区布局
                // =========================================================
                // 入口与分区厚重防爆门架墙体 (x: 3588, x: 3994, x: 4394, x: 4788)
                { x: 3588, y: 10, w: 12, h: 65, type: 'solid', label: 'CONTROL WEST WALL N', hideLabel: true },
                { x: 3588, y: 165, w: 12, h: 65, type: 'solid', label: 'CONTROL WEST WALL S', hideLabel: true },

                { x: 3994, y: 10, w: 12, h: 65, type: 'solid', label: 'CONTROL-COMMAND WALL N', hideLabel: true },
                { x: 3994, y: 165, w: 12, h: 65, type: 'solid', label: 'CONTROL-COMMAND WALL S', hideLabel: true },

                { x: 4394, y: 10, w: 12, h: 65, type: 'solid', label: 'COMMAND-PILOT WALL N', hideLabel: true },
                { x: 4394, y: 165, w: 12, h: 65, type: 'solid', label: 'COMMAND-PILOT WALL S', hideLabel: true },

                { x: 4788, y: 10, w: 12, h: 65, type: 'solid', label: 'CONTROL EAST WALL N', hideLabel: true },
                { x: 4788, y: 165, w: 12, h: 65, type: 'solid', label: 'CONTROL EAST WALL S', hideLabel: true },

                // =========================================================
                // 驾驶舱马蹄形屏幕精准物理碰撞 (解决完整矩形空气墙，使玩家可以走入 U 形区域)
                { x: 4576, y: 56, w: 40, h: 26, type: 'low_wall', invisible: true, label: 'COCKPIT SCREEN N', hideLabel: true },
                { x: 4576, y: 158, w: 40, h: 26, type: 'low_wall', invisible: true, label: 'COCKPIT SCREEN S', hideLabel: true },
                { x: 4616, y: 56, w: 26, h: 128, type: 'low_wall', invisible: true, label: 'COCKPIT SCREEN E', hideLabel: true },

                // 5. 引擎室 / 发动机舱 (ENGINE & POWER CORE, 4800 ~ 6000) - 3大独立舱段隔断墙
                // =========================================================
                // 舱段 1 与 舱段 2 之间 (x: 5194) 防火防爆墙隔断
                { x: 5194, y: 10, w: 12, h: 65, type: 'solid', label: 'FIREPROOF WALL 1N', hideLabel: true },
                { x: 5194, y: 165, w: 12, h: 65, type: 'solid', label: 'FIREPROOF WALL 1S', hideLabel: true },

                // 舱段 2 与 舱段 3 之间 (x: 5594) 防火防爆墙隔断
                { x: 5594, y: 10, w: 12, h: 65, type: 'solid', label: 'FIREPROOF WALL 2N', hideLabel: true },
                { x: 5594, y: 165, w: 12, h: 65, type: 'solid', label: 'FIREPROOF WALL 2S', hideLabel: true },

                // 引擎室 -> 货仓 5号隔离密封墙 (x: 5988~6000)
                { x: 5988, y: 10, w: 12, h: 65, type: 'solid', label: 'ENGINE EAST WALL N', hideLabel: true },
                { x: 5988, y: 165, w: 12, h: 65, type: 'solid', label: 'ENGINE EAST WALL S', hideLabel: true },

                // =========================================================
                // 6. 货仓 (CARGO & IFV TRANSPORT, 6000 ~ 7200) - 按草图布局
                // =========================================================
                // 车尾封闭装甲端壁 (CAR 6 REAR BULKHEAD, 封闭车尾，移除通道与跳板)
                { x: 7188, y: 10, w: 12, h: 220, type: 'solid', label: 'CAR 6 REAR BULKHEAD', hideLabel: true }
            ],
            securityGates: [],
            props: [
                // =========================================================
                // CAR 1: 客舱 (PASSENGER COACH, 0 ~ 1200) - 按草图布局
                // =========================================================
                // 1. 马桶 (上下对称: 拉宽至 22x22，朝向不变)
                { type: 'toilet', x: 60, y: 22, w: 22, h: 22, label: 'NORTH TOILET', displayName: 'TOILET', hideLabel: true },
                { type: 'toilet', x: 60, y: 196, w: 22, h: 22, label: 'SOUTH TOILET', displayName: 'TOILET', hideLabel: true },
                // 2. 洗手池 (上下对称: 18x22，朝向车尾 180度)
                { type: 'counter', x: 145, y: 22, w: 18, h: 22, label: 'NORTH SINK', displayName: 'SINK', hideLabel: true },
                { type: 'counter', x: 145, y: 196, w: 18, h: 22, label: 'SOUTH SINK', displayName: 'SINK', hideLabel: true },
                // [隔板 1 位于 x: 235]
                // 3. 座椅 1 & 座椅 2 (朝向右侧车头: 宽24/深, 高42/双人座椅)
                { type: 'train_seat', x: 305, y: 22, w: 24, h: 42, facing: 'right', label: 'COACH SEAT 1N', displayName: 'SEAT 1', tagPosition: 'bottom' },
                { type: 'train_seat', x: 305, y: 176, w: 24, h: 42, facing: 'right', label: 'COACH SEAT 1S', displayName: 'SEAT 1', tagPosition: 'top' },
                { type: 'train_seat', x: 425, y: 22, w: 24, h: 42, facing: 'right', label: 'COACH SEAT 2N', displayName: 'SEAT 2', tagPosition: 'bottom' },
                { type: 'train_seat', x: 425, y: 176, w: 24, h: 42, facing: 'right', label: 'COACH SEAT 2S', displayName: 'SEAT 2', tagPosition: 'top' },
                // [隔板 2 位于 x: 540]
                // 4. 座椅 3 & 座椅 4 (朝向右侧车头: 宽24/深, 高42/双人座椅)
                { type: 'train_seat', x: 635, y: 22, w: 24, h: 42, facing: 'right', label: 'COACH SEAT 3N', displayName: 'SEAT 3', tagPosition: 'bottom' },
                { type: 'train_seat', x: 635, y: 176, w: 24, h: 42, facing: 'right', label: 'COACH SEAT 3S', displayName: 'SEAT 3', tagPosition: 'top' },
                { type: 'train_seat', x: 755, y: 22, w: 24, h: 42, facing: 'right', label: 'COACH SEAT 4N', displayName: 'SEAT 4', tagPosition: 'bottom' },
                { type: 'train_seat', x: 755, y: 176, w: 24, h: 42, facing: 'right', label: 'COACH SEAT 4S', displayName: 'SEAT 4', tagPosition: 'top' },
                // [隔板 3 位于 x: 870]
                // 5. 座椅 5 (朝向右侧车头: 宽24/深, 高42/双人座椅)
                { type: 'train_seat', x: 965, y: 22, w: 24, h: 42, facing: 'right', label: 'COACH SEAT 5N', displayName: 'SEAT 5', tagPosition: 'bottom' },
                { type: 'train_seat', x: 965, y: 176, w: 24, h: 42, facing: 'right', label: 'COACH SEAT 5S', displayName: 'SEAT 5', tagPosition: 'top' },
                // 6. 北侧：饮水机；南侧：行李架
                { type: 'water_dispenser', x: 1080, y: 22, w: 18, h: 22, label: 'COACH WATER DISPENSER', displayName: 'WATER DISPENSER', tagPosition: 'bottom' },
                { type: 'luggage_stack', x: 1070, y: 196, w: 38, h: 22, label: 'COACH LUGGAGE RACK', displayName: 'LUGGAGE RACK', tagPosition: 'top' },

                // =========================================================
                // CAR 2: 餐车 (DINING & BISTRO CAR, 1200 ~ 2400) - 按草图精确布局
                // =========================================================
                // 1. 准备区 (Preparation Area: 1240~1350)
                { type: 'counter', x: 1240, y: 22, w: 90, h: 24, label: 'PREP COUNTER NORTH', displayName: 'PREP COUNTER', tagPosition: 'bottom' },
                { type: 'display_cabinet', x: 1240, y: 194, w: 90, h: 24, label: 'PREP CABINET SOUTH', displayName: 'PREP CABINET', tagPosition: 'top' },

                // 2. 酒吧 (Bar Area: 1380~1560) - 上下两个酒吧按草图IMG_6915修改L形朝向 (右侧竖向翼角延伸至墙壁, 吧台变窄)
                { type: 'train_bistro_bar', x: 1380, y: 38, w: 180, h: 18, facing: 'down', isLShape: true, label: 'NORTH L-SHAPE BISTRO BAR', displayName: 'BISTRO BAR (NORTH)', tagPosition: 'top' },
                { type: 'train_bistro_bar', x: 1380, y: 184, w: 180, h: 18, facing: 'up', isLShape: true, label: 'SOUTH L-SHAPE BISTRO BAR', displayName: 'BISTRO BAR (SOUTH)', tagPosition: 'bottom' },

                // [x: 1600 处为玻璃隔断 1 Glass Partition 1 (酒吧区 <-> 用餐区 1)]

                // 3. 用餐区 1 (Dining Area 1: 1635~1950) - 上下各3组竖向卡座 (左椅子 [ ] | 中间桌 [   ] | 右椅子 [ ] 结构)
                { type: 'dining_booth', x: 1635, y: 14, w: 56, h: 62, label: 'DINING BOOTH 1N', displayName: 'DINING BOOTH', tagPosition: 'bottom' },
                { type: 'dining_booth', x: 1635, y: 164, w: 56, h: 62, label: 'DINING BOOTH 1S', displayName: 'DINING BOOTH', tagPosition: 'top' },
                { type: 'dining_booth', x: 1735, y: 14, w: 56, h: 62, label: 'DINING BOOTH 2N', displayName: 'DINING BOOTH', tagPosition: 'bottom' },
                { type: 'dining_booth', x: 1735, y: 164, w: 56, h: 62, label: 'DINING BOOTH 2S', displayName: 'DINING BOOTH', tagPosition: 'top' },
                { type: 'dining_booth', x: 1835, y: 14, w: 56, h: 62, label: 'DINING BOOTH 3N', displayName: 'DINING BOOTH', tagPosition: 'bottom' },
                { type: 'dining_booth', x: 1835, y: 164, w: 56, h: 62, label: 'DINING BOOTH 3S', displayName: 'DINING BOOTH', tagPosition: 'top' },

                // [x: 1980 处为玻璃隔断 2 Glass Partition 2 (用餐区 1 <-> 用餐区 2)]

                // 4. 用餐区 2 (Dining Area 2: 2015~2330) - 上下各3组竖向卡座 (左椅子 [ ] | 中间桌 [   ] | 右椅子 [ ] 结构)
                { type: 'dining_booth', x: 2015, y: 14, w: 56, h: 62, label: 'DINING BOOTH 4N', displayName: 'DINING BOOTH', tagPosition: 'bottom' },
                { type: 'dining_booth', x: 2015, y: 164, w: 56, h: 62, label: 'DINING BOOTH 4S', displayName: 'DINING BOOTH', tagPosition: 'top' },
                { type: 'dining_booth', x: 2115, y: 14, w: 56, h: 62, label: 'DINING BOOTH 5N', displayName: 'DINING BOOTH', tagPosition: 'bottom' },
                { type: 'dining_booth', x: 2115, y: 164, w: 56, h: 62, label: 'DINING BOOTH 5S', displayName: 'DINING BOOTH', tagPosition: 'top' },
                { type: 'dining_booth', x: 2215, y: 14, w: 56, h: 62, label: 'DINING BOOTH 6N', displayName: 'DINING BOOTH', tagPosition: 'bottom' },
                { type: 'dining_booth', x: 2215, y: 164, w: 56, h: 62, label: 'DINING BOOTH 6S', displayName: 'DINING BOOTH', tagPosition: 'top' },

                // =========================================================
                // CAR 3: VIP 舱室 (VIP LUXURY SUITES, 2400 ~ 3600) - 按草图 IMG_6932 5段布局
                // =========================================================
                // VIP 舱室 左右入口/出口 智能感应双向自动玻璃门 (AUTO SLIDING GLASS DOORS)
                { type: 'auto_glass_door', x: 2388, y: 75, w: 12, h: 90, label: 'VIP WEST AUTO DOOR', displayName: 'AUTO GLASS DOOR', hideLabel: true },
                { type: 'auto_glass_door', x: 3588, y: 75, w: 12, h: 90, label: 'VIP EAST AUTO DOOR', displayName: 'AUTO GLASS DOOR', hideLabel: true },

                // 1. 吧台区 (x: 2400 ~ 2640) - 上下各 1 组 L 形吧台
                { type: 'train_bistro_bar', x: 2420, y: 38, w: 180, h: 18, facing: 'down', isLShape: true, label: 'VIP BISTRO BAR (NORTH)', displayName: 'VIP BAR (NORTH)', tagPosition: 'top' },
                { type: 'train_bistro_bar', x: 2420, y: 184, w: 180, h: 18, facing: 'up', isLShape: true, label: 'VIP BISTRO BAR (SOUTH)', displayName: 'VIP BAR (SOUTH)', tagPosition: 'bottom' },

                // 2. 座位区 1 (x: 2640 ~ 2880) - 上下各 2 组 VIP 专属深红真皮头等舱座椅 [□] [□] (改窄为 w:48, h:36, 靠背朝左)
                { type: 'vip_seat', x: 2674, y: 26, w: 48, h: 36, label: 'VIP SEAT 1N', displayName: 'VIP RECLINER', tagPosition: 'bottom' },
                { type: 'vip_seat', x: 2774, y: 26, w: 48, h: 36, label: 'VIP SEAT 2N', displayName: 'VIP RECLINER', tagPosition: 'bottom' },
                { type: 'vip_seat', x: 2674, y: 176, w: 48, h: 36, label: 'VIP SEAT 1S', displayName: 'VIP RECLINER', tagPosition: 'top' },
                { type: 'vip_seat', x: 2774, y: 176, w: 48, h: 36, label: 'VIP SEAT 2S', displayName: 'VIP RECLINER', tagPosition: 'top' },

                // 3. 房间区 1 (x: 2880 ~ 3120) - 上下各 1 间套房房间 [▬] (床头朝左, 床尾朝右)
                // 北套房 1: 豪华大床 + 衣柜 + 独立梳妆台
                { type: 'luxury_bed', x: 2910, y: 22, w: 68, h: 48, facing: 'left', label: 'SUITE 1 KING BED N', displayName: 'KING BED', tagPosition: 'bottom' },
                { type: 'wardrobe', x: 2995, y: 22, w: 36, h: 20, facing: 'down', label: 'SUITE 1 WARDROBE N', displayName: 'WARDROBE', tagPosition: 'bottom' },
                { type: 'counter', x: 3045, y: 22, w: 40, h: 20, facing: 'down', label: 'SUITE 1 VANITY N', displayName: 'VANITY SINK', tagPosition: 'bottom' },
                // 南套房 1: 豪华大床 + 衣柜 + 商务茶几
                { type: 'luxury_bed', x: 2910, y: 170, w: 68, h: 48, facing: 'left', label: 'SUITE 1 KING BED S', displayName: 'KING BED', tagPosition: 'top' },
                { type: 'wardrobe', x: 2995, y: 198, w: 36, h: 20, facing: 'up', label: 'SUITE 1 WARDROBE S', displayName: 'WARDROBE', tagPosition: 'top' },
                { type: 'coffee_table', x: 3045, y: 198, w: 40, h: 20, label: 'SUITE 1 TABLE S', displayName: 'COFFEE TABLE', tagPosition: 'top' },

                // 4. 房间区 2 (x: 3120 ~ 3360) - 上下各 1 间套房房间 [▬] (床头朝左, 床尾朝右)
                // 北套房 2: 豪华大床 + 写字台 + 老板椅
                { type: 'luxury_bed', x: 3150, y: 22, w: 68, h: 48, facing: 'left', label: 'SUITE 2 KING BED N', displayName: 'KING BED', tagPosition: 'bottom' },
                { type: 'writing_desk', x: 3235, y: 22, w: 56, h: 24, facing: 'down', label: 'SUITE 2 DESK N', displayName: 'STUDY DESK', tagPosition: 'bottom' },
                { type: 'office_chair', x: 3300, y: 24, w: 18, h: 18, facing: 'left', label: 'SUITE 2 CHAIR', hideLabel: true },
                // 南套房 2: 豪华大床 + 重型保险箱 + 全息显示屏
                { type: 'luxury_bed', x: 3150, y: 170, w: 68, h: 48, facing: 'left', label: 'SUITE 2 KING BED S', displayName: 'KING BED', tagPosition: 'top' },
                { type: 'safe_box', x: 3235, y: 190, w: 38, h: 28, facing: 'down', label: 'SUITE 2 SAFE S', displayName: 'SAFE BOX', tagPosition: 'top' },
                { type: 'display_cabinet', x: 3285, y: 198, w: 46, h: 20, facing: 'down', label: 'SUITE 2 HOLO SCREEN', displayName: 'HOLO SCREEN', tagPosition: 'top' },

                // 5. 座位区 2 (x: 3360 ~ 3600) - 上下各 2 组 VIP 专属深红真皮头等舱座椅 [□] [□] (改窄为 w:48, h:36, 靠背朝左)
                { type: 'vip_seat', x: 3394, y: 26, w: 48, h: 36, label: 'VIP SEAT 3N', displayName: 'VIP RECLINER', tagPosition: 'bottom' },
                { type: 'vip_seat', x: 3494, y: 26, w: 48, h: 36, label: 'VIP SEAT 4N', displayName: 'VIP RECLINER', tagPosition: 'bottom' },
                { type: 'vip_seat', x: 3394, y: 176, w: 48, h: 36, label: 'VIP SEAT 3S', displayName: 'VIP RECLINER', tagPosition: 'top' },
                { type: 'vip_seat', x: 3494, y: 176, w: 48, h: 36, label: 'VIP SEAT 4S', displayName: 'VIP RECLINER', tagPosition: 'top' },

                // =========================================================
                // CAR 4: 控制室 (TRAIN CONTROL BRIDGE, 3600 ~ 4800) - 按草图 IMG_6933 精确布局
                // =========================================================
                // 车厢分区与东侧厚重自动门 (HEAVY AUTOMATIC STEEL DOORS)
                { type: 'heavy_auto_door', x: 3994, y: 75, w: 12, h: 90, label: 'CONTROL-COMMAND HEAVY DOOR', displayName: 'HEAVY AUTO DOOR', hideLabel: true },
                { type: 'heavy_auto_door', x: 4394, y: 75, w: 12, h: 90, label: 'COMMAND-PILOT HEAVY DOOR', displayName: 'HEAVY AUTO DOOR', hideLabel: true },
                { type: 'heavy_auto_door', x: 4788, y: 75, w: 12, h: 90, label: 'EAST HEAVY AUTO DOOR', displayName: 'HEAVY AUTO DOOR', hideLabel: true },

                // ---------------------------------------------------------
                // 1. 控制部分 (CONTROL SECTION: 3600 ~ 4000)
                // ---------------------------------------------------------
                // 北侧: U型环绕控制台 x2 + 办公椅 x2 (按草图“合”字包围布局，屏幕环绕向下)
                { type: 'control_console', x: 3642, y: 15, w: 76, h: 48, facing: 'down', label: 'CONTROL CONSOLE 1N', displayName: 'CONSOLE', tagPosition: 'inside' },
                { type: 'office_chair', x: 3671, y: 55, w: 18, h: 18, facing: 'up', label: 'OPERATOR SEAT 1N', hideLabel: true },
                { type: 'control_console', x: 3862, y: 15, w: 76, h: 48, facing: 'down', label: 'CONTROL CONSOLE 2N', displayName: 'CONSOLE', tagPosition: 'inside' },
                { type: 'office_chair', x: 3891, y: 55, w: 18, h: 18, facing: 'up', label: 'OPERATOR SEAT 2N', hideLabel: true },

                // 南侧: U型环绕屏幕控制台 x2 + 办公椅 x2 (按草图“凹”字包围布局，屏幕环绕向上)
                { type: 'control_console', x: 3642, y: 177, w: 76, h: 48, facing: 'up', label: 'SCREEN CONSOLE 1S', displayName: 'CONSOLE', tagPosition: 'inside' },
                { type: 'office_chair', x: 3671, y: 167, w: 18, h: 18, facing: 'down', label: 'OPERATOR SEAT 1S', hideLabel: true },
                { type: 'control_console', x: 3862, y: 177, w: 76, h: 48, facing: 'up', label: 'SCREEN CONSOLE 2S', displayName: 'CONSOLE', tagPosition: 'inside' },
                { type: 'office_chair', x: 3891, y: 167, w: 18, h: 18, facing: 'down', label: 'OPERATOR SEAT 2S', hideLabel: true },

                // ---------------------------------------------------------
                // 2. 指挥部分 (COMMAND SECTION: 4000 ~ 4400)
                // ---------------------------------------------------------
                // 北墙: 宏伟战术大屏幕 (TACTICAL MAIN DISPLAY SCREEN WALL)
                { type: 'command_display', x: 4100, y: 12, w: 200, h: 20, label: 'COMMAND MAIN DISPLAY', displayName: 'COMMAND SCREEN', tagPosition: 'bottom' },

                // 中央: 长形指挥会议桌 (CONFERENCE TABLE - 整体下移至原席位区域 y: 136)
                { type: 'conference_table', x: 4090, y: 136, w: 220, h: 44, label: 'COMMAND CONFERENCE TABLE', displayName: 'CONFERENCE TABLE', tagPosition: 'inside' },

                // 会议桌两侧: 高阶指挥席位 (6组席位, 上侧 y:104, 下侧 y:184)
                { type: 'command_seat', x: 4110, y: 104, w: 30, h: 26, facing: 'down', label: 'COMMAND SEAT 1', displayName: 'COMMAND SEAT', hideLabel: true },
                { type: 'command_seat', x: 4185, y: 104, w: 30, h: 26, facing: 'down', label: 'COMMAND SEAT 2', displayName: 'COMMAND SEAT', hideLabel: true },
                { type: 'command_seat', x: 4260, y: 104, w: 30, h: 26, facing: 'down', label: 'COMMAND SEAT 3', displayName: 'COMMAND SEAT', hideLabel: true },
                { type: 'command_seat', x: 4110, y: 184, w: 30, h: 26, facing: 'up', label: 'COMMAND SEAT 4', displayName: 'COMMAND SEAT', hideLabel: true },
                { type: 'command_seat', x: 4185, y: 184, w: 30, h: 26, facing: 'up', label: 'COMMAND SEAT 5', displayName: 'COMMAND SEAT', hideLabel: true },
                { type: 'command_seat', x: 4260, y: 184, w: 30, h: 26, facing: 'up', label: 'COMMAND SEAT 6', displayName: 'COMMAND SEAT', hideLabel: true },

                // ---------------------------------------------------------
                // 3. 驾驶部分 (PILOT / COCKPIT SECTION: 4400 ~ 4800)
                // ---------------------------------------------------------
                // 中央靠左: 驾驶员主控座椅 (靠左放置，面朝右)
                { type: 'cockpit_chair', x: 4490, y: 104, w: 32, h: 32, facing: 'right', label: 'CAPTAIN PILOT CHAIR', displayName: 'PILOT SEAT', tagPosition: 'bottom' },

                // 车头180°全包围弧形驾驶中控与前视HUD屏幕 (往内稍收，x: 4575~4645, y: 48~192，上下留出36px、右侧留出155px宽敞通道)
                { type: 'cockpit_main_console', x: 4575, y: 48, w: 70, h: 144, facing: 'left', label: 'COCKPIT MAIN CONSOLE', displayName: 'FLIGHT CONTROL & SCREEN', tagPosition: 'top', noCollision: true },

                // =========================================================
                // CAR 5: 引擎室 / 发动机舱 (ENGINE & POWER CORE, 4800 ~ 6000) - 按草图3舱段布局
                // =========================================================
                // 1. 西侧舱段 1 (Sub-section 1: 4800 ~ 5200) - 带有圆盘弹药架的炮台 1 + 车轮/电机 1组
                { type: 'gun_turret', x: 4964, y: 84, w: 72, h: 72, facing: 'up', label: 'TURRET & AMMO DRUM 1', displayName: 'TURRET & AMMO RACK 1', tagPosition: 'bottom' },
                { type: 'wheel_motor', x: 4958, y: 10, w: 84, h: 32, label: 'NORTH WHEEL & MOTOR 1', displayName: 'WHEEL & MOTOR', tagPosition: 'bottom' },
                { type: 'wheel_motor', x: 4958, y: 198, w: 84, h: 32, label: 'SOUTH WHEEL & MOTOR 1', displayName: 'WHEEL & MOTOR', tagPosition: 'top' },
                { type: 'heavy_auto_door', x: 5194, y: 75, w: 12, h: 90, label: 'FIREPROOF BLAST DOOR 1', displayName: 'FIREPROOF DOOR', tagPosition: 'bottom' },

                // 2. 中央舱段 2 (Sub-section 2: 5200 ~ 5600) - 主柴油发电机组 + 车轮/电机 2组
                { type: 'diesel_engine', x: 5330, y: 84, w: 140, h: 72, label: 'MAIN DIESEL ENGINE', displayName: 'DIESEL ENGINE UNIT', tagPosition: 'bottom' },
                { type: 'wheel_motor', x: 5358, y: 10, w: 84, h: 32, label: 'NORTH WHEEL & MOTOR 2', displayName: 'WHEEL & MOTOR', tagPosition: 'bottom' },
                { type: 'wheel_motor', x: 5358, y: 198, w: 84, h: 32, label: 'SOUTH WHEEL & MOTOR 2', displayName: 'WHEEL & MOTOR', tagPosition: 'top' },
                { type: 'heavy_auto_door', x: 5594, y: 75, w: 12, h: 90, label: 'FIREPROOF BLAST DOOR 2', displayName: 'FIREPROOF DOOR', tagPosition: 'bottom' },

                // 3. 东侧舱段 3 (Sub-section 3: 5600 ~ 6000) - 带有圆盘弹药架的炮台 2 + 车轮/电机 3组
                { type: 'gun_turret', x: 5764, y: 84, w: 72, h: 72, facing: 'down', label: 'TURRET & AMMO DRUM 2', displayName: 'TURRET & AMMO RACK 2', tagPosition: 'top' },
                { type: 'wheel_motor', x: 5758, y: 10, w: 84, h: 32, label: 'NORTH WHEEL & MOTOR 3', displayName: 'WHEEL & MOTOR', tagPosition: 'bottom' },
                { type: 'wheel_motor', x: 5758, y: 198, w: 84, h: 32, label: 'SOUTH WHEEL & MOTOR 3', displayName: 'WHEEL & MOTOR', tagPosition: 'top' },
                { type: 'heavy_auto_door', x: 5988, y: 75, w: 12, h: 90, label: 'CAR 5-6 FIREPROOF DOOR', displayName: 'FIREPROOF DOOR', tagPosition: 'bottom' },

                // =========================================================
                // CAR 6: 战备物资与步兵战车运输车厢 (COMBAT CARGO & IFV TRANSPORT, 6000 ~ 7200)
                // =========================================================
                // 1. 左侧重型战备物资箱组 (左侧4组战术集装箱，彻底填补左侧空档，x: 6060 ~ 6260)
                { type: 'military_cargo_box', x: 6060, y: 55, w: 52, h: 62, label: 'CARGO CRATE N1', displayName: 'CARGO CRATES', tagPosition: 'top' },
                { type: 'military_cargo_box', x: 6060, y: 125, w: 52, h: 62, label: 'CARGO CRATE S1', displayName: 'SUPPLY CRATE (物资箱)', tagPosition: 'bottom', hideLabel: true },
                { type: 'military_cargo_box', x: 6140, y: 55, w: 52, h: 62, label: 'CARGO CRATE N2', displayName: 'SUPPLY CRATE (物资箱)', tagPosition: 'top', hideLabel: true },
                { type: 'military_cargo_box', x: 6140, y: 125, w: 52, h: 62, label: 'CARGO CRATE S2', displayName: 'SUPPLY CRATE (物资箱)', tagPosition: 'bottom', hideLabel: true },
                { type: 'military_cargo_box', x: 6220, y: 65, w: 50, h: 110, label: 'CARGO CRATE 3', displayName: 'AMMO CASE (弹药箱)', tagPosition: 'bottom', hideLabel: true },

                // 左侧物资箱甲板固定地锚 (北侧3组 + 南侧3组)
                { type: 'deck_tie_down', x: 6074, y: 18, w: 24, h: 18, noCollision: true, label: 'TIE-DOWN ANCHOR N1', displayName: 'ANCHOR (固定)', tagPosition: 'bottom', hideLabel: true },
                { type: 'deck_tie_down', x: 6154, y: 18, w: 24, h: 18, noCollision: true, label: 'TIE-DOWN ANCHOR N2', displayName: 'ANCHOR (固定)', tagPosition: 'bottom', hideLabel: true },
                { type: 'deck_tie_down', x: 6233, y: 18, w: 24, h: 18, noCollision: true, label: 'TIE-DOWN ANCHOR N3', displayName: 'ANCHOR (固定)', tagPosition: 'bottom', hideLabel: true },
                { type: 'deck_tie_down', x: 6074, y: 204, w: 24, h: 18, noCollision: true, label: 'TIE-DOWN ANCHOR S1', displayName: 'ANCHOR (固定)', tagPosition: 'top', hideLabel: true },
                { type: 'deck_tie_down', x: 6154, y: 204, w: 24, h: 18, noCollision: true, label: 'TIE-DOWN ANCHOR S2', displayName: 'ANCHOR (固定)', tagPosition: 'top', hideLabel: true },
                { type: 'deck_tie_down', x: 6233, y: 204, w: 24, h: 18, noCollision: true, label: 'TIE-DOWN ANCHOR S3', displayName: 'ANCHOR (固定)', tagPosition: 'top', hideLabel: true },

                // 2. 步兵战车 (中央重心区，写实细致，290x120)
                { type: 'infantry_fighting_vehicle', x: 6355, y: 60, w: 290, h: 120, label: 'INFANTRY FIGHTING VEHICLE', displayName: 'COMBAT IFV', tagPosition: 'top' },

                // 步战车甲板固定地锚 (北侧2个 + 南侧2个，与其他固定环完全一致)
                { type: 'deck_tie_down', x: 6355, y: 18, w: 24, h: 18, noCollision: true, label: 'TIE-DOWN ANCHOR N4', displayName: 'ANCHOR (固定)', tagPosition: 'bottom', hideLabel: true },
                { type: 'deck_tie_down', x: 6621, y: 18, w: 24, h: 18, noCollision: true, label: 'TIE-DOWN ANCHOR N5', displayName: 'ANCHOR (固定)', tagPosition: 'bottom', hideLabel: true },
                { type: 'deck_tie_down', x: 6355, y: 204, w: 24, h: 18, noCollision: true, label: 'TIE-DOWN ANCHOR S4', displayName: 'ANCHOR (固定)', tagPosition: 'top', hideLabel: true },
                { type: 'deck_tie_down', x: 6621, y: 204, w: 24, h: 18, noCollision: true, label: 'TIE-DOWN ANCHOR S5', displayName: 'ANCHOR (固定)', tagPosition: 'top', hideLabel: true },

                // 3. 步兵战车右侧战术补给物资 (x: 6710 ~ 6830)
                { type: 'military_cargo_box', x: 6720, y: 65, w: 48, h: 110, label: 'SUPPLY CRATE 4', displayName: 'TACTICAL SUPPLIES', tagPosition: 'top' },
                { type: 'military_cargo_box', x: 6778, y: 65, w: 48, h: 110, label: 'SUPPLY CRATE 5', displayName: 'SUPPLIES (物资)', tagPosition: 'top', hideLabel: true },

                // 补给物资固定装置 (北侧 + 南侧)
                { type: 'deck_tie_down', x: 6744, y: 18, w: 24, h: 18, noCollision: true, label: 'TIE-DOWN ANCHOR N6', displayName: 'ANCHOR (固定)', tagPosition: 'bottom', hideLabel: true },
                { type: 'deck_tie_down', x: 6792, y: 18, w: 24, h: 18, noCollision: true, label: 'TIE-DOWN ANCHOR N7', displayName: 'ANCHOR (固定)', tagPosition: 'bottom', hideLabel: true },
                { type: 'deck_tie_down', x: 6744, y: 204, w: 24, h: 18, noCollision: true, label: 'TIE-DOWN ANCHOR S6', displayName: 'ANCHOR (固定)', tagPosition: 'top', hideLabel: true },
                { type: 'deck_tie_down', x: 6792, y: 204, w: 24, h: 18, noCollision: true, label: 'TIE-DOWN ANCHOR S7', displayName: 'ANCHOR (固定)', tagPosition: 'top', hideLabel: true },

                // =========================================================
                // 4. 平板车真实装载：长轨备料 (x: 6860 ~ 6980)
                // =========================================================
                { type: 'flatcar_steel_rails', x: 6870, y: 70, w: 100, h: 100, label: 'LONG WELDED RAILS', displayName: 'STEEL RAILS', tagPosition: 'top' },

                // 钢轨固定夹紧器 (北侧 + 南侧，严格对齐黄色框 6860 ~ 6980 的四个角)
                { type: 'deck_tie_down', x: 6860, y: 18, w: 24, h: 18, noCollision: true, label: 'TIE-DOWN ANCHOR N8', displayName: 'ANCHOR (固定)', tagPosition: 'bottom', hideLabel: true },
                { type: 'deck_tie_down', x: 6956, y: 18, w: 24, h: 18, noCollision: true, label: 'TIE-DOWN ANCHOR N9', displayName: 'ANCHOR (固定)', tagPosition: 'bottom', hideLabel: true },
                { type: 'deck_tie_down', x: 6860, y: 204, w: 24, h: 18, noCollision: true, label: 'TIE-DOWN ANCHOR S8', displayName: 'ANCHOR (固定)', tagPosition: 'top', hideLabel: true },
                { type: 'deck_tie_down', x: 6956, y: 204, w: 24, h: 18, noCollision: true, label: 'TIE-DOWN ANCHOR S9', displayName: 'ANCHOR (固定)', tagPosition: 'top', hideLabel: true },

                // =========================================================
                // 5. 真实铁道应急装备整备区 (x: 7010 ~ 7140)
                // =========================================================
                { type: 'rail_maintenance_bars', x: 7025, y: 60, w: 105, h: 52, label: 'EMERGENCY TOOLKIT', displayName: 'EMERGENCY TOOLKIT', tagPosition: 'top' },
                { type: 'maintenance_supplies', x: 7025, y: 124, w: 105, h: 52, label: 'MAINTENANCE SUPPLIES', displayName: 'HEAVY SUPPLIES', tagPosition: 'bottom', hideLabel: true },

                // 整备箱甲板安全钢缆固定地锚 (严格对齐工具区黄色框 7010 ~ 7140 的四个角)
                { type: 'deck_tie_down', x: 7010, y: 18, w: 24, h: 18, noCollision: true, label: 'TIE-DOWN ANCHOR N10', displayName: 'ANCHOR (安全固定环)', tagPosition: 'bottom', hideLabel: true },
                { type: 'deck_tie_down', x: 7116, y: 18, w: 24, h: 18, noCollision: true, label: 'TIE-DOWN ANCHOR N11', displayName: 'ANCHOR (安全固定环)', tagPosition: 'bottom', hideLabel: true },
                { type: 'deck_tie_down', x: 7010, y: 204, w: 24, h: 18, noCollision: true, label: 'TIE-DOWN ANCHOR S10', displayName: 'ANCHOR (安全固定环)', tagPosition: 'top', hideLabel: true },
                { type: 'deck_tie_down', x: 7116, y: 204, w: 24, h: 18, noCollision: true, label: 'TIE-DOWN ANCHOR S11', displayName: 'ANCHOR (安全固定环)', tagPosition: 'top', hideLabel: true }

             ],
            zones: [
                { name: "CAR 01: PASSENGER COACH", x: 10, y: 12, w: 1180, h: mapH - 24, labelX: 60, labelY: 70, align: 'left' },
                { name: "CAR 02: DINING & BISTRO CAR", x: 1200, y: 12, w: 1180, h: mapH - 24, labelX: 1208, labelY: 18, align: 'left' },
                { name: "CAR 03: VIP SUITES", x: 2400, y: 12, w: 1180, h: mapH - 24, labelX: 2412, labelY: 18, align: 'left' },
                { name: "CAR 04: CONTROL BRIDGE", x: 3600, y: 12, w: 1180, h: mapH - 24, labelX: 3780, labelY: 120, align: 'center' },
                { name: "CAR 05: ENGINE & POWER CORE", x: 4800, y: 12, w: 1180, h: mapH - 24, labelX: 4830, labelY: 18, align: 'left' },
                { name: "CAR 06: COMBAT CARGO & IFV TRANSPORT", x: 6000, y: 12, w: 1180, h: mapH - 24, labelX: 6500, labelY: 18, align: 'center' }
            ],
            waypoints: [
                { x: 100, y: 120 },
                { x: 600, y: 120 },
                { x: 1100, y: 120 },
                { x: 1450, y: 120 },
                { x: 1900, y: 120 },
                { x: 2300, y: 120 },
                { x: 2600, y: 180 },
                { x: 3000, y: 180 },
                { x: 3400, y: 180 },
                { x: 3900, y: 120 },
                { x: 4300, y: 120 },
                { x: 4700, y: 120 },
                { x: 4900, y: 120 },
                { x: 5050, y: 120 },
                { x: 5350, y: 120 },
                { x: 5750, y: 120 },
                { x: 6060, y: 120 },
                { x: 6140, y: 40 },
                { x: 6480, y: 40 },
                { x: 6800, y: 40 },
                { x: 6140, y: 200 },
                { x: 6480, y: 200 },
                { x: 6800, y: 200 },
                { x: 7060, y: 120 }
            ],
            cameras: [
                { 
                    x: 1188, y: 70, 
                    baseAngle: Math.PI, currentAngle: Math.PI,
                    sweepRange: Math.PI / 3.5, sweepSpeed: 0.015, sweepTimer: 0 
                },
                { 
                    x: 2388, y: 120, 
                    baseAngle: 0, currentAngle: 0,
                    sweepRange: Math.PI / 4, sweepSpeed: 0.012, sweepTimer: 0 
                },
                { 
                    x: 3588, y: 70, 
                    baseAngle: Math.PI, currentAngle: Math.PI,
                    sweepRange: Math.PI / 3.5, sweepSpeed: 0.015, sweepTimer: 0 
                },
                { 
                    x: 4788, y: 120, 
                    baseAngle: 0, currentAngle: 0,
                    sweepRange: Math.PI / 4, sweepSpeed: 0.012, sweepTimer: 0 
                },
                { 
                    x: 5988, y: 70, 
                    baseAngle: Math.PI, currentAngle: Math.PI,
                    sweepRange: Math.PI / 3.5, sweepSpeed: 0.015, sweepTimer: 0 
                }
            ],
            lasers: []
        };
    }
};

window.LEVEL_TRAIN = LEVEL_TRAIN;
