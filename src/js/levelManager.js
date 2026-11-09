// 负责切换与管理场景关卡
class LevelManager {
    constructor() {
        this.levels = [];
        this.currentIndex = 0;
    }

    // 包含第0关（测试关卡地狱深渊）、第1关（机场）、第2关（地铁）、第3关（银行）、第4关（游艇）、第5关（酒店）、第6关（列车）、第7关（科研）
    getLevels() {
        if (!this.levels || this.levels.length === 0) {
            this.levels = [
                (typeof LEVEL_TEST !== 'undefined' ? LEVEL_TEST : window.LEVEL_TEST),
                (typeof LEVEL_AIRPORT !== 'undefined' ? LEVEL_AIRPORT : window.LEVEL_AIRPORT),
                (typeof LEVEL_SUBWAY !== 'undefined' ? LEVEL_SUBWAY : window.LEVEL_SUBWAY),
                (typeof LEVEL_BANK !== 'undefined' ? LEVEL_BANK : window.LEVEL_BANK),
                (typeof LEVEL_YACHT !== 'undefined' ? LEVEL_YACHT : window.LEVEL_YACHT),
                (typeof LEVEL_HOTEL !== 'undefined' ? LEVEL_HOTEL : window.LEVEL_HOTEL),
                (typeof LEVEL_TRAIN !== 'undefined' ? LEVEL_TRAIN : window.LEVEL_TRAIN),
                (typeof LEVEL_LAB !== 'undefined' ? LEVEL_LAB : window.LEVEL_LAB),
                (typeof LEVEL_8_TEST !== 'undefined' ? LEVEL_8_TEST : window.LEVEL_8_TEST)
            ].filter(Boolean);
        }
        return this.levels;
    }

    // 测试关卡（Level 0 远东装甲列车）已安全隐藏，仅供开发测试调用
    loadTestLevel() {
        const testLvl = (typeof LEVEL_TEST !== 'undefined' ? LEVEL_TEST : window.LEVEL_TEST);
        if (!testLvl) return;
        this.levels = [testLvl, ...this.getLevels()];
        this.currentIndex = 0;
        this.loadCurrentLevel();
        if (typeof addLog === 'function') {
            addLog(`[开发调试] 测试关卡已载入: ${testLvl.name}`);
        }
    }

    getCurrentLevel() {
        const levels = this.getLevels();
        return levels[this.currentIndex] || levels[0];
    }

    loadCurrentLevel() {
        const level = this.getCurrentLevel();
        if (!level) return;

        if (typeof document !== 'undefined' && document.body) {
            document.body.setAttribute('data-level', level.id);
        }

        let w = 1280;
        let h = 720;
        if (level.id === 'level0_test') { w = window.level0MapWidth || 3200; h = window.level0MapHeight || 1000; }
        else if (level.id === 'level6_train') { w = window.level6MapWidth || 7200; h = window.level6MapHeight || 240; }
        else if (level.id === 'level4_yacht') { w = window.level4MapWidth || 2400; h = 720; }
        else if (level.id === 'level7_lab') { w = window.level7MapWidth || 3200; h = window.level7MapHeight || 2400; }
        else if (level.id === 'level8_test') { w = window.level8MapWidth || 3200; h = window.level8MapHeight || 2400; }

        const layout = level.getMapLayout(w, h);

        const obs = layout.obstacles || [];
        const sec = layout.securityGates || [];
        const prp = layout.props || [];
        const zns = layout.zones || [];
        const way = layout.waypoints || [];
        const cam = layout.cameras || [];
        if (Array.isArray(cam)) {
            cam.forEach(c => {
                if (c.currentAngle === undefined || isNaN(c.currentAngle)) {
                    c.currentAngle = c.baseAngle || 0;
                }
                if (c.sweepTimer === undefined || isNaN(c.sweepTimer)) {
                    c.sweepTimer = 0;
                }
                c.detecting = false;
            });
        }
        const lsr = layout.lasers || [];

        if (typeof setMapData === 'function') {
            setMapData(obs, sec, prp, zns, way, cam, lsr);
        } else if (typeof window.setMapData === 'function') {
            window.setMapData(obs, sec, prp, zns, way, cam, lsr);
        }

        const p = (typeof player !== 'undefined' ? player : window.player);
        if (p && level.playerStart) {
            p.x = level.playerStart.x;
            p.y = level.playerStart.y;

            if (level.id === 'level3_bank') {
                p.viewDistance = 250;
                if (typeof initBankRevealGrid === 'function') {
                    initBankRevealGrid();
                } else if (typeof window.initBankRevealGrid === 'function') {
                    window.initBankRevealGrid();
                }
            } else {
                p.viewDistance = 500;
            }
        }

        if (typeof window.snapCameraToPlayer === 'function') {
            window.snapCameraToPlayer();
        }

        if (typeof addLog === 'function') {
            addLog(`已加载地图: ${level.name}`);
        } else if (typeof window.addLog === 'function') {
            window.addLog(`已加载地图: ${level.name}`);
        }
    }

    nextLevel() {
        const levels = this.getLevels();
        if (this.currentIndex + 1 < levels.length) {
            this.currentIndex++;
            this.loadCurrentLevel();
            return true;
        }
        return false; // 已无更多关卡
    }
}

const levelManager = new LevelManager();
window.levelManager = levelManager;

