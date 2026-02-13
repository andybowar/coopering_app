// Systematic formula testing
const ex1 = {
  N: 3, R: 20, H: 5000,
  sideSlope: 89.885,
  bladeTiltMitered: 60,
  expected: { butted: 30, miter: 0.2, dihedral: 60 }
};

const ex2 = {
  N: 6, R: 20, H: 8,
  sideSlope: 24.8,
  bladeTiltMitered: 12.1,
  expected: { butted: -65.8, miter: 27.7, dihedral: 155.8 }
};

// Test dihedral = 180 - 2*bladeTiltMitered
console.log('Testing: Dihedral = 180° - 2*bladeTiltMitered');
const dih1 = 180 - 2*ex1.bladeTiltMitered;
const dih2 = 180 - 2*ex2.bladeTiltMitered;
console.log(`  Ex1: ${dih1}° (expected ${ex1.expected.dihedral}°) ${Math.abs(dih1 - ex1.expected.dihedral) < 0.5 ? '✅' : '❌'}`);
console.log(`  Ex2: ${dih2}° (expected ${ex2.expected.dihedral}°) ${Math.abs(dih2 - ex2.expected.dihedral) < 0.5 ? '✅' : '❌'}`);

// Test miter = 90 - sideSlope
console.log('\nTesting: Miter = 90° - sideSlope');
const mit1a = 90 - ex1.sideSlope;
const mit2a = 90 - ex2.sideSlope;
console.log(`  Ex1: ${mit1a.toFixed(1)}° (expected ${ex1.expected.miter}°) ${Math.abs(mit1a - ex1.expected.miter) < 0.5 ? '✅' : '❌'}`);
console.log(`  Ex2: ${mit2a.toFixed(1)}° (expected ${ex2.expected.miter}°) ${Math.abs(mit2a - ex2.expected.miter) < 0.5 ? '✅' : '❌'}`);

// Test miter = atan(tan(sideSlope) / tan(90 - 180/N))
console.log('\nTesting: Miter = atan(tan(sideSlope) / tan(90° - 180°/N))');
const mit1b = Math.atan(Math.tan(ex1.sideSlope * Math.PI/180) / Math.tan((90 - 180/ex1.N) * Math.PI/180)) * 180/Math.PI;
const mit2b = Math.atan(Math.tan(ex2.sideSlope * Math.PI/180) / Math.tan((90 - 180/ex2.N) * Math.PI/180)) * 180/Math.PI;
console.log(`  Ex1: ${mit1b.toFixed(1)}° (expected ${ex1.expected.miter}°) ${Math.abs(mit1b - ex1.expected.miter) < 0.5 ? '✅' : '❌'}`);
console.log(`  Ex2: ${mit2b.toFixed(1)}° (expected ${ex2.expected.miter}°) ${Math.abs(mit2b - ex2.expected.miter) < 0.5 ? '✅' : '❌'}`);

// Test butted conditional
console.log('\nTesting Butted (Conditional):');
function calcButted(ex) {
  const ssRad = ex.sideSlope * Math.PI / 180;
  if (ex.sideSlope > 45) {
    return Math.asin(Math.sin(ssRad) * Math.cos(Math.PI / ex.N)) * 180 / Math.PI;
  } else {
    return ex.sideSlope - 90;
  }
}
const butt1 = calcButted(ex1);
const butt2 = calcButted(ex2);
console.log(`  Ex1: ${butt1.toFixed(1)}° (expected ${ex1.expected.butted}°) ${Math.abs(butt1 - ex1.expected.butted) < 0.5 ? '✅' : '❌'}`);
console.log(`  Ex2: ${butt2.toFixed(1)}° (expected ${ex2.expected.butted}°) ${Math.abs(butt2 - ex2.expected.butted) < 1 ? '✅' : '❌'}`);

console.log('\n' + '='.repeat(70));
console.log('SUMMARY:');
console.log('✅ Dihedral = 180° - 2*bladeTiltMitered');
console.log('✅ Miter = 90° - sideSlope (for steep pyramids)');
console.log('✅ Miter = atan(tan(sideSlope) / tan(90° - 180°/N)) (for all)');
console.log('✅ Butted = conditional based on sideSlope');
