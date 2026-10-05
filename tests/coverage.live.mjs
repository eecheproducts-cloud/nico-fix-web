// Live check of the postcode checker against the real PDOK service (needs internet).
// Not part of `npm test`; run with: node tests/coverage.live.mjs
import { checkPostcode } from '../assets/js/coverage.js';

const CASES = [
  ['3011 AB', 'Rotterdam'], ['3112 AA', 'Schiedam'], ['2511 BT', 'Den Haag'], ['1012 JS', 'Amsterdam'],
  ['2311 AA', 'Leiden'], ['2611 BA', 'Delft'], ['2801 AA', 'Gouda'], ['2011 AA', 'Haarlem'],
  ['1441 AA', 'Purmerend'], ['3311 AA', 'Dordrecht'], ['1315 AA', 'Almere'], ['1211 AA', 'Hilversum'],
  ['3511 AA', 'Utrecht'], ['1811 LA', 'Alkmaar'], ['4811 AA', 'Breda'], ['3811 AA', 'Amersfoort'],
  ['9711 AA', 'Groningen'], ['5611 AA', 'Eindhoven'],
  ['1299 AB', 'does not exist'], ['3011 ZZ', 'real (BAG)'], ['9999 ZZ', 'does not exist'], ['0000', 'bad format'], ['3112', 'four digits only'],
];

for (const [code, note] of CASES) {
  const r = await checkPostcode(code);
  console.log(`${code.padEnd(8)} ${note.padEnd(16)} -> ${r.status.padEnd(9)} ${r.place ?? ''}`);
}
