/**
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 * Parts of the code are based on pyvenn available at:
 * https://github.com/tctianchi/pyvenn
 */

const DEFAULT_COLORS = [
  'rgba(92, 192, 98, 0.5)',
  'rgba(90, 155, 212, 0.5)',
  'rgba(246, 236, 86, 0.6)',
  'rgba(241, 90, 96, 0.4)',
  'rgba(255, 117, 0, 0.3)',
  'rgba(82, 82, 190, 0.2)',
]

function vennSvg_(labels, names, colors = DEFAULT_COLORS) {
  return `<svg width="600" height="600" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
    <style>
      text {
          font-size: 14pt;
          fill: black;
          font-family: "Noto Sans";
          text-anchor: middle;
          dominant-baseline: middle;
      }
      .tl { text-anchor: start; dominant-baseline: auto; }
      .tr { text-anchor: end; dominant-baseline: auto; }
      .tm { dominant-baseline: auto; }
      .bl { text-anchor: start; dominant-baseline: hanging; }
      .br { text-anchor: end; dominant-baseline: hanging; }
      .bm { dominant-baseline: hanging; }
    </style>
    ${vennBody_(labels, names, colors)}
  </svg>`;
}


// Based on pyvenn (https://github.com/tctianchi/pyvenn)
// For venn6 see https://web.archive.org/web/20040819232503/http://www.hpl.hp.com/techreports/2000/HPL-2000-73.pdf
function vennBody_(l, n, c) {
  const yy = (y) => 1000 - y;
  const xx = (x) => x;
  const e = (x, y, dx, dy, rotationDeg, color) => `<g transform="translate(${xx(x)},${yy(y)})"><ellipse rx="${dx/2}" ry="${dy/2}" fill="${color}"${optionalTransform(rotationDeg)}/></g>`;
  const t = (x, y, label, cls) => `<text x="${xx(x)}" y="${yy(y)}"${optionalClass(cls)}>${label}</text>`;
  const tr = (x1, y1, x2, y2, x3, y3, color) => `<path d="M${xx(x1)},${yy(y1)}L${xx(x2)},${yy(y2)}L${xx(x3)},${yy(y3)}Z" fill="${color}"/>`;
  const optionalClass = (cls) => cls ? ` class="${cls}"` : '';
  const optionalTransform = (rotationDeg) => rotationDeg !== 0.0 ? ` transform="rotate(${-rotationDeg})"` : '';
  const m = n.length;
  return m === 2 ? `
    ${e(375, 300, 500, 500, 0.0, c[0])}
    ${e(625, 300, 500, 500, 0.0, c[1])}
    ${t(740, 300, l['01'])}
    ${t(260, 300, l['10'])}
    ${t(500, 300, l['11'])}
    ${t(200, 560, n[0], c[0], "br")}
    ${t(800, 560, n[1], c[1], "bl")}` : m === 3 ? `
    ${e(333, 633, 500, 500, 0.0, c[0])}
    ${e(666, 633, 500, 500, 0.0, c[1])}
    ${e(500, 310, 500, 500, 0.0, c[2])}
    ${t(500, 270, l['001'])}
    ${t(730, 650, l['010'])}
    ${t(610, 460, l['011'])}
    ${t(270, 650, l['100'])}
    ${t(390, 460, l['101'])}
    ${t(500, 650, l['110'])}
    ${t(500, 510, l['111'])}
    ${t(150, 870, n[0], c[0], "br")}
    ${t(850, 870, n[1], c[1], "bl")}
    ${t(500, 20, n[2], c[2], "tm")}` : m === 4 ? `
    ${e(350, 400, 720, 450, 140.0, c[0])}
    ${e(450, 500, 720, 450, 140.0, c[1])}
    ${e(544, 500, 720, 450, 40.0, c[2])}
    ${e(644, 400, 720, 450, 40.0, c[3])}
    ${t(850, 420, l['0001'])}
    ${t(680, 720, l['0010'])}
    ${t(770, 590, l['0011'])}
    ${t(320, 720, l['0100'])}
    ${t(710, 300, l['0101'])}
    ${t(500, 660, l['0110'])}
    ${t(650, 500, l['0111'])}
    ${t(140, 420, l['1000'])}
    ${t(500, 170, l['1001'])}
    ${t(290, 300, l['1010'])}
    ${t(390, 240, l['1011'])}
    ${t(230, 590, l['1100'])}
    ${t(610, 240, l['1101'])}
    ${t(350, 500, l['1110'])}
    ${t(500, 380, l['1111'])}
    ${t(130, 180, n[0], c[0], "mr")}
    ${t(180, 830, n[1], c[1], "br")}
    ${t(820, 830, n[2], c[2], "bl")}
    ${t(870, 180, n[3], c[3], "tl")}` : m === 5 ? `
    ${e(428, 449, 870, 500, 155.0, c[0])}
    ${e(469, 543, 870, 500, 82.0, c[1])}
    ${e(558, 523, 870, 500, 10.0, c[2])}
    ${e(578, 432, 870, 500, 118.0, c[3])}
    ${e(489, 383, 870, 500, 46.0, c[4])}
    ${t(270, 110, l['00001'])}
    ${t(720, 110, l['00010'])}
    ${t(550, 130, l['00011'])}
    ${t(910, 580, l['00100'])}
    ${t(780, 640, l['00101'])}
    ${t(840, 410, l['00110'])}
    ${t(760, 550, l['00111'])}
    ${t(510, 900, l['01000'])}
    ${t(390, 150, l['01001'])}
    ${t(420, 780, l['01010'])}
    ${t(500, 150, l['01011'])}
    ${t(670, 760, l['01100'])}
    ${t(700, 710, l['01101'])}
    ${t(510, 740, l['01110'])}
    ${t(640, 670, l['01111'])}
    ${t(100, 610, l['10000'])}
    ${t(200, 310, l['10001'])}
    ${t(760, 250, l['10010'])}
    ${t(650, 230, l['10011'])}
    ${t(180, 500, l['10100'])}
    ${t(210, 370, l['10101'])}
    ${t(810, 370, l['10110'])}
    ${t(740, 400, l['10111'])}
    ${t(270, 700, l['11000'])}
    ${t(340, 250, l['11001'])}
    ${t(330, 720, l['11010'])}
    ${t(510, 220, l['11011'])}
    ${t(250, 580, l['11100'])}
    ${t(280, 390, l['11101'])}
    ${t(360, 660, l['11110'])}
    ${t(510, 470, l['11111'])}
    ${t(20, 720, n[0], c[0], "mr")}
    ${t(720, 940, n[1], c[1], "bm")}
    ${t(970, 740, n[2], c[2], "ml")}
    ${t(880, 50, n[3], c[3], "ml")}
    ${t(120, 50, n[4], c[4], "mr")}` : m === 6 ? `
    ${tr(637, 921, 649, 274, 188, 667, c[0])}
    ${tr(981, 769, 335, 191, 393, 671, c[1])}
    ${tr(941, 397, 292, 475, 456, 747, c[2])}
    ${tr(662, 119, 316, 548, 662, 700, c[3])}
    ${tr(309, 81, 374, 718, 681, 488, c[4])}
    ${tr(16, 626, 726, 687, 522, 327, c[5])}
    ${t(212, 562, l['000001'])}
    ${t(430, 249, l['000010'])}
    ${t(356, 444, l['000011'])}
    ${t(609, 255, l['000100'])}
    ${t(323, 546, l['000101'])}
    ${t(513, 316, l['000110'])}
    ${t(523, 348, l['000111'])}
    ${t(747, 458, l['001000'])}
    ${t(325, 492, l['001001'])}
    ${t(670, 481, l['001010'])}
    ${t(359, 478, l['001011'])}
    ${t(653, 444, l['001100'])}
    ${t(344, 526, l['001101'])}
    ${t(653, 466, l['001110'])}
    ${t(363, 503, l['001111'])}
    ${t(750, 616, l['010000'])}
    ${t(682, 654, l['010001'])}
    ${t(402, 310, l['010010'])}
    ${t(392, 421, l['010011'])}
    ${t(653, 691, l['010100'])}
    ${t(651, 644, l['010101'])}
    ${t(490, 340, l['010110'])}
    ${t(468, 399, l['010111'])}
    ${t(692, 545, l['011000'])}
    ${t(666, 592, l['011001'])}
    ${t(665, 496, l['011010'])}
    ${t(374, 470, l['011011'])}
    ${t(653, 537, l['011100'])}
    ${t(652, 579, l['011101'])}
    ${t(653, 488, l['011110'])}
    ${t(389, 486, l['011111'])}
    ${t(553, 806, l['100000'])}
    ${t(313, 604, l['100001'])}
    ${t(388, 694, l['100010'])}
    ${t(375, 633, l['100011'])}
    ${t(605, 359, l['100100'])}
    ${t(334, 555, l['100101'])}
    ${t(582, 397, l['100110'])}
    ${t(542, 372, l['100111'])}
    ${t(468, 708, l['101000'])}
    ${t(355, 572, l['101001'])}
    ${t(420, 679, l['101010'])}
    ${t(375, 597, l['101011'])}
    ${t(641, 436, l['101100'])}
    ${t(348, 538, l['101101'])}
    ${t(635, 453, l['101110'])}
    ${t(370, 548, l['101111'])}
    ${t(594, 689, l['110000'])}
    ${t(579, 670, l['110001'])}
    ${t(398, 670, l['110010'])}
    ${t(395, 653, l['110011'])}
    ${t(633, 682, l['110100'])}
    ${t(616, 656, l['110101'])}
    ${t(587, 427, l['110110'])}
    ${t(526, 415, l['110111'])}
    ${t(495, 677, l['111000'])}
    ${t(505, 648, l['111001'])}
    ${t(428, 663, l['111010'])}
    ${t(430, 631, l['111011'])}
    ${t(639, 524, l['111100'])}
    ${t(591, 604, l['111101'])}
    ${t(622, 477, l['111110'])}
    ${t(501, 523, l['111111'])}
    ${t(674, 824, n[0], c[0])}
    ${t(747, 751, n[1], c[1])}
    ${t(739, 396, n[2], c[2])}
    ${t(700, 247, n[3], c[3])}
    ${t(291, 255, n[4], c[4])}
    ${t(203, 484, n[5], c[5])}` : undefined;
}

