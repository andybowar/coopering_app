/**
 * Rise/run form of the curve-coopering taper.
 *
 * The taper can be reported as a mark-out offset instead of an angle: over the
 * stave length (run), each long edge moves in by the rise. Because the stave is
 * a symmetric trapezoid, rise = |frontWidth - backWidth| / 2, and it must agree
 * with the angle: rise = run * tan(taperAngle).
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { calculateTaperedCoop, calculateRadiusCoop } from '../src/utils/curveCoopFormulas';

const cases: [front: number, back: number, chord: number, depth: number, n: number][] = [
  [20, 15, 18, 10, 8],
  [15, 20, 18, 10, 8], // back wider than front
  [30, 24, 24, 6, 12],
  [12, 11.5, 10, 3.5, 5]
];

describe('curve coopering taper rise/run', () => {
  test('rise is half the front/back width difference', () => {
    for (const [f, b, c, d, n] of cases) {
      const s = calculateTaperedCoop(f, b, c, d, n, 3).staves[0];
      const half = Math.abs(s.width - s.backWidth!) / 2;
      assert.ok(s.taperRise! >= 0, `rise should be non-negative, got ${s.taperRise}`);
      assert.ok(Math.abs(s.taperRise! - half) <= 0.0001 * 1.000001, `${s.taperRise} vs ${half}`);
    }
  });

  test('run is the stave length', () => {
    for (const [f, b, c, d, n] of cases) {
      const s = calculateTaperedCoop(f, b, c, d, n, 3).staves[0];
      assert.equal(s.taperRun, s.length);
      assert.equal(s.taperRun, Number(d.toFixed(4)));
    }
  });

  test('rise equals run * tan(taperAngle)', () => {
    for (const [f, b, c, d, n] of cases) {
      // Unrounded angle check: use high precision so rounding doesn't dominate.
      const s = calculateTaperedCoop(f, b, c, d, n, 6).staves[0];
      const fromAngle = s.taperRun! * Math.tan((Math.abs(s.taperAngle!) * Math.PI) / 180);
      assert.ok(Math.abs(s.taperRise! - fromAngle) < 1e-4, `${s.taperRise} vs ${fromAngle}`);
    }
  });

  test('equal radii give zero taper', () => {
    const s = calculateTaperedCoop(20, 20, 18, 10, 8, 3).staves[0];
    assert.equal(s.taperRise, 0);
  });

  test('untapered results have no rise/run', () => {
    const s = calculateRadiusCoop(20, 18, 8, 3).staves[0];
    assert.equal(s.taperRise, undefined);
    assert.equal(s.taperRun, undefined);
  });
});
