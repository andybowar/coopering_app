// Find miter angle formula for shallow pyramids
const ex2 = {
  N: 6,
  sideSlope: 24.8,
  bladeTiltMitered: 12.1,
  expectedMiter: 27.7
};

console.log('Finding miter formula for shallow pyramids (side slope ≤ 45°)');
console.log(`Ex2: N=6, sideSlope=24.8°, bladeTiltMitered=12.1°, expected miter=27.7°\n`);

// Try various formulas
const tests = [
  {
    name: 'atan(tan(bladeTiltMitered) * tan(90° - 180°/N))',
    calc: () => Math.atan(Math.tan(ex2.bladeTiltMitered * Math.PI/180) * Math.tan((90 - 180/ex2.N) * Math.PI/180)) * 180/Math.PI
  },
  {
    name: 'atan(sin(sideSlope) / cos(180°/N))',
    calc: () => Math.atan(Math.sin(ex2.sideSlope * Math.PI/180) / Math.cos((180/ex2.N) * Math.PI/180)) * 180/Math.PI
  },
  {
    name: 'asin(sin(sideSlope) / sqrt(2))',
    calc: () => Math.asin(Math.sin(ex2.sideSlope * Math.PI/180) / Math.sqrt(2)) * 180/Math.PI
  },
  {
    name: 'atan(tan(sideSlope) * sin(180°/N))',
    calc: () => Math.atan(Math.tan(ex2.sideSlope * Math.PI/180) * Math.sin((180/ex2.N) * Math.PI/180)) * 180/Math.PI
  },
  {
    name: 'atan(sin(sideSlope) * tan(180°/N))',
    calc: () => Math.atan(Math.sin(ex2.sideSlope * Math.PI/180) * Math.tan((180/ex2.N) * Math.PI/180)) * 180/Math.PI
  },
  {
    name: 'asin(tan(bladeTiltMitered) * sqrt(2))',
    calc: () => Math.asin(Math.tan(ex2.bladeTiltMitered * Math.PI/180) * Math.sqrt(2)) * 180/Math.PI
  },
  {
    name: 'atan(tan(bladeTiltMitered) / cos(bladeTiltMitered))',
    calc: () => Math.atan(Math.tan(ex2.bladeTiltMitered * Math.PI/180) / Math.cos(ex2.bladeTiltMitered * Math.PI/180)) * 180/Math.PI
  },
  {
    name: 'asin(sin(bladeTiltMitered) / cos(180°/N))',
    calc: () => Math.asin(Math.sin(ex2.bladeTiltMitered * Math.PI/180) / Math.cos((180/ex2.N) * Math.PI/180)) * 180/Math.PI
  },
  {
    name: 'atan(tan(bladeTiltMitered) / sin(180°/N))',
    calc: () => Math.atan(Math.tan(ex2.bladeTiltMitered * Math.PI/180) / Math.sin((180/ex2.N) * Math.PI/180)) * 180/Math.PI
  }
];

tests.forEach(test => {
  try {
    const result = test.calc();
    const diff = Math.abs(result - ex2.expectedMiter);
    const match = diff < 0.5;
    console.log(`${match ? '✅' : '❌'} ${test.name}`);
    console.log(`   Result: ${result.toFixed(1)}° (diff: ${diff.toFixed(1)}°)\n`);
  } catch (e) {
    console.log(`❌ ${test.name}`);
    console.log(`   Error: ${e.message}\n`);
  }
});
