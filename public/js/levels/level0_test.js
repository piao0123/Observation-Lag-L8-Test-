// =========================================================================
// LEVEL 0: 地狱熔岩深渊 (HELL CAVERN & INFERNAL ABYSS)
// =========================================================================
// 🌋 包含经典地狱元素：
// 1. 冰湖 (FROZEN ICE LAKE) - 晶莹透明冰湖与寒冰高光
// 2. 钟乳石 & 石笋 (STALACTITES & STALAGMITES) - 尖锐锥形多边形怪石
// 3. 黑曜石岩体 (JAGGED OBSIDIAN ROCKS) - 复杂多边形天然洞穴地形
// 4. 炽热岩浆河与熔岩池 (MOLTEN MAGMA RIVERS) - 动态灼烧熔岩
// ⚠️ 绝不波及 Level 1 ~ Level 6 正式关卡！
// =========================================================================

window.level0MapWidth = 2300;
window.level0MapHeight = 1000;

const LEVEL_TEST = {
    id: "level0_test",
    name: "测试关卡 - 地狱熔岩深渊",
    themeColor: "#450a0a",
    gridColor: "rgba(239, 68, 68, 0.2)",
    accentColor: "#f97316",
    playerStart: { x: 80, y: 500 },
    
    getMapLayout: (width, height) => {
        const mapW = window.level0MapWidth || 2300;
        const mapH = window.level0MapHeight || 1000;
        
        return {
            obstacles: [
                // =========================================================
                // 1. 寒冰狱 - 冰湖与冰封撒旦 (ZONE 1: FROZEN ICE LAKE & COCYTUS SATAN, x: 150 ~ 850)
                // =========================================================
                // 大型寒冰湖泊 (冰面)
                { 
                    points: [
                        { x: 250, y: 250 }, { x: 500, y: 180 }, { x: 750, y: 280 }, 
                        { x: 830, y: 500 }, { x: 700, y: 720 }, { x: 430, y: 780 }, 
                        { x: 200, y: 620 }, { x: 170, y: 400 }
                    ], 
                    type: 'ice_lake', label: 'COCYTUS FROZEN LAKE' 
                },

                // 冰湖四周的不规则钟乳石/石笋群 (ORGANIC MULTI-POINT ICE STALAGMITES)
                { points: [{ x: 320, y: 320 }, { x: 345, y: 280 }, { x: 365, y: 260 }, { x: 385, y: 290 }, { x: 405, y: 330 }, { x: 365, y: 345 }, { x: 330, y: 335 }], type: 'stalagmite', label: 'ICE STALAGMITE A' },
                { points: [{ x: 660, y: 580 }, { x: 685, y: 540 }, { x: 710, y: 510 }, { x: 735, y: 550 }, { x: 755, y: 600 }, { x: 715, y: 615 }, { x: 675, y: 600 }], type: 'stalagmite', label: 'ICE STALAGMITE B' },
                { points: [{ x: 250, y: 580 }, { x: 275, y: 540 }, { x: 290, y: 510 }, { x: 310, y: 550 }, { x: 330, y: 590 }, { x: 295, y: 605 }, { x: 265, y: 595 }], type: 'stalagmite', label: 'ICE STALAGMITE C' },
                { points: [{ x: 670, y: 300 }, { x: 695, y: 260 }, { x: 720, y: 240 }, { x: 745, y: 270 }, { x: 760, y: 320 }, { x: 725, y: 335 }, { x: 685, y: 320 }], type: 'stalagmite', label: 'ICE STALAGMITE D' },

                // 冰湖岸边黑曜石碎岩群 (ORGANIC OBSIDIAN ROCKS)
                { 
                    points: [
                        { x: 450, y: 130 }, { x: 485, y: 105 }, { x: 510, y: 95 }, { x: 540, y: 120 }, 
                        { x: 555, y: 160 }, { x: 520, y: 180 }, { x: 475, y: 175 }, { x: 445, y: 155 }
                    ], 
                    type: 'rock', label: 'OBSIDIAN ROCK NORTH LAKE' 
                },
                { 
                    points: [
                        { x: 470, y: 810 }, { x: 510, y: 795 }, { x: 550, y: 800 }, { x: 585, y: 840 }, 
                        { x: 570, y: 875 }, { x: 520, y: 890 }, { x: 465, y: 870 }, { x: 440, y: 840 }
                    ], 
                    type: 'rock', label: 'OBSIDIAN ROCK SOUTH LAKE' 
                },

                // =========================================================
                // 2. 焦热熔岩 - 蜿蜒熔岩河与写实活火山 (ZONE 2: MOLTEN INFERNO, x: 920 ~ 1680)
                // =========================================================
                // 北侧熔岩池
                { 
                    points: [
                        { x: 960, y: 120 }, { x: 1240, y: 100 }, { x: 1380, y: 280 }, 
                        { x: 1260, y: 400 }, { x: 1040, y: 360 }, { x: 910, y: 250 }
                    ], 
                    type: 'lava', label: 'NORTH MAGMA PIT' 
                },

                // 南侧熔岩深渊
                { 
                    points: [
                        { x: 1000, y: 600 }, { x: 1280, y: 550 }, { x: 1520, y: 720 }, 
                        { x: 1700, y: 660 }, { x: 1650, y: 880 }, { x: 1380, y: 920 }, 
                        { x: 1080, y: 860 }, { x: 920, y: 750 }
                    ], 
                    type: 'lava', label: 'SOUTH MAGMA RIVER' 
                },

                // 熔岩踏脚不规则黑曜石碎岛
                { 
                    points: [
                        { x: 1110, y: 220 }, { x: 1140, y: 195 }, { x: 1170, y: 185 }, { x: 1200, y: 210 }, 
                        { x: 1210, y: 245 }, { x: 1180, y: 270 }, { x: 1140, y: 265 }, { x: 1115, y: 245 }
                    ], 
                    type: 'rock', label: 'LAVA STEPPING ROCK 1' 
                },
                { 
                    points: [
                        { x: 1230, y: 700 }, { x: 1265, y: 665 }, { x: 1300, y: 655 }, { x: 1330, y: 680 }, 
                        { x: 1340, y: 730 }, { x: 1310, y: 760 }, { x: 1270, y: 755 }, { x: 1235, y: 735 }
                    ], 
                    type: 'rock', label: 'LAVA STEPPING ROCK 2' 
                },

                // 熔岩区中央巨型写实黑曜石活火山
                { 
                    points: [
                        { x: 1380, y: 400 }, { x: 1450, y: 320 }, { x: 1550, y: 330 }, 
                        { x: 1620, y: 390 }, { x: 1640, y: 480 }, { x: 1600, y: 570 }, 
                        { x: 1480, y: 600 }, { x: 1390, y: 540 }, { x: 1360, y: 460 }
                    ], 
                    type: 'volcano', label: 'INFERNAL VOLCANO' 
                },

                // 熔岩区多维刺状石笋
                { points: [{ x: 1070, y: 480 }, { x: 1095, y: 440 }, { x: 1110, y: 420 }, { x: 1130, y: 450 }, { x: 1150, y: 490 }, { x: 1115, y: 505 }, { x: 1085, y: 495 }], type: 'stalagmite', label: 'SEARING STALAGMITE 1' },
                { points: [{ x: 1570, y: 220 }, { x: 1595, y: 180 }, { x: 1620, y: 150 }, { x: 1640, y: 190 }, { x: 1660, y: 230 }, { x: 1625, y: 245 }, { x: 1585, y: 235 }], type: 'stalagmite', label: 'SEARING STALAGMITE 2' },

                // =========================================================
                // 3. 地狱黑曜石祭坛深渊 (ZONE 3: INFERNAL SANCTUM, x: 1750 ~ 2150)
                // =========================================================
                // 中央精美六角黑曜石决战祭台 (ABYSSAL HEXAGON SANCTUM) - 空间独立无遮挡
                { 
                    points: [
                        { x: 1890, y: 440 }, { x: 1950, y: 440 }, { x: 1990, y: 500 }, 
                        { x: 1950, y: 560 }, { x: 1890, y: 560 }, { x: 1850, y: 500 }
                    ], 
                    type: 'altar', label: 'ABYSSAL HEXAGON SANCTUM' 
                },

                // 祭台四角 4 座精美黑曜石符文方尖碑 (4 INFERNAL RUNE MONOLITHS - ORIGINAL 4 CORNERS)
                { 
                    points: [{ x: 1780, y: 330 }, { x: 1820, y: 290 }, { x: 1850, y: 340 }, { x: 1810, y: 380 }], 
                    type: 'monolith', label: 'INFERNAL MONOLITH NORTHWEST' 
                },
                { 
                    points: [{ x: 1780, y: 670 }, { x: 1820, y: 630 }, { x: 1850, y: 680 }, { x: 1810, y: 720 }], 
                    type: 'monolith', label: 'INFERNAL MONOLITH SOUTHWEST' 
                },
                { 
                    points: [{ x: 2030, y: 330 }, { x: 2070, y: 290 }, { x: 2100, y: 340 }, { x: 2060, y: 380 }], 
                    type: 'monolith', label: 'INFERNAL MONOLITH NORTHEAST' 
                },
                { 
                    points: [{ x: 2030, y: 670 }, { x: 2070, y: 630 }, { x: 2100, y: 680 }, { x: 2060, y: 720 }], 
                    type: 'monolith', label: 'INFERNAL MONOLITH SOUTHEAST' 
                },

                // 深渊出口黑曜石关隘 (ORGANIC 8-POINT JAGGED OBSIDIAN GATEKEEPER ROCKS)
                { 
                    points: [
                        { x: 2160, y: 270 }, { x: 2195, y: 235 }, { x: 2235, y: 225 }, { x: 2265, y: 260 }, 
                        { x: 2280, y: 310 }, { x: 2260, y: 360 }, { x: 2215, y: 395 }, { x: 2175, y: 375 }
                    ], 
                    type: 'rock', label: 'OBSIDIAN GATEKEEPER NORTH' 
                },
                { 
                    points: [
                        { x: 2160, y: 620 }, { x: 2195, y: 585 }, { x: 2240, y: 565 }, { x: 2275, y: 610 }, 
                        { x: 2285, y: 680 }, { x: 2255, y: 735 }, { x: 2210, y: 760 }, { x: 2170, y: 730 }
                    ], 
                    type: 'rock', label: 'OBSIDIAN GATEKEEPER SOUTH' 
                }
            ],
            securityGates: [],
            props: [],
            zones: [],
            waypoints: [
                { x: 80, y: 500 },
                { x: 320, y: 170 },
                { x: 720, y: 190 },
                { x: 840, y: 500 },
                { x: 720, y: 810 },
                { x: 320, y: 810 },
                { x: 1150, y: 500 },
                { x: 1480, y: 500 },
                { x: 1920, y: 500 },
                { x: 2220, y: 500 }
            ],
            cameras: [
                // 1. Zone 1 (寒冰狱 - 西侧入口隘口魂灯)
                {
                    x: 240,
                    y: 480,
                    baseAngle: 0.0,
                    sweepRange: 0.75,
                    sweepSpeed: 0.011,
                    sweepTimer: 0,
                    fovRange: 520,
                    fovAngle: 0.8,
                    type: 'soul_lantern',
                    label: '冰狱西隘口魂灯'
                },
                // 2. Zone 1 (寒冰狱 - 北冰湖畔魂灯)
                {
                    x: 520,
                    y: 220,
                    baseAngle: 0.4,
                    sweepRange: 0.75,
                    sweepSpeed: 0.012,
                    sweepTimer: 1.5,
                    fovRange: 520,
                    fovAngle: 0.8,
                    type: 'soul_lantern',
                    label: '北冰湖畔魂灯'
                },
                // 3. Zone 2 (焦热熔岩 - 北侧熔岩池石像鬼)
                {
                    x: 1150,
                    y: 200,
                    baseAngle: Math.PI * 0.4,
                    sweepRange: 0.8,
                    sweepSpeed: 0.013,
                    sweepTimer: 0.8,
                    fovRange: 550,
                    fovAngle: 0.82,
                    type: 'gargoyle_sentinel',
                    label: '熔岩北池石像鬼'
                },
                // 4. Zone 2 (焦热熔岩 - 南侧熔岩河石像鬼)
                {
                    x: 1350,
                    y: 760,
                    baseAngle: -Math.PI * 0.3,
                    sweepRange: 0.8,
                    sweepSpeed: 0.012,
                    sweepTimer: 2.2,
                    fovRange: 550,
                    fovAngle: 0.82,
                    type: 'gargoyle_sentinel',
                    label: '熔岩南河石像鬼'
                },
                // 5. Zone 3 (黑曜石祭坛 - 全视魔眼图腾 - 360度全回转)
                {
                    x: 1920,
                    y: 500,
                    baseAngle: 0.0,
                    sweepRange: Math.PI * 2,
                    sweepSpeed: 0.009,
                    sweepTimer: 3.0,
                    fovRange: 560,
                    fovAngle: 0.85,
                    type: 'infernal_eye',
                    label: '深渊祭坛全视魔眼'
                }
            ],
            lasers: []
        };
    }
};

window.LEVEL_TEST = LEVEL_TEST;
