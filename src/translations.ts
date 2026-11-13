export type Language = 'zh' | 'en';

export interface TranslationDict {
  // Title & Header
  gameTitle: string;
  gameSubtitle: string;
  
  // Menu Buttons
  startMission: string;
  tacticalManual: string;
  sectorSelect: string;
  languageSelect: string;
  
  // Pause Menu
  tacticalPause: string;
  resumeMission: string;
  restartMission: string;
  returnToMenu: string;

  // Top Bar HUD
  hudGuide: string;
  hudSector: string;
  hudPause: string;
  hudResume: string;
  hudRestart: string;
  hudMenu: string;
  hudLang: string;

  // Status Box
  hpLabel: string;
  armorLabel: string;
  blindEnergyLabel: string;
  blindActiveLabel: string;
  waveLabel: string;
  enemiesLabel: string;
  nextWaveLabel: string;
  killsLabel: string;
  alarmBanner: string;

  // Game Over
  missionFailed: string;
  sectorCleared: string;
  agentFallenDesc: (wave: number, kills: number) => string;
  sectorClearedDesc: (kills: number) => string;
  restartBtn: string;

  // Prologue
  prologue: {
    title: string;
    p1: string[];
    p2: string[];
    p3: string[];
    p4: string[];
    p5: string[];
    p6: string[];
    p7: string[];
    quote: string[];
    skipTip: string;
    enterBtn: string;
  };

  // Level Selection
  levelSelect: {
    title: string;
    confirmBtn: string;
    levels: {
      id: string;
      title: string;
      badge: string;
      desc: string;
    }[];
  };

  // Level Briefing
  levelBriefing: {
    missionBriefingTitle: string;
    sectorIntelTitle: string;
    primaryObjectiveTitle: string;
    tacticalNoticeTitle: string;
    skipTip: string;
    deployBtn: string;
    levels: {
      id: string;
      title: string;
      code: string;
      intel: string[];
      objective: string;
      targetWave: number;
      notice: string;
    }[];
  };

  // Objective Completed & Decision Modal
  objectiveModal: {
    title: string;
    subtitle: string;
    waveCompletedDesc: (wave: number) => string;
    extractBtn: string;
    continueBtn: string;
    finalVictoryBtn: string;
    campaignVictoryTitle: string;
    campaignVictoryDesc: string;
    extractHudTip: string;
    hudExtractBtn: string;
    objectiveBadge: (current: number, target: number) => string;
  };

  // Tutorial (How to Play)
  tutorial: {
    title: string;
    backBtn: string;
    moveAimTitle: string;
    moveAimDesc1: string;
    moveAimDesc2: string;
    weaponsTitle: string;
    weaponsDesc1: string;
    weaponsDesc2: string;
    armorTitle: string;
    armorDesc1: string;
    armorDesc2: string;
    blindTeleportTitle: string;
    blindTeleportDesc1: string;
    blindTeleportDesc2: string;
    blindDamageTitle: string;
    blindDamageDesc: string;
    trapTitle: string;
    trapDesc: string;
    killstreakTitle: string;
    killstreak3Title: string;
    killstreak3Desc: string;
    killstreak5Title: string;
    killstreak5Desc: string;
    killstreak7Title: string;
    killstreak7Desc: string;
    observerTitle: string;
    observerDesc: string;
    jammerTitle: string;
    jammerDesc: string;
    coverTitle: string;
    coverGlassDesc: string;
    coverLowWallDesc: string;
  };

  // Weapons
  weapons: {
    rifle: string;
    pistol: string;
    smg: string;
    sniper: string;
    grenade: string;
    machineGun: string;
    uav: string;
  };
}

