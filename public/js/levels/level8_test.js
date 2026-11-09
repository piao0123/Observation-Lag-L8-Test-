// =========================================================================
// LEVEL 8: 隔离测试关卡 · 顶石中央大厅重装甲复刻与侧门测试场
// ISOLATED DESIGN SANDBOX: LEVEL 7 MIDDLE ROOM WITH LEVEL 6 HEAVY ARMORED WALLS & DOORS
// 100% 隔离测试关卡，将 Level 7 中间房间复制至此，外墙替换为 Level 6 重型装甲外墙，4个侧门替换为 Level 6 重型自动防爆门
// =========================================================================

window.level8MapWidth = 3200;
window.level8MapHeight = 2400;

// =========================================================================
// 全新扇形战术控制台绘制系统 (完全依据手绘草稿 IMG_7693 规范设计与渲染)
// 包含 5 大核心要素：
// 1. 控制台本身呈扇形（弧形外边、内凹弧形座舱边缘、径向收拢侧翼）
// 2. 前部三个连在一起的弧面显示屏（一体化铰链连接，雷达、频谱、动力监测）
// 3. 屏幕后方中央的机械键盘与操作员滑轮座椅（带腰托高靠背与扶手）
// 4. 左侧操作翼多排控制按钮（方块按键、指示摇臂、金属防护拨动开关）
// 5. 右侧操作翼多排控制按钮（双推子电位器、旋转刻度旋钮、微动矩阵、带黄黑警示圈的大型紧急制动按钮）
// =========================================================================
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

// =========================================================================
// 全新圆形全包围控制台绘制系统 (完全依据手绘草稿 IMG_7694 规范升级设计与渲染)
// 包含 5 大核心改进与规范：
// 1. 标准正圆外壳：采用标准原生圆弧几何绘制，彻底摒弃多边形棱角；纤薄外壳仅 5px，最大化保留舱内宽阔活动空间
// 2. 座位前方三块连体弧面大屏：鲜明高亮，严密顺应圆形外壳曲率展开（正中全景雷达、左侧反应堆示波、右侧防御力场）
// 3. 屏幕后方的机械键盘与操作员滑轮座椅：就坐于舱内中央，面向北方三连屏与机械键盘
// 4. 座位左右两侧按钮完全顺应圆弧曲线排列：左侧三环同心圆弧按键、翘板开关与安全拨动开关；右侧三环同心圆弧推子、旋钮、微动矩阵与紧急制动按钮
// 5. 座位后方蓝色玻璃质感平直隔板：【严格保持水平平直线段，非弧形】，升级为通透纯净的科技蓝玻璃质感（天蓝+宝蓝渐变、45度高光、发光蓝光导轨与立柱光环）
// =========================================================================
function getCircularPodWorkstation(cx, cy, angle = 0, scale = 1.0, label = "CIRCULAR POD CONSOLE") {
    const boundR = 80 * scale;
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
        label: label,
        displayName: "CIRCULAR ENCLOSED COMMAND POD",
        noCollision: true,
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
                octx.translate(-cx, -cy);
                drawCircularPodWorkstation(octx, cx, cy, angle, scale, 1);
                octx.restore();
                window[cacheKey] = { canvas: off, size: sz };
            }
            const c = window[cacheKey];
            ctx.drawImage(c.canvas, cx - c.size / 2, cy - c.size / 2);
            drawCircularPodWorkstationDynamic(ctx, cx, cy, angle, scale);
        }
    };
}

// =========================================================================
// 全新三联方形隔间战术控制台绘制系统 (完全依据手绘草稿 IMG_7697 规范设计与渲染)
// 包含 5 大核心要素与尺寸升级：
// 1. 三个连在一起的方形隔间：4 根贯通式重型金属隔断侧壁与前部横梁架构，形成规整方形工作舱 (Square Cubicles)
// 2. 每个隔间前部三个连在一起的高清战术显示屏：三隔间共 9 块屏，一体化钛合金铰链连接与精密 HUD 动效
// 3. 屏幕后方的机械键盘与重型操作员五星轮滑座椅：座椅全面扩大（宽 26px 坐垫 + 32px 扶手间距），完美适配角色身形体格
// 4. 键盘左右两侧的多排控制按钮：左侧方块按键、翘板开关与安全拨动开关；右侧线性推子、旋转刻度旋钮、微动矩阵与带警示圈紧急制动按钮
// 5. 严格横向尺寸约束：总宽度 273px (精确为原正圆控制台 124px 直径的 2.2016 倍，严格控制在 2.2 倍左右)
// =========================================================================
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
        noCollision: true,
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

// =========================================================================
// 全新战术讲台绘制系统 (完全依据手绘草稿 IMG_7701 规范设计与渲染)
// 包含 7 大核心规范：
// 1. 讲台主体为长方形，后方带有两侧护翼 (Main desk rectangle + two side wings)
// 2. 摆放有朝后的麦克风和一平板电脑 (Microphone angled backwards + tablet computer terminal)
// 3. 电脑屏幕为战术科技蓝 (参考 Level 7 蓝色屏幕 #061c3a -> #0b355c，边缘 #00CCFF / #00E5FF 高亮与扫描线)
// 4. 下有黑色半圆形底座支撑 (承托站立区域，与两侧护翼平滑衔接)
// 5. 主体和护翼部分为深色木质质感 (胡桃红木深色木纹与光泽覆层)
// 6. 讲台整体轮廓使用与 Level 8 外墙相同的蓝绿色线 (#10b981) 勾勒
// 7. 尺寸比角色略大，刚好能站上去 (内侧站立槽宽 40px，角色碰撞直径 36px，角色可自然站立并演讲)
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

// =========================================================
// 服务器集群 (从 GitHub 最新版合并，2026-11-05)
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

// =========================================================================
// 全新更衣消毒缓冲通道系统 (完全依据手绘草稿 IMG_7732 规范设计与渲染)
// 包含两大区域与全新机械转轮锁气密防爆门：
// 1. 通道整体倾斜：沿 Level 8 左上斜门 (-0.1813 rad，垂直法线 -1.7521 rad) 顺延向外斜伸
// 2. 更衣区 (Dressing Area)：储物柜、双槽感应洗手池、气压温度监控显示屏、一体式正压防护服、垂下供氧软管
// =========================================================================
// 全新更衣消毒缓冲通道系统 (完全依据手绘草稿 IMG_7732 规范重构设计与高精渲染)
// 包含两大区域与全新机械转轮锁气密防爆门：
// 1. 严格法线几何对齐：左上防爆门斜边方向向量 (-22, -120)，法线指向房间外 (-120, 22)，通道倾斜角度 Math.atan2(-22, 120) = -0.1813 rad
//    更衣区与消毒区沿法线方向顺延向外延伸 720px，外宽 124px，北墙南墙与房间原防爆门两端完全平滑咬合！
// 2. 更衣区 (Dressing Area)：高精军工密码感应储物柜、拉丝不锈钢感应洗手池与按压消毒机、全息气压温度环控监控屏、重装一体式正压防护服与柔性供氧软管
// 3. 消毒区 (Decontamination Area)：双排工业高压气流喷嘴、独立下置不锈钢圆盘消毒液喷头、红绿双色高亮LED指示灯、3D立体废液漏水格栅与地下回收暗槽
// 4. 全新机械转轮气密防爆门：非沿用现有防爆门！钛黑翡翠双色重装门框、两翼掌纹与虹膜生物扫描桩、六辐黄铜把手大型旋转转轮锁（开闭时真实机械旋转）、高压气密双向平移门扇
// =========================================================================

