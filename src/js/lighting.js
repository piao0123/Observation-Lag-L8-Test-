// ============================================================================
// 《视界滞后》光照增强 mod —— 第一关（机场）
// 设计原则（2026-11-01 用户最新指示）：
//   - 不做全局压暗、不改变原有画面基调，只做加法点缀；
//   - 范围限定：摄像头 / 主角 / 敌人的视锥辉光增强（与原版同色）；
//   - 主角身上不加光斑；指示灯微光已删（效果不达标）。
// 由 engine.js 在世界绘制末尾调用 window.__drawLightingPass(ctx, {...})。
// 按 L 键开关。几何函数通过 window.__lightingGeom 暴露，便于单元测试。
// ============================================================================

// ---- 可见报错条（调试用：把 JS 报错直接显示在页面左下角） ----
(function () {
  if (window.__errCatcherOn) return;
  window.__errCatcherOn = true;
  var box = null;
  function show(msg) {
    try {
      if (!box) {
        box = document.createElement('div');
        box.style.cssText = 'position:fixed;left:8px;bottom:8px;z-index:99999;max-width:62%;background:rgba(140,0,0,.93);color:#fff;font:12px/1.5 monospace;padding:8px 10px;border-radius:6px;white-space:pre-wrap;pointer-events:none;';
        document.body.appendChild(box);
      }
      box.textContent = (box.textContent + '\n' + msg).slice(-900);
    } catch (e) {}
  }
  window.addEventListener('error', function (e) { show('ERR: ' + (e.message || e.error)); });
  window.addEventListener('unhandledrejection', function (e) { show('REJ: ' + ((e.reason && e.reason.message) || e.reason)); });
  window.__showErr = show;
})();

