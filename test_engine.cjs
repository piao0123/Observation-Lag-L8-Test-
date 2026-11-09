const fs = require('fs');

// Mock browser environment
global.window = global;
global.document = {
    getElementById: (id) => {
        if (id === 'canvas') {
            return {
                getContext: () => ({
                    save: () => {}, restore: () => {}, beginPath: () => {}, closePath: () => {},
                    moveTo: () => {}, lineTo: () => {}, fill: () => {}, stroke: () => {},
                    fillRect: () => {}, strokeRect: () => {}, clearRect: () => {},
                    arc: () => {}, translate: () => {}, rotate: () => {}, scale: () => {},
                    transform: () => {}, clip: () => {}, fillStyle: '', strokeStyle: '',
                    lineWidth: 1, setLineDash: () => {}, createLinearGradient: () => ({ addColorStop: () => {} }),
                    createRadialGradient: () => ({ addColorStop: () => {} })
                }),
                width: 1280, height: 720, addEventListener: () => {}
            };
        }
        return { style: {}, addEventListener: () => {}, appendChild: () => {}, scrollIntoView: () => {}, setAttribute: () => {}, children: [] };
    },
    createElement: () => ({ style: {}, addEventListener: () => {}, appendChild: () => {}, scrollIntoView: () => {}, setAttribute: () => {}, children: [] }),
    addEventListener: () => {}
};
global.window.addEventListener = () => {};
global.window.innerWidth = 1280;
global.window.innerHeight = 720;
global.requestAnimationFrame = (fn) => setTimeout(fn, 16);
global.Date.now = Date.now;

console.log('Loading level modules...');
require('./src/js/levels/level1_airport.js');
require('./src/js/levels/level2_subway.js');
require('./src/js/levels/level3_bank.js');
require('./src/js/levels/level0_test.js');
require('./src/js/levels/level4_yacht.js');
require('./src/js/levels/level5_hotel.js');
require('./src/js/levels/level6_train.js');
require('./src/js/levels/level7_lab.js');
require('./src/js/levels/level8_test.js');
require('./src/js/soundManager.js');
require('./src/js/levelManager.js');

console.log('Loading engine.js...');
require('./src/js/engine.js');

console.log('Testing level switching and 60 frame updates for all levels...');
const levelIds = ['level1_airport', 'level2_subway', 'level3_bank', 'level0_test', 'level4_yacht', 'level5_hotel', 'level6_train', 'level7_lab', 'level8_test'];

for (let id of levelIds) {
    console.log(`Testing level: ${id}`);
    if (global.levelManager && global.levelManager.loadLevel) {
        global.levelManager.loadLevel(id);
    }
    if (typeof global.initMapLayout === 'function') {
        global.initMapLayout();
    }
    if (typeof global.startGame === 'function') {
        global.startGame();
    }
    for (let frame = 0; frame < 60; frame++) {
        if (typeof global.gameLoop === 'function') {
            global.gameLoop();
        } else if (typeof global.update === 'function') {
            global.update();
        }
    }
    console.log(`Level ${id} OK!`);
}

console.log('ALL LEVELS TESTED SUCCESSFULLY!');
process.exit(0);
