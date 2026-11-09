// ============================================================
// juice.js — 打击感 Game Feel Pack（加法模块，不改原有逻辑）
// 包含：创伤值震屏、枪口火光、命中火花、伤害数字、击杀顿帧
// 2026-10-31
// ============================================================
(function () {
    'use strict';

    // ---------- 1. 震屏（创伤值系统） ----------
    // trauma 0~1，衰减；实际位移 = trauma^2 * maxShake，用平方让小震动更柔和
    let trauma = 0;
    const MAX_SHAKE = 22;

    window.__juiceAddTrauma = function (amount) {
        trauma = Math.min(1, trauma + amount);
    };

    // 每帧由游戏循环调用（在 gameLoop 的 update 之前）
    window.__juiceTick = function (dt) {
        // 创伤衰减：约 0.9 秒完全恢复
        trauma = Math.max(0, trauma - dt * 1.1);
    };

    // draw() 里相机 translate 之后调用，返回 [shakeX, shakeY]
    window.__juiceGetShake = function () {
        if (trauma <= 0.001) return null;
        const s = trauma * trauma * MAX_SHAKE;
        const t = (typeof performance !== 'undefined' ? performance.now() : Date.now()) / 1000;
        // 用多频正弦合成伪噪声，避免随机抖动的生硬感
        const sx = s * (Math.sin(t * 91.7) * 0.6 + Math.sin(t * 47.3 + 1.7) * 0.4);
        const sy = s * (Math.cos(t * 83.1 + 0.6) * 0.6 + Math.cos(t * 53.9 + 2.9) * 0.4);
        return [sx, sy];
    };

    // ---------- 2. 顿帧（击杀时） ----------
    let hitstopFrames = 0;
    window.__juiceHitstop = function (frames) {
        // 取最大，避免连续击杀时互相覆盖缩短
        hitstopFrames = Math.max(hitstopFrames, frames);
    };
    // gameLoop 调用：返回 true 表示本帧跳过 update（只 draw）
    window.__juiceShouldSkipUpdate = function () {
        if (hitstopFrames > 0) {
            hitstopFrames--;
            return true;
        }
        return false;
    };

    // ---------- 3. 枪口火光 ----------
    // 由 shoot() 在 playShoot 后调用
    window.__juiceMuzzle = function (x, y, angle) {
        var P = (typeof window !== 'undefined' && window.particles) || [];
        const mx = x + Math.cos(angle) * 26;
        const my = y + Math.sin(angle) * 26;
        // 核心亮斑
        for (let i = 0; i < 3; i++) {
            P.push({
                x: mx + (Math.random() - 0.5) * 6,
                y: my + (Math.random() - 0.5) * 6,
                vx: Math.cos(angle + (Math.random() - 0.5) * 0.9) * (3 + Math.random() * 4),
                vy: Math.sin(angle + (Math.random() - 0.5) * 0.9) * (3 + Math.random() * 4),
                life: 4 + Math.random() * 3, maxLife: 7,
                color: Math.random() < 0.5 ? '#fff7cc' : '#ffd23f',
                size: 3.5
            });
        }
        // 放射火星
        for (let i = 0; i < 4; i++) {
            const a = angle + (Math.random() - 0.5) * 1.2;
            P.push({
                x: mx, y: my,
                vx: Math.cos(a) * (5 + Math.random() * 7),
                vy: Math.sin(a) * (5 + Math.random() * 7),
                life: 6 + Math.random() * 6, maxLife: 12,
                color: Math.random() < 0.4 ? '#ff9f1c' : '#ffe66d',
                size: 2
            });
        }
    };

    // ---------- 4. 命中火花（子弹打中敌人时） ----------
    window.__juiceHitSpark = function (x, y, fromAngle) {
        var P = (typeof window !== 'undefined' && window.particles) || [];
        for (let i = 0; i < 5; i++) {
            const a = fromAngle + Math.PI + (Math.random() - 0.5) * 1.6;
            P.push({
                x: x, y: y,
                vx: Math.cos(a) * (2 + Math.random() * 5),
                vy: Math.sin(a) * (2 + Math.random() * 5),
                life: 5 + Math.random() * 7, maxLife: 12,
                color: ['#ffffff', '#ffd23f', '#ff9f1c'][Math.floor(Math.random() * 3)],
                size: 2
            });
        }
    };

    // ---------- 5. 伤害数字 ----------
    const dmgNums = [];
    window.__juiceDamageNumber = function (x, y, amount, isKill) {
        if (dmgNums.length > 40) dmgNums.shift();
        dmgNums.push({
            x: x + (Math.random() - 0.5) * 16,
            y: y - 14,
            vy: -1.6,
            life: 42, maxLife: 42,
            text: String(Math.round(amount)),
            color: isKill ? '#ff5252' : '#ffffff',
            size: isKill ? 17 : 13
        });
    };
    // draw() 世界绘制末尾调用（在 restore 之前）
    window.__juiceDrawNumbers = function (ctx) {
        if (dmgNums.length === 0) return;
        ctx.save();
        ctx.textAlign = 'center';
        for (let i = dmgNums.length - 1; i >= 0; i--) {
            const d = dmgNums[i];
            d.y += d.vy;
            d.vy *= 0.96;
            d.life--;
            if (d.life <= 0) { dmgNums.splice(i, 1); continue; }
            const alpha = Math.min(1, d.life / 14);
            ctx.globalAlpha = alpha;
            ctx.font = 'bold ' + d.size + 'px monospace';
            // 2026-11-01：原版 UI 文字无描边，粗描边显贴纸感，改细
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = 'rgba(0,0,0,0.6)';
            ctx.strokeText(d.text, d.x, d.y);
            ctx.fillStyle = d.color;
            ctx.fillText(d.text, d.x, d.y);
        }
        ctx.restore();
    };

    // ---------- 6. 受击反馈（敌人被子弹命中时的通用入口） ----------
    // 在 applyDamageToEnemy 内调用：火花 + 伤害数字 + 击杀顿帧/震屏
    window.__juiceOnEnemyDamaged = function (enemy, amount, wasAlive, isDead) {
        const pl = (typeof window !== 'undefined' && window.player) || null;
        const ang = pl ? Math.atan2(enemy.y - pl.y, enemy.x - pl.x) : 0;
        window.__juiceHitSpark(enemy.x, enemy.y, ang);
        // 2026-11-01：伤害数字移除，用户自己做（__juiceDamageNumber 保留作参考）
        if (isDead && wasAlive) {
            window.__juiceHitstop(3);          // 击杀顿帧（保留，震屏只在爆炸时）
        }
    };

    // ---------- 7. 玩家受击 ----------
    // 2026-11-01：震屏只在爆炸时触发，这里只保留顿帧
    window.__juiceOnPlayerHit = function () {
        window.__juiceHitstop(2);
    };
})();