(function () {
  'use strict';

  var enabled = true;
  var hintShown = false;

  if (typeof window !== 'undefined' && window.addEventListener) {
    window.addEventListener('keydown', function (e) {
      if (e.code === 'KeyL' && !e.repeat) {
        enabled = !enabled;
        if (typeof window.addLog === 'function') {
          try { window.addLog('光照增强 ' + (enabled ? '开' : '关') + '（L）'); } catch (err) {}
        }
      }
    });
  }

  // ---- 射线 (px,py)+t*(dx,dy) 与线段 (ax,ay)-(bx,by) 求交，返回 t 或 Infinity ----
  function raySegT(px, py, dx, dy, ax, ay, bx, by) {
    var ex = bx - ax, ey = by - ay;
    var den = dx * ey - dy * ex;
    if (Math.abs(den) < 1e-9) return Infinity;
    var qx = ax - px, qy = ay - py;
    var t = (qx * ey - qy * ex) / den;
    var u = (qx * dy - qy * dx) / den;
    if (t > 1e-4 && u >= 0 && u <= 1) return t;
    return Infinity;
  }

  // ---- 矩形障碍 -> 线段集（玻璃/矮墙不挡光） ----
  function buildSegments(obstacles, props) {
    var segs = [];
    function rect(x, y, w, h) {
      segs.push([x, y, x + w, y], [x + w, y, x + w, y + h],
                [x + w, y + h, x, y + h], [x, y + h, x, y]);
    }
    var i, o;
    for (i = 0; i < (obstacles || []).length; i++) {
      o = obstacles[i];
      if (!o || o.type === 'glass' || o.type === 'low_wall') continue;
      if (o.points && o.points.length >= 2) {
        // 多边形障碍（L0/L7/L8）：逐边转线段，首尾闭合
        for (var k = 0; k < o.points.length; k++) {
          var a = o.points[k], b = o.points[(k + 1) % o.points.length];
          segs.push([a.x, a.y, b.x, b.y]);
        }
      } else if (o.circle) {
        // 圆形障碍（L7/L8 中央会议桌）：按引擎惯例用 48 边形逼近
        var cc = o.circle, N = 48;
        for (var m = 0; m < N; m++) {
          var a1 = (m * Math.PI * 2) / N, a2 = ((m + 1) % N) * Math.PI * 2 / N;
          segs.push([cc.cx + Math.cos(a1) * cc.radius, cc.cy + Math.sin(a1) * cc.radius,
                     cc.cx + Math.cos(a2) * cc.radius, cc.cy + Math.sin(a2) * cc.radius]);
        }
      } else {
        rect(o.x, o.y, o.w, o.h);
      }
    }
    for (i = 0; i < (props || []).length; i++) {
      o = props[i];
      if (!o) continue;
      if (o.type === 'desk' || o.type === 'conveyor') rect(o.x, o.y, o.w, o.h);
    }
    return segs;
  }

  // ---- 可见多边形（带阴影的光照范围）；aMin/aMax 缺省 = 360° ----
  function visibilityPolygon(lx, ly, segs, maxR, aMin, aMax) {
    var angs = [], seen = {}, i, s, p, key, a, k;
    var hasCone = (typeof aMin === 'number' && typeof aMax === 'number');
    for (i = 0; i < segs.length; i++) {
      s = segs[i];
      var ends = [[s[0], s[1]], [s[2], s[3]]];
      for (k = 0; k < 2; k++) {
        p = ends[k];
        key = p[0].toFixed(1) + ',' + p[1].toFixed(1);
        if (seen[key]) continue;
        seen[key] = 1;
        a = Math.atan2(p[1] - ly, p[0] - lx);
        if (hasCone) {
          while (a < aMin) a += Math.PI * 2;
          while (a >= aMin + Math.PI * 2) a -= Math.PI * 2;
          if (a < aMin - 1e-3 || a > aMax + 1e-3) continue;
        }
        angs.push(a - 0.0006, a, a + 0.0006);
      }
    }
    if (hasCone) {
      angs.push(aMin, aMax);
      // 视锥内无障碍物顶点时只有两条射线，多边形退化成线、画不出辉光；
      // 补 7 个中间采样角，保证扇形始终有面积（射线仍会被障碍物截断，遮挡不变）
      var span = aMax - aMin;
      for (k = 1; k < 8; k++) angs.push(aMin + span * k / 8);
    } else {
      for (k = 0; k < 24; k++) angs.push(k * Math.PI * 2 / 24);
    }
    var pts = [];
    for (i = 0; i < angs.length; i++) {
      a = angs[i];
      var dx = Math.cos(a), dy = Math.sin(a), best = maxR, j, t;
      for (j = 0; j < segs.length; j++) {
        s = segs[j];
        t = raySegT(lx, ly, dx, dy, s[0], s[1], s[2], s[3]);
        if (t < best) best = t;
      }
      pts.push([a, lx + dx * best, ly + dy * best]);
    }
    pts.sort(function (p1, p2) { return p1[0] - p2[0]; });
    var out = [[lx, ly]];
    for (i = 0; i < pts.length; i++) out.push([pts[i][1], pts[i][2]]);
    return out;
  }

  function fillPoly(ctx, poly) {
    if (!poly.length) return;
    ctx.beginPath();
    ctx.moveTo(poly[0][0], poly[0][1]);
    for (var i = 1; i < poly.length; i++) ctx.lineTo(poly[i][0], poly[i][1]);
    ctx.closePath();
    ctx.fill();
  }

  var lastT = 0;

  // ---- 游艇水下灯发射点（与引擎手画光束同源） ----
  // [bx, by, angleDeg, length] —— 与引擎 drawLightBeam 调用一致
  var YACHT_BEAMS = [
    [50,50,-135,340],[50,670,135,340],
    [44,180,175,320],[44,300,180,360],[44,420,180,360],[44,540,185,320],
    [160,44,-105,300],[280,44,-95,300],[160,676,105,300],[280,676,95,300],
    [1800,60,-115,300],[1950,140,-95,320],[2100,220,-75,340],[2250,300,-55,360],
    [1800,660,115,300],[1950,580,95,320],[2100,500,75,340],[2250,420,55,360],
    [2350,352,-15,380],[2350,360,0,440],[2350,368,15,380]
  ];
  var pulses = [];

  // ---- 游艇水下灯增强：灯源呼吸 + 海洋雪 + 折射光带 ----
  function drawYachtLights(ctx, G, now, dt) {
    var cx0 = G.cameraX || 0, cy0 = G.cameraY || 0;
    var W = G.width, H = G.height;
    ctx.globalCompositeOperation = 'lighter';
    var i, bx, by, g;

    // 1) 灯源呼吸辉光（只画视野内的）
    // 2026-11-01：用户反馈太亮，整体调暗约40%
    for (i = 0; i < YACHT_BEAMS.length; i++) {
      bx = YACHT_BEAMS[i][0]; by = YACHT_BEAMS[i][1];
      if (bx < cx0 - 150 || bx > cx0 + W + 150 || by < cy0 - 150 || by > cy0 + H + 150) continue;
      var br = 0.55 + 0.38 * Math.sin(now / 900 + i * 1.7);
      g = ctx.createRadialGradient(bx, by, 4, bx, by, 95);
      g.addColorStop(0, 'rgba(190,255,250,' + (0.47 * br).toFixed(3) + ')');
      g.addColorStop(0.4, 'rgba(60,220,230,' + (0.25 * br).toFixed(3) + ')');
      g.addColorStop(1, 'rgba(20,150,170,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(bx, by, 95, 0, Math.PI * 2); ctx.fill();
    }

    // 2) 光脉冲：亮点沿光束从灯头向外涌动
    if (Math.random() < 0.10 && pulses.length < 24) {
      pulses.push({ b: (Math.random() * YACHT_BEAMS.length) | 0, t: 0, sp: 0.45 + Math.random() * 0.4 });
    }
    for (i = pulses.length - 1; i >= 0; i--) {
      var pu = pulses[i];
      pu.t += pu.sp * dt;
      if (pu.t >= 1) { pulses.splice(i, 1); continue; }
      var B = YACHT_BEAMS[pu.b];
      var rad = B[2] * Math.PI / 180;
      var px2 = B[0] + Math.cos(rad) * B[3] * pu.t;
      var py2 = B[1] + Math.sin(rad) * B[3] * pu.t;
      if (px2 < cx0 - 60 || px2 > cx0 + W + 60 || py2 < cy0 - 60 || py2 > cy0 + H + 60) continue;
      var pa = (1 - pu.t) * 0.36;
      var pg = ctx.createRadialGradient(px2, py2, 2, px2, py2, 48);
      pg.addColorStop(0, 'rgba(225,255,255,' + pa.toFixed(3) + ')');
      pg.addColorStop(0.5, 'rgba(90,230,240,' + (pa * 0.5).toFixed(3) + ')');
      pg.addColorStop(1, 'rgba(60,200,220,0)');
      ctx.fillStyle = pg;
      ctx.beginPath(); ctx.arc(px2, py2, 48, 0, Math.PI * 2); ctx.fill();
    }

    // 3) 折射光带：缓慢漂移的波光
    for (i = 0; i < 3; i++) {
      var yy = cy0 + H * (0.25 + 0.25 * i) + Math.sin(now / 1600 + i * 2.1) * 30;
      ctx.save();
      ctx.translate(cx0 + W / 2, yy);
      ctx.rotate(-0.08);
      var gg = ctx.createLinearGradient(0, -60, 0, 60);
      var ca = 0.08 + 0.035 * Math.sin(now / 1200 + i);
      gg.addColorStop(0, 'rgba(40,200,220,0)');
      gg.addColorStop(0.5, 'rgba(40,200,220,' + ca.toFixed(3) + ')');
      gg.addColorStop(1, 'rgba(40,200,220,0)');
      ctx.fillStyle = gg;
      ctx.fillRect(-W / 2 - 40, -50, W + 80, 100);
      ctx.restore();
    }
  }

  // ---- 视锥辉光增强（与原版同色，加法叠加提鲜艳度） ----
  // 原版已用 drawTacticalFOV 画出带阴影遮挡的视锥，这里只在上面加一层同色辉光。
  function coneGlow(ctx, x, y, angle, halfAngle, R, segs, rgb, peakA) {
    var poly = visibilityPolygon(x, y, segs, R, angle - halfAngle, angle + halfAngle);
    var g = ctx.createRadialGradient(x, y, 8, x, y, R);
    g.addColorStop(0, 'rgba(' + rgb + ',' + peakA.toFixed(2) + ')');
    g.addColorStop(0.7, 'rgba(' + rgb + ',' + (peakA * 0.38).toFixed(2) + ')');
    g.addColorStop(1, 'rgba(' + rgb + ',0)');
    ctx.fillStyle = g;
    fillPoly(ctx, poly);
  }

  // 敌人视锥颜色（与原版 drawTacticalFOV 配色一致）
  function enemyConeColor(e) {
    if (e.alert) return e.isDemon ? '255,34,0' : '255,51,51';
    if (e.isDemon) return '249,115,22';
    if (e.isJammer) return '168,85,247';
    if (e.isObserver) return '0,204,255';
    return '255,185,0';
  }

  // ---- Level 0：岩浆高温 / 冰湖寒气 ----
  function pointInPoly(x, y, pts) {
    var inside = false, i, j;
    for (i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      var xi = pts[i].x, yi = pts[i].y, xj = pts[j].x, yj = pts[j].y;
      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) inside = !inside;
    }
    return inside;
  }

  function drawLevel0Thermo(ctx, G, now) {
    var obss = G.obstacles || [];
    var t = now / 1000;
    var parts = (typeof window !== 'undefined' && window.particles) ? window.particles : null;
    ctx.globalCompositeOperation = 'lighter';
    var i, k, o, pt;
    for (i = 0; i < obss.length; i++) {
      o = obss[i];
      if (!o || !o.points || !o.points.length) continue;
      var isLava = o.type === 'lava';
      var isIce = o.type === 'ice_lake' || o.type === 'ice';
      if (!isLava && !isIce) continue;
      // 包围盒
      var minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9;
      for (k = 0; k < o.points.length; k++) {
        pt = o.points[k];
        if (pt.x < minX) minX = pt.x; if (pt.x > maxX) maxX = pt.x;
        if (pt.y < minY) minY = pt.y; if (pt.y > maxY) maxY = pt.y;
      }
      // 辉光：沿多边形呼吸填充
      ctx.beginPath();
      ctx.moveTo(o.points[0].x, o.points[0].y);
      for (k = 1; k < o.points.length; k++) ctx.lineTo(o.points[k].x, o.points[k].y);
      ctx.closePath();
      if (isLava) {
        var pulse = 0.5 + 0.5 * Math.sin(t * 2.4 + minX * 0.013);
        ctx.fillStyle = 'rgba(255,' + Math.floor(70 + 50 * pulse) + ',0,' + (0.10 + 0.09 * pulse).toFixed(3) + ')';
      } else {
        var chill = 0.5 + 0.5 * Math.sin(t * 0.9 + minY * 0.01);
        ctx.fillStyle = 'rgba(140,190,255,' + (0.07 + 0.05 * chill).toFixed(3) + ')';
      }
      ctx.fill();
      // 粒子：火星/蒸汽上升，寒气贴地漂移
      if (parts && parts.length < 420) {
        var px = minX + Math.random() * (maxX - minX);
        var py = minY + Math.random() * (maxY - minY);
        if (!pointInPoly(px, py, o.points)) continue;
        if (isLava) {
          if (Math.random() < 0.55) {
            parts.push({ x: px, y: py, vx: (Math.random() - 0.5) * 0.7, vy: -0.9 - Math.random() * 1.1,
              life: 45, maxLife: 45, size: 1.2 + Math.random() * 1.8,
              color: ['#ffd23f', '#ff9f1c', '#ff5500'][Math.floor(Math.random() * 3)] });
          } else if (Math.random() < 0.5) {
            parts.push({ x: px, y: py, vx: (Math.random() - 0.5) * 0.5, vy: -0.5 - Math.random() * 0.6,
              life: 80, maxLife: 80, size: 3 + Math.random() * 4, color: 'rgba(210,210,215,0.35)' });
          }
        } else if (Math.random() < 0.4) {
          parts.push({ x: px, y: py, vx: (Math.random() - 0.5) * 0.8, vy: -0.15 - Math.random() * 0.25,
            life: 110, maxLife: 110, size: 2.5 + Math.random() * 3.5, color: 'rgba(170,210,255,0.30)' });
        }
      }
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  var frameCount = 0, accMs = 0;

  function drawLightingPass(ctx, G) {
    if (!enabled) return;
    if (!ctx || !G) return;
    var lid = G.levelId;
    // 2026-11-01：通用视锥辉光适用于所有关卡；游艇光束与 L0 冰火为关卡专属
    if (!lid) return;
    if (!hintShown) {
      hintShown = true;
      if (typeof window.addLog === 'function') {
        try { window.addLog('光照增强已开启（按 L 开关）'); } catch (err) {}
      }
    }
    var t0 = (typeof performance !== 'undefined' ? performance.now() : Date.now());
    var now = t0;
    var dt = lastT ? Math.min(0.05, (now - lastT) / 1000) : 0.016;
    lastT = now;

    ctx.save();
    try {
      // 关卡专属：游艇光束 / L0 冰火（与其他效果叠加）
      if (lid === 'level4_yacht') {
        drawYachtLights(ctx, G, now, dt);
      } else if (lid === 'level0_test') {
        drawLevel0Thermo(ctx, G, now);
      }
      // 通用：所有关卡的视锥辉光增强（不压暗，只做加法点缀）
      var segs = buildSegments(G.obstacles, G.props);
      ctx.globalCompositeOperation = 'lighter';
      var i, cam, a;

      // 1) 监控锥形光辉光增强（与原版 #00FF66 / #FF3333 同色）
      var cams = G.cameras || [];
      for (i = 0; i < cams.length; i++) {
        cam = cams[i];
        if (!cam) continue;
        // 2026-11-02：盲区内无光影——摄像头在盲区内不画辉光
        if (cam.__inBlindZone) continue;
        a = cam.currentAngle || 0;
        // 2026-11-07：L0 三种地狱装置之前被 type 过滤整批跳过、辉光全无；按各自原色给辉光，顶点移到眼睛处
        if (cam.type === 'soul_lantern' || cam.type === 'gargoyle_sentinel' || cam.type === 'infernal_eye') {
          var wHalf = (typeof cam.fovAngle === 'number' && cam.fovAngle > 0) ? cam.fovAngle / 2 : 0.42;
          var wRange = (typeof cam.fovRange === 'number' && cam.fovRange > 0) ? cam.fovRange : 450;
          var wOff = cam.type === 'soul_lantern' ? 18 : cam.type === 'gargoyle_sentinel' ? 7 : 3.5;
          var wRgb = cam.type === 'soul_lantern'
              ? (cam.detecting ? '168,85,247' : '56,189,248')
              : cam.type === 'gargoyle_sentinel'
              ? (cam.detecting ? '239,68,68' : '249,115,22')
              : (cam.detecting ? '255,17,34' : '239,68,68');
          // Level 0 地狱装置视野不受岩石障碍物遮挡，光影辉光传空线段集 []，不被岩石截断
          coneGlow(ctx, cam.x + Math.cos(a) * wOff, cam.y + Math.sin(a) * wOff, a, wHalf, wRange, [], wRgb, 0.42);
        } else if (!cam.type || cam.type === 'default') {
          // 2026-11-07：辉光顶点跟视锥走，移到镜头处（前方 16.5px）
          coneGlow(ctx, cam.x + Math.cos(a) * 16.5, cam.y + Math.sin(a) * 16.5, a, 0.45, 330, segs,
                   cam.detecting ? '255,51,51' : '0,255,102', 0.42);
        }
      }

      // 2) 主角视锥辉光增强（原版已画带阴影视锥，这里加同色辉光；主角身上不再加光斑）
      var pl = G.player;
      // 2026-11-02：盲区内无光影——玩家在盲区内不画辉光
      if (pl && typeof pl.x === 'number' && pl.hp > 0 && !pl.__inBlindZone) {
        var pfov = (typeof pl.fov === 'number' && pl.fov > 0) ? pl.fov : Math.PI / 2.2;
        var pdist = (typeof pl.viewDistance === 'number' && pl.viewDistance > 0) ? pl.viewDistance : 500;
        var pa = pl.angle || 0;
        // 2026-11-07：L0 玩家视锥是红的，辉光改红跟锥走（之前是绿，叠出来暗黄）；其他关保持绿
        // 2026-11-07：辉光顶点跟视锥走，移到眼睛处（前方 10px）
        var pRgb = (lid === 'level0_test') ? '255,51,68' : '0,255,102';
        coneGlow(ctx, pl.x + Math.cos(pa) * 10, pl.y + Math.sin(pa) * 10, pa, pfov / 2, pdist, segs, pRgb, 0.25);
      }

      // 3) 敌人视锥辉光增强（与原版各状态配色一致）
      var ens = G.enemies || [];
      var cx0 = G.cameraX || 0, cy0 = G.cameraY || 0, W = G.width || 1280, H = G.height || 800;
      for (i = 0; i < ens.length; i++) {
        var e = ens[i];
        if (!e || typeof e.x !== 'number' || typeof e.y !== 'number') continue;
        if (typeof e.hp === 'number' && e.hp <= 0) continue;
        // 玩家视线没扫到敌人时，不画它的视锥辉光（避免割裂感）
        if (e.__visibleToPlayer === false) continue;
        // 2026-11-02：盲区内敌人不画视锥辉光（视野大幅缩小，再画光影显得乱）
        if (e.__inBlindZone) continue;
        // 视口外裁剪
        if (e.x < cx0 - 400 || e.x > cx0 + W + 400 || e.y < cy0 - 400 || e.y > cy0 + H + 400) continue;
        // 2026-11-07：辉光顶点跟视锥走，移到眼睛处（恶魔 4px，其余 10px）；锥角/锥距跟实际视锥走（之前写死 60°/260，三头犬只盖一半）
        var ea = e.angle || 0;
        var eOff = e.isDemon ? 4 : 10;
        var eHalf = (typeof e.__fovAngle === 'number' && e.__fovAngle > 0) ? e.__fovAngle / 2 : (Math.PI / 3) / 2;
        var eRange = (typeof e.__fovRange === 'number' && e.__fovRange > 0) ? e.__fovRange : 260;
        coneGlow(ctx, e.x + Math.cos(ea) * eOff, e.y + Math.sin(ea) * eOff, ea, eHalf, eRange, segs, enemyConeColor(e), 0.25);
      }
    } finally {
      ctx.globalCompositeOperation = 'source-over';
      ctx.restore();
    }

    // 性能采样（每 120 帧控制台输出一次）
    var dt = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - t0;
    accMs += dt; frameCount++;
    if (frameCount >= 120) {
      if (typeof console !== 'undefined' && console.log) {
        console.log('[lighting] avg ' + (accMs / frameCount).toFixed(2) + 'ms/frame');
      }
      frameCount = 0; accMs = 0;
    }
  }

  if (typeof window !== 'undefined') {
    window.__drawLightingPass = drawLightingPass;
    window.__lightingGeom = {
      raySegT: raySegT,
      visibilityPolygon: visibilityPolygon,
      buildSegments: buildSegments
    };
  }
})();
