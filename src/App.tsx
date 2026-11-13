/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  Crosshair,
  RotateCcw,
  Shield,
  Zap,
  Terminal,
  Play,
  Pause,
  Home,
  BookOpen,
  MapPin,
  AlertTriangle,
  Flame,
  Globe,
  Languages,
  CheckCircle,
  ArrowRight,
  Award,
} from 'lucide-react';
import { Language, translations } from './translations';
import { GAME_CONFIG } from './gameConfig';

interface PrologueScreenProps {
  onSkip: () => void;
  lang: Language;
  onToggleLang: () => void;
}

const PrologueScreen: React.FC<PrologueScreenProps> = ({ onSkip, lang, onToggleLang }) => {
  const [canSkip, setCanSkip] = useState(false);
  const t = translations[lang];

  useEffect(() => {
    const timer = setTimeout(() => {
      setCanSkip(true);
    }, 250);
    return () => clearTimeout(timer);
  }, []);

  const handleSkip = useCallback(() => {
    if (canSkip) {
      onSkip();
    }
  }, [canSkip, onSkip]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        handleSkip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleSkip]);

  return (
    <div className="fixed inset-0 z-50 bg-[#04100a] text-[#00FF66] overflow-y-auto flex flex-col items-center">
      {/* Top Bar with Language Switcher */}
      <div className="w-full max-w-2xl px-6 pt-6 flex justify-end z-10">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleLang();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-black/60 hover:bg-[#00FF66]/20 border border-[#00FF66]/40 text-[#00FF66] text-xs font-bold transition-all cursor-pointer shadow-[0_0_10px_rgba(0,255,102,0.2)]"
        >
          <Languages className="w-3.5 h-3.5" />
          <span>{lang === 'zh' ? 'English' : '中文'}</span>
        </button>
      </div>

      {/* Centered Scrollable Column */}
      <div className="w-full max-w-2xl px-6 py-6 pb-12 my-auto flex flex-col items-center text-center">
        {/* Main Title */}
        <div className="w-full border-b border-[#00FF66]/30 pb-4 mb-8 text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-widest text-white text-center">
            {t.prologue.title}
          </h1>
        </div>

        {/* Narrative Prose with Atomic Word Grouping and Centered Flow */}
        <div className="w-full text-base md:text-lg leading-loose text-gray-300 text-center">
          <p className="w-full text-center mb-8 leading-loose">
            {t.prologue.p1.map((phrase, i) => (
              <span key={i} className="inline-block mx-0.5">{phrase}</span>
            ))}
          </p>

          <p className="w-full text-center mb-8 leading-loose">
            {t.prologue.p2.map((phrase, i) => (
              <span key={i} className="inline-block mx-0.5">{phrase}</span>
            ))}
          </p>

          <p className="w-full text-center mb-8 leading-loose">
            {t.prologue.p3.map((phrase, i) => (
              <span key={i} className="inline-block mx-0.5">{phrase}</span>
            ))}
          </p>

          <p className="w-full text-center mb-8 leading-loose">
            {t.prologue.p4.map((phrase, i) => (
              <span key={i} className="inline-block mx-0.5">{phrase}</span>
            ))}
          </p>

          <p className="w-full text-center mb-8 leading-loose">
            {t.prologue.p5.map((phrase, i) => (
              <span key={i} className="inline-block mx-0.5">{phrase}</span>
            ))}
          </p>

          <p className="w-full text-center mb-8 leading-loose">
            {t.prologue.p6.map((phrase, i) => (
              <span key={i} className="inline-block mx-0.5">{phrase}</span>
            ))}
          </p>

          <p className="w-full text-center mb-8 leading-loose">
            {t.prologue.p7.map((phrase, i) => (
              <span key={i} className="inline-block mx-0.5">{phrase}</span>
            ))}
          </p>

          <div className="w-full pt-6 border-t border-[#00FF66]/20 mb-8 text-center">
            <p className="w-full text-[#00FF66] font-bold text-lg md:text-xl leading-relaxed text-center">
              {t.prologue.quote.map((phrase, i) => (
                <span key={i} className="inline-block mx-0.5">{phrase}</span>
              ))}
            </p>
          </div>
        </div>

        {/* Footer Guidance */}
        <div className="w-full pt-6 border-t border-[#00FF66]/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-center">
          <span className="text-xs md:text-sm text-gray-400 animate-pulse">
            {t.prologue.skipTip}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleSkip();
            }}
            className="w-full sm:w-auto px-8 py-3.5 bg-[#00FF66] hover:bg-[#00FF66]/80 text-black font-extrabold text-sm md:text-base tracking-wider rounded transition-all cursor-pointer border border-[#00FF66] min-h-[44px]"
          >
            {t.prologue.enterBtn}
          </button>
        </div>
      </div>
    </div>
  );
};

interface LevelBriefingScreenProps {
  levelIndex: number;
  lang: Language;
  onDeploy: () => void;
  onToggleLang: () => void;
  onReturnToMenu?: () => void;
}