export const translations: Record<Language, TranslationDict> = {
  zh: {
    gameTitle: '视界滞后',
    gameSubtitle: '',
    startMission: '开始游戏',
    tacticalManual: '操作指南',
    sectorSelect: '关卡选择',
    languageSelect: '语言',
    tacticalPause: '游戏暂停',
    resumeMission: '继续游戏',
    restartMission: '重新开始',
    returnToMenu: '返回主菜单',
    hudGuide: '指南',
    hudSector: '关卡',
    hudPause: '暂停',
    hudResume: '继续',
    hudRestart: '重置',
    hudMenu: '主菜单',
    hudLang: 'EN',
    hpLabel: '生命值',
    armorLabel: '防弹衣',
    blindEnergyLabel: '盲区能量 [SPACE]',
    blindActiveLabel: '盲区开启中 [SPACE]',
    waveLabel: '波次',
    enemiesLabel: '剩余敌人',
    nextWaveLabel: '下一波即将到来...',
    killsLabel: '击杀数',
    alarmBanner: '🚨 警报触发 - 全区域戒备 🚨',
    missionFailed: '任务失败',
    sectorCleared: '关卡完成',
    agentFallenDesc: (wave, kills) => `特工在第 ${wave} 波行动中阵亡。总击杀数: ${kills}`,
    sectorClearedDesc: (kills) => `区域已完全肃清。总击杀数: ${kills}`,
    restartBtn: '[ R ] 重新开始',
    prologue: {
      title: '视界滞后',
      p1: [
        '二战结束后，',
        '美英欧等西方同盟国',
        '于1947年联合签署密约，',
        '成立了同盟国战略情报署（SIA）——',
        '一个超越单一国界、',
        '直属于同盟最高防务委员会的',
        '跨国情报与绝密战术机构。'
      ],
      p2: [
        '21世纪中叶，',
        '自动化控制与光电传感技术迎来飞跃。',
        '面对日益复杂的全球威胁，',
        '同盟国政府在追求绝对安全的叙事中，',
        '自愿将秩序让渡给算法，',
        '并逐步将 SIA 庞大的全球防务网',
        '与基础设施全面外包。'
      ],
      p3: [
        '跨国军工巨头百眼防务集团（Argus Defence Group）',
        '借此崛起。',
        '通过在基础设施、要塞与主权边境铺设',
        '全天候自动化监控天网——“百眼全视者”（Argus Panoptes），',
        '百眼防务完成了对全球物理空间与信息流动的绝对闭环。'
      ],
      p4: [
        '在“百眼全视者”的覆盖下，',
        '任何未经授权的行动均被即时识别并予以物理肃清。',
        '而当一个非主权军工复合体',
        '掌握了全球信息的生死阀门，',
        '则意味着主权国家的防务命脉与国家安全',
        '也随即被彻底架空。',
        '一场围绕“信息控制权”的暗中博弈',
        '在冷战式的静默中展开。'
      ],
      p5: [
        '为打破这种单向透明的技术霸权，',
        '已退居暗处、被逼至绝境的 SIA 启动了绝密应对机制——',
        '研发出能够阻断局域光子与微波传播的“盲区发生器”。'
      ],
      p6: [
        '通过强制制造外界传感器无法观测的“信息断层”，',
        '该技术强行在绝对控制的防线中',
        '开辟出不被坍缩的物理死角。'
      ],
      p7: [
        '作为情报署直属特别行动局（SAD）的高价值隐蔽行动专家，',
        '代号“幽灵”（Specter）的一级作战人员',
        '将携带这台唯一的实验性装置，深入敌对要塞。'
      ],
      quote: [
        '这是一场发生在观测边缘的秩序之争。',
        '一方以绝对透明构建全球统治；',
        '另一方，则利用视界的滞后，',
        '在不可被观测的死角中重塑因果。'
      ],
      skipTip: '[ 可自由滚动阅读 · 按 Enter / Space 键或点击下方按钮开始 ]',
      enterBtn: '进入游戏'
    },
    levelSelect: {
      title: '关卡选择',
      confirmBtn: '进入关卡',
      levels: [
        {
          id: 'level0',
          title: '第 0 关 · 地狱熔岩深渊',
          badge: '第 0 关 · 恶魔',
          desc: '地狱深渊要塞：包含寒冰狱冰湖、钟乳石笋、熔岩火海、黑曜石活火山与中央祭坛，16 名地狱恶魔盘踞。'
        },
        {
          id: 'level1',
          title: '第 1 关 · 机场航站楼',
          badge: '第 1 关',
          desc: '机场航站楼：包含安检门警报、红外监控摄像、行李传送带与防暴盾牌敌人。'
        },
        {
          id: 'level2',
          title: '第 2 关 · 地铁站台',
          badge: '第 2 关',
          desc: '地下铁站台：长廊型双层站台、进站闸机通道、列车车体与玻璃隔音墙掩体。'
        },
        {
          id: 'level3',
          title: '第 3 关 · 银行金库',
          badge: '第 3 关',
          desc: '中央银行金库：配备高能红外激光探测网、重型钢制墙体与全区战术盲雾。'
        },
        {
          id: 'level4',
          title: '第 4 关 · 豪华游艇',
          badge: '第 4 关',
          desc: '超级游艇：尾部游泳池、沙龙、餐厅、主卧套房、客房以及船首直升机停机坪。'
        },
        {
          id: 'level5',
          title: '第 5 关 · 酒店大堂',
          badge: '第 5 关',
          desc: '五星级酒店大堂：闪灵风格雕花红木墙、行李寄存处、前台、大堂休息区与 VIP 奢华沙龙。'
        },
        {
          id: 'level6',
          title: '第 6 关 · 装甲特快列车',
          badge: '第 6 关',
          desc: '现代特快装甲列车：狭长战术走廊，按序包含客舱、餐车、VIP舱室、控制室、引擎室与货仓 6 大真实车厢区域。'
        },
        {
          id: 'level7',
          title: '第 7 关 · 指挥中心',
          badge: '第 7 关',
          desc: '指挥中心：梯形主控大厅、中央环形会议桌、扇形指挥终端与三联工作站，3 台监控摄像头与 4 扇重型防爆门。'
        },
        {
          id: 'level8',
          title: '第 8 关 · 测试关卡',
          badge: '第 8 关 · 测试',
          desc: '第 8 关 · 测试关卡：指挥中心全图（三房间），用于验证新敌人、模型与系统改动，不影响正式关卡。'
        }
      ]
    },
    levelBriefing: {
      missionBriefingTitle: '战术前情提要 // 任务简报',
      sectorIntelTitle: '区域情报档案',
      primaryObjectiveTitle: '核心行动目标',
      tacticalNoticeTitle: '战术作战备忘',
      skipTip: '[ 按任意键或点击下方按钮直接部署进驻 ]',
      deployBtn: '开始行动 · 部署进驻',
      levels: [
        {
          id: 'level0',
          code: 'SECTOR 00 // INFERNAL ABYSS',
          title: '第 0 关 · 地狱熔岩深渊',
          intel: [
            '这是位于现实维度边缘的不可测深渊，充斥着刺骨寒冰湖与炽烈熔岩河。',
            '16 名残暴的地狱恶魔（Demon）已在深渊要塞部署，喷吐三连地狱火弹并具备近战烈焰撕裂。',
            '在此关卡中已激活专属恶魔神秘武器库：重型三管猎枪、符文光镰、地狱熔岩阵与灵魂汲取。'
          ],
          objective: '突入深渊要塞，肃清全部 16 名盘踞的地狱恶魔',
          targetWave: 1,
          notice: '按数字键 1~4 自由切换 4 种恶魔专属武器；击败恶魔可吸取灵魂叠加血祭增益；小心避开熔岩与恶魔近身扑咬。'
        },
        {
          id: 'level1',
          code: 'SECTOR 01 // AIRPORT TERMINAL',
          title: '第 1 关 · 机场航站楼',
          intel: [
            '财团正通过该国际航运枢纽，秘密转移第三代全域监控芯片试验品。',
            '整座航站楼已被武装安保部队全盘接管，各出入口配备金属探测门与红外监控摄像头。',
            '安检门与防暴盾牌兵构成了前哨警戒网，一旦触发警报将招致全区包夹。'
          ],
          objective: '突入大厅，坚守并肃清 3 波警备武装力量',
          targetWave: 3,
          notice: '穿越安检门时注意避开红外探头；利用盲区制造信息断层，逐个瓦解防暴盾牌掩护。'
        },
        {
          id: 'level2',
          code: 'SECTOR 02 // METRO PLATFORM',
          title: '第 2 关 · 地铁站台',
          intel: [
            '地面机场受到打击后，敌军精锐封锁了地下双层轨道交通枢纽，企图彻底截断撤离路线。',
            '双层站台长廊遍布进出站闸机与防弹玻璃隔断，敌方步兵正配合防暴防线在站台组织交叉火力。',
            '列车车厢与地下廊柱成为天然的战术掩护，但也极易遭遇侧翼包抄。'
          ],
          objective: '突破地下封锁，坚守并肃清 3 波搜剿部队',
          targetWave: 3,
          notice: '防弹玻璃虽可通透视线但会大幅衰减子弹杀伤；利用矮墙掩体抛投破片手雷，并在盲区内瞬移包抄。'
        },
        {
          id: 'level3',
          code: 'SECTOR 03 // VAULT SIGMA',
          title: '第 3 关 · 银行金库',
          intel: [
            '财团洗钱网络与深层密钥中枢隐藏在中央银行地下金库中。',
            '内部安装有高能红外激光侦测网与重型密封钢门，且常年被战术盲雾遮蔽，能见度降至极低。',
            '一旦激光被触碰或安保警报拉响，驻防的防爆重装守卫将展开地毯式清场。'
          ],
          objective: '突破激光探测网，坚守并肃清 4 波金库精锐守卫',
          targetWave: 4,
          notice: '全区战术盲雾限制常态视野；激光网不可直接穿越，善用盲区延迟结算伤害，在黑暗中破敌。'
        },
        {
          id: 'level4',
          code: 'SECTOR 04 // VESSEL AEGIS',
          title: '第 4 关 · 豪华游艇',
          intel: [
            '财团高管正于公海超级游艇上召开私人防务闭门峰会。',
            '这艘重型游艇从船尾无边泳池延伸至船首直升机停机坪，驻扎了全副武装的私人雇佣兵卫队。',
            '公海孤立无援，敌方增援艇已在外围海面形成包围圈。'
          ],
          objective: '占领甲板与沙龙，坚守并肃清 4 波雇佣兵反扑',
          targetWave: 4,
          notice: '泳池内部水阻极大且限制常规枪械开火；合理利用沙龙、客舱与停机坪的掩体层次展开拉扯。'
        },
        {
          id: 'level5',
          code: 'SECTOR 05 // GRAND HORIZON',
          title: '第 5 关 · 酒店大堂',
          intel: [
            '财团总指挥部退守于涉外五星级豪华酒店大堂，将其改造为前线坚固据点。',
            '雕花红木与大理石立柱之间暗藏杀机，敌军已在此正式部署高危作战单位——“暗幕干扰者 (Jammer)”。',
            '干扰者释放的局部暗幕将使进入的特工视界受阻并行动迟缓，极大颠覆战场态势。'
          ],
          objective: '瓦解大堂防务据点，坚守并肃清 4 波高危武装力量',
          targetWave: 4,
          notice: '干扰者配备半弧形单向高能护盾，误入其暗幕极度危险；务必拉开距离优先狙杀干扰者。'
        },
        {
          id: 'level6',
          code: 'SECTOR 06 // IRONFANG EXPRESS',
          title: '第 6 关 · 装甲特快列车',
          intel: [
            '财团核心人员登上了高速极地特快装甲列车，穿行于荒原极寒地带。',
            '列车由客舱、餐车、VIP舱、控制室、引擎动力室与货仓 6 节车厢贯通相连，是极度狭长的致命走廊。',
            '极寒与颠簸之中，全武装防暴突击队正沿着车厢走廊步步推进。'
          ],
          objective: '在极速列车中推进，坚守并肃清 5 波特快突击队',
          targetWave: 5,
          notice: '狭窄通道没有任何迂回空间，正面对决格外凶险；利用跨车厢掩体投掷手雷并合理利用连杀重武器。'
        },
        {
          id: 'level7',
          code: 'SECTOR 07 // COMMAND CENTER',
          title: '第 7 关 · 指挥中心',
          intel: [
            '梯形主控大厅是指挥中枢的核心，中央环形会议桌与扇形指挥终端构成作战中枢。',
            '3 台监控摄像头覆盖四扇重型防爆门与会议桌，4 联圆形工作站与三联隔间组成严密防线。',
            '近黑特种敌人携半弧护盾与翡翠盲区诱捕突入，西装特工成群结队，必须坚守指挥核心。'
          ],
          objective: '坚守梯形指挥大厅，肃清 5 波精锐防卫部队',
          targetWave: 5,
          notice: '善用环形会议桌与扇形控制台作掩体，留意摄像头报警与特种敌人的翡翠盲区诱捕。'
        },
        {
          id: 'level8',
          code: 'SECTOR 08 // TEST LAB',
          title: '第 8 关 · 测试关卡',
          intel: [
            '第 8 关为指挥中心全图测试关卡：保留三房间完整地图，用于验证新敌人模型、西装特工与防毒面具等新系统。',
            '正式 L7 只留中间房间；本关卡的改动先在这里验证，通过后再合入正式关卡。',
            '所有实验内容严格约束在本关卡内，不波及正式关卡。'
          ],
          objective: '在第 8 关测试场中验证新系统，肃清测试敌军',
          targetWave: 1,
          notice: '测试关卡：敌人无视玩家（检查模式），按 G 可切换防毒面具状态。'
        }
      ]
    },
    objectiveModal: {
      title: '关卡作战目标已达成！',
      subtitle: '敌方常规防线已被击溃，战略撤离通道已成功开辟。',
      waveCompletedDesc: (wave: number) => `已成功肃清前 ${wave} 波守备力量，任务指标完全达成。`,
      extractBtn: '撤离并前往下一关',
      continueBtn: '继续坚守 / 刷波次',
      finalVictoryBtn: '彻底终结行动 · 战役大捷',
      campaignVictoryTitle: '全线大捷 · 全知网络彻底崩溃！',
      campaignVictoryDesc: '幽灵特工已成功穿透全部 7 大防御要塞，绝对观测之眼被永久摧毁，视界自由重归人类！',
      extractHudTip: '已达成目标 · 随时按 [E] 撤离',
      hudExtractBtn: '[E] 撤离至下一关',
      objectiveBadge: (current: number, target: number) => `目标波次: ${current}/${target}`
    },
    tutorial: {
      title: '操作指南与游戏机制',
      backBtn: '返回',
      moveAimTitle: '移动与瞄准',
      moveAimDesc1: 'W A S D：控制角色全向移动。',
      moveAimDesc2: '鼠标移动：瞄准与视角转向。',
      weaponsTitle: '武器系统',
      weaponsDesc1: '鼠标左键：开火射击。',
      weaponsDesc2: '1 - 5 键：切换主副武器。R 键：手动换弹。V 键：切换步枪半自动/全自动（仅 Level 7/8）。',
      armorTitle: '防弹衣与补给',
      armorDesc1: '防弹衣吸收子弹与爆炸伤害；脱战后可缓慢自我恢复。',
      armorDesc2: '击败敌人掉落补给，拾取可恢复防弹衣与盲区能量。',
      blindTeleportTitle: '盲区与瞬移',
      blindTeleportDesc1: '按 Space 空格键开启/收起盲区。',
      blindTeleportDesc2: '在盲区内部双击鼠标左键可进行瞬移。',
      blindDamageTitle: '伤害延迟结算',
      blindDamageDesc: '盲区构筑双向视觉屏障（外部看不进，内部看不出）。在盲区内造成的伤害将在盲区解除瞬间一并爆发结算。',
      trapTitle: '诱饵陷阱 [5 + 右键]',
      trapDesc: '盲区开启且手持手雷（5 键）时，在盲区地面右键点击可部署诱饵陷阱。',
      killstreakTitle: '连杀奖励',
      killstreak3Title: '3 连杀：[ 6 键 ] 重机枪',
      killstreak3Desc: '高射速重型火力压制。',
      killstreak5Title: '5 连杀：[ 7 键 ] UAV 轰炸',
      killstreak5Desc: '扫描全图敌人并发动定点空袭。',
      killstreak7Title: '7 连杀：[ 8 键 / Space ] 全图盲区',
      killstreak7Desc: '全地图覆盖的绝对盲区隐匿。',
      observerTitle: '观察者敌人',
      observerDesc: '配备重装防弹衣，能看穿盲区，极易被诱饵陷阱吸引。',
      jammerTitle: '暗幕干扰者 (Jammer)',
      jammerDesc: '第 5 波起出现。释放局部盲区，使误入的玩家视野受限且行动迟缓，盲区内的敌人被攻击不显形；自身完全不受影响，并配备半弧形一次性高能护盾。',
      coverTitle: '特殊掩体',
      coverGlassDesc: '防弹玻璃：通透视线，子弹穿透但伤害衰减，拦截手雷投掷。',
      coverLowWallDesc: '矮墙：阻挡视线与直射子弹，支持手雷抛投越过。'
    },
    weapons: {
      rifle: '1: 步枪',
      pistol: '2: 手枪',
      smg: '3: 冲锋枪',
      sniper: '4: 狙击枪',
      grenade: '5: 手雷',
      machineGun: '6: 机枪',
      uav: '7: 空袭'
    }
  },
  en: {
    gameTitle: 'OBSERVATION LAG',
    gameSubtitle: '',
    startMission: 'Start Game',
    tacticalManual: 'Tutorial',
    sectorSelect: 'Level Select',
    languageSelect: 'Language',
    tacticalPause: 'Game Paused',
    resumeMission: 'Resume',
    restartMission: 'Restart',
    returnToMenu: 'Main Menu',
    hudGuide: 'Guide',
    hudSector: 'Level',
    hudPause: 'Pause',
    hudResume: 'Resume',
    hudRestart: 'Reset',
    hudMenu: 'Menu',
    hudLang: '中文',
    hpLabel: 'HP',
    armorLabel: 'Armor',
    blindEnergyLabel: 'Blind Zone [SPACE]',
    blindActiveLabel: 'Blind Zone Active [SPACE]',
    waveLabel: 'Wave',
    enemiesLabel: 'Hostiles',
    nextWaveLabel: 'Next wave incoming...',
    killsLabel: 'Kills',
    alarmBanner: '🚨 ALARM TRIGGERED - HIGH ALERT 🚨',
    missionFailed: 'Mission Failed',
    sectorCleared: 'Level Cleared',
    agentFallenDesc: (wave, kills) => `Operative eliminated on Wave ${wave}. Total Kills: ${kills}`,
    sectorClearedDesc: (kills) => `Area fully secured. Total Kills: ${kills}`,
    restartBtn: '[ R ] Restart',
    prologue: {
      title: 'Observation Lag',
      p1: [
        'In the aftermath of World War II,',
        'Western Allied nations signed a classified treaty in 1947',
        'establishing the Strategic Intelligence Agency (SIA)—',
        'a clandestine multilateral defense agency',
        'operating beyond sovereign boundaries.'
      ],
      p2: [
        'By the mid-21st century,',
        'rapid breakthroughs in automated tracking and electro-optical sensors arrived.',
        'Confronting complex global threats,',
        'governments surrendered defense autonomy to algorithms,',
        'gradually outsourcing SIA’s vast global surveillance infrastructure',
        'to private defense conglomerates.'
      ],
      p3: [
        'Argus Defense Group rose to absolute dominance.',
        'By deploying an omniscient automated sensor network—',
        '“Argus Panoptes”—across sovereign borders and key strongholds,',
        'Argus established complete surveillance over physical',
        'and digital realms worldwide.'
      ],
      p4: [
        'Under Argus Panoptes,',
        'any unauthorized movement is immediately flagged and eliminated.',
        'With private conglomerates controlling the global information choke-point,',
        'sovereign defense lines were hollowed out from within.',
        'A silent war for information hegemony began.'
      ],
      p5: [
        'To break this one-way transparency,',
        'the covert remnants of the SIA initiated their ultimate contingency—',
        'engineering the experimental “Blind Zone Generator”,',
        'a tactical device capable of halting localized photon and microwave transmission.'
      ],
      p6: [
        'By manufacturing an unobservable information disconnect,',
        'the prototype carves out a stable physical blind spot',
        'entirely invisible to automated sensory lines.'
      ],
      p7: [
        'As elite covert operative “Specter” from the Special Activities Division (SAD),',
        'you are deployed deep behind enemy lines',
        'equipped with the sole functioning prototype.'
      ],
      quote: [
        'A silent war fought at the perimeter of perception.',
        'One side enforces order through total transparency;',
        'The other exploits observation lag to reshape reality in the dark.'
      ],
      skipTip: '[ Press any key or click anywhere to continue ]',
      enterBtn: 'Start Game'
    },
    levelSelect: {
      title: 'Level Selection',
      confirmBtn: 'Enter Level',
      levels: [
        {
          id: 'level0',
          title: 'Level 00 · Infernal Abyss',
          badge: 'LEVEL 00 · DEMON',
          desc: 'Infernal Molten Abyss: Frozen Cocytus lake, stalagmites, molten magma rivers, obsidian volcano, and hexagon sanctum with 16 demons.'
        },
        {
          id: 'level1',
          title: 'Level 01 · Airport Terminal',
          badge: 'LEVEL 01',
          desc: 'Airport terminal featuring security metal detector gates, CCTV cameras, baggage conveyors, and riot shield units.'
        },
        {
          id: 'level2',
          title: 'Level 02 · Subway Station',
          badge: 'LEVEL 02',
          desc: 'Multi-level metro platform with turnstile corridors, subway carriages, and bullet-resistant glass barriers.'
        },
        {
          id: 'level3',
          title: 'Level 03 · Bank Vault',
          badge: 'LEVEL 03',
          desc: 'High-security bank vault with infrared laser tripwires, blast-proof doors, and tactical fog of war.'
        },
        {
          id: 'level4',
          title: 'Level 04 · Luxury Yacht',
          badge: 'LEVEL 04',
          desc: 'Superyacht layout with stern swimming pool, VIP lounge, dining deck, master stateroom, guest suites, and bow helipad.'
        },
        {
          id: 'level5',
          title: 'Level 05 · Hotel Lobby',
          badge: 'LEVEL 05',
          desc: 'Five-star hotel lobby with mahogany paneling, luggage storage, concierge desk, lounge, and VIP salon.'
        },
        {
          id: 'level6',
          title: 'Level 06 · Armored Express Train',
          badge: 'LEVEL 06',
          desc: 'Modern Armored Express: Tactical train corridor featuring 6 realistic carriages: Passenger Coach, Dining & Bistro Car, VIP Luxury Suites, Control Bridge, Engine & Power Core, and Cargo Hold.'
        },
        {
          id: 'level7',
          title: 'Level 07 · Command Center',
          badge: 'LEVEL 07',
          desc: 'Command Center: Trapezoidal command hall with central circular conference table, sector command consoles, triple workstations, 3 surveillance cameras and 4 heavy blast doors.'
        },
        {
          id: 'level8',
          title: 'Level 08 · Test Sandbox',
          badge: 'LEVEL 08',
          desc: 'Level 08 · Test sandbox: full three-room Command Center map for validating new enemies, models and systems without touching the live levels.'
        }
      ]
    },
    levelBriefing: {
      missionBriefingTitle: 'OPERATIONAL BRIEFING // INTEL DOSSIER',
      sectorIntelTitle: 'SECTOR INTELLIGENCE',
      primaryObjectiveTitle: 'PRIMARY OPERATIONAL OBJECTIVE',
      tacticalNoticeTitle: 'TACTICAL RULES OF ENGAGEMENT',
      skipTip: '[ Press any key or click below to deploy ]',
      deployBtn: 'COMMENCE OPERATION · DEPLOY',
      levels: [
        {
          id: 'level0',
          code: 'SECTOR 00 // INFERNAL ABYSS',
          title: 'Level 00 · Infernal Abyss',
          intel: [
            'An unmapped abyssal dimension at the edge of observable reality, fraught with frozen glacial lakes and rivers of searing magma.',
            '16 aggressive infernal demons occupy the fortress, firing triple-hellfire volleys and executing deadly close-range fiery slashes.',
            'Your arsenal in this realm is attuned to forbidden demonic armaments: Triple Shotgun, Rune Scythe, Lava Circle, and Soul Siphon.'
          ],
          objective: 'Infiltrate the sanctum and eliminate all 16 abyssal demons',
          targetWave: 1,
          notice: 'Press keys 1-4 to switch demonic weapons; harvest demon souls to stack Blood Pact buffs; steer clear of open magma pits.'
        },
        {
          id: 'level1',
          code: 'SECTOR 01 // AIRPORT TERMINAL',
          title: 'Level 01 · Airport Terminal',
          intel: [
            'The Syndicate is smuggling prototype 3rd-generation surveillance hardware through this international transit hub.',
            'Terminal security is on full combat alert; armed guards, metal detection gates, and infrared CCTV coverage seal all wings.',
            'Metal detector alarms and riot shield units form the vanguard. Breaching security will summon rapid reinforcements.'
          ],
          objective: 'Infiltrate terminal and eliminate 3 waves of security forces',
          targetWave: 3,
          notice: 'Avoid lingering in CCTV cones; use Blind Zones to sever optical contact and flank riot shields.'
        },
        {
          id: 'level2',
          code: 'SECTOR 02 // METRO PLATFORM',
          title: 'Level 02 · Subway Station',
          intel: [
            'Following the airport breach, Syndicate assault teams have cordoned off the underground dual-tier metro station.',
            'Turnstile choke points, soundproof glass barriers, and subway carriages create dense overlapping fields of fire.',
            'The subterranean acoustics carry gunfire swiftly; expect rapid infantry counter-attacks across platforms.'
          ],
          objective: 'Secure underground terminal and eliminate 3 waves of assault units',
          targetWave: 3,
          notice: 'Bulletproof glass permits vision but attenuates bullet velocity; lob grenades over low walls and utilize Blind Zone teleports.'
        },
        {
          id: 'level3',
          code: 'SECTOR 03 // VAULT SIGMA',
          title: 'Level 03 · Bank Vault',
          intel: [
            'The Syndicate financial ledger and core encryption nodes lie hidden beneath the central bank vault.',
            'Heavy vault blast doors, high-voltage infrared laser tripwires, and persistent tactical fog blanket the entire subterranean sector.',
            'Touching any laser grid triggers instant lockdown and brings armored shock troops bearing down on your location.'
          ],
          objective: 'Overcome laser perimeter and eliminate 4 waves of vault shock troops',
          targetWave: 4,
          notice: 'Tactical fog limits base vision distance. Do not trip lasers; unleash delayed Blind Zone damage bursts to shatter defenses.'
        },
        {
          id: 'level4',
          code: 'SECTOR 04 // VESSEL AEGIS',
          title: 'Level 04 · Luxury Yacht',
          intel: [
            'Syndicate executives are holding a classified defense summit aboard their sovereign superyacht in international waters.',
            'The vessel stretches from the stern infinity pool to the bow helipad, fortified by elite private mercenaries.',
            'Surrounding waters are patrolled by interceptor gunboats; extraction requires neutralizing all shipboard defenses.'
          ],
          objective: 'Storm the vessel decks and eliminate 4 waves of elite PMC squads',
          targetWave: 4,
          notice: 'Water drag inside the swimming pool disables firearm discharge; maneuver between salon tables and exterior gangways.'
        },
        {
          id: 'level5',
          code: 'SECTOR 05 // GRAND HORIZON',
          title: 'Level 05 · Hotel Lobby',
          intel: [
            'Retreating syndicate command has entrenched inside a five-star hotel lobby, fortifying the mahogany salons and VIP lounges.',
            'Hostiles have deployed advanced combat specialists: "Jammer Hostiles" capable of projecting localized Void Blind Zones.',
            'Entering a Jammer field impairs vision and slows movement, concealing enemies until directly confronted.'
          ],
          objective: 'Neutralize the command outpost and eliminate 4 waves of hostile forces',
          targetWave: 4,
          notice: 'Jammers possess directional energy shielding. Engage from distance and eliminate them before entering their void fields.'
        },
        {
          id: 'level6',
          code: 'SECTOR 06 // IRONFANG EXPRESS',
          title: 'Level 06 · Armored Express Train',
          intel: [
            'Syndicate brass have boarded an ultra-high-speed armored express cutting across the sub-zero frontier.',
            'Six interconnected cars (Passenger, Bistro, VIP Suites, Bridge, Reactor, Cargo) form a linear, unrelenting kill-zone.',
            'Armored riot teams and shotgun assault guards advance relentlessly down the narrow gangway.'
          ],
          objective: 'Fight through the narrow cars and eliminate 5 waves of train assault units',
          targetWave: 5,
          notice: 'Flanking is impossible in the tight aisle; employ grenade bounces over seat partitions and deploy killstreak heavy weaponry.'
        },
        {
          id: 'level7',
          code: 'SECTOR 07 // COMMAND CENTER',
          title: 'Level 07 · Command Center',
          intel: [
            'The trapezoidal command hall is the nerve center of the operation, anchored by a central circular conference table and sector command consoles.',
            'Three surveillance cameras cover four heavy blast doors and the conference table, while circular pod stations and triple cubicles form a tight defensive line.',
            'Near-black special operatives with arc shields and emerald blind-zone traps breach the hall alongside suited agents. Hold the command core.'
          ],
          objective: 'Defend the trapezoidal command hall and eliminate 5 waves of elite defenders',
          targetWave: 5,
          notice: 'Use the circular conference table and sector consoles as cover. Watch for camera alarms and the special operatives\' emerald blind-zone traps.'
        },
        {
          id: 'level8',
          code: 'SECTOR 08 // TEST LAB',
          title: 'Level 08 · Test Sandbox',
          intel: [
            'Level 08 is the full-map test sandbox of the Command Center: all three rooms, used to validate new enemy models, suited agents and the gas mask.',
            'The live Level 7 keeps the middle room only; changes are proven here first, then merged into the live level.',
            'All experimental content is strictly scoped to this level and never touches the live levels.'
          ],
          objective: 'Validate new systems in the Level 08 test sandbox',
          targetWave: 1,
          notice: 'Test level: enemies ignore the player (inspect mode); press G to toggle the gas mask.'
        }
      ]
    },
    objectiveModal: {
      title: 'PRIMARY OBJECTIVE ACCOMPLISHED!',
      subtitle: 'Hostile defense network broken. Strategic extraction corridor is now open.',
      waveCompletedDesc: (wave: number) => `Successfully neutralized first ${wave} waves. Mission criteria satisfied.`,
      extractBtn: 'Extract to Next Sector',
      continueBtn: 'Continue Endless Waves',
      finalVictoryBtn: 'Complete Operation · Victory',
      campaignVictoryTitle: 'TOTAL VICTORY · PANOPTICON NETWORK SHATTERED!',
      campaignVictoryDesc: 'Agent Specter has penetrated all seven syndicate bastions. The Panopticon eye is silenced forever!',
      extractHudTip: 'Objective Met · Press [E] to Extract',
      hudExtractBtn: '[E] Extract',
      objectiveBadge: (current: number, target: number) => `Objective Wave: ${current}/${target}`
    },
    tutorial: {
      title: 'Tutorial & Game Mechanics',
      backBtn: 'Back',
      moveAimTitle: 'Movement & Aim',
      moveAimDesc1: 'WASD: Omnidirectional character movement.',
      moveAimDesc2: 'Mouse: Aim crosshair and rotate perspective.',
      weaponsTitle: 'Weapons System',
      weaponsDesc1: 'Left Mouse: Discharge equipped firearm.',
      weaponsDesc2: 'Keys 1 - 5: Switch weapons. R: Manual reload. V: Toggle rifle semi/full auto (Level 7/8 only).',
      armorTitle: 'Armor & Supplies',
      armorDesc1: 'Armor absorbs bullet and explosive damage; regenerates automatically when out of combat.',
      armorDesc2: 'Defeated hostiles drop tactical supplies that replenish armor and Blind Zone energy.',
      blindTeleportTitle: 'Blind Zone & Teleport',
      blindTeleportDesc1: 'Press SPACE to deploy or retract the Blind Zone.',
      blindTeleportDesc2: 'Double-click Left Mouse inside the Blind Zone to teleport.',
      blindDamageTitle: 'Delayed Damage Resolution',
      blindDamageDesc: 'The Blind Zone creates a bidirectional visual barrier (outside cannot see in, inside cannot see out). Damage dealt inside accumulates and erupts simultaneously when the zone collapses.',
      trapTitle: 'Decoy Trap [Key 5 + Right Click]',
      trapDesc: 'While Blind Zone is active and Grenades (Key 5) are equipped, Right-Click the ground to plant a decoy trap.',
      killstreakTitle: 'Killstreak Rewards',
      killstreak3Title: '3 Kills: [Key 6] Machine Gun',
      killstreak3Desc: 'Heavy suppressive machine gun fire (+30 rounds).',
      killstreak5Title: '5 Kills: [Key 7] UAV Strike',
      killstreak5Desc: 'Scans all hostiles and executes precision targeted airstrikes.',
      killstreak7Title: '7 Kills: [Key 8 / Space] Full Blind Zone',
      killstreak7Desc: 'Map-wide Blind Zone deployment for complete tactical concealment.',
      observerTitle: 'Observer Hostiles',
      observerDesc: 'Heavily armored enemies that can pierce through Blind Zones; highly susceptible to decoy traps.',
      jammerTitle: 'Jammer Hostiles',
      jammerDesc: 'Spawns from Wave 5. Deploys localized Void Blind Zones that restrict vision & slow movement; hostiles inside remain concealed even when attacking until scanned directly; equipped with a one-time semi-arc shield.',
      coverTitle: 'Tactical Cover',
      coverGlassDesc: 'Bulletproof Glass: Does not block line of sight; bullets penetrate with damage falloff, but deflects grenades.',
      coverLowWallDesc: 'Low Wall: Blocks line of sight and direct gunfire; grenades can be lobbed over.'
    },
    weapons: {
      rifle: '1: Rifle',
      pistol: '2: Pistol',
      smg: '3: SMG',
      sniper: '4: Sniper',
      grenade: '5: Grenade',
      machineGun: '6: MG',
      uav: '7: UAV'
    }
  }
};