/**
 * Generates a label map for Venn diagram sets.
 * @param {Array<Array>} table - Rows of [item, groupName]
 * @param {Array<string>} fill - display string, which can include {number}, {percent} or {logic}
 * @return {Object} Map from binary code (e.g. "101") to label
 */
function vennLabelsNames_(table, format = '{number}') {
  // Organize items by group
  const groupsMap = new Map();
  const itemGroups = new Map();

  for (const [item, group] of table) {
    if (!groupsMap.has(group)) {
      groupsMap.set(group, new Set());
    }
    groupsMap.get(group).add(item);
    
    // Track which groups each item belongs to
    if (!itemGroups.has(item)) {
      itemGroups.set(item, new Set());
    }
    itemGroups.get(item).add(group);
  }

  const groupNames = Array.from(groupsMap.keys()).sort();
  const N = groupNames.length;
  const totalItems = itemGroups.size;
  
  // Create a mapping from group name to bit position
  const groupBitPosition = new Map();
  groupNames.forEach((name, index) => {
    groupBitPosition.set(name, index);
  });

  // Counter for each bitmap instead of storing full sets
  const bitmapCounter = new Map();

  // Count items for each bitmap configuration
  itemGroups.forEach((groups, item) => {
    let bitmap = 0;
    groups.forEach(group => {
      const position = groupBitPosition.get(group);
      bitmap |= (1 << (N - position - 1));
    });
    
    // Increment counter for this bitmap
    bitmapCounter.set(bitmap, (bitmapCounter.get(bitmap) || 0) + 1);
  });

  // Generate labels
  const labels = {};
  
  // Loop through all binary codes (excluding 000...0)
  for (let n = 1; n < 1 << N; n++) {
    const key = n.toString(2).padStart(N, '0');
    const count = bitmapCounter.get(n) || 0;
    
    const label = format.replace(/([{](?:number|percent|logic)[}])/g, (m) => {
      switch (m) {
        case '{logic}': return key;
        case '{number}': return count;
        case '{percent}': return ((count / totalItems) * 100).toFixed(1);
      }
      return '';
    });
    
    labels[key] = label;
  }

  return {labels, names: groupNames};
}
