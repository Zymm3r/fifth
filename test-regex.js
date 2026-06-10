// Test the Vercel rewrite regex pattern
const regex = new RegExp('^/((?!.*\\..*).*)$');

const testCases = [
  { path: '/', expected: true },
  { path: '/some-route', expected: true },
  { path: '/style.css', expected: false },
  { path: '/script.js', expected: false },
  { path: '/feature.css', expected: false },
  { path: '/src/components/progressionExplorer.js', expected: false },
  { path: '/.config/something', expected: false },
  { path: '/favicon.ico', expected: false },
];

let allPass = true;
testCases.forEach(({ path: p, expected }) => {
  const result = regex.test(p);
  const pass = result === expected;
  if (!pass) allPass = false;
  console.log(`${pass ? '✅' : '❌'} '${p}' → rewrite: ${result} (expected: ${expected})`);
});

console.log(`\n${allPass ? '✅ All tests pass!' : '❌ Some tests failed'}`);