export const LOG_TRANSLATION_MAP: Record<string, string> = {
  "泳池内无法使用枪械": "Cannot fire weapons inside pool",
  "盲区已开启": "Blind Zone activated",
  "能量不足，无法开启盲区！": "Insufficient energy for Blind Zone",
  "全图警报！": "ALARM TRIGGERED!",
  "手榴弹无法扔出泳池外": "Grenades cannot exit pool area",
  "盲区瞬移成功": "Teleport successful",
  "无法在目标附近瞬移": "Cannot teleport too close to target",
  "诱饵陷阱部署成功": "Decoy trap deployed",
  "无法在掩体上部署陷阱": "Cannot place trap on cover",
  "只能在盲区内部署陷阱": "Traps must be placed inside Blind Zone",
  "观察者已被陷阱消灭": "Observer eliminated by decoy trap",
  "拾取医疗包 (+35 生命值)": "Medkit acquired (+35 HP)",
  "拾取补给 (+50 防弹衣 / +40 能量)": "Supplies acquired (+50 Armor / +40 Energy)",
  "💾 已获取绝密数据芯片！区域主电源已重启，照明系统恢复。": "💾 Classified data secured! Main power restored, full lighting enabled.",
  "全图盲区效果已到期": "Blind Zone duration expired"
};