const LevelBriefingScreen: React.FC<LevelBriefingScreenProps> = ({
  levelIndex,
  lang,
  onDeploy,
  onToggleLang,
  onReturnToMenu,
}) => {
  const [canSkip, setCanSkip] = useState(false);
  const t = translations[lang];
  const safeIndex = Math.max(0, Math.min(levelIndex, t.levelBriefing.levels.length - 1));
  const briefing = t.levelBriefing.levels[safeIndex] || t.levelBriefing.levels[0];

  useEffect(() => {
    const timer = setTimeout(() => {
      setCanSkip(true);
    }, 180);
    return () => clearTimeout(timer);
  }, []);

  const handleDeploy = useCallback(() => {
    if (canSkip) {
      onDeploy();
    }
  }, [canSkip, onDeploy]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock'].includes(e.key)) return;
      if (canSkip) {
        e.preventDefault();
        onDeploy();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [canSkip, onDeploy]);

  return (
    <div className="fixed inset-0 z-50 bg-[#020905] text-[#00FF66] overflow-y-auto select-none font-mono flex flex-col justify-between">
      {/* Top Bar with Return to Menu & Language Switcher */}
      <div className="w-full max-w-4xl mx-auto px-6 pt-5 pb-2 flex justify-between items-center z-10 shrink-0">
        {onReturnToMenu ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onReturnToMenu();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-black/60 hover:bg-[#00FF66]/20 border border-[#00FF66]/40 text-gray-300 hover:text-[#00FF66] text-xs font-bold transition-all cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>{t.hudMenu}</span>
          </button>
        ) : <div />}

        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleLang();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-black/60 hover:bg-[#00FF66]/20 border border-[#00FF66]/40 text-[#00FF66] text-xs font-bold transition-all cursor-pointer shadow-[0_0_10px_rgba(0,255,102,0.2)]"
        >
          <Languages className="w-3.5 h-3.5" />
          <span>{lang === 'zh' ? 'English' : '中文'}</span>
        </button>
      </div>

      {/* Main Content Column - Centered Vertically in Screen */}
      <div className="flex-1 flex flex-col items-center justify-center w-full px-6 py-4 my-auto">
        <div className="w-full max-w-3xl flex flex-col items-center">
          {/* Operation Header */}
          <div className="w-full border-b border-[#00FF66]/30 pb-3 mb-5 flex flex-col items-center text-center">
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-widest text-white drop-shadow-[0_0_15px_rgba(0,255,102,0.4)]">
              {briefing.title}
            </h1>
            <p className="text-xs text-[#00FF66]/70 mt-1.5 tracking-wider uppercase">
              {t.levelBriefing.missionBriefingTitle}
            </p>
          </div>

          {/* Tactical Intel Dossier */}
          <div className="w-full space-y-3.5 text-sm sm:text-base text-gray-300">
            {/* 情报 */}
            <div className="p-4 rounded bg-black/50 border border-[#00FF66]/30 space-y-2.5">
              <div className="text-xs font-bold tracking-wider text-[#00FF66] flex items-center gap-1.5 uppercase">
                <Terminal className="w-4 h-4 text-[#00FF66]" />
                <span>{t.levelBriefing.sectorIntelTitle}</span>
              </div>
              {briefing.intel.map((para, idx) => (
                <p key={idx} className="leading-relaxed text-gray-200 pl-2.5 border-l-2 border-[#00FF66]/50">
                  {para}
                </p>
              ))}
            </div>

            {/* 目标 */}
            <div className="p-4 rounded bg-[#FFCC00]/10 border border-[#FFCC00]/50 space-y-2 shadow-[0_0_15px_rgba(255,204,0,0.1)]">
              <div className="text-xs font-extrabold tracking-wider text-[#FFCC00] flex items-center gap-1.5 uppercase">
                <Crosshair className="w-4 h-4 text-[#FFCC00]" />
                <span>{t.levelBriefing.primaryObjectiveTitle}</span>
              </div>
              <div className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span className="text-[#00FF66]">🎯</span>
                <span>{briefing.objective}</span>
              </div>
              <p className="text-xs text-amber-200/90 leading-normal">
                ✦ {lang === 'zh'
                  ? `达成目标（肃清第 ${briefing.targetWave} 波）后，可选择就地撤离前往下一关，亦可继续坚守无尽刷波次！`
                  : `Upon completing Wave ${briefing.targetWave}, you may extract to the next sector or stay to defend endless waves!`}
              </p>
            </div>

            {/* 备忘栏 */}
            <div className="p-3.5 rounded bg-black/40 border border-white/15 text-xs text-gray-400 space-y-1">
              <span className="font-bold text-gray-300 uppercase tracking-wide flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                {t.levelBriefing.tacticalNoticeTitle}:
              </span>
              <p className="leading-relaxed text-gray-300">
                {briefing.notice}
              </p>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="w-full pt-5 mt-5 border-t border-[#00FF66]/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-gray-400 animate-pulse text-center sm:text-left">
              {t.levelBriefing.skipTip}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeploy();
              }}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#00FF66] hover:bg-[#00FF66]/80 text-black font-extrabold text-sm sm:text-base tracking-wider rounded transition-all cursor-pointer border border-[#00FF66] shadow-[0_0_15px_rgba(0,255,102,0.3)] flex items-center justify-center gap-2 min-h-[44px]"
            >
              <Play className="w-4 h-4 fill-black" />
              <span>{t.levelBriefing.deployBtn}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom spacer for balanced vertical alignment */}
      <div className="h-4 shrink-0" />
    </div>
  );
};

