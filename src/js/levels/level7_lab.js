// =========================================================================
// LEVEL 7: 顶石深潜科研中心 (APEX NEXUS RESEARCH COMPLEX)
// 依据用户最新草图与指令构建的巨型眼睛地图 (The Eye Map)
// =========================================================================

window.level7MapWidth = 3200;
window.level7MapHeight = 2400;

// =========================================================================
// 全新扇形战术控制台绘制系统 (自 Level 8 移植，完全依据手绘草稿 IMG_7693 设计)
// 包含 5 大核心要素：
// 1. 控制台本身呈扇形（弧形外边、内凹弧形座舱边缘、径向收拢侧翼）
// 2. 前部三个连在一起的弧面显示屏（一体化铰链连接，雷达、频谱、动力监测，角度贴合弧度）
// 3. 屏幕后方中央的机械键盘与操作员滑轮座椅（紧贴内凹工位，带腰托高靠背与扶手，无黑影）
// 4. 左侧操作翼多排控制按钮（方块按键、指示摇臂、金属防护拨动开关）
// 5. 右侧操作翼多排控制按钮（双推子电位器、旋转刻度旋钮、微动矩阵、带黄黑警示圈的大型紧急制动按钮）
// =========================================================================
function getCircularPodWorkstation(cx, cy, angle = 0, scale = 1.0, label = "CIRCULAR POD CONSOLE") {
    const boundR = 65 * scale; // 剔除框半径（比视觉略大，用于视锥剔除）
    const collR = 62 * scale; // 碰撞半径 = 视觉外壳 R_out，16边形逼近
    // 16边形碰撞多边形，贴近圆形视觉
    const points = [];
    for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2;
        points.push({ x: cx + Math.cos(a) * collR, y: cy + Math.sin(a) * collR });
    }
    return {
        type: "circular_pod_workstation",
        cx: cx,
        cy: cy,
        angle: angle,
        scale: scale,
        x: cx - boundR,
        y: cy - boundR,
        w: boundR * 2,
        h: boundR * 2,
        points: points,
        label: label,
        displayName: "CIRCULAR ENCLOSED COMMAND POD",
        noCollision: false,
        hideLabel: true,
        draw: (ctx) => {
            // ===== 动静分离优化 (2026-11-05)：静态预渲染 + 动态叠加 =====
            const cacheKey = '__podCache_' + cx + '_' + cy + '_' + angle + '_' + scale;
            if (!window[cacheKey]) {
                const sz = Math.ceil(boundR * 2 + 20);
                const off = document.createElement('canvas');
                off.width = sz; off.height = sz;
                const octx = off.getContext('2d');
                octx.save();
                octx.translate(sz / 2, sz / 2);
                // 静态绘制（时间冻结在0），反向补偿让 (cx,cy) 落在 offscreen 中心
                octx.translate(-cx, -cy);
                drawCircularPodWorkstation(octx, cx, cy, angle, scale, 1);
                octx.restore();
                window[cacheKey] = { canvas: off, size: sz };
            }
            const c = window[cacheKey];
            ctx.drawImage(c.canvas, cx - c.size / 2, cy - c.size / 2);
            // 动态元素每帧叠加
            drawCircularPodWorkstationDynamic(ctx, cx, cy, angle, scale);
        }
    };
}




// =========================================================
// 三联方形隔间战术控制台 (从 Level 8 移植，2026-11-05)
// =========================================================
function getTripleCubicleWorkstation(cx, cy, angle = 0, scale = 1.0, label = "TRIPLE CUBICLE WORKSTATION") {
    const boundW = 280 * scale;
    const boundH = 106 * scale;
    return {
        type: "triple_cubicle_workstation",
        cx: cx,
        cy: cy,
        angle: angle,
        scale: scale,
        x: cx - boundW / 2,
        y: cy - boundH / 2,
        w: boundW,
        h: boundH,
        label: label,
        displayName: "TRIPLE CUBICLE COMMAND POD",
        noCollision: false,
        hideLabel: true,
        draw: (ctx) => {
            // ===== 动静分离优化 (2026-11-05)：静态预渲染 + 动态叠加 =====
            const cacheKey = '__tripleCache_' + cx + '_' + cy + '_' + angle + '_' + scale;
            if (!window[cacheKey]) {
                const cw = Math.ceil(boundW + 20), ch = Math.ceil(boundH + 20);
                const off = document.createElement('canvas');
                off.width = cw; off.height = ch;
                const octx = off.getContext('2d');
                octx.save();
                octx.translate(cw / 2, ch / 2);
                octx.translate(-cx, -cy);
                drawTripleCubicleWorkstation(octx, cx, cy, angle, scale, 1);
                octx.restore();
                window[cacheKey] = { canvas: off, w: cw, h: ch };
            }
            const c = window[cacheKey];
            ctx.drawImage(c.canvas, cx - c.w / 2, cy - c.h / 2);
            drawTripleCubicleWorkstationDynamic(ctx, cx, cy, angle, scale);
        }
    };
}




// =========================================================
// 指挥讲台 (从 Level 8 移植，2026-11-05)
// =========================================================
// =========================================================================
function getPodium(cx, cy, angle = 0, scale = 1.0, label = "COMMAND PODIUM") {
    const boundW = 60 * scale;
    const boundH = 50 * scale;
    return {
        type: "command_podium",
        cx: cx,
        cy: cy,
        angle: angle,
        scale: scale,
        x: cx - boundW / 2,
        y: cy - boundH / 2,
        w: boundW,
        h: boundH,
        label: label,
        displayName: "COMMAND PODIUM",
        noCollision: true, // 确保角色能自然走入护翼并站上底座
        hideLabel: true,
        draw: (ctx) => {
            drawPodium(ctx, cx, cy, angle, scale);
        }
    };
}