// =========================================================================
// 全新机械转轮气密防爆门高精写实渲染系统 (完全依据手绘 IMG_7732 规范与顶级军工科幻标杆升级)
// 包含 4 大重型写实特征：
// 1. 3D 钛黑翡翠双色重型防爆门框：液压驱动缸、高压压力表、六角装甲螺栓、导向锁舌与警示贴标
// 2. 掌纹与虹膜双侧高精生物识别：掌纹扫描台带镀膜斜面玻璃、内嵌手掌纹路、动态平移激光面与OLED显示屏；虹膜塔带多层透镜光圈、双侧红外补光灯阵列、呼吸光圈与准星
// 3. 重型双向气密平移门扇：双层装甲钢板、X型强劲补强梁、嵌入式观察视窗（带高光斜 cut 玻璃反射）、气密齿状密封胶条与激光锁条
// 4. 门体正中 3D 机械转轮锁：行星齿轮保护外环（12 颗齿）、6 根高强手柄轮辐、滚花黄铜旋柄、中心液压轴芯与锁定销，开闭时平滑旋转
// =========================================================================
function drawAirtightWheelDoor(ctx, doorObj) {
    const w = doorObj.doorWidth || 122;
    const h = doorObj.doorHeight || 18;
    const halfW = w / 2;
    const halfH = h / 2;
    const openProg = doorObj.openProgress || 0;
    const isLocked = doorObj.isLocked;
    const isOpening = openProg > 0.05;
    const time = Date.now() * 0.003;

    ctx.save();
    ctx.translate(doorObj.cx, doorObj.cy);
    ctx.rotate(doorObj.angle);

    // =========================================================
    // 1. 3D 渐变投影与重型静态装甲门框 (Multi-tier Heavy Armored Jambs & Thresholds)
    // 门沿局部 Y 轴展开 (y: -61 ~ +61)，厚度沿局部 X 轴 (x: -9 ~ +9)
    // =========================================================
    const jambLength = 18;

    // 门洞底衬阴影与通行基座 (黑绿色翡翠耐磨地坪底槽)
    ctx.fillStyle = '#010a08';
    ctx.fillRect(-halfH - 1, -halfW - 2, h + 2, w + 4);
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.45)';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(-halfH - 1, -halfW - 2, h + 2, w + 4);

    // 左右门套立柱 (North Jamb at y = +halfW, South Jamb at y = -halfW - jambLength)
    [halfW, -halfW - jambLength].forEach(jy => {
        // 立柱渐变倒角外壳
        const gradJamb = ctx.createLinearGradient(-halfH - 3, jy, halfH + 3, jy);
        gradJamb.addColorStop(0, '#02120e');
        gradJamb.addColorStop(0.3, '#083327');
        gradJamb.addColorStop(0.7, '#05221a');
        gradJamb.addColorStop(1, '#02120e');
        ctx.fillStyle = gradJamb;
        ctx.fillRect(-halfH - 3, jy, h + 6, jambLength);
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1.6;
        ctx.strokeRect(-halfH - 3, jy, h + 6, jambLength);

        // 立柱沉头六角防爆紧固螺栓 (4 颗)
        ctx.fillStyle = '#0f172a';
        [jy + 4, jy + jambLength - 4].forEach(by => {
            [-halfH + 2, halfH - 2].forEach(bx => {
                ctx.beginPath(); ctx.arc(bx, by, 1.8, 0, Math.PI * 2); ctx.fill();
                ctx.strokeStyle = '#34d399'; ctx.lineWidth = 0.8; ctx.stroke();
            });
        });

        // 顶部液压驱动推杆箱 (Hydraulic Actuator Housing)
        ctx.fillStyle = '#031913';
        ctx.fillRect(-halfH - 1, jy + 3, h + 2, jambLength - 6);
        ctx.strokeStyle = '#059669'; ctx.lineWidth = 1; ctx.strokeRect(-halfH - 1, jy + 3, h + 2, jambLength - 6);

        // 液压压力表盘 (Hydraulic Pressure Gauge)
        const gaugeX = 0;
        const gaugeY = jy + jambLength / 2;
        ctx.fillStyle = '#020d09';
        ctx.beginPath(); ctx.arc(gaugeX, gaugeY, 3.2, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 1; ctx.stroke();
        ctx.fillStyle = isLocked ? '#ef4444' : '#00FF66';
        ctx.beginPath(); ctx.arc(gaugeX, gaugeY, 1.4, 0, Math.PI * 2); ctx.fill();
    });

    // 顶部与底部防冲击重型轨道门槛 (Along X edges)
    [-halfH, halfH - 5].forEach(bx => {
        ctx.fillStyle = '#02140f';
        ctx.fillRect(bx, -halfW, 5, w);
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(bx, -halfW, 5, w);

        // 重型咬合卡扣导向槽 (6 组微型导向槽)
        for (let sy = -halfW + 10; sy < halfW - 6; sy += 18) {
            ctx.fillStyle = '#010a07';
            ctx.fillRect(bx + 1, sy, 3, 7);
            ctx.strokeStyle = '#059669'; ctx.lineWidth = 0.6; ctx.strokeRect(bx + 1, sy, 3, 7);
        }
    });

    // =========================================================
    // 2. 双侧写实生物识别控制装置 (Realistic Biometric Scanners)
    // =========================================================
    // A. 北侧掌纹静脉扫描台 (Palm Vein Biometric Scanner Unit: y = +halfW + 2)
    const palmY = halfW + 2;
    ctx.save();
    // 斜切铸钢底座
    ctx.fillStyle = '#02140f';
    ctx.fillRect(-halfH - 2, palmY, h + 4, 16);
    ctx.strokeStyle = isLocked ? '#ef4444' : '#10b981';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-halfH - 2, palmY, h + 4, 16);

    // 扫描台钢化玻璃感应基座 (带金属压边)
    const scanGrad = ctx.createLinearGradient(-halfH, palmY + 2, halfH, palmY + 14);
    scanGrad.addColorStop(0, '#04271e');
    scanGrad.addColorStop(0.5, '#0a4234');
    scanGrad.addColorStop(1, '#04271e');
    ctx.fillStyle = scanGrad;
    ctx.fillRect(-halfH + 2, palmY + 2, h - 4, 12);
    ctx.strokeStyle = '#34d399'; ctx.lineWidth = 0.8; ctx.strokeRect(-halfH + 2, palmY + 2, h - 4, 12);

    // 蚀刻在玻璃面上的手掌静脉轮廓纹路
    ctx.strokeStyle = isLocked ? 'rgba(239, 68, 68, 0.6)' : 'rgba(52, 211, 153, 0.65)';
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.arc(0, palmY + 8, 3.5, 0, Math.PI * 2);
    ctx.moveTo(-2, palmY + 8); ctx.lineTo(2, palmY + 8);
    ctx.moveTo(0, palmY + 6); ctx.lineTo(0, palmY + 10);
    ctx.stroke();

    // 动态垂直平移的激光扫描线与高晕光斑
    const scanYOffset = (Math.sin(time * 6) * 0.5 + 0.5) * (h - 8);
    const laserX = -halfH + 4 + scanYOffset;
    ctx.strokeStyle = isLocked ? '#f87171' : '#00FF66';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(laserX, palmY + 2);
    ctx.lineTo(laserX, palmY + 14);
    ctx.stroke();

    // 顶部微型 OLED 状态显示屏
    ctx.fillStyle = '#010a08';
    ctx.fillRect(-halfH + 1, palmY - 4, h - 2, 4);
    ctx.font = 'bold 4.5px monospace';
    ctx.fillStyle = isLocked ? '#f87171' : '#00FF66';
    ctx.textAlign = 'center';
    ctx.fillText(isLocked ? 'LOCKED' : 'VERIFIED', 0, palmY - 1);
    ctx.restore();

    // B. 南侧虹膜面部识别镜头塔 (Iris Recognition Lens Assembly: y = -halfW - 18)
    const irisY = -halfW - 18;
    ctx.save();
    // 阳极氧化钛合金外壳底座
    ctx.fillStyle = '#02140f';
    ctx.fillRect(-halfH - 2, irisY, h + 4, 16);
    ctx.strokeStyle = isLocked ? '#ef4444' : '#00CCFF';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-halfH - 2, irisY, h + 4, 16);

    // 镜头圆形多层镀膜光圈 (Curved Optical Lens)
    const lensR = 6.5;
    ctx.fillStyle = '#02182b';
    ctx.beginPath(); ctx.arc(0, irisY + 8, lensR, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = isLocked ? '#ef4444' : '#00E5FF';
    ctx.lineWidth = 1.4;
    ctx.stroke();

    // 双侧红外补光 LED 阵列 (4 颗微型 LED)
    [-4, 4].forEach(lx => {
        [-3, 3].forEach(ly => {
            ctx.fillStyle = isLocked ? '#ef4444' : '#38bdf8';
            ctx.beginPath(); ctx.arc(lx, irisY + 8 + ly, 0.9, 0, Math.PI * 2); ctx.fill();
        });
    });

    // 动态呼吸缩放的瞳孔与准星光圈
    const pupilR = isLocked ? 2.0 : (2.6 + Math.sin(time * 5) * 0.8);
    ctx.fillStyle = isLocked ? '#ef4444' : '#38bdf8';
    ctx.beginPath(); ctx.arc(0, irisY + 8, pupilR, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(0.8, irisY + 7.2, 0.8, 0, Math.PI * 2); ctx.fill();

    // 准星微细十字线
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.6)';
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(-5, irisY + 8); ctx.lineTo(5, irisY + 8);
    ctx.moveTo(0, irisY + 3); ctx.lineTo(0, irisY + 13);
    ctx.stroke();
    ctx.restore();

    // =========================================================
    // 3. 写实重型气密平移门扇 (Heavy Double-Walled Sliding Door Leaves)
    // 门扇向两端 (y: -halfW 与 y: +halfW) 平移滑动
    // =========================================================
    const maxSlide = halfW - 4;
    const slideOffset = maxSlide * openProg;
    const leafLength = halfW - 1;
    const leafThickness = h - 4;

    ctx.save();
    // 门洞内裁切，防止门扇退行越界
    ctx.beginPath();
    ctx.rect(-halfH - 3, -halfW - 22, h + 6, w + 44);
    ctx.clip();

    // 北门扇 (向 North y = +halfW 方向退行)
    const northLeafStartY = slideOffset;
    drawDoorLeafPlate(ctx, -leafThickness / 2, northLeafStartY, leafThickness, leafLength, true);

    // 南门扇 (向 South y = -halfW 方向退行)
    const southLeafStartY = -leafLength - slideOffset;
    drawDoorLeafPlate(ctx, -leafThickness / 2, southLeafStartY, leafThickness, leafLength, false);

    // 门扇正中高压黑橡胶气密密封胶条与齿状咬合嘴
    if (openProg < 0.12) {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-leafThickness / 2, -2, leafThickness, 4);

        // 齿状咬合线
        ctx.fillStyle = '#f59e0b';
        for (let tx = -leafThickness / 2 + 1; tx < leafThickness / 2 - 1; tx += 3) {
            ctx.fillRect(tx, -1.2, 1.8, 2.4);
        }

        // 激光闭锁高亮束
        ctx.strokeStyle = isLocked ? '#ef4444' : 'rgba(52, 211, 153, 0.9)';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(-leafThickness / 2, 0);
        ctx.lineTo(leafThickness / 2, 0);
        ctx.stroke();
    }
    ctx.restore();

    // =========================================================
    // 4. 门中央 3D 机械旋转转轮锁 (Giant 3D Mechanical Wheel Lock)
    // 开关门时转轮平滑高速旋转！
    // =========================================================
    const wheelAlpha = Math.max(0, 1 - openProg * 2.2);
    if (wheelAlpha > 0.02) {
        ctx.save();
        ctx.globalAlpha = wheelAlpha;
        const curAngle = (doorObj.wheelAngle !== undefined) ? doorObj.wheelAngle : (openProg * Math.PI * 6);
        ctx.rotate(curAngle);

        const wheelR = 16;

        // 行星齿轮保护外环 (Outer Planetary Gear Ring)
        ctx.fillStyle = '#021611';
        ctx.beginPath(); ctx.arc(0, 0, wheelR, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2.6;
        ctx.stroke();

        // 外环 12 颗机械轮齿 (12 Gear Teeth Around Rim)
        ctx.fillStyle = '#064e3b';
        for (let g = 0; g < 12; g++) {
            const gang = g * (Math.PI / 6);
            const gx = Math.cos(gang) * (wheelR + 1.2);
            const gy = Math.sin(gang) * (wheelR + 1.2);
            ctx.fillRect(gx - 1.2, gy - 1.2, 2.4, 2.4);
        }

        // 6 根重型铸钢手柄轮辐与黄铜滚花旋柄 (6 Spokes & Knurled Brass Handles)
        for (let sp = 0; sp < 6; sp++) {
            const spAng = sp * (Math.PI / 3);
            const gx = Math.cos(spAng) * wheelR;
            const gy = Math.sin(spAng) * wheelR;

            // 轮辐坚固双层钢柱
            ctx.strokeStyle = '#042a20';
            ctx.lineWidth = 3.8;
            ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(gx, gy); ctx.stroke();

            ctx.strokeStyle = '#34d399';
            ctx.lineWidth = 1.6;
            ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(gx, gy); ctx.stroke();

            // 黄铜 knurled 旋转握把 (Knurled Brass Grip Handle)
            const gradGrip = ctx.createRadialGradient(gx, gy, 0.5, gx, gy, 3.8);
            gradGrip.addColorStop(0, '#fef08a');
            gradGrip.addColorStop(0.6, '#f59e0b');
            gradGrip.addColorStop(1, '#78350f');
            ctx.fillStyle = gradGrip;
            ctx.beginPath(); ctx.arc(gx, gy, 3.8, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#b45309'; ctx.lineWidth = 0.9; ctx.stroke();
        }

        // 中心液压锁定轴芯与 3D 螺栓圈 (Central Hydraulic Spindle & Lock Pins)
        const gradCenter = ctx.createRadialGradient(0, 0, 1, 0, 0, 6);
        gradCenter.addColorStop(0, '#0f2922');
        gradCenter.addColorStop(1, '#02120e');
        ctx.fillStyle = gradCenter;
        ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#10b981'; ctx.lineWidth = 1.4; ctx.stroke();

        // 状态指示 LED 核心
        ctx.fillStyle = isOpening ? '#10b981' : (isLocked ? '#ef4444' : '#34d399');
        ctx.beginPath(); ctx.arc(0, 0, 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 0.8; ctx.stroke();

        ctx.restore();
    }

    ctx.restore();
}

// 辅助函数：绘制门扇高精写实装甲板细节
function drawDoorLeafPlate(ctx, x, y, w, len, isNorth) {
    // 1. 双向渐变装甲钢板 (Heavy Armored Steel Plate)
    const gradLeaf = ctx.createLinearGradient(x, y, x + w, y);
    gradLeaf.addColorStop(0, '#02140f');
    gradLeaf.addColorStop(0.3, '#083a2d');
    gradLeaf.addColorStop(0.7, '#052a20');
    gradLeaf.addColorStop(1, '#02140f');
    ctx.fillStyle = gradLeaf;
    ctx.fillRect(x, y, w, len);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 1.6;
    ctx.strokeRect(x, y, w, len);

    // 2. 内部沉头补强 X 梁桁架 (Recessed X-Rib Reinforcement)
    ctx.strokeStyle = '#020d09';
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(x + 2, y + 4); ctx.lineTo(x + w - 2, y + len - 4);
    ctx.moveTo(x + w - 2, y + 4); ctx.lineTo(x + 2, y + len - 4);
    ctx.stroke();

    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // 3. 边框装甲沉头铆钉 (Counter-sunk Hex Bolts)
    ctx.fillStyle = '#0f172a';
    [y + 4, y + len - 4].forEach(by => {
        [x + 2, x + w - 2].forEach(bx => {
            ctx.beginPath(); ctx.arc(bx, by, 1.1, 0, Math.PI * 2); ctx.fill();
        });
    });

    // 4. 战术防弹窄幅观察视窗 (Narrow Inspection Glass Window with Diagonal Glare Highlight)
    const slitH = len - 18;
    const slitW = 3.8;
    const slitX = x + w / 2 - slitW / 2;
    const slitY = y + 9;

    // 玻璃深层底色
    ctx.fillStyle = '#02182b';
    ctx.fillRect(slitX, slitY, slitW, slitH);

    // 高光玻璃渐变
    const gradGlass = ctx.createLinearGradient(slitX, slitY, slitX + slitW, slitY + slitH);
    gradGlass.addColorStop(0, 'rgba(56, 189, 248, 0.95)');
    gradGlass.addColorStop(0.5, 'rgba(16, 185, 129, 0.7)');
    gradGlass.addColorStop(1, 'rgba(2, 24, 43, 0.9)');
    ctx.fillStyle = gradGlass;
    ctx.fillRect(slitX, slitY, slitW, slitH);
    ctx.strokeStyle = '#00E5FF';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(slitX, slitY, slitW, slitH);

    // 玻璃反光斜打光
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(slitX + 0.5, slitY + 2);
    ctx.lineTo(slitX + slitW - 0.5, slitY + slitH / 2);
    ctx.stroke();
}

// =========================================================================
// 全新更衣消毒缓冲通道高精综合系统 (完全符合 Level 8 军工科幻顶级写实规范)
// 包含更衣区写实储物柜、双槽洗手池、气压温度多面板监控大屏、正压防护服与螺旋供氧软管、
// 消毒区分隔高压气流喷嘴、消毒液喷头、地面 3D 格栅废液暗槽与红绿状态灯
// =========================================================================
function drawBufferCorridorSystem(ctx, corridor) {
    const time = Date.now() * 0.001;
    const L = corridor.length || 720; // 通道总长 720px
    const W = corridor.width || 122;  // 通道净宽 122px
    const halfL = L / 2; // 360px
    const halfW = W / 2; // 61px

    ctx.save();
    ctx.translate(corridor.cx, corridor.cy);
    ctx.rotate(corridor.angle);

    // =========================================================
    // 1. 缓冲区写实重型金属地坪与高能警戒线
    // 更衣区: x: -360 ~ 0
    // 消毒区: x: 0 ~ +360
    // =========================================================
    // 更衣区地坪 (Class-100 Cleanroom 防静电环氧科技地坪)
    const gradDress = ctx.createLinearGradient(-halfL, 0, 0, 0);
    gradDress.addColorStop(0, '#03140e');
    gradDress.addColorStop(0.5, '#072b21');
    gradDress.addColorStop(1, '#03140e');
    ctx.fillStyle = gradDress;
    ctx.fillRect(-halfL, -halfW, halfL, W);

    // 消毒区地坪 (316L 高耐磨不锈钢工业地坪)
    const gradDecon = ctx.createLinearGradient(0, 0, halfL, 0);
    gradDecon.addColorStop(0, '#02120e');
    gradDecon.addColorStop(0.5, '#06281e');
    gradDecon.addColorStop(1, '#02120e');
    ctx.fillStyle = gradDecon;
    ctx.fillRect(0, -halfW, halfL, W);

    // 导静电防滑网格与不锈钢焊缝
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.18)';
    ctx.lineWidth = 1;
    for (let lx = -halfL; lx <= halfL; lx += 32) {
        ctx.beginPath(); ctx.moveTo(lx, -halfW); ctx.lineTo(lx, halfW); ctx.stroke();
    }
    for (let ly = -halfW; ly <= halfW; ly += 20.3) {
        ctx.beginPath(); ctx.moveTo(-halfL, ly); ctx.lineTo(halfL, ly); ctx.stroke();
    }

    // 两侧黑黄高光防滑斜纹警戒带 (High-Visibility Safety Hazard Bands)
    const drawHazardStripe = (startY) => {
        ctx.save();
        ctx.fillStyle = '#02120e';
        ctx.fillRect(-halfL, startY, L, 6);
        ctx.fillStyle = 'rgba(245, 158, 11, 0.82)';
        for (let hx = -halfL; hx < halfL; hx += 16) {
            ctx.beginPath();
            ctx.moveTo(hx, startY + 6);
            ctx.lineTo(hx + 8, startY);
            ctx.lineTo(hx + 12, startY);
            ctx.lineTo(hx + 4, startY + 6);
            ctx.closePath();
            ctx.fill();
        }
        ctx.restore();
    };
    drawHazardStripe(-halfW);
    drawHazardStripe(halfW - 6);

    // 地面激光喷涂军规字样 (Laser-Engraved Stencil Markings)
    ctx.save();
    ctx.font = 'bold 8px monospace';
    ctx.fillStyle = 'rgba(16, 185, 129, 0.65)';
    ctx.textAlign = 'center';
    ctx.fillText('<< CLASS-100 CLEANROOM // SUIT DRESSING FACILITY <<', -180, 48);
    ctx.fillText('<< DECONTAMINATION CHAMBER // HIGH-PRESSURE STERILIZATION <<', 180, 48);
    ctx.restore();

    // =========================================================
    // 2. 更衣区写实高精设施 (Dressing Area: x: -350 ~ -20)
    // 北侧 (y: +32 ~ +61): 6联装储物柜、双槽洗手池、多面板监控大屏
    // 南侧 (y: -61 ~ -32): 一体式正压防护服与蛇皮螺旋供氧软管
    // =========================================================

    // A. 北墙 6 联装写实隔离储物柜 (Personal Hazmat Lockers: x: -335 ~ -215)
    const lkStartX = -335;
    const lkW = 18.5;
    const lkH = 26;
    for (let i = 0; i < 6; i++) {
        const lx = lkStartX + i * 20;
        const ly = halfW - 32;

        // 柜体 3D 沉头倒角外框
        ctx.fillStyle = '#02140e';
        ctx.fillRect(lx, ly, lkW, lkH);
        ctx.strokeStyle = '#064e3b';
        ctx.lineWidth = 1.4;
        ctx.strokeRect(lx, ly, lkW, lkH);

        // 柜门高精度拉丝翡翠合页板
        const gradDoor = ctx.createLinearGradient(lx, ly, lx + lkW, ly);
        gradDoor.addColorStop(0, '#04221a');
        gradDoor.addColorStop(0.5, '#083d2e');
        gradDoor.addColorStop(1, '#04221a');
        ctx.fillStyle = gradDoor;
        ctx.fillRect(lx + 1.2, ly + 1.2, lkW - 2.4, lkH - 2.4);

        // 柜门百叶通风排气栅格 (5 条写实横槽)
        ctx.fillStyle = '#010c08';
        for (let sl = 0; sl < 5; sl++) {
            ctx.fillRect(lx + 2.5, ly + 3 + sl * 2.8, lkW - 5, 1.4);
        }

        // 柜门 RFID 数字密码按键锁与指示灯
        ctx.fillStyle = '#010e0a';
        ctx.fillRect(lx + lkW - 5.5, ly + 14, 4, 9);
        ctx.fillStyle = (i === 1) ? '#ef4444' : '#00FF66';
        ctx.beginPath(); ctx.arc(lx + lkW - 3.5, ly + 16, 1.2, 0, Math.PI * 2); ctx.fill();

        // 激光编号 (BAY-01 ~ BAY-06)
        ctx.font = 'bold 4.8px monospace';
        ctx.fillStyle = '#34d399';
        ctx.fillText(`BAY0${i + 1}`, lx + 2, ly + 22);
    }

    // 储物柜上方贯通电力与气压线槽导轨 (Power & Gas Supply Manifold Duct)
    ctx.fillStyle = '#031913';
    ctx.fillRect(lkStartX - 6, halfW - 5, 126, 4);
    ctx.strokeStyle = '#10b981'; ctx.lineWidth = 1; ctx.strokeRect(lkStartX - 6, halfW - 5, 126, 4);

    // B. 北墙医用级双槽感应洗手池与按压消毒机 (Medical Scrub Sink Unit: x: -202 ~ -144)
    const sinkX = -202;
    const sinkY = halfW - 32;
    const sinkW = 56;
    const sinkH = 26;

    // 拉丝 316L 不锈钢洗手台底座 (带金属高光)
    const gradSinkBase = ctx.createLinearGradient(sinkX, sinkY, sinkX + sinkW, sinkY);
    gradSinkBase.addColorStop(0, '#09211a');
    gradSinkBase.addColorStop(0.5, '#133a2e');
    gradSinkBase.addColorStop(1, '#09211a');
    ctx.fillStyle = gradSinkBase;
    ctx.fillRect(sinkX, sinkY, sinkW, sinkH);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 1.6;
    ctx.strokeRect(sinkX, sinkY, sinkW, sinkH);

    // 双联下沉式不锈钢水槽
    for (let s = 0; s < 2; s++) {
        const bx = sinkX + 15 + s * 26;
        const by = sinkY + 13;

        // 椭圆水槽凹陷、滤网与反光
        const gradBasin = ctx.createRadialGradient(bx, by, 1, bx, by, 10);
        gradBasin.addColorStop(0, '#010a08');
        gradBasin.addColorStop(0.7, '#062d22');
        gradBasin.addColorStop(1, '#0d4032');
        ctx.fillStyle = gradBasin;
        ctx.beginPath(); ctx.ellipse(bx, by, 10, 8, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#00E5FF'; ctx.lineWidth = 0.9; ctx.stroke();

        // 底部水槽漏水滤网
        ctx.fillStyle = '#010806';
        ctx.beginPath(); ctx.arc(bx, by + 2, 2, 0, Math.PI * 2); ctx.fill();

        // 镀铬高抛感应水龙头与感应眼
        ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2.2;
        ctx.beginPath(); ctx.moveTo(bx, sinkY + 1); ctx.lineTo(bx, by - 2); ctx.stroke();
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath(); ctx.arc(bx, by - 2, 1.4, 0, Math.PI * 2); ctx.fill();
    }
    // 侧边洗手消毒液泵瓶 (带液位透明观察窗)
    ctx.fillStyle = '#031711';
    ctx.fillRect(sinkX + sinkW - 8, sinkY + 4, 6, 13);
    ctx.strokeStyle = '#10b981'; ctx.lineWidth = 0.8; ctx.strokeRect(sinkX + sinkW - 8, sinkY + 4, 6, 13);
    ctx.fillStyle = 'rgba(52, 211, 153, 0.85)';
    ctx.fillRect(sinkX + sinkW - 6.5, sinkY + 6, 3, 9);

    // C. 北墙大型多面板环境遥测监控终端 (Atmospheric Monitoring Terminal: x: -130 ~ -46)
    // 参照 Level 8 中间房间三联大屏与顶级 HUD 视觉规范重构！
    const monX = -130;
    const monY = halfW - 33;
    const monW = 84;
    const monH = 28;

    // 屏幕钛黑外框与金属紧固角扣
    ctx.fillStyle = '#020f18';
    ctx.fillRect(monX, monY, monW, monH);
    ctx.strokeStyle = '#00CCFF';
    ctx.lineWidth = 1.6;
    ctx.strokeRect(monX, monY, monW, monH);

    // 屏幕战术科技蓝/翡翠色高光玻璃面 (Gradient Screen Surface)
    const gradMon = ctx.createLinearGradient(monX, monY, monX, monY + monH);
    gradMon.addColorStop(0, '#062038');
    gradMon.addColorStop(0.6, '#020e18');
    gradMon.addColorStop(1, '#020a10');
    ctx.fillStyle = gradMon;
    ctx.fillRect(monX + 1.5, monY + 1.5, monW - 3, monH - 3);

    // 屏幕 4 大分屏 UI 面板与高精 HUD (多面板写实界面)
    // 面板 1: 气压波形示波图与数值
    ctx.font = 'bold 5px monospace';
    ctx.fillStyle = '#00E5FF';
    ctx.textAlign = 'left';
    ctx.fillText('PRESS: +32.4 Pa [POS]', monX + 3.5, monY + 7);
    ctx.fillText('TEMP:  20.4 °C [NOM]', monX + 3.5, monY + 13);
    const liveO2 = (20.9 + Math.sin(time * 2.2) * 0.12).toFixed(1);
    ctx.fillStyle = '#00FF66';
    ctx.fillText(`O2:    ${liveO2}% SAFE`, monX + 3.5, monY + 19);

    // 面板 2: 气压历史波形图与网格线 (Oscilloscope Graph)
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.2)'; ctx.lineWidth = 0.5;
    ctx.strokeRect(monX + 50, monY + 4, 30, 12);
    ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 0.9;
    ctx.beginPath();
    for (let wx = 0; wx < 28; wx += 2) {
        const wy = monY + 10 + Math.sin(time * 5 + wx * 0.4) * 2.8;
        if (wx === 0) ctx.moveTo(monX + 51 + wx, wy); else ctx.lineTo(monX + 51 + wx, wy);
    }
    ctx.stroke();

    // 面板 3: 底部系统诊断滚动日志 (Diagnostic Log)
    ctx.font = '4px monospace'; ctx.fillStyle = 'rgba(52, 211, 153, 0.85)';
    ctx.fillText('[SYS] PRESS: STABLE // STERILIZATION READY', monX + 3.5, monY + 25);

    // 屏幕反光斜打光
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(monX + 2, monY + 2); ctx.lineTo(monX + 28, monY + monH - 2); ctx.stroke();

    // D. 南墙一体式写实正压防护服排挂与蛇皮螺旋供氧软管 (Pressurized Hazmat Suits: 6 套)
    const suitStartX = -325;
    for (let st = 0; st < 6; st++) {
        const sx = suitStartX + st * 55;
        const sy = -halfW + 20;

        // 墙壁金属挂架底座 (Wall Mounting Bracket)
        ctx.fillStyle = '#02120e';
        ctx.fillRect(sx - 6, -halfW + 1, 12, 5);
        ctx.strokeStyle = '#064e3b'; ctx.lineWidth = 1; ctx.strokeRect(sx - 6, -halfW + 1, 12, 5);

        // 墙壁垂下一根根黄色与黑色相间螺旋蛇皮供氧软管 (Spiral Coiled Hose)
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(sx, -halfW + 6);
        ctx.bezierCurveTo(sx - 8, -halfW + 11, sx + 8, -halfW + 15, sx, sy - 14);
        ctx.stroke();

        // 软管黑色防磨螺旋环
        ctx.strokeStyle = '#020d09';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(sx - 2, -halfW + 9); ctx.lineTo(sx + 2, -halfW + 10);
        ctx.moveTo(sx - 2, sy - 17); ctx.lineTo(sx + 2, sy - 16);
        ctx.stroke();

        // 供氧管不锈钢快锁接头与压力阀 (Quick-Disconnect Coupler)
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(sx - 2, sy - 14, 4, 3);
        ctx.strokeStyle = '#0284c7'; ctx.lineWidth = 0.8; ctx.strokeRect(sx - 2, sy - 14, 4, 3);

        // 一体式正压防护服人体模型 (Industrial Chemical Hazard Yellow Suit Body)
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.ellipse(sx, sy - 4, 10, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // 护肩与褶皱阴影 (Cloth Folds & Shoulder Pads)
        ctx.fillStyle = '#d97706';
        ctx.fillRect(sx - 8, sy - 10, 16, 2.5);

        // 全景正压防护面罩与 3D 玻璃反光 (Pressurized Helmet Visor with Glass Glare)
        ctx.fillStyle = 'rgba(2, 132, 199, 0.85)';
        ctx.beginPath();
        ctx.ellipse(sx, sy - 2, 6.5, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#00E5FF';
        ctx.lineWidth = 1.2;
        ctx.stroke();
        // 面罩高光弧
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(sx - 2, sy - 3.5, 1.2, 0, Math.PI * 2); ctx.fill();

        // 胸前 PAPR 呼吸过滤风机盒与状态灯 (Powered Air-Purifying Respirator Pack)
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(sx - 4.5, sy + 3, 9, 6);
        ctx.strokeStyle = '#64748b'; ctx.lineWidth = 0.8; ctx.strokeRect(sx - 4.5, sy + 3, 9, 6);
        ctx.fillStyle = '#00FF66';
        ctx.beginPath(); ctx.arc(sx, sy + 6, 1.2, 0, Math.PI * 2); ctx.fill();
    }

    // =========================================================
    // 3. 消毒区写实核心设施 (Decontamination Area: x: 20 ~ 350)
    // 气流喷嘴与消毒液喷头严格物理隔开！
    // 消毒液喷头下方配置全覆盖 3D 地面格栅与废液收集暗槽！
    // =========================================================

    // A. 高压气流喷嘴段 (High-Velocity Air Jet Nozzle Array: x: 40 ~ 170)
    // 独立分布在前半段南北两侧墙壁上，与消毒液完全物理隔开！
    const airXs = [55, 90, 125, 160];
    const isAir = corridor.airSpraying;

    airXs.forEach(nx => {
        // 北侧气流喷嘴 (朝向局部 -Y，即朝向走廊中央)
        drawHighPressureAirNozzle(ctx, nx, halfW - 6, 'inward_south', isAir);
        // 南侧气流喷嘴 (朝向局部 +Y，即朝向走廊中央)
        drawHighPressureAirNozzle(ctx, nx, -halfW + 6, 'inward_north', isAir);
    });

    // 动态高压气流风幕喷射特效 (High-Velocity Air Curtain Blast)
    if (isAir) {
        ctx.save();
        // 浓郁强风气幕背景
        ctx.fillStyle = 'rgba(0, 229, 255, 0.18)';
        ctx.fillRect(40, -halfW + 10, 130, W - 20);

        // 强气流高速粒子与对撞冲击线条
        ctx.strokeStyle = 'rgba(0, 229, 255, 0.85)';
        ctx.lineWidth = 1.6;
        for (let a = 0; a < 42; a++) {
            const px = 45 + Math.random() * 120;
            const pyTop = halfW - 10 - Math.random() * 45;
            const pyBot = -halfW + 10 + Math.random() * 45;
            ctx.beginPath();
            ctx.moveTo(px, pyTop);
            ctx.lineTo(px + (Math.random() - 0.5) * 12, pyTop - (18 + Math.random() * 14));
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(px, pyBot);
            ctx.lineTo(px + (Math.random() - 0.5) * 12, pyBot + (18 + Math.random() * 14));
            ctx.stroke();
        }
        ctx.restore();
    }

    // B. 地面 3D 铸钢废液收集暗槽与立体漏水格栅 (3D Floor Grating & Drainage Trench: x: 180 ~ 340)
    // 设在消毒液喷头正下方，收集洗消后滴落的废液！
    const trenchX = 180;
    const trenchY = -halfW + 12;
    const trenchW = 160;
    const trenchH = W - 24;

    // 废液暗槽深池
    ctx.fillStyle = '#010806';
    ctx.fillRect(trenchX, trenchY, trenchW, trenchH);
    ctx.strokeStyle = '#064e3b';
    ctx.lineWidth = 2.4;
    ctx.strokeRect(trenchX, trenchY, trenchW, trenchH);

    // 3D 铸钢重型主承重条与交叉拉筋格栅网 (3D Cast-Steel Mesh Grid)
    ctx.strokeStyle = '#03231a';
    ctx.lineWidth = 2.4;
    for (let gx = trenchX + 5; gx < trenchX + trenchW; gx += 8) {
        ctx.beginPath(); ctx.moveTo(gx, trenchY); ctx.lineTo(gx, trenchY + trenchH); ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(52, 211, 153, 0.5)';
    ctx.lineWidth = 1.2;
    for (let gx = trenchX + 5; gx < trenchX + trenchW; gx += 8) {
        ctx.beginPath(); ctx.moveTo(gx, trenchY); ctx.lineTo(gx, trenchY + trenchH); ctx.stroke();
    }
    for (let gy = trenchY + 6; gy < trenchY + trenchH; gy += 10) {
        ctx.beginPath(); ctx.moveTo(trenchX, gy); ctx.lineTo(trenchX + trenchW, gy); ctx.stroke();
    }
    // 槽底浓郁绿色彩光与微波反射高光
    ctx.fillStyle = 'rgba(16, 185, 129, 0.16)';
    ctx.fillRect(trenchX + 2, trenchY + 2, trenchW - 4, trenchH - 4);

    // C. 消毒液喷淋花洒头段 (Chemical Disinfection Shower Heads: x: 195 ~ 335)
    // 独立设在地面格栅正上方，隔开排列，配备红绿双色高亮指示灯
    const liquidXs = [205, 245, 285, 325];
    const isLiquid = corridor.liquidSpraying;

    liquidXs.forEach(lx => {
        // 北侧消毒液花洒头
        drawLiquidShowerHeadUnit(ctx, lx, halfW - 6, 'inward_south', isLiquid);
        // 南侧消毒液花洒头
        drawLiquidShowerHeadUnit(ctx, lx, -halfW + 6, 'inward_north', isLiquid);
    });

    // 动态消毒液喷淋雾化水幕特效 (Chemical Disinfectant Spray Mist Cloud)
    if (isLiquid) {
        ctx.save();
        // 浓郁绿色消毒雾化光斑
        const mistGrad = ctx.createRadialGradient(265, 0, 15, 265, 0, 130);
        mistGrad.addColorStop(0, 'rgba(52, 211, 153, 0.52)');
        mistGrad.addColorStop(0.5, 'rgba(16, 185, 129, 0.28)');
        mistGrad.addColorStop(1, 'rgba(6, 78, 59, 0.08)');
        ctx.fillStyle = mistGrad;
        ctx.fillRect(180, -halfW + 10, 160, W - 20);

        // 密集雨幕线条与地面溅水粒子
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.9)';
        ctx.lineWidth = 1.6;
        for (let b = 0; b < 56; b++) {
            const rx = 185 + Math.random() * 150;
            const ry = -halfW + 14 + Math.random() * (W - 28);
            ctx.beginPath();
            ctx.moveTo(rx, ry);
            ctx.lineTo(rx + (Math.random() - 0.5) * 6, ry + 8 + Math.random() * 14);
            ctx.stroke();

            // 水花微粒
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(rx, ry + 12, 1.2, 1.2);
        }
        ctx.restore();
    }

    ctx.restore();
}

// 辅助函数：绘制工业高压气流喷嘴单元 (带文丘里锥阀、六角螺母、不锈钢管与红绿高亮状态灯)
function drawHighPressureAirNozzle(ctx, x, y, dir, isSpraying) {
    const isSouth = (dir === 'inward_south');
    const tipY = isSouth ? y - 10 : y + 10;

    // 不锈钢高压气流文丘里锥形喷嘴体
    ctx.fillStyle = '#052a21';
    ctx.beginPath();
    ctx.moveTo(x - 6, y);
    ctx.lineTo(x + 6, y);
    ctx.lineTo(x + 2.5, tipY);
    ctx.lineTo(x - 2.5, tipY);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 1.4;
    ctx.stroke();

    // 六角紧固螺母
    ctx.fillStyle = '#021611';
    ctx.fillRect(x - 4.5, y - (isSouth ? 2 : -2), 9, 2);

    // 喷嘴口微型高光阀芯
    ctx.fillStyle = '#00E5FF';
    ctx.fillRect(x - 1.5, tipY - (isSouth ? 0 : 1.5), 3, 1.5);

    // 红绿双色状态指示灯 (喷洒中亮红色，喷洒后变绿色)
    const ledY = isSouth ? y + 3 : y - 3;
    ctx.fillStyle = isSpraying ? '#ef4444' : '#10b981';
    ctx.beginPath(); ctx.arc(x, ledY, 2.8, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 0.8; ctx.stroke();
    // LED 强光晕
    ctx.fillStyle = isSpraying ? 'rgba(239, 68, 68, 0.5)' : 'rgba(16, 185, 129, 0.5)';
    ctx.beginPath(); ctx.arc(x, ledY, 6, 0, Math.PI * 2); ctx.fill();
}

// 辅助函数：绘制 316L 不锈钢圆盘消毒液喷头单元 (带工业花洒盘、多孔出液嘴与红绿状态灯)
function drawLiquidShowerHeadUnit(ctx, x, y, dir, isSpraying) {
    const isSouth = (dir === 'inward_south');
    const discY = isSouth ? y - 12 : y + 12;

    // 不锈钢供液管道与法兰扣
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, discY + (isSouth ? 3 : -3)); ctx.stroke();
    ctx.fillStyle = '#042a20';
    ctx.fillRect(x - 3.5, y - (isSouth ? 2 : -2), 7, 2);

    // 316L 不锈钢花洒圆盘 (Brushed Steel Shower Disc)
    ctx.fillStyle = '#084032';
    ctx.beginPath();
    ctx.ellipse(x, discY, 9.5, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 密集出液微孔孔阵 (White Nozzle Holes)
    ctx.fillStyle = '#ffffff';
    for (let ox = -6; ox <= 6; ox += 2.4) {
        ctx.fillRect(x + ox, discY - 0.5, 1.2, 1.2);
    }

    // 红绿双色状态指示灯 (喷洒时间亮红灯，喷洒完毕亮绿灯)
    const ledY = isSouth ? y + 3 : y - 3;
    ctx.fillStyle = isSpraying ? '#ef4444' : '#10b981';
    ctx.beginPath(); ctx.arc(x, ledY, 2.8, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 0.8; ctx.stroke();
    ctx.fillStyle = isSpraying ? 'rgba(239, 68, 68, 0.5)' : 'rgba(16, 185, 129, 0.5)';
    ctx.beginPath(); ctx.arc(x, ledY, 6, 0, Math.PI * 2); ctx.fill();
}

// =========================================================================
// LEVEL 8 独立高精写实展示道具绘制系统 (完完全全重新高精度绘制，极尽细致与写实)
// 包含 5 大独立展示道具：
// 1. 储物柜 (Personal Hazmat Cleanroom Locker Unit)
// 2. 洗手池 (Medical Scrub Sink Unit)
// 3. 掌纹和虹膜识别装置 (Palm Vein & Iris Biometric Terminal)
// 4. 监控屏幕 (Atmospheric Monitoring Telemetry Screen)
// 5. 防毒面具 (CBRN Gas Mask Showcase Display)
// =========================================================================

function drawShowcaseTag(ctx, x, y, titleCn, titleEn) {
    ctx.save();
    ctx.translate(x, y);

    const tw = 200;
    const th = 26;
    ctx.fillStyle = 'rgba(1, 12, 9, 0.96)';
    ctx.fillRect(-tw / 2, -th / 2, tw, th);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2.0;
    ctx.strokeRect(-tw / 2, -th / 2, tw, th);

    ctx.fillStyle = '#34d399';
    [-tw / 2 + 4, tw / 2 - 4].forEach(bx => {
        [-th / 2 + 4, th / 2 - 4].forEach(by => {
            ctx.fillRect(bx - 1.5, by - 1.5, 3, 3);
        });
    });

    ctx.font = 'bold 11px "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.fillStyle = '#00FF66';
    ctx.textAlign = 'center';
    ctx.fillText(titleCn, 0, -3);

    ctx.font = 'bold 7px monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(titleEn, 0, 9);

    ctx.restore();
}

// 1. 储物柜 (Personal Hazmat Cleanroom Locker Array - 240x150 Masterwork)
function drawStandaloneLocker(ctx, cx, cy) {
    const time = Date.now() * 0.002;
    const w = 240;
    const h = 150;
    const halfW = w / 2;
    const halfH = h / 2;

    ctx.save();
    ctx.translate(cx, cy);

    // Drop Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.beginPath();
    ctx.ellipse(0, halfH + 8, halfW + 14, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    // Heavy Plinth Base / Kickplate
    ctx.fillStyle = '#010806';
    ctx.fillRect(-halfW + 8, halfH - 14, w - 16, 16);
    ctx.strokeStyle = '#064e3b'; ctx.lineWidth = 2.0; ctx.strokeRect(-halfW + 8, halfH - 14, w - 16, 16);
    for (let bx = -halfW + 24; bx < halfW - 16; bx += 36) {
        ctx.fillStyle = '#0f172a';
        ctx.beginPath(); ctx.arc(bx, halfH - 6, 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#34d399'; ctx.lineWidth = 0.8; ctx.stroke();
    }

    // Outer Cabinet Frame
    const cabinetGrad = ctx.createLinearGradient(-halfW, -halfH, halfW, halfH);
    cabinetGrad.addColorStop(0, '#021812');
    cabinetGrad.addColorStop(0.25, '#08392c');
    cabinetGrad.addColorStop(0.75, '#04241c');
    cabinetGrad.addColorStop(1, '#01120d');
    ctx.fillStyle = cabinetGrad;
    ctx.fillRect(-halfW, -halfH, w, h - 14);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2.8;
    ctx.strokeRect(-halfW, -halfH, w, h - 14);

    ctx.strokeStyle = 'rgba(52, 211, 153, 0.5)';
    ctx.lineWidth = 1.4;
    ctx.strokeRect(-halfW + 4, -halfH + 4, w - 8, h - 22);

    // Overhead Power & Gas Supply Manifold Duct
    ctx.fillStyle = '#02140e';
    ctx.fillRect(-halfW - 8, -halfH - 20, w + 16, 20);
    ctx.strokeStyle = '#059669'; ctx.lineWidth = 2.0; ctx.strokeRect(-halfW - 8, -halfH - 20, w + 16, 20);

    // 3 Gas Regulators
    [-halfW + 30, 0, halfW - 30].forEach(vx => {
        ctx.fillStyle = '#b45309';
        ctx.fillRect(vx - 6, -halfH - 17, 12, 12);
        ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 1.0; ctx.strokeRect(vx - 6, -halfH - 17, 12, 12);
        ctx.fillStyle = '#010a07';
        ctx.beginPath(); ctx.arc(vx, -halfH - 11, 6.5, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#00E5FF'; ctx.lineWidth = 1.2; ctx.stroke();
        ctx.fillStyle = '#00FF66';
        ctx.beginPath(); ctx.arc(vx, -halfH - 11, 2.2, 0, Math.PI * 2); ctx.fill();
    });

    // 5 Locker Bays Array
    const doorW = (w - 24) / 5;
    for (let i = 0; i < 5; i++) {
        const dx = -halfW + 12 + i * doorW;
        const dy = -halfH + 10;
        const dh = h - 36;

        const doorGrad = ctx.createLinearGradient(dx, dy, dx + doorW, dy);
        doorGrad.addColorStop(0, '#032019');
        doorGrad.addColorStop(0.5, '#0a4938');
        doorGrad.addColorStop(1, '#032019');
        ctx.fillStyle = doorGrad;
        ctx.fillRect(dx, dy, doorW - 3, dh);
        ctx.strokeStyle = '#065f46'; ctx.lineWidth = 1.6; ctx.strokeRect(dx, dy, doorW - 3, dh);

        // Louvered Slats (10 Slats)
        ctx.fillStyle = '#010c08';
        for (let s = 0; s < 10; s++) {
            ctx.fillRect(dx + 3, dy + 6 + s * 5.2, doorW - 9, 2.8);
            ctx.fillStyle = '#021e15';
            ctx.fillRect(dx + 3, dy + 7.8 + s * 5.2, doorW - 9, 1.0);
        }

        // Inspection Window
        const winY = dy + 58;
        ctx.fillStyle = '#02182b';
        ctx.fillRect(dx + 4, winY, doorW - 11, 18);
        ctx.strokeStyle = '#00E5FF'; ctx.lineWidth = 1.0; ctx.strokeRect(dx + 4, winY, doorW - 11, 18);
        ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 1.0;
        ctx.beginPath(); ctx.moveTo(dx + 6, winY + 3); ctx.lineTo(dx + doorW - 13, winY + 15); ctx.stroke();

        // Keypad & RFID Scanner Panel
        const kpY = dy + 80;
        ctx.fillStyle = '#010e0b';
        ctx.fillRect(dx + doorW - 12, kpY, 8, 22);
        ctx.strokeStyle = '#34d399'; ctx.lineWidth = 0.8; ctx.strokeRect(dx + doorW - 12, kpY, 8, 22);
        ctx.fillStyle = '#042e23';
        ctx.fillRect(dx + doorW - 10, kpY + 3, 5, 4);
        ctx.fillRect(dx + doorW - 10, kpY + 9, 5, 4);
        ctx.fillRect(dx + doorW - 10, kpY + 15, 5, 4);
        ctx.fillStyle = (i === 1) ? '#ef4444' : '#00FF66';
        ctx.beginPath(); ctx.arc(dx + doorW - 8, kpY - 3, 1.6, 0, Math.PI * 2); ctx.fill();

        // Handle Latch
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(dx + 4, kpY, 5, 20);
        ctx.strokeStyle = '#475569'; ctx.lineWidth = 1.0; ctx.strokeRect(dx + 4, kpY, 5, 20);

        ctx.font = 'bold 7px monospace';
        ctx.fillStyle = '#34d399';
        ctx.textAlign = 'center';
        ctx.fillText(`L0${i + 1}`, dx + doorW / 2 - 1.5, dy + dh - 6);
    }

    drawShowcaseTag(ctx, 0, -halfH - 32, '重型防爆洁净储物柜', 'HAZMAT CLEANROOM LOCKER ARRAY');
    ctx.restore();
}

// 2. 洗手池 (Medical Scrub Sink System - 240x150 Masterwork)
function drawStandaloneScrubSink(ctx, cx, cy) {
    const time = Date.now() * 0.003;
    const w = 240;
    const h = 150;
    const halfW = w / 2;
    const halfH = h / 2;

    ctx.save();
    ctx.translate(cx, cy);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.beginPath();
    ctx.ellipse(0, halfH + 8, halfW + 14, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    const baseGrad = ctx.createLinearGradient(-halfW, -halfH, halfW, halfH);
    baseGrad.addColorStop(0, '#041f17');
    baseGrad.addColorStop(0.5, '#114a39');
    baseGrad.addColorStop(1, '#041f17');
    ctx.fillStyle = baseGrad;
    ctx.fillRect(-halfW, -halfH, w, h);
    ctx.strokeStyle = '#10b981'; ctx.lineWidth = 2.8; ctx.strokeRect(-halfW, -halfH, w, h);

    // Backsplash Panel (316L Stainless Steel Plate)
    ctx.fillStyle = '#02150f';
    ctx.fillRect(-halfW + 6, -halfH + 6, w - 12, 38);
    ctx.strokeStyle = '#059669'; ctx.lineWidth = 1.6; ctx.strokeRect(-halfW + 6, -halfH + 6, w - 12, 38);

    // Central Telemetry HUD Screen
    ctx.fillStyle = '#010a08';
    ctx.fillRect(-45, -halfH + 10, 90, 26);
    ctx.strokeStyle = '#00E5FF'; ctx.lineWidth = 1.4; ctx.strokeRect(-45, -halfH + 10, 90, 26);
    ctx.font = 'bold 9px monospace';
    ctx.fillStyle = '#00FF66'; ctx.textAlign = 'center';
    ctx.fillText('37.8°C NOMINAL', 0, -halfH + 21);
    ctx.font = '7px monospace'; ctx.fillStyle = '#38bdf8';
    ctx.fillText('UV-C STERILIZER: OK', 0, -halfH + 31);

    // Soap & Disinfectant Dispensers
    [-halfW + 14, halfW - 30].forEach((sx, idx) => {
        ctx.fillStyle = '#010d0a';
        ctx.fillRect(sx, -halfH + 9, 16, 30);
        ctx.strokeStyle = '#34d399'; ctx.lineWidth = 1.2; ctx.strokeRect(sx, -halfH + 9, 16, 30);
        ctx.fillStyle = (idx === 0) ? 'rgba(52, 211, 153, 0.9)' : 'rgba(56, 189, 248, 0.9)';
        ctx.fillRect(sx + 3, -halfH + 13, 10, 22);
    });

    // Dual Basins (Left & Right Troughs)
    const basinW = 100;
    const basinH = 92;
    [-halfW + 15, halfW - 15 - basinW].forEach((bx, idx) => {
        const by = -halfH + 48;

        ctx.fillStyle = '#02120e';
        ctx.fillRect(bx, by, basinW, basinH);
        ctx.strokeStyle = '#34d399'; ctx.lineWidth = 1.8; ctx.strokeRect(bx, by, basinW, basinH);

        const basinGrad = ctx.createRadialGradient(bx + basinW / 2, by + basinH / 2, 6, bx + basinW / 2, by + basinH / 2, 48);
        basinGrad.addColorStop(0, '#010a08');
        basinGrad.addColorStop(0.6, '#063527');
        basinGrad.addColorStop(1, '#0e5241');
        ctx.fillStyle = basinGrad;
        ctx.beginPath();
        ctx.ellipse(bx + basinW / 2, by + basinH / 2, basinW / 2 - 6, basinH / 2 - 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#00E5FF'; ctx.lineWidth = 1.4; ctx.stroke();

        ctx.fillStyle = '#010806';
        ctx.beginPath(); ctx.arc(bx + basinW / 2, by + basinH / 2 + 8, 7, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#059669'; ctx.lineWidth = 1.0; ctx.stroke();

        const fx = bx + basinW / 2;
        ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 5.0;
        ctx.beginPath(); ctx.moveTo(fx, by - 12); ctx.lineTo(fx, by + 10); ctx.stroke();
        ctx.fillStyle = '#cbd5e1';
        ctx.beginPath(); ctx.arc(fx, by - 12, 5.0, 0, Math.PI * 2); ctx.fill();

        ctx.fillStyle = '#38bdf8';
        ctx.beginPath(); ctx.arc(fx, by - 4, 2.5, 0, Math.PI * 2); ctx.fill();

        const waterAlpha = 0.5 + Math.sin(time * 4 + idx) * 0.35;
        ctx.strokeStyle = `rgba(0, 229, 255, ${waterAlpha})`;
        ctx.lineWidth = 3.6;
        ctx.beginPath(); ctx.moveTo(fx, by + 10); ctx.lineTo(fx, by + basinH / 2 + 8); ctx.stroke();

        ctx.strokeStyle = `rgba(56, 189, 248, ${waterAlpha * 0.85})`;
        ctx.lineWidth = 1.4;
        const ripR = (Date.now() * 0.01 + idx * 10) % 12;
        ctx.beginPath();
        ctx.ellipse(fx, by + basinH / 2 + 8, ripR + 3, ripR * 0.5 + 1.5, 0, 0, Math.PI * 2);
        ctx.stroke();
    });

    drawShowcaseTag(ctx, 0, -halfH - 32, '医用双槽感应洗手池', 'MEDICAL SCRUB SINK SYSTEM');
    ctx.restore();
}

// 3. 掌纹和虹膜识别装置 (Palm Vein & Iris Biometric Terminal - 240x150 Masterwork)
function drawStandaloneBiometricTerminal(ctx, cx, cy) {
    const time = Date.now() * 0.003;
    const w = 240;
    const h = 150;
    const halfW = w / 2;
    const halfH = h / 2;

    ctx.save();
    ctx.translate(cx, cy);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.beginPath();
    ctx.ellipse(0, halfH + 8, halfW + 14, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#010d0a';
    ctx.fillRect(-halfW + 20, halfH - 14, w - 40, 16);
    ctx.strokeStyle = '#10b981'; ctx.lineWidth = 2.0; ctx.strokeRect(-halfW + 20, halfH - 14, w - 40, 16);

    const bodyGrad = ctx.createLinearGradient(-halfW, -halfH, halfW, halfH);
    bodyGrad.addColorStop(0, '#031c15');
    bodyGrad.addColorStop(0.5, '#0a4334');
    bodyGrad.addColorStop(1, '#031c15');
    ctx.fillStyle = bodyGrad;
    ctx.fillRect(-halfW, -halfH, w, h - 16);
    ctx.strokeStyle = '#10b981'; ctx.lineWidth = 2.8; ctx.strokeRect(-halfW, -halfH, w, h - 16);

    ctx.strokeStyle = '#059669'; ctx.lineWidth = 2.0;
    ctx.beginPath(); ctx.moveTo(0, -halfH); ctx.lineTo(0, halfH - 16); ctx.stroke();

    // LEFT MODULE: Palm Scanner
    const palmBoxX = -halfW + 12;
    const palmBoxY = -halfH + 12;
    const palmBoxW = halfW - 20;
    const palmBoxH = h - 40;

    const platenGrad = ctx.createLinearGradient(palmBoxX, palmBoxY, palmBoxX + palmBoxW, palmBoxY + palmBoxH);
    platenGrad.addColorStop(0, '#021a15');
    platenGrad.addColorStop(0.5, '#083c2e');
    platenGrad.addColorStop(1, '#021a15');
    ctx.fillStyle = platenGrad;
    ctx.fillRect(palmBoxX, palmBoxY, palmBoxW, palmBoxH);
    ctx.strokeStyle = '#34d399'; ctx.lineWidth = 1.8; ctx.strokeRect(palmBoxX, palmBoxY, palmBoxW, palmBoxH);

    const palmCx = palmBoxX + palmBoxW / 2;
    const palmCy = palmBoxY + palmBoxH / 2 - 6;

    ctx.strokeStyle = 'rgba(52, 211, 153, 0.85)';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(palmCx, palmCy + 8, 16, 0, Math.PI * 2);
    [-13, -4, 4, 13].forEach(fx => {
        ctx.moveTo(palmCx + fx, palmCy);
        ctx.lineTo(palmCx + fx * 1.3, palmCy - 20);
    });
    ctx.stroke();

    const sweepY = palmBoxY + 8 + (Math.sin(time * 5) * 0.5 + 0.5) * (palmBoxH - 16);
    ctx.strokeStyle = '#00FF66'; ctx.lineWidth = 3.2;
    ctx.beginPath(); ctx.moveTo(palmBoxX + 4, sweepY); ctx.lineTo(palmBoxX + palmBoxW - 4, sweepY); ctx.stroke();
    ctx.fillStyle = 'rgba(0, 255, 102, 0.32)';
    ctx.fillRect(palmBoxX + 4, sweepY - 5, palmBoxW - 8, 10);

    ctx.font = 'bold 8px monospace';
    ctx.fillStyle = '#00FF66'; ctx.textAlign = 'center';
    ctx.fillText('PALM: MATCHED 99.8%', palmCx, palmBoxY + palmBoxH - 6);

    // RIGHT MODULE: Iris Camera Tower
    const irisBoxX = 8;
    const irisBoxY = -halfH + 12;
    const irisBoxW = halfW - 20;
    const irisBoxH = h - 40;

    ctx.fillStyle = platenGrad;
    ctx.fillRect(irisBoxX, irisBoxY, irisBoxW, irisBoxH);
    ctx.strokeStyle = '#00CCFF'; ctx.lineWidth = 1.8; ctx.strokeRect(irisBoxX, irisBoxY, irisBoxW, irisBoxH);

    const irisCx = irisBoxX + irisBoxW / 2;
    const irisCy = irisBoxY + irisBoxH / 2 - 6;

    ctx.fillStyle = '#021220';
    ctx.beginPath(); ctx.arc(irisCx, irisCy, 26, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#00E5FF'; ctx.lineWidth = 2.8; ctx.stroke();

    const pupilR = 9 + Math.sin(time * 4) * 2.4;
    ctx.fillStyle = '#00E5FF';
    ctx.beginPath(); ctx.arc(irisCx, irisCy, pupilR, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(irisCx - 3, irisCy - 3, 2.5, 0, Math.PI * 2); ctx.fill();

    for (let i = 0; i < 8; i++) {
        const ang = i * (Math.PI / 4);
        const lx = irisCx + Math.cos(ang) * 20;
        const ly = irisCy + Math.sin(ang) * 20;
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath(); ctx.arc(lx, ly, 2.0, 0, Math.PI * 2); ctx.fill();
    }

    ctx.strokeStyle = 'rgba(0, 229, 255, 0.8)'; ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(irisCx - 32, irisCy); ctx.lineTo(irisCx + 32, irisCy);
    ctx.moveTo(irisCx, irisCy - 32); ctx.lineTo(irisCx, irisCy + 32);
    ctx.stroke();

    ctx.font = 'bold 8px monospace';
    ctx.fillStyle = '#00E5FF'; ctx.textAlign = 'center';
    ctx.fillText('IRIS: LOCKED', irisCx, irisBoxY + irisBoxH - 6);

    drawShowcaseTag(ctx, 0, -halfH - 32, '掌纹和虹膜生物识别终端', 'PALM VEIN & IRIS BIOMETRIC TERMINAL');
    ctx.restore();
}

// 4. 监控屏幕 (Atmospheric Monitoring Telemetry Screen - 240x150 Masterwork)
function drawStandaloneMonitoringScreen(ctx, cx, cy) {
    const time = Date.now() * 0.003;
    const w = 240;
    const h = 150;
    const halfW = w / 2;
    const halfH = h / 2;

    ctx.save();
    ctx.translate(cx, cy);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.beginPath();
    ctx.ellipse(0, halfH + 8, halfW + 14, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#010a08';
    ctx.fillRect(-halfW + 24, halfH - 14, w - 48, 16);
    ctx.strokeStyle = '#059669'; ctx.lineWidth = 2.0; ctx.strokeRect(-halfW + 24, halfH - 14, w - 48, 16);

    const frameGrad = ctx.createLinearGradient(-halfW, -halfH, halfW, halfH);
    frameGrad.addColorStop(0, '#020f18');
    frameGrad.addColorStop(0.5, '#093652');
    frameGrad.addColorStop(1, '#020f18');
    ctx.fillStyle = frameGrad;
    ctx.fillRect(-halfW, -halfH, w, h - 16);
    ctx.strokeStyle = '#00CCFF'; ctx.lineWidth = 2.8; ctx.strokeRect(-halfW, -halfH, w, h - 16);

    const screenGrad = ctx.createLinearGradient(-halfW + 6, -halfH + 6, halfW - 6, halfH - 22);
    screenGrad.addColorStop(0, '#072842');
    screenGrad.addColorStop(0.6, '#021220');
    screenGrad.addColorStop(1, '#010912');
    ctx.fillStyle = screenGrad;
    ctx.fillRect(-halfW + 6, -halfH + 6, w - 12, h - 28);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.beginPath();
    ctx.moveTo(-halfW + 6, -halfH + 6);
    ctx.lineTo(-halfW + 90, -halfH + 6);
    ctx.lineTo(-halfW + 22, halfH - 22);
    ctx.lineTo(-halfW + 6, halfH - 22);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(0, 204, 255, 0.22)';
    ctx.fillRect(-halfW + 9, -halfH + 9, w - 18, 18);
    ctx.strokeStyle = '#00CCFF'; ctx.lineWidth = 1.2; ctx.strokeRect(-halfW + 9, -halfH + 9, w - 18, 18);
    ctx.font = 'bold 9.5px monospace';
    ctx.fillStyle = '#00E5FF'; ctx.textAlign = 'left';
    ctx.fillText('ATMOSPHERIC TELEMETRY', -halfW + 14, -halfH + 22);
    ctx.fillStyle = '#00FF66'; ctx.textAlign = 'right';
    ctx.fillText('● LIVE NOMINAL', halfW - 14, -halfH + 22);

    const dialCx = -halfW + 42;
    const dialCy = -halfH + 68;
    ctx.fillStyle = '#010d18';
    ctx.beginPath(); ctx.arc(dialCx, dialCy, 24, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#00E5FF'; ctx.lineWidth = 1.8; ctx.stroke();

    const needleAng = -Math.PI * 0.75 + (Math.sin(time * 2) * 0.1 + 0.65) * Math.PI * 1.5;
    ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.moveTo(dialCx, dialCy); ctx.lineTo(dialCx + Math.cos(needleAng) * 18, dialCy + Math.sin(needleAng) * 18); ctx.stroke();

    ctx.font = 'bold 7.5px monospace';
    ctx.fillStyle = '#00E5FF'; ctx.textAlign = 'center';
    ctx.fillText('+32.4Pa', dialCx, dialCy + 32);

    const waveX = -halfW + 78;
    const waveY = -halfH + 36;
    const waveW = w - 90;
    const waveH = 60;

    ctx.fillStyle = '#010c14';
    ctx.fillRect(waveX, waveY, waveW, waveH);
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.4)'; ctx.lineWidth = 1.0; ctx.strokeRect(waveX, waveY, waveW, waveH);

    ctx.strokeStyle = '#00FF66'; ctx.lineWidth = 2.0;
    ctx.beginPath();
    for (let x = 0; x < waveW - 6; x += 3) {
        const wy = waveY + waveH / 2 + Math.sin(time * 6 + x * 0.18) * 15;
        if (x === 0) ctx.moveTo(waveX + 3 + x, wy); else ctx.lineTo(waveX + 3 + x, wy);
    }
    ctx.stroke();

    ctx.font = '7.5px monospace';
    ctx.fillStyle = '#38bdf8'; ctx.textAlign = 'left';
    ctx.fillText('TEMP: 20.4°C  HUMID: 45%', waveX + 5, waveY + 15);
    ctx.fillText('O2: 20.9%    CO2: 380ppm', waveX + 5, waveY + waveH - 6);

    ctx.fillStyle = '#010a12';
    ctx.fillRect(-halfW + 9, halfH - 44, w - 18, 18);
    ctx.strokeStyle = '#059669'; ctx.lineWidth = 1.0; ctx.strokeRect(-halfW + 9, halfH - 44, w - 18, 18);
    ctx.font = '7px monospace'; ctx.fillStyle = 'rgba(52, 211, 153, 0.95)'; ctx.textAlign = 'left';
    ctx.fillText('[SYS] HEPA FILTER: 99.97% // AIRFLOW: POSITIVE', -halfW + 14, halfH - 32);

    drawShowcaseTag(ctx, 0, -halfH - 32, '气压环境遥测监控屏幕', 'ATMOSPHERIC MONITORING TERMINAL');
    ctx.restore();
}

// 5. 防毒面具 (CBRN Gas Mask Showcase Display - 240x150 Masterwork)
function drawStandaloneGasMask(ctx, cx, cy) {
    const w = 240;
    const h = 150;
    const halfW = w / 2;
    const halfH = h / 2;

    ctx.save();
    ctx.translate(cx, cy);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.beginPath();
    ctx.ellipse(0, halfH + 8, halfW + 14, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#010d0a';
    ctx.fillRect(-halfW, -halfH, w, h);
    ctx.strokeStyle = '#10b981'; ctx.lineWidth = 2.8; ctx.strokeRect(-halfW, -halfH, w, h);

    const spotGrad = ctx.createRadialGradient(0, -halfH + 20, 6, 0, 0, 85);
    spotGrad.addColorStop(0, 'rgba(52, 211, 153, 0.48)');
    spotGrad.addColorStop(0.7, 'rgba(16, 185, 129, 0.15)');
    spotGrad.addColorStop(1, 'rgba(2, 18, 14, 0.0)');
    ctx.fillStyle = spotGrad;
    ctx.fillRect(-halfW + 6, -halfH + 6, w - 12, h - 12);

    ctx.fillStyle = '#021a14';
    ctx.beginPath(); ctx.ellipse(0, 8, 38, 46, 0, 0, Math.PI * 2); ctx.fill();

    // Mask Body
    ctx.fillStyle = '#0f172a';
    ctx.beginPath(); ctx.ellipse(0, 6, 42, 52, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#334155'; ctx.lineWidth = 3.2; ctx.stroke();

    // Visor
    const visorGrad = ctx.createLinearGradient(-32, -26, 32, 22);
    visorGrad.addColorStop(0, 'rgba(2, 132, 199, 0.95)');
    visorGrad.addColorStop(0.5, 'rgba(14, 165, 233, 0.75)');
    visorGrad.addColorStop(1, 'rgba(3, 105, 161, 0.9)');
    ctx.fillStyle = visorGrad;
    ctx.beginPath(); ctx.ellipse(0, -12, 34, 24, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#00E5FF'; ctx.lineWidth = 2.4; ctx.stroke();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath(); ctx.ellipse(-12, -18, 9, 4, -Math.PI / 6, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.beginPath(); ctx.ellipse(0, -6, 16, 10, 0, 0, Math.PI * 2); ctx.fill();

    // Speech Diaphragm
    ctx.fillStyle = '#1e293b';
    ctx.beginPath(); ctx.arc(0, 24, 14, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#64748b'; ctx.lineWidth = 2.2; ctx.stroke();

    ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 1.4;
    for (let sl = -9; sl <= 9; sl += 3.5) {
        ctx.beginPath(); ctx.moveTo(sl, 16); ctx.lineTo(sl, 32); ctx.stroke();
    }

    // NATO Filters
    [-40, 40].forEach(fx => {
        ctx.fillStyle = '#334155';
        ctx.fillRect(fx - 13, 6, 26, 30);
        ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2.2; ctx.strokeRect(fx - 13, 6, 26, 30);

        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(fx - 13, 15, 26, 6);

        ctx.fillStyle = '#0f172a';
        ctx.fillRect(fx - 10, 26, 20, 5);
    });

    // Harness
    ctx.strokeStyle = '#475569'; ctx.lineWidth = 4.2;
    ctx.beginPath(); ctx.moveTo(-26, -42); ctx.lineTo(-52, -28); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(26, -42); ctx.lineTo(52, -28); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-38, 0); ctx.lineTo(-56, 14); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(38, 0); ctx.lineTo(56, 14); ctx.stroke();

    [-52, 52].forEach(bx => {
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(bx - 4.5, -30, 9, 9);
    });

    drawShowcaseTag(ctx, 0, -halfH - 32, 'CBRN 防毒面具展示台', 'TYPE-84 CBRN RESPIRATOR MASK');
    ctx.restore();
}

// =========================================================================
// 全新大圆会议桌系统 (依据用户指令规范设计与渲染)
// 包含 4 大核心要素：
// 1. 地图中间大圆形改成大圆会议桌 (深色木质质感，类似讲台道具的红木/胡桃木木纹与光泽，保留原正圆 155px 半径)
// 2. 会议桌上排满一圈平板电脑、文件夹和笔 (共 16 席高精度战术终端、TOP SECRET 机密文件夹与金属签字笔)
// 3. 圆环形灯环保持原本形状与颜色 (143px 半径，原版天空蓝/青蓝配色)，做出一颗一颗灯珠和点亮发光动态效果 (64 颗独立发光灯珠带光晕与光核)
// 4. 四周原 4 个圆弧删除，替换为环绕会议桌的 16 个高管人体工学转椅 (位置与会议桌上的物品席位一一对应，面向会议桌)

const LEVEL_8_TEST = {
    id: "level8_test",
    name: "第 8 关 · 隔离测试关卡",
    nameEn: "Level 08 · Isolated Test Sandbox",
    themeColor: "#022c22",
    gridColor: "rgba(16, 185, 129, 0.22)",
    accentColor: "#10b981",
    playerStart: { x: 1600, y: 1460 },

    getMapLayout: (width, height) => {
        const cx = 1600;
        const cy = 1200;

        // =========================================================
        // 1. 实体碰撞墙体与 Level 6 重型装甲外壳外墙
        // =========================================================
        const obstacles = [
            // A. 中间房间最上方 3 大显示屏的封闭重装甲墙
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

            // E. 正中央大圆会议桌系统 (保留正圆实体碰撞与物理阻挡，由专属绘制闭包渲染深色木纹、一圈平板电脑文件夹笔、发光灯珠灯环与环绕座位)
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

            // H. 南侧 6 个控制长方台
            { type: 'solid', x: 1330, y: 1480, w: 220, h: 36, label: 'RECTANGLE R1-L', hideLabel: true },
            { type: 'solid', x: 1650, y: 1480, w: 220, h: 36, label: 'RECTANGLE R1-R', hideLabel: true },
            { type: 'solid', x: 1330, y: 1580, w: 220, h: 36, label: 'RECTANGLE R2-L', hideLabel: true },
            { type: 'solid', x: 1650, y: 1580, w: 220, h: 36, label: 'RECTANGLE R2-R', hideLabel: true },
            { type: 'solid', x: 1330, y: 1680, w: 220, h: 36, label: 'RECTANGLE R3-L', hideLabel: true },
            { type: 'solid', x: 1650, y: 1680, w: 220, h: 36, label: 'RECTANGLE R3-R', hideLabel: true },

            // I. 缓冲区通道倾斜重装甲北墙与南墙 (外接于房间左上防爆门，全长720px，净宽122px，倾斜角严格与斜门法线一致)
            {
                type: 'poly_wall',
                points: [
                    { x: 1110, y: 860 },
                    { x: 1107, y: 846 },
                    { x: 399, y: 976 },
                    { x: 402, y: 990 }
                ],
                label: 'BUFFER CORRIDOR NORTH ARMORED WALL',
                hideLabel: true
            },
            {
                type: 'poly_wall',
                points: [
                    { x: 1132, y: 980 },
                    { x: 1135, y: 994 },
                    { x: 427, y: 1124 },
                    { x: 424, y: 1110 }
                ],
                label: 'BUFFER CORRIDOR SOUTH ARMORED WALL',
                hideLabel: true
            }
        ];

        // =========================================================
        // 2. 道具与 Level 6 重型自动防爆门
        // =========================================================
        const props = [
            // 1. 中间房间蓝图与 3 大战术屏幕绘图 (BACKGROUND PROP FIRST)
            {
                x: 100,
                y: 400,
                w: 3000,
                h: 1650,
                noCollision: true,
                hideLabel: true,
                draw: (ctx) => {
                    ctx.save();

                    // --- 1. 中间大厅防静电科技地坪底色 ---
                    ctx.beginPath();
                    ctx.moveTo(1055, 470);
                    ctx.lineTo(2145, 470);
                    ctx.lineTo(2097, 820);
                    ctx.lineTo(1908, 1960);
                    ctx.lineTo(1292, 1960);
                    ctx.lineTo(1103, 820);
                    ctx.closePath();
                    ctx.fillStyle = '#0a101d';
                    ctx.fill();


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

                    // --- 4. LEVEL 7 翡翠装甲外墙多层强化结构与 4 扇侧门自然咬合系统 ---
                    ctx.save();

                    // =================================================================
                    // A. 4 扇侧门与斜外墙的高精度自然咬合装甲门套 (Slanted Heavy Door Jambs)
                    // 仅绘制门洞顶部和底部的门套箱，中央通行通道完全中空，由真实的重型自动门动态滑动开启
                    // =================================================================
                    const doorsData = [
                        { name: 'WEST UPPER', cx: 1128, cy: 920, angle: -0.1813, topX: 1117, topY: 860, botX: 1139, botY: 980 },
                        { name: 'WEST LOWER', cx: 1288.5, cy: 1835, angle: -0.173, topX: 1278, topY: 1775, botX: 1299, botY: 1895 },
                        { name: 'EAST UPPER', cx: 2072, cy: 920, angle: 0.1813, topX: 2083, topY: 860, botX: 2061, botY: 980 },
                        { name: 'EAST LOWER', cx: 1911.5, cy: 1835, angle: 0.173, topX: 1922, topY: 1775, botX: 1901, botY: 1895 }
                    ];

                    doorsData.forEach(d => {
                        ctx.save();
                        ctx.translate(d.cx, d.cy);
                        ctx.rotate(d.angle);

                        const halfH = 60;
                        const halfW = 12;

                        // 1. 顶部重型门套立柱与液压气动箱 (Level 7 翡翠军工装甲配色)
                        ctx.fillStyle = '#051914';
                        ctx.fillRect(-halfW - 4, -halfH - 8, halfW * 2 + 8, 10);
                        ctx.strokeStyle = '#10b981';
                        ctx.lineWidth = 1.6;
                        ctx.strokeRect(-halfW - 4, -halfH - 8, halfW * 2 + 8, 10);

                        // 顶部黄色斜纹安全警示标志
                        ctx.save();
                        ctx.beginPath();
                        ctx.rect(-halfW - 3, -halfH - 7, halfW * 2 + 6, 8);
                        ctx.clip();
                        ctx.fillStyle = '#f59e0b';
                        for (let sx = -halfW - 10; sx < halfW + 15; sx += 8) {
                            ctx.beginPath();
                            ctx.moveTo(sx, -halfH + 1);
                            ctx.lineTo(sx + 5, -halfH - 7);
                            ctx.lineTo(sx + 9, -halfH - 7);
                            ctx.lineTo(sx + 4, -halfH + 1);
                            ctx.closePath();
                            ctx.fill();
                        }
                        ctx.restore();

                        // 顶部液压活塞缸体
                        ctx.fillStyle = '#064e3b';
                        ctx.fillRect(-6, -halfH - 4, 12, 6);
                        ctx.strokeStyle = '#34d399';
                        ctx.lineWidth = 1;
                        ctx.strokeRect(-6, -halfH - 4, 12, 6);

                        // 2. 底部重型门套地梁与导向槽
                        ctx.fillStyle = '#051914';
                        ctx.fillRect(-halfW - 4, halfH - 2, halfW * 2 + 8, 10);
                        ctx.strokeStyle = '#10b981';
                        ctx.lineWidth = 1.6;
                        ctx.strokeRect(-halfW - 4, halfH - 2, halfW * 2 + 8, 10);

                        // 底部黄色斜纹警示
                        ctx.save();
                        ctx.beginPath();
                        ctx.rect(-halfW - 3, halfH - 1, halfW * 2 + 6, 8);
                        ctx.clip();
                        ctx.fillStyle = '#f59e0b';
                        for (let sx = -halfW - 10; sx < halfW + 15; sx += 8) {
                            ctx.beginPath();
                            ctx.moveTo(sx, halfH + 7);
                            ctx.lineTo(sx + 5, halfH - 1);
                            ctx.lineTo(sx + 9, halfH - 1);
                            ctx.lineTo(sx + 4, halfH + 7);
                            ctx.closePath();
                            ctx.fill();
                        }
                        ctx.restore();

                        // 两侧重型装甲卡槽护壁线
                        ctx.strokeStyle = '#064e3b';
                        ctx.lineWidth = 1.2;
                        ctx.beginPath();
                        ctx.moveTo(-halfW - 2, -halfH); ctx.lineTo(-halfW - 2, halfH);
                        ctx.moveTo(halfW + 2, -halfH); ctx.lineTo(halfW + 2, halfH);
                        ctx.stroke();

                        ctx.restore();
                    });

                    // =================================================================
                    // B. 斜外墙装甲钢板拼缝与战术能量导轨 (Armor Seams & Energy Conduit Lines)
                    // 严格保持平整外壁轮廓，不带有任何对外突出的锯齿
                    // =================================================================
                    // 1. 西侧长斜外墙装甲拼缝 (West Wall 2)
                    {
                        const outX1 = 1132, outY1 = 980, outX2 = 1271, outY2 = 1775;
                        const inX1 = 1146, inY1 = 980, inX2 = 1285, inY2 = 1775;
                        const steps = 18;
                        for (let i = 1; i < steps; i++) {
                            const t = i / steps;
                            const ox = outX1 + (outX2 - outX1) * t;
                            const oy = outY1 + (outY2 - outY1) * t;
                            const ix = inX1 + (inX2 - inX1) * t;
                            const iy = inY1 + (inY2 - inY1) * t;

                            ctx.strokeStyle = '#02120e';
                            ctx.lineWidth = 2;
                            ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ix, iy); ctx.stroke();

                            ctx.strokeStyle = '#34d399';
                            ctx.lineWidth = 0.8;
                            ctx.beginPath(); ctx.moveTo(ox + 0.5, oy + 0.5); ctx.lineTo(ix + 0.5, iy + 0.5); ctx.stroke();
                        }

                        // 墙体中心贯穿的翡翠绿战术能量光条
                        ctx.strokeStyle = 'rgba(16, 185, 129, 0.55)';
                        ctx.lineWidth = 1.4;
                        ctx.beginPath();
                        ctx.moveTo((outX1 + inX1) / 2, (outY1 + inY1) / 2);
                        ctx.lineTo((outX2 + inX2) / 2, (outY2 + inY2) / 2);
                        ctx.stroke();
                    }

                    // 2. 东侧长斜外墙装甲拼缝 (East Wall 2)
                    {
                        const outX1 = 2068, outY1 = 980, outX2 = 1929, outY2 = 1775;
                        const inX1 = 2054, inY1 = 980, inX2 = 1915, inY2 = 1775;
                        const steps = 18;
                        for (let i = 1; i < steps; i++) {
                            const t = i / steps;
                            const ox = outX1 + (outX2 - outX1) * t;
                            const oy = outY1 + (outY2 - outY1) * t;
                            const ix = inX1 + (inX2 - inX1) * t;
                            const iy = inY1 + (inY2 - inY1) * t;

                            ctx.strokeStyle = '#02120e';
                            ctx.lineWidth = 2;
                            ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ix, iy); ctx.stroke();

                            ctx.strokeStyle = '#34d399';
                            ctx.lineWidth = 0.8;
                            ctx.beginPath(); ctx.moveTo(ox - 0.5, oy + 0.5); ctx.lineTo(ix - 0.5, iy + 0.5); ctx.stroke();
                        }

                        ctx.strokeStyle = 'rgba(16, 185, 129, 0.55)';
                        ctx.lineWidth = 1.4;
                        ctx.beginPath();
                        ctx.moveTo((outX1 + inX1) / 2, (outY1 + inY1) / 2);
                        ctx.lineTo((outX2 + inX2) / 2, (outY2 + inY2) / 2);
                        ctx.stroke();
                    }

                    // 3. 南侧封底装甲墙拼装缝
                    {
                        for (let x = 1350; x < 1880; x += 45) {
                            ctx.strokeStyle = '#02120e';
                            ctx.lineWidth = 2;
                            ctx.beginPath(); ctx.moveTo(x, 1953); ctx.lineTo(x, 1967); ctx.stroke();
                            ctx.strokeStyle = '#34d399';
                            ctx.lineWidth = 0.8;
                            ctx.beginPath(); ctx.moveTo(x + 1, 1953); ctx.lineTo(x + 1, 1967); ctx.stroke();
                        }
                    }

                    ctx.restore();
                    ctx.restore();
                }
            },

            // =========================================================
            // 2. 4 扇 Level 6 重型自动防爆装甲门 (完全实装自动感应平移门系统，窄型紧凑装甲外壳，配色与 Level 7 一致)
            // 门体厚度设定为 14px，与 14px 重型装甲墙完美对齐，仅微凸 1px 保护边框，绝不臃肿
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
            // 3. 全新扇形战术主控台 (置于原被挡圆柱 (1350, 920) 与 (1850, 920) 位置，已删除正中与底部控制台)
            // =========================================================
            // 西侧主控台 (位于原西侧圆柱 1350, 920 位置)
            getSectorWorkstation(1350, 920, 0, 1.0, 'WEST SECTOR COMMAND CONSOLE'),
            // 东侧主控台 (位于原东侧圆柱 1850, 920 位置)
            getSectorWorkstation(1850, 920, 0, 1.0, 'EAST SECTOR COMMAND CONSOLE'),

            // =========================================================
            // 4. 全新三联方形隔间战术控制台 (完全依据手绘草稿 IMG_7697 规范制作：三联方形隔间、前部3连放大屏、键盘与左右按钮、后方与其他控制台同尺寸座椅、宽度273px为圆形台2.20倍)
            // 置于北侧中央开阔广场 (1600, 890) 核心指挥席位，面向北方大屏
            // =========================================================
            getTripleCubicleWorkstation(1600, 890, 0, 1.0, 'CENTRAL TRIPLE CUBICLE WORKSTATION'),
            getServerCluster(1600, 1865, 0, 1.0, 'TACTICAL 5-RACK SERVER CLUSTER'),

            // =========================================================
            // 5. 全新战术讲台 (完全依据手绘草稿 IMG_7701 规范设计与渲染)
            // 讲台主体长方形桌面与后方两侧护翼 (深色红木/黑胡桃木木纹质感)、朝后的鹅颈麦克风、Level 7 战术蓝屏平板电脑 (终端)、
            // 黑色半圆形底座支撑、整体蓝绿色外轮廓勾勒，比角色略大刚好能站上去。
            // 置于北侧中央演讲席位 (1600, 960)；角色出生于正后方入口 (1600, 995) 举步即可登台。
            // =========================================================
            getPodium(1600, 960, 0, 1.0, 'CENTRAL COMMAND PODIUM'),

            // =========================================================
            // 6. 全新更衣消毒缓冲通道综合系统 (依据手绘 IMG_7732 规范全倾斜外接)
            // 包含更衣区储物柜/洗手池/监控屏/正压防护服供氧软管、消毒区高压气流喷嘴/消毒液喷头/地面格栅集液槽/红绿指示灯
            // =========================================================
            {
                type: 'buffer_corridor_system',
                cx: 767,
                cy: 985,
                length: 720,
                width: 122,
                angle: 2.96027,
                airSpraying: false,
                liquidSpraying: false,
                sprayState: 'idle', // 'idle' | 'air_spray' | 'liquid_spray' | 'done'
                sprayTimer: 0,
                noCollision: true,
                hideLabel: true,
                draw: function(ctx) {
                    drawBufferCorridorSystem(ctx, this);
                }
            },

            // =========================================================
            // 7. 气密门1 (Airtight Door 1): 位于更衣区与消毒区之间 (机械转轮锁气密防爆门)
            // 靠近自动开门带转轮旋转；由更衣区进入消毒区后自动关闭，并触发身后关门与喷雾时序
            // =========================================================
            {
                type: 'airtight_wheel_door',
                id: 'airtight_door_1',
                cx: 767,
                cy: 985,
                topX: 756,
                topY: 925,
                botX: 778,
                botY: 1045,
                x: 756,
                y: 925,
                w: 22,
                h: 120,
                doorWidth: 122,
                doorHeight: 18,
                angle: 2.96027,
                openProgress: 0,
                wheelAngle: 0,
                isLocked: false,
                playerWasInDressing: true,
                label: 'AIRTIGHT WHEEL BLAST DOOR 1',
                displayName: 'AIRTIGHT BLAST DOOR',
                hideLabel: true,
                points: [
                    { x: 763, y: 924 },
                    { x: 749, y: 926 },
                    { x: 771, y: 1046 },
                    { x: 785, y: 1044 }
                ],
                draw: function(ctx) {
                    drawAirtightWheelDoor(ctx, this);
                }
            },

            // =========================================================
            // 8. 气密门2 (Airtight Door 2): 位于消毒区最外侧出口 (机械转轮锁气密防爆门)
            // 初始锁定，当高压气流喷嘴与消毒液喷头全部喷洒完毕后自动解锁并开启
            // =========================================================
            {
                type: 'airtight_wheel_door',
                id: 'airtight_door_2',
                cx: 413,
                cy: 1050,
                topX: 402,
                topY: 990,
                botX: 424,
                botY: 1110,
                x: 402,
                y: 990,
                w: 22,
                h: 120,
                doorWidth: 122,
                doorHeight: 18,
                angle: 2.96027,
                openProgress: 0,
                wheelAngle: 0,
                isLocked: true, // 初始锁定，等喷雾完成开启
                label: 'AIRTIGHT WHEEL BLAST DOOR 2',
                displayName: 'AIRTIGHT BLAST DOOR',
                hideLabel: true,
                points: [
                    { x: 409, y: 989 },
                    { x: 395, y: 991 },
                    { x: 417, y: 1111 },
                    { x: 431, y: 1109 }
                ],
                draw: function(ctx) {
                    drawAirtightWheelDoor(ctx, this);
                }
            },

            // =========================================================
            // 9. LEVEL 8 独立高精写实道具展示行 (STANDALONE PROPS SHOWCASE ROW)
            // 置于 LEVEL 8 中央开阔测试场 (y = 1380)，角色 Birth Point (1600, 1530) 直面这 5 个单独绘制的高精写实道具
            // 包含 5 大独立写实道具：储物柜、洗手池、掌纹和虹膜识别装置、监控屏幕、防毒面具
            // =========================================================
            {
                type: 'standalone_locker_showcase',
                cx: 1040,
                cy: 1380,
                x: 920, y: 1305, w: 240, h: 150,
                label: 'STANDALONE HAZMAT LOCKER',
                displayName: 'HAZMAT LOCKER',
                hideLabel: true,
                draw: function(ctx) { drawStandaloneLocker(ctx, this.cx, this.cy); }
            },
            {
                type: 'standalone_scrub_sink_showcase',
                cx: 1320,
                cy: 1380,
                x: 1200, y: 1305, w: 240, h: 150,
                label: 'STANDALONE SCRUB SINK',
                displayName: 'SCRUB SINK',
                hideLabel: true,
                draw: function(ctx) { drawStandaloneScrubSink(ctx, this.cx, this.cy); }
            },
            {
                type: 'standalone_biometric_terminal_showcase',
                cx: 1600,
                cy: 1380,
                x: 1480, y: 1305, w: 240, h: 150,
                label: 'STANDALONE BIOMETRIC TERMINAL',
                displayName: 'BIOMETRIC TERMINAL',
                hideLabel: true,
                draw: function(ctx) { drawStandaloneBiometricTerminal(ctx, this.cx, this.cy); }
            },
            {
                type: 'standalone_monitoring_screen_showcase',
                cx: 1880,
                cy: 1380,
                x: 1760, y: 1305, w: 240, h: 150,
                label: 'STANDALONE MONITORING SCREEN',
                displayName: 'MONITORING SCREEN',
                hideLabel: true,
                draw: function(ctx) { drawStandaloneMonitoringScreen(ctx, this.cx, this.cy); }
            },
            {
                type: 'standalone_gas_mask_showcase',
                cx: 2160,
                cy: 1380,
                x: 2040, y: 1305, w: 240, h: 150,
                label: 'STANDALONE GAS MASK SHOWCASE',
                displayName: 'GAS MASK SHOWCASE',
                hideLabel: true,
                draw: function(ctx) { drawStandaloneGasMask(ctx, this.cx, this.cy); }
            }
        ];

        return {
            obstacles: obstacles,
            securityGates: [],
            props: props,
            zones: [
                { name: "HEAVY ARMORED COMMAND CHAMBER (LEVEL 8 COPIED)", x: 1055, y: 830, w: 1090, h: 1130, labelX: 1600, labelY: 850, align: 'center' }
            ],
            waypoints: [
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
                { x: 1905, y: 1835 }
            ],
            cameras: [],
            lasers: []
        };
    }
};

window.LEVEL_8_TEST = LEVEL_8_TEST;
