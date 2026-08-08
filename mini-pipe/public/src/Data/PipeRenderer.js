/**
 * PipeRenderer - SVGを使ったパイプの描画
 * 各セルに対してSVGパイプを描画する
 */

import { PIPE_TYPES, connectionsMap } from '../Data/PipeEngine.js';

// 中心点
const CX = 50, CY = 50;
// エンドポイント (各方向)
const ENDPOINTS = [
    [50, 0],   // 0: 上
    [100, 50], // 1: 右
    [50, 100], // 2: 下
    [0, 50],   // 3: 左
];

function makePipePath(dirs) {
    if (dirs.length === 1) {
        // dead end
        const [ex, ey] = ENDPOINTS[dirs[0]];
        return `M ${CX} ${CY} L ${ex} ${ey}`;
    }
    if (dirs.length === 2) {
        const [d1, d2] = dirs;
        const [e1x, e1y] = ENDPOINTS[d1];
        const [e2x, e2y] = ENDPOINTS[d2];
        return `M ${e1x} ${e1y} L ${CX} ${CY} L ${e2x} ${e2y}`;
    }
    if (dirs.length === 3) {
        // T字: 3本の線をまとめる
        const paths = dirs.map(d => {
            const [ex, ey] = ENDPOINTS[d];
            return `M ${CX} ${CY} L ${ex} ${ey}`;
        });
        return paths.join(' ');
    }
    if (dirs.length === 4) {
        // 十字: 縦 + 横
        return `M 50 0 L 50 100 M 0 50 L 100 50`;
    }
    return '';
}

export function renderPipeCell(cell, element) {
    const existing = element.querySelector('svg.pipe-svg');
    if (existing) existing.remove();

    const dirs = cell.getConnections();
    const pathData = makePipePath(dirs);

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.classList.add('pipe-svg');

    // 背景の細い線（配管感）
    const bgPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    bgPath.setAttribute('d', pathData);
    bgPath.setAttribute('stroke-width', '18');
    bgPath.setAttribute('stroke', 'rgba(20, 40, 70, 0.8)');
    bgPath.setAttribute('fill', 'none');
    bgPath.setAttribute('stroke-linecap', 'round');
    bgPath.setAttribute('stroke-linejoin', 'round');
    svg.appendChild(bgPath);

    // メインのパイプ
    const mainPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    mainPath.setAttribute('d', pathData);
    mainPath.setAttribute('stroke-width', '14');
    mainPath.setAttribute('fill', 'none');
    mainPath.setAttribute('stroke-linecap', 'round');
    mainPath.setAttribute('stroke-linejoin', 'round');
    mainPath.classList.add('pipe-body');

    if (cell.filled) {
        mainPath.classList.add('water');
        mainPath.setAttribute('stroke-dasharray', '120');
        mainPath.setAttribute('stroke-dashoffset', '0');
    }

    svg.appendChild(mainPath);

    // 内側のハイライト線
    const highlightPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    highlightPath.setAttribute('d', pathData);
    highlightPath.setAttribute('stroke-width', '4');
    highlightPath.setAttribute('stroke', cell.filled ? 'rgba(255, 255, 255, 0.5)' : 'rgba(100, 150, 200, 0.15)');
    highlightPath.setAttribute('fill', 'none');
    highlightPath.setAttribute('stroke-linecap', 'round');
    highlightPath.setAttribute('stroke-linejoin', 'round');
    svg.appendChild(highlightPath);

    // 中心の点
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', '50');
    circle.setAttribute('cy', '50');
    circle.setAttribute('r', dirs.length === 4 ? '8' : '6');
    circle.setAttribute('fill', cell.filled ? '#38bdf8' : 'rgba(80, 130, 180, 0.5)');
    if (cell.filled) {
        circle.setAttribute('filter', 'url(#glow)');
    }
    svg.appendChild(circle);

    // グローフィルター定義
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = `
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
    `;
    svg.prepend(defs);

    element.appendChild(svg);
}