// 生成扇形控制台的高精度物理碰撞多边形顶点及道具对象
function getSectorWorkstation(cx, cy, angle = 0, scale = 1.0, label = "SECTOR WORKSTATION") {
    const R_out = 114 * scale;
    const R_in = 50 * scale;
    const maxTheta = 38 * Math.PI / 180;
    const pts = [];
    const steps = 8;
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);

    for (let i = 0; i <= steps; i++) {
        const t = -maxTheta + (2 * maxTheta) * (i / steps);
        const lx = Math.sin(t) * R_out;
        const ly = -Math.cos(t) * R_out;
        pts.push({
            x: Math.round(cx + (lx * cosA - ly * sinA)),
            y: Math.round(cy + (lx * sinA + ly * cosA))
        });
    }
    for (let i = steps; i >= 0; i--) {
        const t = -maxTheta + (2 * maxTheta) * (i / steps);
        const lx = Math.sin(t) * R_in;
        const ly = -Math.cos(t) * R_in;
        pts.push({
            x: Math.round(cx + (lx * cosA - ly * sinA)),
            y: Math.round(cy + (lx * sinA + ly * cosA))
        });
    }

    const boundR = 135 * scale;
    return {
        type: "sector_workstation",
        cx: cx,
        cy: cy,
        angle: angle,
        scale: scale,
        x: cx - boundR,
        y: cy - boundR,
        w: boundR * 2,
        h: boundR * 2,
        points: pts,
        label: label,
        displayName: "SECTOR COMMAND CONSOLE",
        hideLabel: true,
        draw: (ctx) => {
            // ===== 动静分离优化 (2026-11-04)：静态预渲染 + 动态叠加 =====
            const cacheKey = '__wsCache_' + cx + '_' + cy + '_' + angle + '_' + scale;
            if (!window[cacheKey]) {
                const sz = Math.ceil(boundR * 2);
                const off = document.createElement('canvas');
                off.width = sz; off.height = sz;
                const octx = off.getContext('2d');
                octx.save();
                octx.translate(boundR, boundR);
                // 静态绘制（时间冻结在0），注意：原函数内部会 translate(cx,cy)，
                // 这里我们反向补偿，让 (cx,cy) 落在 offscreen 中心
                octx.translate(-cx, -cy);
                drawSectorWorkstation(octx, cx, cy, angle, scale, true);
                octx.restore();
                window[cacheKey] = { canvas: off, size: sz };
            }
            const c = window[cacheKey];
            ctx.drawImage(c.canvas, cx - boundR, cy - boundR);
            // 动态元素每帧叠加
            drawSectorWorkstationDynamic(ctx, cx, cy, angle, scale);
        }
    };
}

// =========================================================
// 服务器集群 (从 Level 8 移植，2026-11-05)
// =========================================================
// =========================================================================


function getServerCluster(cx, cy, angle = 0, scale = 1.0, label = "TACTICAL 5-RACK SERVER CLUSTER") {
    // 整体尺寸放大 2.35 倍：宽 330px，高 96px (单柜宽 66px 远超角色宽度，气势磅礴)
    const boundW = 330 * scale;
    const boundH = 96 * scale;
    const halfW = boundW / 2;
    const halfH = boundH / 2;

    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    const localCorners = [
        { x: -halfW, y: -halfH },
        { x: halfW, y: -halfH },
        { x: halfW, y: halfH },
        { x: -halfW, y: halfH }
    ];
    const points = localCorners.map(p => ({
        x: Math.round(cx + (p.x * cosA - p.y * sinA)),
        y: Math.round(cy + (p.x * sinA + p.y * cosA))
    }));

    return {
        type: "server_cluster",
        cx: cx,
        cy: cy,
        angle: angle,
        scale: scale,
        x: cx - halfW,
        y: cy - halfH,
        w: boundW,
        h: boundH,
        points: points,
        label: label,
        displayName: "SERVER CLUSTER RACK ARRAY",
        hideLabel: true,
        draw: (ctx) => {
            // ===== 动静分离优化 (2026-11-05)：静态预渲染 + 动态叠加 =====
            const cacheKey = '__serverCache_' + cx + '_' + cy + '_' + angle + '_' + scale;
            if (!window[cacheKey]) {
                const sz = Math.ceil(Math.hypot(boundW + 10, boundH + 14) + 20);
                const off = document.createElement('canvas');
                off.width = sz; off.height = sz;
                const octx = off.getContext('2d');
                octx.save();
                octx.translate(sz / 2, sz / 2);
                octx.translate(-cx, -cy);
                drawServerCluster(octx, cx, cy, angle, scale, 1);
                octx.restore();
                window[cacheKey] = { canvas: off, size: sz };
            }
            const c = window[cacheKey];
            ctx.drawImage(c.canvas, cx - c.size / 2, cy - c.size / 2);
            // 动态元素每帧叠加
            drawServerClusterDynamic(ctx, cx, cy, angle, scale);
        }
    };
}

