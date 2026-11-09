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
function drawSectorWorkstation(ctx, cx, cy, angle = 0, scale = 1.0) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    if (scale !== 1.0) ctx.scale(scale, scale);

    const time = Date.now() * 0.001;

    // --- 1. 扇形控制台主体工作台面 (Fan-shaped Console Desk Surface) ---
    const R_out = 112;
    const R_in = 52;
    const maxTheta = 36 * Math.PI / 180;
    const startAngle = -Math.PI / 2 - maxTheta;
    const endAngle = -Math.PI / 2 + maxTheta;

    // 1A. 底座与重型军工装甲包边
    ctx.beginPath();
    ctx.arc(0, 0, R_out + 2, startAngle - 0.02, endAngle + 0.02, false);
    ctx.lineTo(Math.sin(maxTheta) * (R_in - 2), -Math.cos(maxTheta) * (R_in - 2));
    ctx.arc(0, 0, R_in - 2, endAngle + 0.02, startAngle - 0.02, true);
    ctx.closePath();
    ctx.fillStyle = "#02120e";
    ctx.fill();
    ctx.strokeStyle = "#064e3b";
    ctx.lineWidth = 3.5;
    ctx.stroke();

    // 1B. 碳纤军工翡翠科技台面 (Radial Gradient Surface)
    ctx.beginPath();
    ctx.arc(0, 0, R_out, startAngle, endAngle, false);
    ctx.lineTo(Math.sin(maxTheta) * R_in, -Math.cos(maxTheta) * R_in);
    ctx.arc(0, 0, R_in, endAngle, startAngle, true);
    ctx.closePath();
    const gradDesk = ctx.createRadialGradient(0, 0, R_in, 0, 0, R_out);
    gradDesk.addColorStop(0, "#08251e");
    gradDesk.addColorStop(0.6, "#041712");
    gradDesk.addColorStop(1, "#020d0a");
    ctx.fillStyle = gradDesk;
    ctx.fill();
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 1.4;
    ctx.stroke();

    // 1C. 台面金属嵌缝与导轨线
    ctx.strokeStyle = "rgba(52, 211, 153, 0.28)";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.arc(0, 0, (R_out + R_in) / 2 + 12, startAngle + 0.03, endAngle - 0.03);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, (R_out + R_in) / 2 - 12, startAngle + 0.03, endAngle - 0.03);
    ctx.stroke();

    // 两侧功能分界径向嵌线
    [-16 * Math.PI / 180, 16 * Math.PI / 180].forEach(radTheta => {
        ctx.beginPath();
        ctx.moveTo(Math.sin(radTheta) * (R_in + 2), -Math.cos(radTheta) * (R_in + 2));
        ctx.lineTo(Math.sin(radTheta) * (R_out - 4), -Math.cos(radTheta) * (R_out - 4));
        ctx.strokeStyle = "#064e3b";
        ctx.lineWidth = 1.5;
        ctx.stroke();
    });

    // --- 2. 前部 3 连体全景弧面高科技显示屏 ("前部是三个连在一起的屏幕") ---
    const R_scr_out = 110;
    const R_scr_in = 94;
    const scrBezelOuter = 111.5;
    const scrBezelInner = 92.5;

    // 2A. 屏幕一体化金属悬臂底座与支架
    ctx.save();
    for (let sa = -30; sa <= 30; sa += 15) {
        const rad = sa * Math.PI / 180;
        const bx = Math.sin(rad) * 91;
        const by = -Math.cos(rad) * 91;
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(bx - 3, by - 2, 6, 4);
        ctx.fillStyle = "#10b981";
        ctx.fillRect(bx - 1.5, by - 1, 3, 2);
    }
    ctx.restore();

    // 屏幕角度定义: Left (-33° to -11°), Center (-11° to +11°), Right (+11° to +33°)
    const screens = [
        { id: "L", startDeg: -33, endDeg: -11, label: "SPECTRAL / COMMS" },
        { id: "C", startDeg: -11, endDeg: 11, label: "TACTICAL RADAR HUD" },
        { id: "R", startDeg: 11, endDeg: 33, label: "REACTOR / SHIELD" }
    ];

    screens.forEach(scr => {
        ctx.save();
        const a1 = -Math.PI / 2 + scr.startDeg * Math.PI / 180;
        const a2 = -Math.PI / 2 + scr.endDeg * Math.PI / 180;

        // 边框 (Bezel)
        ctx.beginPath();
        ctx.arc(0, 0, scrBezelOuter, a1 + 0.01, a2 - 0.01, false);
        ctx.arc(0, 0, scrBezelInner, a2 - 0.01, a1 + 0.01, true);
        ctx.closePath();
        ctx.fillStyle = "#03100b";
        ctx.fill();
        ctx.strokeStyle = "#047857";
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // 屏幕玻璃面
        ctx.beginPath();
        ctx.arc(0, 0, R_scr_out, a1 + 0.02, a2 - 0.02, false);
        ctx.arc(0, 0, R_scr_in, a2 - 0.02, a1 + 0.02, true);
        ctx.closePath();
        ctx.fillStyle = "#021611";
        ctx.fill();
        ctx.strokeStyle = "#10b981";
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // 限制在屏幕内裁切绘制高精度 UI
        ctx.clip();

        // 屏幕背景细密同心圆弧扫描线 (完美贴合屏幕弧度，杜绝斜切走样)
        ctx.strokeStyle = "rgba(16, 185, 129, 0.12)";
        ctx.lineWidth = 0.6;
        for (let r = R_scr_in + 2; r < R_scr_out - 1; r += 2.5) {
            ctx.beginPath();
            ctx.arc(0, 0, r, a1 + 0.02, a2 - 0.02);
            ctx.stroke();
        }

        // 屏幕局部中心坐标与倾斜角度
        const midDeg = (scr.startDeg + scr.endDeg) / 2;
        const midRad = midDeg * Math.PI / 180;
        const midR = (R_scr_out + R_scr_in) / 2;
        const smx = Math.sin(midRad) * midR;
        const smy = -Math.cos(midRad) * midR;

        // 旋转局部坐标系，与该屏幕弧度切线与法线完全平行 (消除一切歪斜)
        ctx.save();
        ctx.translate(smx, smy);
        ctx.rotate(midRad);

        if (scr.id === "C") {
            // 中央雷达与准星 (Radar HUD)
            ctx.strokeStyle = "rgba(52, 211, 153, 0.55)";
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.arc(0, 0, 6.5, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(0, 0, 3, 0, Math.PI * 2);
            ctx.stroke();
            // 准星十字刻度
            ctx.beginPath();
            ctx.moveTo(-8, 0); ctx.lineTo(8, 0);
            ctx.moveTo(0, -7); ctx.lineTo(0, 7);
            ctx.stroke();

            // 动态旋转雷达扫描线
            const sweepA = (time * 2.5) % (Math.PI * 2);
            ctx.strokeStyle = "#34d399";
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(sweepA) * 7.5, Math.sin(sweepA) * 7.5);
            ctx.stroke();

            // 目标信号点 (Blips)
            ctx.fillStyle = "#38bdf8";
            ctx.beginPath(); ctx.arc(-3.5, -2.5, 1, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(4, 2, 1, 0, Math.PI * 2); ctx.fill();
        } else if (scr.id === "L") {
            // 左屏: 频谱波形与遥测条形图 (Telemetric Spectrogram, 角度完全与屏对齐)
            const bars = 7;
            const barW = 2;
            for (let b = 0; b < bars; b++) {
                const bx = -10 + b * 3.2;
                const hVal = 3 + Math.abs(Math.sin(time * 3 + b * 0.9)) * 8;
                ctx.fillStyle = b === 5 ? "#f59e0b" : "#10b981";
                ctx.fillRect(bx, 4 - hVal, barW, hVal);
            }
            // 顶端通信微型波形
            ctx.strokeStyle = "#38bdf8";
            ctx.lineWidth = 0.9;
            ctx.beginPath();
            ctx.moveTo(-12, -4);
            ctx.lineTo(-6, -6);
            ctx.lineTo(0, -3);
            ctx.lineTo(6, -7);
            ctx.lineTo(12, -4);
            ctx.stroke();
        } else if (scr.id === "R") {
            // 右屏: 反应堆核心环与防线状态指示 (Reactor Diagnostics, 角度完全与屏对齐)
            ctx.strokeStyle = "#f59e0b";
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.arc(-5, 0, 4, 0, Math.PI * 1.5);
            ctx.stroke();

            // 能量阶梯条
            ctx.fillStyle = "#10b981";
            ctx.fillRect(2, -5, 8, 2);
            ctx.fillRect(2, -2, 6, 2);
            ctx.fillStyle = "#38bdf8";
            ctx.fillRect(2, 1, 9, 2);
            ctx.fillStyle = "#ef4444";
            ctx.fillRect(2, 4, 4, 2);
        }

        // 玻璃高光反光倾斜斜线 (沿屏幕切线)
        ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
        ctx.beginPath();
        ctx.moveTo(-14, -10);
        ctx.lineTo(-4, -10);
        ctx.lineTo(6, 10);
        ctx.lineTo(-4, 10);
        ctx.closePath();
        ctx.fill();

        ctx.restore(); // 结束各屏幕旋转 HUD
        ctx.restore(); // 结束各屏幕主裁剪区
    });

    // 屏幕间关节铰链连接锁扣 ("前部是三个连在一起的屏幕")
    [-11 * Math.PI / 180, 11 * Math.PI / 180].forEach(jTheta => {
        const jx = Math.sin(jTheta) * ((R_scr_out + R_scr_in) / 2);
        const jy = -Math.cos(jTheta) * ((R_scr_out + R_scr_in) / 2);
        ctx.save();
        ctx.translate(jx, jy);
        ctx.rotate(jTheta);
        ctx.fillStyle = "#022c22";
        ctx.fillRect(-2, -9, 4, 18);
        ctx.strokeStyle = "#34d399";
        ctx.lineWidth = 1;
        ctx.strokeRect(-2, -9, 4, 18);
        // 金属铰链螺栓
        ctx.fillStyle = "#10b981";
        ctx.beginPath(); ctx.arc(0, -5, 1, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(0, 5, 1, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    });

    // --- 3. 屏幕后方的键盘控制模块 ("屏幕后方是键盘和座椅") ---
    ctx.save();
    // 键盘凹槽托盘
    const kbCenterR = 74;
    const kbW = 28;
    const kbH = 14;
    ctx.translate(0, -kbCenterR);

    ctx.fillStyle = "#021a14";
    ctx.fillRect(-kbW / 2 - 2, -kbH / 2 - 2, kbW + 4, kbH + 4);
    ctx.strokeStyle = "#065f46";
    ctx.lineWidth = 1;
    ctx.strokeRect(-kbW / 2 - 2, -kbH / 2 - 2, kbW + 4, kbH + 4);

    // 机械键盘背光底板
    ctx.fillStyle = "rgba(16, 185, 129, 0.15)";
    ctx.fillRect(-kbW / 2, -kbH / 2, kbW, kbH);

    // 4 排机械键帽阵列
    const keyRows = 4;
    const keyCols = 8;
    const kw = 2.4;
    const kh = 1.9;
    const gapX = 0.8;
    const gapY = 0.8;
    const startKx = -kbW / 2 + 1.2;
    const startKy = -kbH / 2 + 1;

    for (let r = 0; r < keyRows; r++) {
        for (let c = 0; c < keyCols; c++) {
            if (r === 3 && (c >= 2 && c <= 5)) continue; // 空格键留空
            const kx = startKx + c * (kw + gapX);
            const ky = startKy + r * (kh + gapY);
            ctx.fillStyle = "#052e24";
            ctx.fillRect(kx, ky, kw, kh);
            ctx.fillStyle = (r === 0 && c === 0) ? "#ef4444" : "#34d399";
            ctx.fillRect(kx + 0.5, ky + 0.4, kw - 1, kh - 0.8);
        }
    }
    // 特别绘制长条空格键
    const spaceX = startKx + 2 * (kw + gapX);
    const spaceY = startKy + 3 * (kh + gapY);
    const spaceW = 4 * kw + 3 * gapX;
    ctx.fillStyle = "#064e3b";
    ctx.fillRect(spaceX, spaceY, spaceW, kh);
    ctx.fillStyle = "#6ee7b7";
    ctx.fillRect(spaceX + 1, spaceY + 0.4, spaceW - 2, kh - 0.8);

    // 键盘下方集成高精度触控板/定位轨迹球模块
    ctx.fillStyle = "#041d16";
    ctx.fillRect(-6, kbH / 2 + 2, 12, 4);
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 0.7;
    ctx.strokeRect(-6, kbH / 2 + 2, 12, 4);
    // 轨迹发光中线
    ctx.fillStyle = "#38bdf8";
    ctx.fillRect(-2, kbH / 2 + 3.5, 4, 1);
    ctx.restore();

    // --- 4. 左右两侧各有几排控制按钮 ("左右两侧各有几排控制按钮") ---
    // 4A. 左侧操作翼 (Left Wing Controls: 3 Rows of Push Switches, Rockers, Safety Toggles)
    ctx.save();
    const lAngle = -26 * Math.PI / 180;
    ctx.translate(Math.sin(lAngle) * 75, -Math.cos(lAngle) * 75);
    ctx.rotate(lAngle);

    // 控制板底座
    ctx.fillStyle = "#021a14";
    ctx.fillRect(-12, -12, 24, 24);
    ctx.strokeStyle = "#047857";
    ctx.lineWidth = 1;
    ctx.strokeRect(-12, -12, 24, 24);

    // 第一排: 4 枚方型带背光指令按钮 (Row 1)
    const btnColors1 = ["#10b981", "#06b6d4", "#f59e0b", "#ef4444"];
    for (let i = 0; i < 4; i++) {
        const bx = -9 + i * 5;
        const by = -8;
        ctx.fillStyle = "#03120e";
        ctx.fillRect(bx, by, 3.8, 3.8);
        ctx.fillStyle = btnColors1[i];
        ctx.fillRect(bx + 0.6, by + 0.6, 2.6, 2.6);
    }

    // 第二排: 4 枚长条型联动翘板开关 (Row 2)
    for (let i = 0; i < 4; i++) {
        const bx = -9 + i * 5;
        const by = -1;
        ctx.fillStyle = "#03120e";
        ctx.fillRect(bx, by, 3.8, 4.5);
        ctx.fillStyle = (i % 2 === 0) ? "#047857" : "#0f766e";
        ctx.fillRect(bx + 0.5, by + 0.5, 2.8, 3.5);
        // 状态指示灯
        ctx.fillStyle = (Math.sin(time * 4 + i) > 0) ? "#34d399" : "#022c22";
        ctx.beginPath(); ctx.arc(bx + 1.9, by + 1.5, 0.6, 0, Math.PI * 2); ctx.fill();
    }

    // 第三排: 3 枚带安全护盖的拨动开关 (Row 3: Heavy Guarded Toggle Switches)
    for (let i = 0; i < 3; i++) {
        const bx = -7.5 + i * 6.5;
        const by = 6.5;
        // 金属护盖座
        ctx.fillStyle = "#064e3b";
        ctx.fillRect(bx - 1.5, by - 1.5, 4, 4);
        ctx.strokeStyle = "#10b981";
        ctx.lineWidth = 0.6;
        ctx.strokeRect(bx - 1.5, by - 1.5, 4, 4);
        // 金属拨杆
        ctx.strokeStyle = "#f3f4f6";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(bx + 0.5, by + 1.5);
        ctx.lineTo(bx + 0.5, by - 2);
        ctx.stroke();
    }
    ctx.restore();

    // 4B. 右侧操作翼 (Right Wing Controls: Linear Sliders, Rotary Dials, Key Matrix, Emergency Stop)
    ctx.save();
    const rAngle = 26 * Math.PI / 180;
    ctx.translate(Math.sin(rAngle) * 75, -Math.cos(rAngle) * 75);
    ctx.rotate(rAngle);

    // 控制板底座
    ctx.fillStyle = "#021a14";
    ctx.fillRect(-12, -12, 24, 24);
    ctx.strokeStyle = "#047857";
    ctx.lineWidth = 1;
    ctx.strokeRect(-12, -12, 24, 24);

    // 第一排: 双线性电位器推子 (Dual Linear Sliders)
    [-7, -2].forEach((sx, sidx) => {
        // 滑轨槽
        ctx.fillStyle = "#020f0b";
        ctx.fillRect(sx, -9, 2.2, 11);
        ctx.strokeStyle = "#064e3b";
        ctx.lineWidth = 0.5;
        ctx.strokeRect(sx, -9, 2.2, 11);
        // 刻度线
        ctx.strokeStyle = "rgba(52, 211, 153, 0.4)";
        ctx.lineWidth = 0.5;
        for (let ty = -8; ty <= 1; ty += 2) {
            ctx.beginPath(); ctx.moveTo(sx - 1.5, ty); ctx.lineTo(sx - 0.3, ty); ctx.stroke();
        }
        // 滑块手柄
        const faderY = -7 + (sidx === 0 ? 3 : 5.5);
        ctx.fillStyle = "#10b981";
        ctx.fillRect(sx - 1, faderY, 4.2, 2.2);
        ctx.fillStyle = "#e0f2fe";
        ctx.fillRect(sx, faderY + 0.7, 2.2, 0.8);
    });

    // 旋钮组: 2 个高精密旋转编码器旋钮 (Rotary Knurled Dials)
    [4, 9].forEach((dx, didx) => {
        const dy = -4;
        ctx.fillStyle = "#03120e";
        ctx.beginPath(); ctx.arc(dx, dy, 3.2, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "#10b981";
        ctx.lineWidth = 0.8;
        ctx.stroke();
        // 旋钮刻度指示指针
        const pointerRad = (time * 1.5 + didx * 2) % (Math.PI * 2);
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(dx, dy);
        ctx.lineTo(dx + Math.cos(pointerRad) * 2.8, dy + Math.sin(pointerRad) * 2.8);
        ctx.stroke();
    });

    // 第二排: 4 枚战术微动矩阵按键 (Tactical Microswitch Matrix)
    for (let c = 0; c < 2; c++) {
        for (let r = 0; r < 2; r++) {
            const bx = -8 + c * 5;
            const by = 4 + r * 3.8;
            ctx.fillStyle = (r === 0 ? "#10b981" : "#f59e0b");
            ctx.fillRect(bx, by, 3.5, 2.6);
            ctx.strokeStyle = "#022c22";
            ctx.lineWidth = 0.5;
            ctx.strokeRect(bx, by, 3.5, 2.6);
        }
    }

    // 第三排: 大型带黄黑警示环的红色紧急制动主控按钮 (Guarded E-STOP Actuator Button)
    const eX = 6;
    const eY = 5.5;
    // 黄黑相间安全防护座圈
    ctx.fillStyle = "#f59e0b";
    ctx.beginPath(); ctx.arc(eX, eY, 4.8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#000000";
    ctx.beginPath(); ctx.arc(eX, eY, 4.8, 0, Math.PI * 0.5); ctx.lineTo(eX, eY); ctx.fill();
    ctx.beginPath(); ctx.arc(eX, eY, 4.8, Math.PI, Math.PI * 1.5); ctx.lineTo(eX, eY); ctx.fill();
    // 红色蘑菇头紧急按钮
    ctx.fillStyle = "#ef4444";
    ctx.beginPath(); ctx.arc(eX, eY, 3.2, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#fee2e2";
    ctx.lineWidth = 0.8;
    ctx.stroke();
    ctx.restore();

    // --- 5. 屏幕后方中央凹槽处的操作员座椅 ("屏幕后方是键盘和座椅", 座位靠近控制台，底下黑影已删除) ---
    ctx.save();
    const seatY = -22; // 贴近内凹扇形弧操作工位，无缝就坐
    ctx.translate(0, seatY);

    // 5A. 五星万向轮金属底座 (5-Star Swivel Caster Base)
    ctx.strokeStyle = "#042018";
    ctx.lineWidth = 2.4;
    for (let arm = 0; arm < 5; arm++) {
        const starA = arm * (Math.PI * 2 / 5) - Math.PI / 2;
        const wx = Math.cos(starA) * 14;
        const wy = Math.sin(starA) * 11;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(wx, wy);
        ctx.stroke();
        // 轮子端头
        ctx.fillStyle = "#064e3b";
        ctx.beginPath(); ctx.arc(wx, wy, 1.8, 0, Math.PI * 2); ctx.fill();
    }
    // 气压升降液压中柱
    ctx.fillStyle = "#10b981";
    ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI * 2); ctx.fill();

    // 5B. 坐垫本体 (Ergonomic Bucket Seat Cushion with Stitching)
    ctx.fillStyle = "#031712";
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(-12, -10, 24, 18, 5); else ctx.rect(-12, -10, 24, 18);
    ctx.fill();
    ctx.strokeStyle = "#047857";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 坐垫加厚层与中央双缝线
    ctx.fillStyle = "#064e3b";
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(-9, -8, 18, 14, 3); else ctx.rect(-9, -8, 18, 14);
    ctx.fill();
    ctx.strokeStyle = "rgba(52, 211, 153, 0.5)";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(0, -7); ctx.lineTo(0, 5);
    ctx.stroke();

    // 5C. 左右两侧带垫扶手 (Armrests)
    [-13, 11].forEach(ax => {
        ctx.fillStyle = "#02120e";
        ctx.fillRect(ax, -8, 2.6, 12);
        ctx.strokeStyle = "#10b981";
        ctx.lineWidth = 0.8;
        ctx.strokeRect(ax, -8, 2.6, 12);
        // 扶手软垫表面
        ctx.fillStyle = "#065f46";
        ctx.fillRect(ax + 0.4, -6, 1.8, 8);
    });

    // 5D. 人体工学高靠背与头枕 (High Backrest & Integrated Headrest)
    ctx.fillStyle = "#021a14";
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(-11, 3, 22, 10, 4); else ctx.rect(-11, 3, 22, 10);
    ctx.fill();
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 靠背腰托隆起部与头枕
    ctx.fillStyle = "#044e3b";
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(-7, 6, 14, 5, 2.5); else ctx.rect(-7, 6, 14, 5);
    ctx.fill();
    ctx.strokeStyle = "#34d399";
    ctx.lineWidth = 0.8;
    ctx.stroke();

    ctx.restore();

    ctx.restore(); // end drawSectorWorkstation
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
            drawSectorWorkstation(ctx, cx, cy, angle, scale);
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

            // F. 正中央圆台
            {
                type: 'solid',
                circle: { cx: cx, cy: cy, radius: 155 },
                innerRing: { radius: 143, width: 8 },
                label: 'CENTRAL ROUND TABLE',
                hideLabel: true
            },

            // G. 中间房间左圆柱终端 (右侧终端柱已替换为全新斜向扇形主控台)
            {
                type: 'solid',
                circle: { cx: 1350, cy: 920, radius: 35 },
                label: 'LEFT TERMINAL PILLAR',
                hideLabel: true
            },

            // H. 环绕在中央圆台四周的 4 个加长圆弧结构
            {
                type: 'solid',
                arc: {
                    cx: cx,
                    cy: cy,
                    radius: 180,
                    startAngle: -1.487,
                    endAngle: -0.084,
                    thickness: 20
                },
                label: 'CURVED ARC NE',
                hideLabel: true
            },
            {
                type: 'solid',
                arc: {
                    cx: cx,
                    cy: cy,
                    radius: 180,
                    startAngle: 0.084,
                    endAngle: 1.487,
                    thickness: 20
                },
                label: 'CURVED ARC SE',
                hideLabel: true
            },
            {
                type: 'solid',
                arc: {
                    cx: cx,
                    cy: cy,
                    radius: 180,
                    startAngle: 1.655,
                    endAngle: 3.058,
                    thickness: 20
                },
                label: 'CURVED ARC SW',
                hideLabel: true
            },
            {
                type: 'solid',
                arc: {
                    cx: cx,
                    cy: cy,
                    radius: 180,
                    startAngle: 3.226,
                    endAngle: 4.628,
                    thickness: 20
                },
                label: 'CURVED ARC NW',
                hideLabel: true
            },

            // I. 中间房间南侧长方形系统 (3 排 × 2 列 = 6 个长方形)
            {
                type: 'solid',
                x: 1330,
                y: 1480,
                w: 220,
                h: 36,
                label: 'RECTANGLE R1-L',
                hideLabel: true
            },
            {
                type: 'solid',
                x: 1650,
                y: 1480,
                w: 220,
                h: 36,
                label: 'RECTANGLE R1-R',
                hideLabel: true
            },
            {
                type: 'solid',
                x: 1330,
                y: 1580,
                w: 220,
                h: 36,
                label: 'RECTANGLE R2-L',
                hideLabel: true
            },
            {
                type: 'solid',
                x: 1650,
                y: 1580,
                w: 220,
                h: 36,
                label: 'RECTANGLE R2-R',
                hideLabel: true
            },
            {
                type: 'solid',
                x: 1330,
                y: 1680,
                w: 220,
                h: 36,
                label: 'RECTANGLE R3-L',
                hideLabel: true
            },
            {
                type: 'solid',
                x: 1650,
                y: 1680,
                w: 220,
                h: 36,
                label: 'RECTANGLE R3-R',
                hideLabel: true
            }
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
                }
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
            // =========================================================
            getSectorWorkstation(1850, 920, -Math.PI * 0.75, 1.0, 'EAST SECTOR COMMAND CONSOLE')
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
