// Reverse engineer formulas from both examples
console.log('Analyzing both examples to find correct formulas\n');
console.log('='.repeat(80));

// Example 1: N=3, R=20, H=5000
const ex1 = {
  N: 3,
  R: 20,
  H: 5000,
  expected: {
    bladeTiltMitered: 60,
    bladeTiltButted: 30,
    miterAngle: 0.2,
    sideSlope: 89.9,
    dihedral: 60
  }
};

// Example 2: N=6, R=20, H=8
const ex2 = {
  N: 6,
  R: 20,
  H: 8,
  expected: {
    bladeTiltMitered: 12.1,
    bladeTiltButted: -65.8,
    miterAngle: 27.7,
    sideSlope: 24.8,
    dihedral: 155.8
  }
};

function testFormula(name, formula, ex1Val, ex2Val) {
  const ex1Result = formula(ex1);
  const ex2Result = formula(ex2);
  const ex1Match = Math.abs(ex1Result - ex1Val) < 0.5;
  const ex2Match = Math.abs(ex2Result - ex2Val) < 0.5;

  console.log(`\n${name}:`);
  console.log(`  Ex1: ${ex1Result.toFixed(1)}° (expected ${ex1Val}°) ${ex1Match ? '✅' : '❌'}`);
  console.log(`  Ex2: ${ex2Result.toFixed(1)}° (expected ${ex2Val}°) ${ex2Match ? '✅' : '❌'}`);

  return ex1Match && ex2Match;
}

// Calculate basic values
function calcApothem(ex) {
  return ex.R * Math.cos(Math.PI / ex.N);
}

function calcSideSlope(ex) {
  const apothem = calcApothem(ex);
  return Math.atan(ex.H / apothem) * (180 / Math.PI);
}

// Test blade tilt mitered formulas
console.log('\n--- Testing Blade Tilt (Mitered) Formulas ---');

// Try: asin(sin(sideSlope) * sin(π/N))
const formula1 = (ex) => {
  const sideSlope = calcSideSlope(ex);
  const sideSlopeRad = sideSlope * Math.PI / 180;
  return Math.asin(Math.sin(sideSlopeRad) * Math.sin(Math.PI / ex.N)) * (180 / Math.PI);
};

testFormula('asin(sin(sideSlope) * sin(π/N))', formula1,
  ex1.expected.bladeTiltMitered, ex2.expected.bladeTiltMitered);

// Test blade tilt butted formulas
console.log('\n--- Testing Blade Tilt (Butted) Formulas ---');

// Try: asin(sin(sideSlope) * cos(π/N))
const formula2a = (ex) => {
  const sideSlope = calcSideSlope(ex);
  const sideSlopeRad = sideSlope * Math.PI / 180;
  return Math.asin(Math.sin(sideSlopeRad) * Math.cos(Math.PI / ex.N)) * (180 / Math.PI);
};

testFormula('asin(sin(sideSlope) * cos(π/N))', formula2a,
  ex1.expected.bladeTiltButted, ex2.expected.bladeTiltButted);

// Try: 90° - asin(cos(sideSlope) / cos(π/N))
const formula2b = (ex) => {
  const sideSlope = calcSideSlope(ex);
  const sideSlopeRad = sideSlope * Math.PI / 180;
  const val = Math.cos(sideSlopeRad) / Math.cos(Math.PI / ex.N);
  if (val > 1) return 90 - 90; // asin(1) = 90
  return 90 - Math.asin(val) * (180 / Math.PI);
};

testFormula('90° - asin(cos(sideSlope) / cos(π/N))', formula2b,
  ex1.expected.bladeTiltButted, ex2.expected.bladeTiltButted);

// Test dihedral angle formulas
console.log('\n--- Testing Dihedral Angle Formulas ---');

// Try: 180° - 2*atan(H/apothem)
const formula3a = (ex) => {
  const apothem = calcApothem(ex);
  return 180 - 2 * Math.atan(ex.H / apothem) * (180 / Math.PI);
};

testFormula('180° - 2*atan(H/apothem)', formula3a,
  ex1.expected.dihedral, ex2.expected.dihedral);

// Try: 180° - 2*atan(apothem/H)
const formula3b = (ex) => {
  const apothem = calcApothem(ex);
  return 180 - 2 * Math.atan(apothem / ex.H) * (180 / Math.PI);
};

testFormula('180° - 2*atan(apothem/H)', formula3b,
  ex1.expected.dihedral, ex2.expected.dihedral);

console.log('\n' + '='.repeat(80));
