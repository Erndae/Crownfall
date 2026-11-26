// Relic and card artwork must survive land changes and saved inventory order.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const run = require('./test-support/game-runtime.cjs').testEval;
const source = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const worker = fs.readFileSync(path.join(__dirname, 'sw.js'), 'utf8');
const version = source.match(/const GAME_VERSION = (\d+);/)[1];
assert(source.includes('storybook.css?v=' + version));
assert(worker.includes('./storybook.css?v=' + version));
assert(worker.includes('./assets/card-illustrations.webp'));
const cardMarks = run('CARDS.map(c => cardIllustration(c.id))');
assert(cardMarks.every(mark => mark.includes('aria-hidden="true"')));
assert.equal(new Set(cardMarks).size, cardMarks.length);
for (const land of ['street', 'medieval', 'greek', 'fantasy', 'throne']) {
  run(`setPack('${land}')`);
  const marks = run('RELICS.map(r => relicIcon(r))');
  assert.equal(new Set(marks).size, 26, land);
  assert(marks.every(mark => mark.includes('relic-art')));
  const asset = 'assets/relics/' + land + '.webp';
  assert(worker.includes('./' + asset));
  assert.equal(fs.readFileSync(path.join(__dirname, asset)).toString('ascii', 8, 12), 'WEBP');
}
assert.equal(run("cardIllustration('unknown')"), '');
console.log('PASS: every card and relic has a stable illustration and the offline cache includes the art.');