const LEVEL_LAB = {
    id: "level7_lab",
    name: "第 7 关 · 顶石科研中心",
    nameEn: "Level 07 · Apex Research Complex",
    themeColor: "#022c22",
    gridColor: "rgba(16, 185, 129, 0.22)",
    accentColor: "#10b981",
    playerStart: { x: 1600, y: 1835 },

    getMapLayout: (width, height) => {
        const cx = 1600;
        const cy = 1200; // 整张地图正中央 (3200 x 2400 之中心点)

        // =====================================================================
        // 1. 实体阻挡障碍物 (Obstacles)
        // =====================================================================
        const obstacles = [
            // A. 中间房间最上方 3 大显示屏的封闭外墙
            {
                type: 'solid',
                points: [
                    { x: 1055, y: 483 },
                    { x: 2145, y: 483 },
                    { x: 2145, y: 497 },
                    { x: 1055, y: 497 }
                ],
                label: 'TOP SCREEN UPPER HEAVY ARMORED WALL',
                hideLabel: true
            },
            {
                type: 'poly_wall',
                points: [
                    { x: 1048, y: 490 },
                    { x: 1062, y: 490 },
                    { x: 1117, y: 820 },
                    { x: 1103, y: 820 }
                ],
                label: 'TOP LEFT SCREEN HEAVY ARMORED WALL',
                hideLabel: true
            },
            {
                type: 'poly_wall',
                points: [
                    { x: 2138, y: 490 },
                    { x: 2152, y: 490 },
                    { x: 2097, y: 820 },
                    { x: 2083, y: 820 }
                ],
                label: 'TOP RIGHT SCREEN HEAVY ARMORED WALL',
                hideLabel: true
            },

            // B. 西侧重型装甲墙体 (4扇重型自动防爆门留出 120px 门洞)
            {
                type: 'poly_wall',
                points: [
                    { x: 1103, y: 820 },
                    { x: 1117, y: 820 },
                    { x: 1124, y: 860 },
                    { x: 1110, y: 860 }
                ],
                label: 'WEST HEAVY ARMORED WALL 1',
                hideLabel: true
            },
            {
                type: 'poly_wall',
                points: [
                    { x: 1132, y: 980 },
                    { x: 1146, y: 980 },
                    { x: 1285, y: 1775 },
                    { x: 1271, y: 1775 }
                ],
                label: 'WEST HEAVY ARMORED WALL 2',
                hideLabel: true
            },
            {
                type: 'poly_wall',
                points: [
                    { x: 1292, y: 1895 },
                    { x: 1306, y: 1895 },
                    { x: 1318, y: 1960 },
                    { x: 1304, y: 1960 }
                ],
                label: 'WEST HEAVY ARMORED WALL 3',
                hideLabel: true
            },

            // C. 东侧重型装甲墙体 (4扇重型自动防爆门留出 120px 门洞)
            {
                type: 'poly_wall',
                points: [
                    { x: 2083, y: 820 },
                    { x: 2097, y: 820 },
                    { x: 2090, y: 860 },
                    { x: 2076, y: 860 }
                ],
                label: 'EAST HEAVY ARMORED WALL 1',
                hideLabel: true
            },
            {
                type: 'poly_wall',
                points: [
                    { x: 2054, y: 980 },
                    { x: 2068, y: 980 },
                    { x: 1929, y: 1775 },
                    { x: 1915, y: 1775 }
                ],
                label: 'EAST HEAVY ARMORED WALL 2',
                hideLabel: true
            },
            {
                type: 'poly_wall',
                points: [
                    { x: 1894, y: 1895 },
                    { x: 1908, y: 1895 },
                    { x: 1896, y: 1960 },
                    { x: 1882, y: 1960 }
                ],
                label: 'EAST HEAVY ARMORED WALL 3',
                hideLabel: true
            },

            // D. 南侧底部重型装甲封底墙
            {
                type: 'solid',
                points: [
                    { x: 1304, y: 1953 },
                    { x: 1896, y: 1953 },
                    { x: 1896, y: 1967 },
                    { x: 1304, y: 1967 }
                ],
                label: 'SOUTH HEAVY ARMORED WALL',
                hideLabel: true
            },

            // E. 巨型眼睛外围轮廓斜外墙
            {
                type: 'poly_wall',
                points: [
                    { x: 145.1, y: 1193.7 },
                    { x: 1050.1, y: 483.7 },
                    { x: 1059.9, y: 496.3 },
                    { x: 154.9, y: 1206.3 }
                ],
                label: 'WEST EYE OUTER WALL TOP',
                hideLabel: true
            },
            {
                type: 'poly_wall',
                points: [
                    { x: 154.4, y: 1193.3 },
                    { x: 1308.4, y: 1953.3 },
                    { x: 1299.6, y: 1966.7 },
                    { x: 145.6, y: 1206.7 }
                ],
                label: 'WEST EYE OUTER WALL BOTTOM',
                hideLabel: true
            },
            {
                type: 'solid',
                points: [
                    { x: 138, y: 1190 },
                    { x: 155, y: 1190 },
                    { x: 155, y: 1210 },
                    { x: 138, y: 1210 }
                ],
                label: 'WEST EYE APEX CAP',
                hideLabel: true
            },
            {
                type: 'poly_wall',
                points: [
                    { x: 2149.9, y: 483.7 },
                    { x: 3054.9, y: 1193.7 },
                    { x: 3045.1, y: 1206.3 },
                    { x: 2140.1, y: 496.3 }
                ],
                label: 'EAST EYE OUTER WALL TOP',
                hideLabel: true
            },
            {
                type: 'poly_wall',
                points: [
                    { x: 1891.6, y: 1953.3 },
                    { x: 3045.6, y: 1193.3 },
                    { x: 3054.4, y: 1206.7 },
                    { x: 1900.4, y: 1966.7 }
                ],
                label: 'EAST EYE OUTER WALL BOTTOM',
                hideLabel: true
            },
            {
                type: 'solid',
                points: [
                    { x: 3045, y: 1190 },
                    { x: 3062, y: 1190 },
                    { x: 3062, y: 1210 },
                    { x: 3045, y: 1210 }
                ],
                label: 'EAST EYE APEX CAP',
                hideLabel: true
            },

            // F. 正中央大圆会议桌系统 (移植自 Level 8，2026-11-05，替换原中央圆台)
            {
                type: 'solid',
                circle: { cx: cx, cy: cy, radius: 155 },
                label: 'CENTRAL CONFERENCE TABLE',
                displayName: 'CONFERENCE TABLE',
                hideLabel: true,
                draw: (ctx) => {
                    // ===== 动静分离优化 (2026-11-05)：静态预渲染 + 动态叠加 =====
                    const cacheKey = '__confCache_' + cx + '_' + cy;
                    if (!window[cacheKey]) {
                        const sz = 500;
                        const off = document.createElement('canvas');
                        off.width = sz; off.height = sz;
                        const octx = off.getContext('2d');
                        octx.save();
                        octx.translate(sz / 2, sz / 2);
                        octx.translate(-cx, -cy);
                        drawConferenceTableSystem(octx, cx, cy, 155, 1);
                        octx.restore();
                        window[cacheKey] = { canvas: off, size: sz };
                    }
                    const cc = window[cacheKey];
                    ctx.drawImage(cc.canvas, cx - cc.size / 2, cy - cc.size / 2);
                    // 动态元素每帧叠加
                    drawConferenceTableSystemDynamic(ctx, cx, cy, 155);
                }
            },

            // G. 中间房间左圆柱终端 (已替换为指挥讲台，2026-11-05)
            // (已删除 LEFT TERMINAL PILLAR，替换为讲台)


            // I. 中间房间南侧长方形系统 (3 排 × 2 列 = 6 个长方形)
            // (圆形控制台已移至 props 数组)
            // (已删除 R1-L，替换为圆形控制台)
            // (已删除 R1-R，替换为圆形控制台)
            // (已删除 R2-L，替换为圆形控制台)
            // (已删除 R2-R，替换为圆形控制台)
            // (已删除 R3-L/R3-R，替换为三联方形隔间控制台，2026-11-05)
        ];

        // =====================================================================
        // 2. Blueprint 视觉图层 (巨型眼睛地坪 + 3 大屏幕 + 圆弧/门洞刻度)
        // =====================================================================
        const props = [
            {
                x: 100,
                y: 400,
                w: 3000,
                h: 1650,
                noCollision: true,
                hideLabel: true,
                draw: (ctx) => {
                    // ===== 离屏预渲染优化 (2026-11-04)：蓝图静态内容只画一次 =====
                    const P = { x: 100, y: 400, w: 3000, h: 1650 };
                    if (!window.__l7BlueprintCache) {
                        const off = document.createElement('canvas');
                        off.width = P.w; off.height = P.h;
                        const octx = off.getContext('2d');
                        octx.save();
                        octx.translate(-P.x, -P.y);
                        ((ctx) => {
                    ctx.save();

                    // --- 1. 巨型眼睛三大房间地坪底色 ---
                    ctx.beginPath();
                    ctx.moveTo(150, 1200);      // 西端眼睛顶点
                    ctx.lineTo(1055, 470);     // 中室西北角
                    ctx.lineTo(2145, 470);     // 中室东北角
                    ctx.lineTo(3050, 1200);    // 东端眼睛顶点
                    ctx.lineTo(1896, 1960);    // 中室东南角
                    ctx.lineTo(1304, 1960);    // 中室西南角
                    ctx.closePath();
                    ctx.fillStyle = '#05100c';
                    ctx.fill();

                    // --- 2. 中间大圆形内部悬挂发光灯环 ---
                    ctx.beginPath();
                    ctx.arc(cx, cy, 143, 0, Math.PI * 2);
                    ctx.strokeStyle = 'rgba(52, 211, 153, 0.95)';
                    ctx.lineWidth = 8;
                    ctx.stroke();

                    ctx.beginPath();
                    ctx.arc(cx, cy, 143, 0, Math.PI * 2);
                    ctx.strokeStyle = '#e6fffa';
                    ctx.lineWidth = 2;
                    ctx.stroke();

                    // --- 3. 最上方 3 大高科技控制显示屏 ---
                    ctx.save();

                    // 3A. LEFT SCREEN
                    ctx.save();
                    ctx.beginPath();
                    ctx.moveTo(1055, 490);
                    ctx.lineTo(1403, 490);
                    ctx.lineTo(1445, 740);
                    ctx.lineTo(1110, 820);
                    ctx.closePath();

                    const radLeft = ctx.createRadialGradient(1250, 650, 20, 1250, 650, 320);
                    radLeft.addColorStop(0, '#0b355c');
                    radLeft.addColorStop(0.45, '#061c3a');
                    radLeft.addColorStop(1, '#05100c');
                    ctx.fillStyle = radLeft;
                    ctx.fill();

                    ctx.strokeStyle = '#00CCFF';
                    ctx.lineWidth = 2.5;
                    ctx.stroke();

                    ctx.clip();

                    ctx.strokeStyle = 'rgba(0, 204, 255, 0.04)';
                    ctx.lineWidth = 1;
                    for (let gy = 480; gy < 830; gy += 3) {
                        ctx.beginPath(); ctx.moveTo(1000, gy); ctx.lineTo(1500, gy); ctx.stroke();
                    }

                    ctx.beginPath();
                    ctx.moveTo(1055, 490); ctx.lineTo(1250, 490); ctx.lineTo(1120, 750); ctx.closePath();
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)'; ctx.fill();

                    ctx.fillStyle = 'rgba(0, 204, 255, 0.18)';
                    ctx.fillRect(1070, 495, 325, 22);
                    ctx.strokeStyle = '#00CCFF';
                    ctx.lineWidth = 1.2;
                    ctx.strokeRect(1070, 495, 325, 22);

                    ctx.font = 'bold 11px monospace';
                    ctx.fillStyle = '#00E5FF';
                    ctx.textAlign = 'center';
                    ctx.fillText('INFERNAL DEEP MONITOR', 1232, 510);

                    ctx.fillStyle = 'rgba(0, 204, 255, 0.08)';
                    ctx.fillRect(1075, 523, 318, 112);
                    ctx.strokeStyle = 'rgba(0, 204, 255, 0.4)';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(1075, 523, 318, 112);

                    ctx.font = 'bold 8.5px monospace';
                    ctx.fillStyle = '#38bdf8';
                    ctx.textAlign = 'left';
                    ctx.fillText('ABYSSAL DEEP SECTOR OUTLINE:', 1082, 535);

                    // Sector 1: Demon Wings
                    ctx.strokeStyle = '#FF3344'; ctx.lineWidth = 1.2;
                    ctx.strokeRect(1080, 542, 90, 88);
                    ctx.fillStyle = 'rgba(255, 51, 68, 0.10)'; ctx.fillRect(1080, 542, 90, 88);

                    ctx.save();
                    ctx.translate(1125, 580);
                    ctx.strokeStyle = '#ff3344';
                    ctx.fillStyle = 'rgba(255, 51, 68, 0.25)';
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.moveTo(0, 5);
                    ctx.bezierCurveTo(-12, -15, -30, -12, -33, 2);
                    ctx.bezierCurveTo(-24, 8, -18, 18, -10, 10);
                    ctx.bezierCurveTo(-6, 15, -3, 12, 0, 5);
                    ctx.closePath(); ctx.fill(); ctx.stroke();

                    ctx.beginPath();
                    ctx.moveTo(0, 5);
                    ctx.bezierCurveTo(12, -15, 30, -12, 33, 2);
                    ctx.bezierCurveTo(24, 8, 18, 18, 10, 10);
                    ctx.bezierCurveTo(6, 15, 3, 12, 0, 5);
                    ctx.closePath(); ctx.fill(); ctx.stroke();

                    ctx.beginPath(); ctx.moveTo(0, 5); ctx.lineTo(-33, 2); ctx.stroke();
                    ctx.beginPath(); ctx.moveTo(0, 5); ctx.lineTo(33, 2); ctx.stroke();
                    ctx.restore();

                    ctx.font = 'bold 7px monospace'; ctx.textAlign = 'center'; ctx.fillStyle = '#FF3344';
                    ctx.fillText('SEC 1: SATAN DOMAIN', 1125, 622);

                    // Sector 2: Irregular Lava Lake Polygon
                    ctx.strokeStyle = '#FFCC00'; ctx.lineWidth = 1.2;
                    ctx.strokeRect(1178, 542, 90, 88);
                    ctx.fillStyle = 'rgba(255, 204, 0, 0.10)'; ctx.fillRect(1178, 542, 90, 88);

                    ctx.save();
                    ctx.translate(1223, 578);
                    ctx.strokeStyle = '#ffaa00';
                    ctx.fillStyle = 'rgba(255, 170, 0, 0.3)';
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.moveTo(-28, -10);
                    ctx.lineTo(-10, -20);
                    ctx.lineTo(16, -16);
                    ctx.lineTo(28, -4);
                    ctx.lineTo(24, 16);
                    ctx.lineTo(2, 22);
                    ctx.lineTo(-22, 14);
                    ctx.lineTo(-28, 4);
                    ctx.closePath();
                    ctx.fill(); ctx.stroke();
                    ctx.strokeStyle = '#ffe600'; ctx.lineWidth = 1;
                    ctx.beginPath(); ctx.moveTo(-10, -20); ctx.lineTo(2, 22); ctx.stroke();
                    ctx.beginPath(); ctx.moveTo(-28, 4); ctx.lineTo(16, -16); ctx.stroke();
                    ctx.restore();

                    ctx.font = 'bold 7px monospace'; ctx.textAlign = 'center'; ctx.fillStyle = '#FFCC00';
                    ctx.fillText('SEC 2: MOLTEN BASIN', 1223, 622);

                    // Sector 3: Sacrificial Altar Hexagon
                    ctx.strokeStyle = '#00FF66'; ctx.lineWidth = 1.2;
                    ctx.strokeRect(1276, 542, 112, 88);
                    ctx.fillStyle = 'rgba(0, 255, 102, 0.10)'; ctx.fillRect(1276, 542, 112, 88);

                    ctx.save();
                    ctx.translate(1332, 578);
                    ctx.strokeStyle = '#00ff66';
                    ctx.fillStyle = 'rgba(0, 255, 102, 0.25)';
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    for (let a = 0; a < 6; a++) {
                        const ang = (Math.PI / 3) * a;
                        const hx = 20 * Math.cos(ang);
                        const hy = 20 * Math.sin(ang);
                        if (a === 0) ctx.moveTo(hx, hy); else ctx.lineTo(hx, hy);
                    }
                    ctx.closePath(); ctx.fill(); ctx.stroke();
                    ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.stroke();
                    ctx.beginPath(); ctx.arc(0, 0, 3.5, 0, Math.PI * 2); ctx.fill();
                    ctx.restore();

                    ctx.font = 'bold 7px monospace'; ctx.textAlign = 'center'; ctx.fillStyle = '#00FF66';
                    ctx.fillText('SEC 3: SACRIFICE ALTAR', 1332, 622);

                    // Cerberus Diagram
                    ctx.fillStyle = 'rgba(0, 204, 255, 0.08)';
                    ctx.fillRect(1098, 642, 330, 138);
                    ctx.strokeStyle = 'rgba(0, 204, 255, 0.4)';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(1098, 642, 330, 138);

                    ctx.font = 'bold 9px monospace';
                    ctx.fillStyle = '#ef4444'; ctx.textAlign = 'left';
                    ctx.fillText('SUBJECT: CERBERUS / HELLHOUND DIAGRAM', 1106, 655);

                    ctx.save();
                    ctx.translate(1150, 712);

                    ctx.strokeStyle = '#ef4444';
                    ctx.lineWidth = 1.8;
                    ctx.beginPath(); ctx.moveTo(-16, 8); ctx.lineTo(-22, 24); ctx.lineTo(-18, 25); ctx.stroke();
                    ctx.beginPath(); ctx.moveTo(-8, 8); ctx.lineTo(-12, 24); ctx.lineTo(-8, 25); ctx.stroke();
                    ctx.beginPath(); ctx.moveTo(10, 8); ctx.lineTo(8, 24); ctx.lineTo(12, 25); ctx.stroke();
                    ctx.beginPath(); ctx.moveTo(18, 8); ctx.lineTo(18, 24); ctx.lineTo(22, 25); ctx.stroke();

                    ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
                    ctx.beginPath(); ctx.ellipse(0, 2, 22, 11, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

                    ctx.beginPath();
                    ctx.moveTo(-22, 2);
                    ctx.quadraticCurveTo(-32, -8, -28, -18);
                    ctx.stroke();
                    ctx.fillStyle = '#ff2200';
                    ctx.beginPath(); ctx.arc(-28, -18, 3, 0, Math.PI * 2); ctx.fill();

                    const drawHead = (hx, hy, angle) => {
                        ctx.save();
                        ctx.translate(hx, hy);
                        ctx.rotate(angle);
                        ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 2;
                        ctx.beginPath(); ctx.moveTo(0, 10); ctx.lineTo(0, 0); ctx.stroke();
                        ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
                        ctx.beginPath(); ctx.arc(0, -2, 6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
                        ctx.beginPath(); ctx.moveTo(3, -4); ctx.lineTo(10, -2); ctx.lineTo(3, 1); ctx.closePath(); ctx.fill(); ctx.stroke();
                        ctx.beginPath(); ctx.moveTo(-2, -6); ctx.lineTo(-4, -11); ctx.lineTo(1, -6); ctx.fill(); ctx.stroke();
                        ctx.fillStyle = '#ff0000';
                        ctx.beginPath(); ctx.arc(2, -3, 1.2, 0, Math.PI * 2); ctx.fill();
                        ctx.restore();
                    };

                    drawHead(-12, -8, -0.35);
                    drawHead(0, -12, 0);
                    drawHead(12, -8, 0.35);

                    ctx.restore();

                    ctx.font = 'bold 8.5px monospace'; ctx.textAlign = 'left';
                    ctx.fillStyle = '#f87171';
                    ctx.fillText('ENTITY ID: CERBERUS-X', 1208, 672);
                    ctx.fillText('THREAT LEVEL: OMEGA-MAX', 1208, 687);
                    ctx.fillStyle = '#FFCC00';
                    ctx.fillText('STATUS: UNKNOWN', 1208, 702);
                    ctx.fillText('ANATOMY DATA: UNKNOWN', 1208, 717);
                    ctx.fillText('WEAKNESS: UNKNOWN', 1208, 732);

                    ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
                    ctx.fillRect(1106, 746, 314, 20);
                    ctx.strokeStyle = '#ef4444';
                    ctx.strokeRect(1106, 746, 314, 20);
                    ctx.font = 'bold 8.5px monospace';
                    ctx.fillStyle = '#ff6666';
                    ctx.textAlign = 'center';
                    ctx.fillText('⚠️ DETAILED SPECIFICATIONS: UNKNOWN', 1263, 760);

                    ctx.restore(); // end Screen 1

                    // 3B. CENTER SCREEN: GLOBAL STRATEGIC COMMAND & WORLD THEATER MAP
                    ctx.save();
                    ctx.beginPath();
                    ctx.moveTo(1403, 490);
                    ctx.lineTo(1797, 490);
                    ctx.lineTo(1755, 740);
                    ctx.lineTo(1445, 740);
                    ctx.closePath();

                    const gradCenter = ctx.createRadialGradient(1600, 630, 20, 1600, 630, 300);
                    gradCenter.addColorStop(0, '#0c3a6b');
                    gradCenter.addColorStop(0.45, '#071f40');
                    gradCenter.addColorStop(1, '#05100c');
                    ctx.fillStyle = gradCenter;
                    ctx.fill();

                    ctx.strokeStyle = '#00E5FF';
                    ctx.lineWidth = 2.5;
                    ctx.stroke();

                    ctx.clip();

                    ctx.strokeStyle = 'rgba(0, 229, 255, 0.04)';
                    ctx.lineWidth = 1;
                    for (let gy = 480; gy < 750; gy += 3) {
                        ctx.beginPath(); ctx.moveTo(1400, gy); ctx.lineTo(1800, gy); ctx.stroke();
                    }

                    ctx.beginPath();
                    ctx.moveTo(1403, 490); ctx.lineTo(1620, 490); ctx.lineTo(1480, 740); ctx.closePath();
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)'; ctx.fill();

                    ctx.fillStyle = 'rgba(0, 229, 255, 0.18)';
                    ctx.fillRect(1410, 495, 380, 24);
                    ctx.strokeStyle = '#00E5FF';
                    ctx.lineWidth = 1.2;
                    ctx.strokeRect(1410, 495, 380, 24);

                    ctx.font = 'bold 11px monospace';
                    ctx.fillStyle = '#ffffff';
                    ctx.textAlign = 'center';
                    ctx.fillText('GLOBAL STRATEGIC COMMAND - WORLD THEATER MAP', 1600, 511);

                    ctx.strokeStyle = 'rgba(0, 229, 255, 0.22)';
                    ctx.lineWidth = 0.8;
                    for (let latY = 530; latY <= 720; latY += 22) {
                        ctx.beginPath(); ctx.moveTo(1400, latY); ctx.lineTo(1800, latY); ctx.stroke();
                        ctx.font = 'bold 7px monospace'; ctx.fillStyle = 'rgba(0, 229, 255, 0.75)';
                        ctx.textAlign = 'left';
                        ctx.fillText(`${90 - Math.round((latY - 530) * 0.9)}°N`, 1432, latY - 2);
                    }
                    for (let lonX = 1430; lonX <= 1770; lonX += 30) {
                        ctx.beginPath();
                        ctx.moveTo(lonX, 525);
                        ctx.bezierCurveTo(lonX + (1600 - lonX) * 0.12, 600, lonX + (1600 - lonX) * 0.12, 680, lonX, 735);
                        ctx.stroke();
                    }

                    ctx.strokeStyle = 'rgba(0, 229, 255, 0.85)';
                    ctx.fillStyle = 'rgba(0, 229, 255, 0.18)';
                    ctx.lineWidth = 1.2;

                    // North America
                    ctx.beginPath();
                    ctx.moveTo(1465, 580);
                    ctx.lineTo(1490, 573);
                    ctx.lineTo(1530, 577);
                    ctx.lineTo(1525, 610);
                    ctx.lineTo(1512, 617);
                    ctx.lineTo(1508, 613);
                    ctx.lineTo(1495, 635);
                    ctx.lineTo(1480, 615);
                    ctx.lineTo(1468, 595);
                    ctx.closePath(); ctx.fill(); ctx.stroke();

                    // South America
                    ctx.beginPath();
                    ctx.moveTo(1495, 635);
                    ctx.lineTo(1528, 643);
                    ctx.lineTo(1522, 700);
                    ctx.lineTo(1502, 685);
                    ctx.lineTo(1490, 653);
                    ctx.closePath(); ctx.fill(); ctx.stroke();

                    // Eurasia
                    ctx.beginPath();
                    ctx.moveTo(1560, 583);
                    ctx.lineTo(1578, 567);
                    ctx.lineTo(1595, 567);
                    ctx.lineTo(1645, 565);
                    ctx.lineTo(1740, 573);
                    ctx.lineTo(1745, 610);
                    ctx.lineTo(1700, 630);
                    ctx.lineTo(1670, 650);
                    ctx.lineTo(1655, 623);
                    ctx.lineTo(1615, 625);
                    ctx.lineTo(1610, 607);
                    ctx.lineTo(1560, 587);
                    ctx.closePath(); ctx.fill(); ctx.stroke();

                    // Africa
                    ctx.beginPath();
                    ctx.moveTo(1570, 610);
                    ctx.lineTo(1615, 613);
                    ctx.lineTo(1622, 645);
                    ctx.lineTo(1595, 687);
                    ctx.lineTo(1568, 650);
                    ctx.closePath(); ctx.fill(); ctx.stroke();

                    // Australia
                    ctx.beginPath();
                    ctx.moveTo(1705, 665);
                    ctx.lineTo(1748, 660);
                    ctx.lineTo(1742, 700);
                    ctx.lineTo(1702, 691);
                    ctx.closePath(); ctx.fill(); ctx.stroke();

                    // Japan Islands Dot
                    ctx.beginPath(); ctx.arc(1748, 595, 3, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

                    const campaignLocations = [
                        { name: 'LOC-01 AIRPORT', lat: '37.6° N', lon: '122.3° W', x: 1485, y: 600, boxX: 1438, boxY: 617 },
                        { name: 'LOC-02 SUBWAY',  lat: '40.7° N', lon: '73.9° W',  x: 1520, y: 593, boxX: 1452, boxY: 563 },
                        { name: 'LOC-03 BANK',    lat: '51.5° N', lon: '0.1° W',   x: 1570, y: 575, boxX: 1545, boxY: 545 },
                        { name: 'LOC-04 YACHT',   lat: '25.7° N', lon: '80.1° W',  x: 1510, y: 630, boxX: 1448, boxY: 655 },
                        { name: 'LOC-05 HOTEL',   lat: '47.3° N', lon: '8.5° E',   x: 1592, y: 585, boxX: 1602, boxY: 600 },
                        { name: 'LOC-06 EXPRESS', lat: '55.7° N', lon: '37.6° E',  x: 1640, y: 571, boxX: 1660, boxY: 550 },
                    ];

                    campaignLocations.forEach(loc => {
                        ctx.fillStyle = '#00FF66';
                        ctx.beginPath(); ctx.arc(loc.x, loc.y, 3, 0, Math.PI * 2); ctx.fill();
                        ctx.strokeStyle = '#00FF66'; ctx.lineWidth = 1;
                        ctx.beginPath(); ctx.arc(loc.x, loc.y, 6, 0, Math.PI * 2); ctx.stroke();

                        ctx.strokeStyle = 'rgba(0, 229, 255, 0.6)';
                        ctx.lineWidth = 0.8;
                        ctx.beginPath(); ctx.moveTo(loc.x, loc.y); ctx.lineTo(loc.boxX + 35, loc.boxY + 9); ctx.stroke();

                        ctx.fillStyle = 'rgba(6, 28, 22, 0.88)';
                        ctx.strokeStyle = '#00E5FF';
                        ctx.lineWidth = 0.8;
                        const w = 92;
                        const h = 18;
                        ctx.fillRect(loc.boxX, loc.boxY, w, h);
                        ctx.strokeRect(loc.boxX, loc.boxY, w, h);

                        ctx.font = 'bold 6.5px monospace';
                        ctx.fillStyle = '#00E5FF'; ctx.textAlign = 'left';
                        ctx.fillText(loc.name, loc.boxX + 3, loc.boxY + 7);
                        ctx.fillStyle = '#ffffff';
                        ctx.fillText(`[${loc.lat}, ${loc.lon}]`, loc.boxX + 3, loc.boxY + 15);
                    });

                    ctx.restore(); // end Screen 2

                    // 3C. RIGHT SCREEN
                    ctx.save();
                    ctx.beginPath();
                    ctx.moveTo(1797, 490);
                    ctx.lineTo(2145, 490);
                    ctx.lineTo(2090, 820);
                    ctx.lineTo(1755, 740);
                    ctx.closePath();

                    const gradRight = ctx.createRadialGradient(1950, 650, 20, 1950, 650, 320);
                    gradRight.addColorStop(0, '#0b355c');
                    gradRight.addColorStop(0.45, '#061c3a');
                    gradRight.addColorStop(1, '#05100c');
                    ctx.fillStyle = gradRight;
                    ctx.fill();

                    ctx.strokeStyle = '#00CCFF';
                    ctx.lineWidth = 2.0;
                    ctx.stroke();

                    ctx.clip();

                    ctx.strokeStyle = 'rgba(0, 204, 255, 0.04)';
                    ctx.lineWidth = 1;
                    for (let gy = 480; gy < 830; gy += 3) {
                        ctx.beginPath(); ctx.moveTo(1750, gy); ctx.lineTo(2200, gy); ctx.stroke();
                    }

                    ctx.beginPath();
                    ctx.moveTo(1797, 490); ctx.lineTo(1980, 490); ctx.lineTo(1850, 750); ctx.closePath();
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)'; ctx.fill();

                    ctx.fillStyle = 'rgba(0, 204, 255, 0.15)';
                    ctx.fillRect(1790, 495, 312, 22);
                    ctx.strokeStyle = '#00CCFF';
                    ctx.lineWidth = 1.2;
                    ctx.strokeRect(1790, 495, 312, 22);

                    ctx.font = 'bold 11px monospace';
                    ctx.fillStyle = '#00E5FF';
                    ctx.textAlign = 'center';
                    ctx.fillText('PERSONNEL & TRAIN TELEMETRY', 1946, 510);

                    ctx.fillStyle = 'rgba(0, 204, 255, 0.08)';
                    ctx.fillRect(1790, 523, 320, 112);
                    ctx.strokeStyle = 'rgba(0, 204, 255, 0.4)';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(1790, 523, 320, 112);

                    ctx.font = 'bold 8.5px monospace';
                    ctx.fillStyle = '#38bdf8'; ctx.textAlign = 'left';
                    ctx.fillText('PERSONNEL VITAL SIGNS MONITORING:', 1796, 535);

                    const personnelList = [
                        { name: 'SPECTRE (AGENT)', status: 'ACTIVE', bpm: 72, o2: '98%', hp: '100%' },
                        { name: 'NEXUS (OPERATOR)', status: 'ONLINE', bpm: 68, o2: '99%', hp: '100%' },
                        { name: 'APEX (COMMANDER)', status: 'STANDBY', bpm: 75, o2: '97%', hp: '100%' },
                    ];

                    personnelList.forEach((p, i) => {
                        const py = 544 + i * 27;
                        ctx.fillStyle = '#0a1a30'; ctx.fillRect(1814, py, 20, 20);
                        ctx.strokeStyle = '#00E5FF'; ctx.strokeRect(1814, py, 20, 20);
                        ctx.fillStyle = '#00E5FF';
                        ctx.beginPath(); ctx.arc(1824, py + 7, 3.5, 0, Math.PI * 2); ctx.fill();
                        ctx.beginPath(); ctx.arc(1824, py + 18, 6, Math.PI, 0); ctx.fill();

                        ctx.font = 'bold 7.5px monospace';
                        ctx.fillStyle = '#ffffff'; ctx.fillText(p.name, 1838, py + 7);
                        ctx.fillStyle = '#00FF66'; ctx.fillText(`[${p.status}]`, 1838, py + 16);

                        ctx.fillStyle = '#38bdf8';
                        ctx.fillText(`HR: ${p.bpm} BPM | O2: ${p.o2} | VITAL: ${p.hp}`, 1930, py + 11);

                        ctx.strokeStyle = '#00FF66'; ctx.lineWidth = 1;
                        ctx.beginPath();
                        const ecgX = 2065;
                        ctx.moveTo(ecgX, py + 9);
                        ctx.lineTo(ecgX + 8, py + 9);
                        ctx.lineTo(ecgX + 11, py + 2);
                        ctx.lineTo(ecgX + 15, py + 16);
                        ctx.lineTo(ecgX + 18, py + 9);
                        ctx.lineTo(ecgX + 30, py + 9);
                        ctx.stroke();
                    });

                    ctx.fillStyle = 'rgba(0, 204, 255, 0.08)';
                    ctx.fillRect(1795, 642, 335, 138);
                    ctx.strokeStyle = 'rgba(0, 204, 255, 0.4)';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(1795, 642, 335, 138);

                    ctx.font = 'bold 8.5px monospace';
                    ctx.fillStyle = '#38bdf8'; ctx.textAlign = 'left';
                    ctx.fillText('ARMORED EXPRESS & BRIDGE LAYOUT:', 1802, 655);

                    ctx.strokeStyle = '#00E5FF';
                    ctx.lineWidth = 1.2;
                    ctx.fillStyle = 'rgba(0, 229, 255, 0.15)';

                    const trainStartX = 1802;
                    const trainY = 663;
                    for (let c = 0; c < 6; c++) {
                        const cx = trainStartX + c * 22;
                        ctx.fillRect(cx, trainY, 19, 9);
                        ctx.strokeRect(cx, trainY, 19, 9);
                    }
                    ctx.beginPath();
                    ctx.moveTo(trainStartX + 132, trainY);
                    ctx.lineTo(trainStartX + 144, trainY + 4.5);
                    ctx.lineTo(trainStartX + 132, trainY + 9);
                    ctx.closePath(); ctx.fill(); ctx.stroke();

                    ctx.fillStyle = '#081220';
                    ctx.fillRect(1802, 678, 145, 45);
                    ctx.strokeStyle = '#00E5FF';
                    ctx.lineWidth = 1.2;
                    ctx.strokeRect(1802, 678, 145, 45);

                    ctx.fillStyle = '#00CCFF';
                    ctx.fillRect(1808, 682, 24, 7);
                    ctx.fillRect(1836, 682, 24, 7);
                    ctx.fillRect(1874, 682, 32, 7);

                    ctx.fillRect(1808, 712, 24, 7);
                    ctx.fillRect(1874, 712, 32, 7);

                    ctx.font = 'bold 6.5px monospace'; ctx.fillStyle = '#00FF66';
                    ctx.fillText('COMMAND BRIDGE (CAR 4)', 1806, 702);

                    ctx.font = 'bold 8px monospace';
                    ctx.fillStyle = '#ffffff';
                    ctx.fillText('ARMORED EXPRESS SPECS:', 1955, 682);

                    ctx.font = '7.5px monospace'; ctx.fillStyle = '#38bdf8';
                    ctx.fillText('SPEED: 240 KM/H', 1955, 695);
                    ctx.fillText('STATUS: CRUISING', 1955, 707);
                    ctx.fillText('CARRIAGES: 06 UNITS', 1955, 719);
                    ctx.fillText('DEFENSE: MAX LOCKDOWN', 1955, 731);

                    ctx.fillStyle = 'rgba(0, 255, 102, 0.15)';
                    ctx.fillRect(1802, 752, 318, 18);
                    ctx.strokeStyle = '#00FF66';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(1802, 752, 318, 18);
                    ctx.font = 'bold 8.5px monospace'; ctx.fillStyle = '#00FF66';
                    ctx.textAlign = 'center';
                    ctx.fillText('SYSTEM STATUS: ALL SECURE', 1961, 765);

                    ctx.restore(); // end Screen 3

                    ctx.restore(); // end 3 screens block

                    // --- 4. 左右三角房间大圆弧结构 ---
                    ctx.save();
                    ctx.strokeStyle = '#10b981';

                    // 4A. 西侧三角房间大圆弧
                    ctx.beginPath();
                    ctx.lineWidth = 3;
                    ctx.moveTo(1142, 985);
                    ctx.bezierCurveTo(1010, 1070, 1010, 1330, 1215, 1415);
                    ctx.stroke();

                    // 4B. 东侧三角房间大圆弧
                    ctx.beginPath();
                    ctx.lineWidth = 3;
                    ctx.moveTo(2058, 985);
                    ctx.bezierCurveTo(2190, 1070, 2190, 1330, 1985, 1415);
                    ctx.stroke();

                    ctx.restore();

                    ctx.restore();
                
                        })(octx);
                        octx.restore();
                        window.__l7BlueprintCache = off;
                    }
                    ctx.drawImage(window.__l7BlueprintCache, P.x, P.y);
                },
            },

            // =========================================================
            // 2. 4 扇重型自动防爆装甲门 (完全实装自动感应平移门系统，窄型紧凑装甲外壳，翡翠暗绿配色)
            // =========================================================
            // 1. 西侧上门: 连接 (1110,860)-(1124,860) 与 (1132,980)-(1146,980)
            {
                type: 'heavy_auto_door',
                cx: 1128,
                cy: 920,
                topX: 1117,
                topY: 860,
                botX: 1139,
                botY: 980,
                x: 1121,
                y: 859,
                w: 14,
                h: 122,
                angle: -0.1813,
                label: 'WEST UPPER HEAVY AUTO DOOR',
                displayName: 'HEAVY AUTO DOOR',
                hideLabel: true,
                points: [
                    { x: 1110, y: 860 },
                    { x: 1124, y: 860 },
                    { x: 1146, y: 980 },
                    { x: 1132, y: 980 }
                ]
            },
            // 2. 西侧下门: 连接 (1271,1775)-(1285,1775) 与 (1292,1895)-(1306,1895)
            {
                type: 'heavy_auto_door',
                cx: 1288.5,
                cy: 1835,
                topX: 1278,
                topY: 1775,
                botX: 1299,
                botY: 1895,
                x: 1281.5,
                y: 1774,
                w: 14,
                h: 122,
                angle: -0.173,
                label: 'WEST LOWER HEAVY AUTO DOOR',
                displayName: 'HEAVY AUTO DOOR',
                hideLabel: true,
                points: [
                    { x: 1271, y: 1775 },
                    { x: 1285, y: 1775 },
                    { x: 1306, y: 1895 },
                    { x: 1292, y: 1895 }
                ]
            },
            // 3. 东侧上门: 连接 (2076,860)-(2090,860) 与 (2054,980)-(2068,980)
            {
                type: 'heavy_auto_door',
                cx: 2072,
                cy: 920,
                topX: 2083,
                topY: 860,
                botX: 2061,
                botY: 980,
                x: 2065,
                y: 859,
                w: 14,
                h: 122,
                angle: 0.1813,
                label: 'EAST UPPER HEAVY AUTO DOOR',
                displayName: 'HEAVY AUTO DOOR',
                hideLabel: true,
                points: [
                    { x: 2090, y: 860 },
                    { x: 2076, y: 860 },
                    { x: 2054, y: 980 },
                    { x: 2068, y: 980 }
                ]
            },
            // 4. 东侧下门: 连接 (1915,1775)-(1929,1775) 与 (1894,1895)-(1908,1895)
            {
                type: 'heavy_auto_door',
                cx: 1911.5,
                cy: 1835,
                topX: 1922,
                topY: 1775,
                botX: 1901,
                botY: 1895,
                x: 1904.5,
                y: 1774,
                w: 14,
                h: 122,
                angle: 0.173,
                label: 'EAST LOWER HEAVY AUTO DOOR',
                displayName: 'HEAVY AUTO DOOR',
                hideLabel: true,
                points: [
                    { x: 1929, y: 1775 },
                    { x: 1915, y: 1775 },
                    { x: 1894, y: 1895 },
                    { x: 1908, y: 1895 }
                ]
            },

            // =========================================================
            // 3. 移植自 Level 8 的全新扇形战术主控台 (置于原右圆柱 1850, 920 位置，斜 45 度朝向下方大圆台)
            //    指挥讲台 (置于原左圆柱 1350, 920 位置，镜像 45 度朝向下方大圆台，2026-11-05)
            // =========================================================
            getSectorWorkstation(1850, 920, -Math.PI * 0.75, 1.0, 'EAST SECTOR COMMAND CONSOLE'),
            getPodium(1350, 920, Math.PI * 0.75, 1.0, 'WEST COMMAND PODIUM'),
            // =========================================================
            // 4. 圆形全包围控制台 ×4 (替代 R1/R2 长方形，2026-11-04)
            // 左侧2个横排，右侧2个横排，中间过道 50px（2026-11-05 收窄，碰撞半径65）
            // 已加碰撞体积（noCollision: false）
            // =========================================================
            getCircularPodWorkstation(1370, 1548, 0, 1.0, 'L7 LEFT POD A'),
            getCircularPodWorkstation(1510, 1548, 0, 1.0, 'L7 LEFT POD B'),
            getCircularPodWorkstation(1690, 1548, 0, 1.0, 'L7 RIGHT POD A'),
            getCircularPodWorkstation(1830, 1548, 0, 1.0, 'L7 RIGHT POD B'),
            // =========================================================
            // 5. 三联方形隔间控制台 ×2 (替代 R3 长方形，2026-11-05)
            // 左右各1个横排，中间过道 60px；上移与圆形舱保持距离
            // 已加碰撞体积（noCollision: false）
            // =========================================================
            getTripleCubicleWorkstation(1430, 1675, 0, 1.0, 'L7 LEFT TRIPLE CUBICLE'),
            getTripleCubicleWorkstation(1770, 1675, 0, 1.0, 'L7 RIGHT TRIPLE CUBICLE'),
            // =========================================================
            // 6. 服务器集群 ×1 (移植自 Level 8，2026-11-05)
            // 房间最底下贴墙，scale 0.85
            // =========================================================
            getServerCluster(1600, 1900, 0, 0.85, 'L7 SERVER CLUSTER'),
            // 两侧斜墙各一个，贴墙旋转（2026-11-05）
            getServerCluster(1252, 1200, 4.5350, 0.85, 'L7 LEFT SERVER'),
            getServerCluster(1948, 1200, 1.7480, 0.85, 'L7 RIGHT SERVER')
        ];

        // =====================================================================
        // 3. 区域与房间定义 (Zones)
        // =====================================================================
        const zones = [
            {
                id: 'apex_chamber_1',
                name: '顶石中央指挥大厅 (Room 01)',
                x: 1055,
                y: 830,
                w: 1090,
                h: 1130
            },
            {
                id: 'apex_chamber_west',
                name: '顶石西侧观测区 (West Sector)',
                x: 150,
                y: 490,
                w: 905,
                h: 1470
            },
            {
                id: 'apex_chamber_east',
                name: '顶石东侧科研区 (East Sector)',
                x: 2145,
                y: 490,
                w: 905,
                h: 1470
            }
        ];

        // =====================================================================
        // 4. 寻路与视野导航路点
        // =====================================================================
        const waypoints = [
            { x: 1600, y: 1835 },
            { x: 1600, y: 1645 },
            { x: 1600, y: 1545 },
            { x: 1600, y: 1435 },
            { x: 1300, y: 1200 },
            { x: 1900, y: 1200 },
            { x: 1600, y: 980 },
            { x: 1600, y: 800 },
            { x: 1350, y: 840 },
            { x: 1850, y: 840 },
            { x: 1125, y: 920 },
            { x: 2075, y: 920 },
            { x: 1295, y: 1835 },
            { x: 1905, y: 1835 },
            { x: 950, y: 920 },
            { x: 950, y: 1835 },
            { x: 805, y: 1200 },
            { x: 665, y: 1200 },
            { x: 530, y: 1200 },
            { x: 300, y: 1200 },
            { x: 2250, y: 920 },
            { x: 2250, y: 1835 },
            { x: 2395, y: 1200 },
            { x: 2535, y: 1200 },
            { x: 2670, y: 1200 },
            { x: 2900, y: 1200 }
        ];

        return {
            obstacles,
            props,
            zones,
            waypoints,
            cameras: [],
            lasers: [],
            securityGates: []
        };
    }
};

window.LEVEL_LAB = LEVEL_LAB;