export default function App() {
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('game_language');
    return (saved === 'en' || saved === 'zh') ? saved : 'zh';
  });

  const [viewState, setViewState] = useState<'menu' | 'prologue' | 'briefing' | 'playing'>('menu');
  const [isPaused, setIsPaused] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showLevelSelect, setShowLevelSelect] = useState(false);
  const [gameLoaded, setGameLoaded] = useState(false);
  const [activeWeapon, setActiveWeapon] = useState<number>(1);
  // 实验 v6：步枪快慢机状态（L7/L8），轮询 window.__l7RifleAutoMode 同步
  const [rifleAutoMode, setRifleAutoMode] = useState<boolean>(false);
  useEffect(() => {
    const timer = setInterval(() => {
      setRifleAutoMode(!!(window as any).__l7RifleAutoMode);
    }, 200);
    return () => clearInterval(timer);
  }, []);
  const [selectedLevelIndex, setSelectedLevelIndex] = useState<number>(8);
  const [showObjectiveModal, setShowObjectiveModal] = useState(false);
  const [objectiveStats, setObjectiveStats] = useState<{
    levelIndex: number;
    wave: number;
    targetWave: number;
    kills: number;
  } | null>(null);
  const [canExtractAnytime, setCanExtractAnytime] = useState(false);
  const [showVictoryScreen, setShowVictoryScreen] = useState(false);

  // Sync view state and config with global engine
  useEffect(() => {
    (window as any).__storyBriefingEnabled = GAME_CONFIG.ENABLE_STORY_BRIEFING;
    (window as any).__viewState = viewState;
    if (viewState !== 'playing') {
      if (typeof (window as any).togglePause === 'function') {
        (window as any).togglePause(true);
      }
      setIsPaused(true);
      if (typeof (window as any).soundManager !== 'undefined') {
        (window as any).soundManager.updateGameState(false, true);
      }
    }
  }, [viewState]);

  // Sync language with global engine state
  useEffect(() => {
    localStorage.setItem('game_language', lang);
    (window as any).__gameLang = lang;
    if (typeof (window as any).refreshLogPanelLanguage === 'function') {
      (window as any).refreshLogPanelLanguage();
    }
    const banner = document.getElementById('alarm-banner');
    if (banner && banner.style.display !== 'none' && banner.innerText) {
      const lm = (window as any).levelManager;
      const levelId = (lm && lm.getCurrentLevel) ? lm.getCurrentLevel().id : '';
      const isEn = (lang === 'en');
      if (levelId === 'level6_train' || levelId === 'level0_test') {
        banner.innerText = isEn ? "🚨 ARMORED TRAIN ALARM - FULL LOCKDOWN 🚨" : "🚨 装甲列车防务警报 - 全列全面封锁 🚨";
      } else if (levelId === 'level5_hotel') {
        banner.innerText = isEn ? "🚨 HOTEL SECURITY ALARM - LOBBY ON HIGH ALERT 🚨" : "🚨 酒店安保警报 - 酒店大堂已进入全面戒备 🚨";
      } else if (levelId === 'level3_bank') {
        banner.innerText = isEn ? "🚨 VAULT SECURITY ALARM - BANK IN FULL LOCKDOWN 🚨" : "🚨 金库安全警报 - 中央银行已进入全面封锁 🚨";
      } else if (levelId === 'level2_subway') {
        banner.innerText = isEn ? "🚨 STATION SECURITY ALARM - SUBWAY IN FULL LOCKDOWN 🚨" : "🚨 地铁安全警报 - 地铁站已进入全面封锁 🚨";
      } else if (levelId === 'level4_yacht') {
        banner.innerText = isEn ? "🚨 VESSEL SECURITY ALARM - YACHT IN FULL LOCKDOWN 🚨" : "🚨 游艇安全警报 - 游艇全舰进入全面封锁 🚨";
      } else if (levelId === 'level7_lab' || levelId === 'level7_test') {
        banner.innerText = isEn ? "🚨 APEX RESEARCH COMPLEX SECURITY ALARM - FACILITY IN FULL LOCKDOWN 🚨" : "🚨 顶石科研中心安全警报 - 科研中心已进入全面封锁 🚨";
      } else {
        banner.innerText = isEn ? "🚨 AIRPORT SECURITY ALARM - TERMINAL ON HIGH ALERT 🚨" : "🚨 机场安全警报 - 航站楼全区域戒备 🚨";
      }
    }
  }, [lang]);

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'zh' ? 'en' : 'zh'));
  };

  const t = translations[lang];

  useEffect(() => {
    let isMounted = true;

    // Register global listener for engine pause state changes
    (window as any).onGamePauseChange = (paused: boolean) => {
      if (isMounted) setIsPaused(paused);
    };

    // Register global listener for weapon changes (from keyboard keys or bottom-left HUD clicks)
    (window as any).onWeaponChange = (weaponId: number) => {
      if (isMounted) setActiveWeapon(weaponId);
    };

    // Keep active weapon in sync with engine
    const weaponSyncInterval = setInterval(() => {
      if (isMounted) {
        const curWp = (window as any).currentWeapon;
        if (curWp && typeof curWp.id === 'number') {
          setActiveWeapon((prev) => (prev !== curWp.id ? curWp.id : prev));
        }
      }
    }, 80);

    const checkEngineReady = () => {
      if (typeof (window as any).resetGame === 'function') {
        if (isMounted) {
          setGameLoaded(true);
          // Keep game paused on main menu initially
          if (typeof (window as any).togglePause === 'function') {
            (window as any).togglePause(true);
          }
        }
      } else {
        setTimeout(checkEngineReady, 50);
      }
    };
    checkEngineReady();

    return () => {
      isMounted = false;
      delete (window as any).onGamePauseChange;
      delete (window as any).onWeaponChange;
      clearInterval(weaponSyncInterval);
    };
  }, []);

  const launchGameLevel = useCallback((levelIndex: number) => {
    setSelectedLevelIndex(levelIndex);
    setShowObjectiveModal(false);
    setCanExtractAnytime(false);
    setShowVictoryScreen(false);

    // Pause first during reconfiguration to eliminate race condition with gameLoop
    if (typeof (window as any).togglePause === 'function') {
      (window as any).togglePause(true);
    }
    setIsPaused(true);

    const lm = (window as any).levelManager;
    if (lm) {
      lm.currentIndex = levelIndex;
      if (typeof lm.loadCurrentLevel === 'function') {
        lm.loadCurrentLevel();
      }
    }
    if (typeof (window as any).resizeCanvas === 'function') {
      (window as any).resizeCanvas();
    }
    if (typeof (window as any).resetGame === 'function') {
      (window as any).resetGame();
    }
    if (typeof (window as any).snapCameraToPlayer === 'function') {
      (window as any).snapCameraToPlayer();
    }

    // Now that map layout, enemies, and camera are cleanly initialized, enter playing state
    (window as any).__viewState = 'playing';
    setViewState('playing');
    if (typeof (window as any).togglePause === 'function') {
      (window as any).togglePause(false);
    }
    setIsPaused(false);
    setActiveWeapon(levelIndex === 0 ? 8 : 1);
  }, []);

  const enterLevelBriefing = useCallback((levelIndex: number) => {
    if (!GAME_CONFIG.ENABLE_STORY_BRIEFING) {
      launchGameLevel(levelIndex);
      return;
    }
    setSelectedLevelIndex(levelIndex);
    setShowObjectiveModal(false);
    setCanExtractAnytime(false);
    setShowVictoryScreen(false);
    (window as any).__viewState = 'briefing';
    setViewState('briefing');
    if (typeof (window as any).togglePause === 'function') {
      (window as any).togglePause(true);
    }
    setIsPaused(true);
  }, [launchGameLevel]);

  const handleExtractToNextLevel = useCallback(() => {
    setShowObjectiveModal(false);
    const maxLevel = 7;
    if (selectedLevelIndex >= maxLevel) {
      setShowVictoryScreen(true);
      if (typeof (window as any).togglePause === 'function') {
        (window as any).togglePause(true);
      }
      setIsPaused(true);
      return;
    }

    const nextIndex = selectedLevelIndex + 1;
    setSelectedLevelIndex(nextIndex);
    enterLevelBriefing(nextIndex);
  }, [selectedLevelIndex, enterLevelBriefing]);

  const handleContinueEndlessDefense = useCallback(() => {
    setShowObjectiveModal(false);
    setCanExtractAnytime(true);
    (window as any).__endlessMode = true;
    if (typeof (window as any).togglePause === 'function') {
      (window as any).togglePause(false);
    }
    setIsPaused(false);
  }, []);

  // Listen for objective completed & extract requests from engine
  useEffect(() => {
    (window as any).onLevelObjectiveCompleted = (stats: {
      levelIndex: number;
      wave: number;
      targetWave: number;
      kills: number;
    }) => {
      if (!GAME_CONFIG.ENABLE_STORY_BRIEFING) return;
      setObjectiveStats(stats);
      setShowObjectiveModal(true);
    };

    (window as any).requestLevelExtract = () => {
      if (!GAME_CONFIG.ENABLE_STORY_BRIEFING) return;
      handleExtractToNextLevel();
    };

    return () => {
      delete (window as any).onLevelObjectiveCompleted;
      delete (window as any).requestLevelExtract;
    };
  }, [handleExtractToNextLevel]);

  const handleStartGame = (bypassPrologue: boolean | any = false) => {
    if (bypassPrologue !== true) {
      (window as any).__viewState = 'prologue';
      setViewState('prologue');
      if (typeof (window as any).togglePause === 'function') {
        (window as any).togglePause(true);
      }
      setIsPaused(true);
      return;
    }

    enterLevelBriefing(selectedLevelIndex);
  };

  const handleTogglePause = () => {
    if (typeof (window as any).togglePause === 'function') {
      const newState = (window as any).togglePause();
      setIsPaused(newState);
    } else {
      setIsPaused(!isPaused);
    }
  };

  const handleRestart = () => {
    setShowObjectiveModal(false);
    setShowVictoryScreen(false);
    setCanExtractAnytime(false);
    if (typeof (window as any).resetGame === 'function') {
      (window as any).resetGame();
      setIsPaused(false);
    }
  };

  const handleReturnToMenu = () => {
    setShowObjectiveModal(false);
    setShowVictoryScreen(false);
    setCanExtractAnytime(false);
    (window as any).__viewState = 'menu';
    if (typeof (window as any).togglePause === 'function') {
      (window as any).togglePause(true);
    }
    setIsPaused(true);
    if (typeof (window as any).soundManager !== 'undefined') {
      (window as any).soundManager.updateGameState(false, true);
    }
    setViewState('menu');
  };

  // 2026-11-01 地狱隐藏关：暴露给 engine.js（放在 handleReturnToMenu 定义之后，避免 TDZ）
  useEffect(() => {
    (window as any).__launchGameLevel = launchGameLevel;
    (window as any).__returnToMenu = handleReturnToMenu;
  }, [launchGameLevel, handleReturnToMenu]);

  const handleSelectWeapon = (id: number) => {
    setActiveWeapon(id);
    if (typeof (window as any).switchWeapon === 'function') {
      const weaponMap: Record<number, any> = {
        1: (window as any).WEAPONS?.RIFLE,
        2: (window as any).WEAPONS?.PISTOL,
        3: (window as any).WEAPONS?.SMG,
        4: (window as any).WEAPONS?.SNIPER,
        5: (window as any).WEAPONS?.GRENADE,
        8: (window as any).WEAPONS?.TRIPLE_SHOTGUN,
        9: (window as any).WEAPONS?.RUNE_SCYTHE,
        10: (window as any).WEAPONS?.LAVA_CIRCLE,
        11: (window as any).WEAPONS?.SOUL_SIPHON,
      };
      if (weaponMap[id]) {
        (window as any).switchWeapon(weaponMap[id]);
      }
    }
  };

  const handleSelectLevel = (index: number) => {
    setSelectedLevelIndex(index);
    const lm = (window as any).levelManager;
    if (lm) {
      lm.currentIndex = index;
    }
  };

  const currentLevelId = (window as any).levelManager?.getCurrentLevel()?.id;
  const isLevel0 = (selectedLevelIndex === 0) || (currentLevelId === 'level0_test');
  const isL78 = (selectedLevelIndex === 7 || selectedLevelIndex === 8) || (currentLevelId === 'level7_lab' || currentLevelId === 'level7_test');

  return (
    <div className={`relative w-full h-screen overflow-hidden bg-[#020403] font-mono select-none ${isLevel0 ? 'text-[#FF3344]' : (isL78 ? 'text-[#10b981]' : 'text-[#00FF66]')}`}>
      {/* HUD Bar (Top Right Controls in Playing Mode) */}
      {viewState === 'playing' && (
        <div className="status-box top-bar-hud absolute top-3 right-5 z-30 flex items-center gap-1.5 backdrop-blur text-xs">
          {/* Target Objective Indicator */}
          {GAME_CONFIG.ENABLE_STORY_BRIEFING && (
            <div className={`hidden xl:flex items-center gap-1.5 px-2 py-0.5 rounded border text-[11px] ${isLevel0 ? 'bg-[rgba(22,6,8,0.7)] border-[#FF3344]/30 text-[#FF3344]' : (isL78 ? 'bg-[rgba(6,32,27,0.7)] border-[#10b981]/30 text-[#10b981]' : 'bg-[rgba(4,16,10,0.7)] border-[#00FF66]/30 text-[#00FF66]')}`}>
              <span>🎯</span>
              <span className="font-bold truncate max-w-[200px]" title={t.levelBriefing.levels[selectedLevelIndex]?.objective}>
                {t.levelBriefing.levels[selectedLevelIndex]?.objective || (lang === 'zh' ? '坚守防线' : 'Hold Defense')}
              </span>
            </div>
          )}

          {/* Persistent Extraction Button after Objective Accomplished */}
          {GAME_CONFIG.ENABLE_STORY_BRIEFING && (canExtractAnytime || (window as any).__levelObjectiveAchieved) && (
            <button
              onClick={handleExtractToNextLevel}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#00FF66] hover:bg-[#00FF66]/80 text-black font-extrabold text-xs transition-all cursor-pointer shadow-[0_0_12px_rgba(0,255,102,0.6)] animate-pulse"
              title={lang === 'zh' ? '按 E 键或点击立即撤离至下一关' : 'Press E or click to extract'}
            >
              <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
              <span>{t.objectiveModal.hudExtractBtn}</span>
            </button>
          )}

          {/* Language Toggle in Top Right */}
          <button
            onClick={toggleLanguage}
            className={`flex items-center gap-1 px-2 py-1 rounded border transition-all font-bold cursor-pointer text-xs ${
              isLevel0
                ? 'bg-[#FF3344]/10 hover:bg-[#FF3344]/25 border-[#FF3344]/40 text-[#FF3344]'
                : (isL78 ? 'bg-[#10b981]/10 hover:bg-[#10b981]/25 border-[#10b981]/40 text-[#10b981]' : 'bg-[#00FF66]/10 hover:bg-[#00FF66]/25 border-[#00FF66]/40 text-[#00FF66]')
            }`}
            title={lang === 'zh' ? 'Switch to English' : '切换为中文'}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{t.hudLang}</span>
          </button>

          <button
            onClick={() => setShowTutorial(true)}
            className={`flex items-center gap-1 px-2 py-1 rounded border transition-all cursor-pointer text-xs ${
              isLevel0
                ? 'bg-[#FF3344]/10 hover:bg-[#FF3344]/20 border-[#FF3344]/30 text-[#FF3344]'
                : (isL78 ? 'bg-[#10b981]/10 hover:bg-[#10b981]/20 border-[#10b981]/30 text-[#10b981]' : 'bg-[#00FF66]/10 hover:bg-[#00FF66]/20 border-[#00FF66]/30 text-[#00FF66]')
            }`}
            title={lang === 'zh' ? '查看操作指南' : 'How to Play'}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{t.hudGuide}</span>
          </button>

          <button
            onClick={() => {
              if (typeof (window as any).togglePause === 'function') {
                (window as any).togglePause(true);
              }
              setShowLevelSelect(true);
            }}
            className={`flex items-center gap-1 px-2 py-1 rounded border transition-all cursor-pointer text-xs ${
              isLevel0
                ? 'bg-[#FF3344]/10 hover:bg-[#FF3344]/20 border-[#FF3344]/30 text-[#FF3344]'
                : (isL78 ? 'bg-[#10b981]/10 hover:bg-[#10b981]/20 border-[#10b981]/30 text-[#10b981]' : 'bg-[#00FF66]/10 hover:bg-[#00FF66]/20 border-[#00FF66]/30 text-[#00FF66]')
            }`}
            title={lang === 'zh' ? '选择关卡' : 'Select Level'}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>{t.hudSector}</span>
          </button>

          <button
            onClick={handleTogglePause}
            className={`flex items-center gap-1 px-2 py-1 rounded border transition-all font-bold cursor-pointer text-xs ${
              isPaused
                ? 'bg-[#FFCC00]/20 hover:bg-[#FFCC00]/40 border-[#FFCC00] text-[#FFCC00]'
                : (isLevel0 ? 'bg-[#FF3344]/15 hover:bg-[#FF3344]/30 border-[#FF3344]/50 text-[#FF3344]' : (isL78 ? 'bg-[#10b981]/15 hover:bg-[#10b981]/30 border-[#10b981]/50 text-[#10b981]' : 'bg-[#00FF66]/15 hover:bg-[#00FF66]/30 border-[#00FF66]/50 text-[#00FF66]'))
            }`}
            title={lang === 'zh' ? '暂停/恢复 (ESC/P)' : 'Pause/Resume (ESC/P)'}
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            <span>{isPaused ? t.hudResume : t.hudPause}</span>
          </button>

          <button
            onClick={handleRestart}
            className="flex items-center gap-1 px-2 py-1 rounded bg-[#FF3344]/20 hover:bg-[#FF3344]/40 border border-[#FF3344]/50 text-[#FF3344] transition-all font-bold cursor-pointer text-xs"
            title={lang === 'zh' ? '重置关卡 (R)' : 'Restart (R)'}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.hudRestart}</span>
          </button>

          <button
            onClick={handleReturnToMenu}
            className="flex items-center gap-1 px-2 py-1 rounded bg-white/5 hover:bg-white/15 border border-white/20 text-gray-300 transition-all cursor-pointer text-xs"
            title={lang === 'zh' ? '返回主菜单' : 'Main Menu'}
          >
            <Home className="w-3.5 h-3.5" />
            <span>{t.hudMenu}</span>
          </button>
        </div>
      )}

      {/* Vertical Weapon List (below top bar, left of wave counter) */}
      {viewState === 'playing' && (
        <div className="status-box weapon-list-hud absolute top-[63px] right-[210px] z-30 hidden lg:flex flex-col items-stretch gap-0.5 backdrop-blur">
          {(isLevel0 ? [
            { id: 8, name: lang === 'zh' ? '三管猎枪' : 'Triple Shotgun' },
            { id: 9, name: lang === 'zh' ? '符文光镰' : 'Rune Scythe' },
            { id: 10, name: lang === 'zh' ? '熔岩阵' : 'Lava Circle' },
            { id: 11, name: lang === 'zh' ? '灵魂汲取' : 'Soul Siphon' },
          ] : [
            { id: 1, name: t.weapons.rifle },
            { id: 2, name: t.weapons.pistol },
            { id: 3, name: isL78 ? (lang === 'zh' ? '3: 霰弹枪' : '3: Shotgun') : t.weapons.smg },
            { id: 4, name: t.weapons.sniper },
            { id: 5, name: isL78 ? (lang === 'zh' ? '5: 榴弹' : '5: Grenade') : t.weapons.grenade },
          ]).map((wp) => (
            <button
              key={wp.id}
              onClick={() => handleSelectWeapon(wp.id)}
              className={`px-2 py-0.5 rounded text-[11px] text-left transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeWeapon === wp.id
                  ? (isLevel0 ? 'bg-[#FF3344] text-black font-bold shadow-[0_0_8px_rgba(255,51,68,0.5)]' : (isL78 ? 'bg-[rgba(56,189,248,0.15)] text-[#38bdf8] font-bold shadow-[0_0_8px_rgba(56,189,248,0.5)]' : 'bg-[#00FF66] text-black font-bold shadow-[0_0_8px_rgba(0,255,102,0.5)]'))
                  : (isLevel0 ? 'hover:bg-[#FF3344]/20 text-[#FF3344]' : (isL78 ? 'hover:bg-[#10b981]/20 text-[#10b981]' : 'hover:bg-[#00FF66]/20 text-[#00FF66]'))
              }`}
            >
              {/* 实验 v6：快慢机状态指示——仅 L7/L8 且选中步枪时显示，在武器名左侧 */}
              {isL78 && wp.id === 1 && activeWeapon === 1 && (
                <span className={`text-[10px] font-bold shrink-0 ${isLevel0 ? 'text-[#FF3344]' : (isL78 ? 'text-[#38bdf8]' : 'text-[#00FF66]')}`}>
                  <span className="text-[9px]">[V]</span> {rifleAutoMode ? (lang === 'zh' ? '全自动' : 'AUTO') : (lang === 'zh' ? '半自动' : 'SEMI')}
                </span>
              )}
              {wp.name}
            </button>
          ))}
        </div>
      )}

      {/* Main Cover / Menu Overlay */}
      {viewState === 'menu' && (
        <div className="absolute inset-0 z-40 flex items-center justify-center p-6 bg-[#020403] backdrop-blur-md">
          {/* Top Right Language Switcher on Main Menu */}
          <div className="absolute top-6 right-6">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3.5 py-2 rounded bg-black/60 hover:bg-[#00FF66]/20 border border-[#00FF66]/40 text-[#00FF66] text-xs font-bold transition-all cursor-pointer shadow-[0_0_15px_rgba(0,255,102,0.15)]"
            >
              <Globe className="w-4 h-4" />
              <span>{lang === 'zh' ? 'English' : '中文'}</span>
            </button>
          </div>

          {/* Center Container */}
          <div className="max-w-md w-full flex flex-col items-center justify-center text-center my-auto">
            {/* Title: 视界滞后 / Observation Lag */}
            <div className="mb-10 select-none">
              <h1 className="text-5xl sm:text-6xl font-extrabold tracking-widest text-[#00FF66] drop-shadow-[0_0_20px_rgba(0,255,102,0.6)]">
                {t.gameTitle}
              </h1>
            </div>

            {/* Menu Buttons */}
            <div className="w-full space-y-3.5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStartGame(false);
                }}
                className="w-full py-3.5 px-6 bg-[#00FF66] text-black font-extrabold text-base rounded border border-[#00FF66] shadow-[0_0_15px_rgba(0,255,102,0.3)] hover:bg-[#00FF66]/80 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-5 h-5 fill-black" />
                <span>{t.startMission}</span>
              </button>

              <button
                onClick={() => setShowTutorial(true)}
                className="w-full py-3 px-4 bg-[#00FF66]/10 hover:bg-[#00FF66]/20 border border-[#00FF66]/40 text-[#00FF66] font-bold text-sm rounded transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>{t.tacticalManual}</span>
              </button>

              <button
                onClick={() => setShowLevelSelect(true)}
                className="w-full py-3 px-4 bg-[#00FF66]/10 hover:bg-[#00FF66]/20 border border-[#00FF66]/40 text-[#00FF66] font-bold text-sm rounded transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <MapPin className="w-4 h-4" />
                <span>{t.sectorSelect}</span>
              </button>

              {/* Language Switcher Button in Main Menu */}
              <button
                onClick={toggleLanguage}
                className="w-full py-2.5 px-4 bg-black/40 hover:bg-[#00FF66]/15 border border-[#00FF66]/30 text-gray-300 hover:text-[#00FF66] font-bold text-xs rounded transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Languages className="w-4 h-4 text-[#00FF66]" />
                <span>
                  {t.languageSelect}: <strong className="text-[#00FF66]">{lang === 'zh' ? '简体中文' : 'English'}</strong>
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Prologue / Introduction Overlay */}
      {viewState === 'prologue' && (
        <PrologueScreen
          onSkip={() => enterLevelBriefing(GAME_CONFIG.ENABLE_LEVEL_0 ? 0 : 1)}
          lang={lang}
          onToggleLang={toggleLanguage}
        />
      )}

      {/* Level Briefing Overlay */}
      {viewState === 'briefing' && GAME_CONFIG.ENABLE_STORY_BRIEFING && (
        <LevelBriefingScreen
          levelIndex={selectedLevelIndex}
          lang={lang}
          onDeploy={() => launchGameLevel(selectedLevelIndex)}
          onToggleLang={toggleLanguage}
          onReturnToMenu={handleReturnToMenu}
        />
      )}

      {/* Pause Menu Overlay */}
      {isPaused && viewState === 'playing' && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in">
          <div
            className="max-w-md w-full bg-[#030d07] border border-[#00FF66] p-8 rounded shadow-[0_0_20px_rgba(0,255,102,0.15)] text-center relative flex flex-col items-center justify-center"
          >
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#00FF66] tracking-widest mb-6 drop-shadow-[0_0_12px_rgba(0,255,102,0.5)]">
              {t.tacticalPause}
            </h2>

            <div className="w-full space-y-3">
              <button
                onClick={() => handleTogglePause()}
                className="w-full py-3 bg-[#00FF66] text-black font-extrabold text-sm rounded hover:bg-[#00FF66]/80 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-black" />
                <span>{t.resumeMission}</span>
              </button>

              <button
                onClick={handleRestart}
                className="w-full py-2.5 bg-[#FF3344]/20 border border-[#FF3344]/50 text-[#FF3344] hover:bg-[#FF3344]/30 font-bold text-sm rounded transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{t.restartMission}</span>
              </button>

              <button
                onClick={() => setShowTutorial(true)}
                className="w-full py-2.5 bg-[#00FF66]/10 border border-[#00FF66]/30 text-[#00FF66] hover:bg-[#00FF66]/20 font-bold text-xs rounded transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>{t.tacticalManual}</span>
              </button>

              {/* Language Switcher in Pause Menu */}
              <button
                onClick={toggleLanguage}
                className="w-full py-2.5 bg-black/40 hover:bg-[#00FF66]/15 border border-[#00FF66]/30 text-gray-300 hover:text-[#00FF66] font-bold text-xs rounded transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Languages className="w-4 h-4 text-[#00CCFF]" />
                <span>
                  {t.languageSelect}: <strong className="text-[#00FF66]">{lang === 'zh' ? '简体中文' : 'English'}</strong>
                </span>
              </button>

              <button
                onClick={handleReturnToMenu}
                className="w-full py-2.5 bg-white/5 border border-white/20 text-gray-300 hover:bg-white/10 font-bold text-xs rounded transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>{t.returnToMenu}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Level Select Modal */}
      {showLevelSelect && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="max-w-lg w-full bg-[#030d07] border border-[#00FF66] p-6 rounded shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#00FF66]/30 pb-3">
              <h3 className="text-sm font-bold text-[#00FF66] flex items-center gap-2">
                <MapPin className="w-4 h-4" /> {t.levelSelect.title}
              </h3>
              <button
                onClick={() => setShowLevelSelect(false)}
                className="text-gray-400 hover:text-white font-bold text-base cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {t.levelSelect.levels.map((lvl, idx) => {
                if (idx === 0 && !GAME_CONFIG.ENABLE_LEVEL_0) return null;

                const isSelected = selectedLevelIndex === idx;
                return (
                  <div
                    key={lvl.id}
                    onClick={() => handleSelectLevel(idx)}
                    className={`p-4 rounded border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#00FF66]/15 border-[#00FF66] shadow-md shadow-[#00FF66]/10'
                        : 'bg-black/40 border-[#00FF66]/20 hover:border-[#00FF66]/60'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-sm text-white">
                        {lvl.title}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-[#00FF66]/20 text-[#00FF66]">
                        {lvl.badge}
                      </span>
                    </div>
                    <p className="text-xs text-gray-300">
                      {lvl.desc}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setShowLevelSelect(false);
                  enterLevelBriefing(selectedLevelIndex);
                }}
                className="px-5 py-2 bg-[#00FF66] text-black font-bold text-xs rounded hover:bg-[#00FF66]/80 transition-colors cursor-pointer"
              >
                {t.levelSelect.confirmBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tutorial (How to Play) Modal */}
      {showTutorial && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
          <div className="max-w-3xl w-full bg-[#030e07] border border-[#00FF66] p-6 rounded shadow-2xl space-y-4 my-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#00FF66]/30 pb-3">
              <h3 className="text-sm font-bold text-[#00FF66] flex items-center gap-2">
                <Terminal className="w-4 h-4" /> {t.tutorial.title}
              </h3>
              <button
                onClick={() => setShowTutorial(false)}
                className="text-gray-400 hover:text-white font-bold text-base cursor-pointer px-2"
              >
                ✕
              </button>
            </div>

            {/* Top Row: Basic Controls (Green) & Armor (Blue) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 bg-[#00FF66]/5 border border-[#00FF66]/25 rounded space-y-1 text-xs">
                <div className="font-bold text-[#00FF66] flex items-center gap-1.5">
                  <Crosshair className="w-3.5 h-3.5" /> {t.tutorial.moveAimTitle}
                </div>
                <p className="text-gray-300">
                  {t.tutorial.moveAimDesc1}
                </p>
                <p className="text-gray-300">
                  {t.tutorial.moveAimDesc2}
                </p>
              </div>

              <div className="p-3 bg-[#00FF66]/5 border border-[#00FF66]/25 rounded space-y-1 text-xs">
                <div className="font-bold text-[#00FF66] flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" /> {t.tutorial.weaponsTitle}
                </div>
                <p className="text-gray-300">
                  {t.tutorial.weaponsDesc1}
                </p>
                <p className="text-gray-300">
                  {t.tutorial.weaponsDesc2}
                </p>
              </div>

              <div className="p-3 bg-[#00CCFF]/5 border border-[#00CCFF]/30 rounded space-y-1 text-xs">
                <div className="font-bold text-[#00CCFF] flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" /> {t.tutorial.armorTitle}
                </div>
                <p className="text-gray-300">
                  {t.tutorial.armorDesc1}
                </p>
                <p className="text-gray-300">
                  {t.tutorial.armorDesc2}
                </p>
              </div>
            </div>

            {/* Middle Row: Blind Zone System (Yellow) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 bg-[#FFCC00]/5 border border-[#FFCC00]/30 rounded space-y-1 text-xs">
                <div className="font-bold text-[#FFCC00] flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" /> {t.tutorial.blindTeleportTitle}
                </div>
                <p className="text-gray-300">
                  {t.tutorial.blindTeleportDesc1}
                </p>
                <p className="text-gray-300">
                  {t.tutorial.blindTeleportDesc2}
                </p>
              </div>

              <div className="p-3 bg-[#FFCC00]/5 border border-[#FFCC00]/30 rounded space-y-1 text-xs">
                <div className="font-bold text-[#FFCC00] flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> {t.tutorial.blindDamageTitle}
                </div>
                <p className="text-gray-300">
                  {t.tutorial.blindDamageDesc}
                </p>
              </div>

              <div className="p-3 bg-[#FFCC00]/5 border border-[#FFCC00]/30 rounded space-y-1 text-xs">
                <div className="font-bold text-[#FFCC00] flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" /> {t.tutorial.trapTitle}
                </div>
                <p className="text-gray-300">
                  {t.tutorial.trapDesc}
                </p>
              </div>
            </div>

            {/* Killstreak Rewards (Orange) */}
            <div className="p-3 bg-[#FF8800]/5 border border-[#FF8800]/30 rounded space-y-2 text-xs">
              <div className="font-bold text-[#FF8800] flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5" /> {t.tutorial.killstreakTitle}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                <div className="p-2.5 bg-black/40 border border-[#FF8800]/20 rounded space-y-1">
                  <div className="font-bold text-[#FF8800]">{t.tutorial.killstreak3Title}</div>
                  <div className="text-gray-300">{t.tutorial.killstreak3Desc}</div>
                </div>
                <div className="p-2.5 bg-black/40 border border-[#FF8800]/20 rounded space-y-1">
                  <div className="font-bold text-[#FF8800]">{t.tutorial.killstreak5Title}</div>
                  <div className="text-gray-300">{t.tutorial.killstreak5Desc}</div>
                </div>
                <div className="p-2.5 bg-black/40 border border-[#FF8800]/20 rounded space-y-1">
                  <div className="font-bold text-[#FF8800]">{t.tutorial.killstreak7Title}</div>
                  <div className="text-gray-300">{t.tutorial.killstreak7Desc}</div>
                </div>
              </div>
            </div>

            {/* Enemies & Cover Mechanics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-[#00CCFF]/5 border border-[#00CCFF]/30 rounded space-y-1">
                <div className="font-bold text-[#00CCFF] flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> {t.tutorial.observerTitle}
                </div>
                <p className="text-gray-300">
                  {t.tutorial.observerDesc}
                </p>
              </div>

              <div className="p-3 bg-[#C084FC]/5 border border-[#C084FC]/30 rounded space-y-1">
                <div className="font-bold text-[#C084FC] flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> {t.tutorial.jammerTitle}
                </div>
                <p className="text-gray-300">
                  {t.tutorial.jammerDesc}
                </p>
              </div>

              <div className="p-3 bg-[#FF4455]/5 border border-[#FF4455]/30 rounded space-y-1">
                <div className="font-bold text-[#FF4455] flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" /> {t.tutorial.coverTitle}
                </div>
                <p className="text-gray-300">
                  {t.tutorial.coverGlassDesc}
                </p>
                <p className="text-gray-300">
                  {t.tutorial.coverLowWallDesc}
                </p>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setShowTutorial(false)}
              className="w-full py-2.5 bg-[#00FF66] text-black font-bold rounded hover:bg-[#00FF66]/80 transition-colors cursor-pointer text-xs"
            >
              {t.tutorial.backBtn}
            </button>
          </div>
        </div>
      )}

      {/* Objective Accomplished Modal */}
      {showObjectiveModal && GAME_CONFIG.ENABLE_STORY_BRIEFING && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in font-mono">
          <div className="max-w-md w-full bg-[#030e07] border-2 border-[#00FF66] p-7 rounded-lg shadow-[0_0_30px_rgba(0,255,102,0.25)] text-center space-y-5">
            <div className="inline-block p-3 rounded-full bg-[#00FF66]/15 border border-[#00FF66]/50 mx-auto">
              <CheckCircle className="w-8 h-8 text-[#00FF66]" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl sm:text-2xl font-black text-[#00FF66] tracking-wider drop-shadow-[0_0_10px_rgba(0,255,102,0.5)]">
                {t.objectiveModal.title}
              </h2>
              <p className="text-xs text-gray-300">
                {t.objectiveModal.subtitle}
              </p>
            </div>

            {objectiveStats && (
              <div className="p-3 bg-black/60 border border-[#00FF66]/30 rounded text-xs space-y-1 text-gray-300">
                <div className="text-[#00FF66] font-bold">
                  {t.objectiveModal.waveCompletedDesc(objectiveStats.wave)}
                </div>
                <div>
                  {lang === 'zh' ? `总击杀数: ${objectiveStats.kills}` : `Total Hostiles Neutralized: ${objectiveStats.kills}`}
                </div>
              </div>
            )}

            <div className="space-y-3 pt-2">
              <button
                onClick={handleExtractToNextLevel}
                className="w-full py-3.5 px-4 bg-[#00FF66] text-black font-extrabold text-sm rounded shadow-[0_0_15px_rgba(0,255,102,0.35)] hover:bg-[#00FF66]/80 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
                <span>
                  {selectedLevelIndex >= 6
                    ? t.objectiveModal.finalVictoryBtn
                    : t.objectiveModal.extractBtn}
                </span>
              </button>

              <button
                onClick={handleContinueEndlessDefense}
                className="w-full py-3 px-4 bg-[#FFCC00]/15 border border-[#FFCC00]/50 text-[#FFCC00] hover:bg-[#FFCC00]/25 font-bold text-xs rounded transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Flame className="w-4 h-4 text-[#FFCC00]" />
                <span>{t.objectiveModal.continueBtn}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Campaign Victory Modal */}
      {showVictoryScreen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in font-mono">
          <div className="max-w-lg w-full bg-[#030e07] border-2 border-[#00FF66] p-8 rounded-lg shadow-[0_0_40px_rgba(0,255,102,0.4)] text-center space-y-6">
            <div className="inline-block p-4 rounded-full bg-[#00FF66]/20 border border-[#00FF66] mx-auto animate-pulse">
              <Award className="w-10 h-10 text-[#00FF66]" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-[#00FF66] tracking-widest drop-shadow-[0_0_15px_rgba(0,255,102,0.6)]">
                {t.objectiveModal.campaignVictoryTitle}
              </h2>
              <p className="text-sm text-gray-300 leading-relaxed">
                {t.objectiveModal.campaignVictoryDesc}
              </p>
            </div>

            <div className="p-4 bg-black/60 border border-[#00FF66]/30 rounded text-xs space-y-1.5 text-gray-300">
              <div className="text-white font-bold text-sm">
                {lang === 'zh' ? '★ 行动最终评估: 卓越 ★' : '★ OPERATION RATING: OUTSTANDING ★'}
              </div>
              <div>
                {lang === 'zh'
                  ? `特工“幽灵”已彻底撕裂绝对观测防线，全域信息垄断终结。`
                  : `Agent Specter has broken all surveillance fortresses. Perception freedom restored.`}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => {
                  setShowVictoryScreen(false);
                  setSelectedLevelIndex(GAME_CONFIG.ENABLE_LEVEL_0 ? 0 : 1);
                  handleReturnToMenu();
                }}
                className="flex-1 py-3 bg-[#00FF66] text-black font-extrabold text-xs rounded hover:bg-[#00FF66]/80 transition-all cursor-pointer"
              >
                {t.returnToMenu}
              </button>
              <button
                onClick={() => {
                  setShowVictoryScreen(false);
                  setShowLevelSelect(true);
                }}
                className="flex-1 py-3 bg-[#00FF66]/20 border border-[#00FF66]/50 text-[#00FF66] font-bold text-xs rounded hover:bg-[#00FF66]/30 transition-all cursor-pointer"
              >
                {t.sectorSelect}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Engine Container */}
      <div id="game-container" className="relative w-full h-full">
        {/* HUD Overlay */}
        <div className="hud-overlay">
          <div className="status-box">
            <div>{t.hpLabel}</div>
            <div className="bar-outer">
              <div className="bar-inner" id="player-hp-bar"></div>
            </div>

            <div style={{ marginTop: '6px' }}>{t.armorLabel}</div>
            <div className="bar-outer">
              <div className="bar-inner shield" id="player-shield-bar"></div>
            </div>

            <div style={{ marginTop: '6px' }} id="blind-label">
              {t.blindEnergyLabel}
            </div>
            <div className="bar-outer">
              <div className="bar-inner blind" id="blind-energy-bar"></div>
            </div>
          </div>

          <div
            className="status-box right-status"
            style={{ textAlign: 'right' }}
          >
            <div id="wave-title">{lang === 'zh' ? '波次: 1' : 'Wave: 1'}</div>
            <div id="enemies-left" style={{ color: '#FF3344', marginTop: '4px' }}>
              {lang === 'zh' ? '剩余敌人: 0' : 'Enemies: 0'}
            </div>
            <div id="score-count" style={{ marginTop: '4px', color: '#88FFBB' }}>
              {lang === 'zh' ? '击杀数: 0' : 'Kills: 0'}
            </div>
          </div>
        </div>

        {/* Alarm Banner */}
        <div id="alarm-banner">{t.alarmBanner}</div>

        {/* Game Over Screen */}
        <div id="game-over-screen">
          <h1 id="over-title">{t.missionFailed}</h1>
          <p id="over-desc">{lang === 'zh' ? '特工在行动中阵亡' : 'Operative eliminated in action'}</p>
          <button className="restart-btn" onClick={handleRestart}>
            {t.restartBtn}
          </button>
        </div>

        {/* Game Canvas */}
        <canvas id="canvas"></canvas>

        {/* Tactical Log Panel */}
        <div className="log-panel" id="log-panel">
          <div data-raw-text="战术行动已就绪">&gt; {lang === 'zh' ? '战术行动已就绪' : 'Tactical operation ready'}</div>
        </div>
      </div>
    </div>
  );
}
