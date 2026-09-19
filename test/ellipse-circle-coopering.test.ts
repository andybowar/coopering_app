/**
 * Suite backing the merge of cylinder coopering into the ellipse calculator.
 *
 * The hypothesis under test was: "cylinder coopering is redundant, because the
 * ellipse feature with equal length and width gives the same results."
 *
 * That held for the core math, so the cylinder page was removed and its
 * capability folded into the ellipse calculator's Circle mode. These tests
 * check the merged Circle mode against the ANALYTIC regular-polygon formulas
 * rather than against the old implementation, so they keep their meaning now
 * that the old code is gone:
 *
 *   concaveWidth = D * sin(pi/N)
 *   convexWidth  = (D + 2t) * sin(pi/N)
 *   bladeTilt    = 180/N
 *   D            = staveWidth / sin(pi/N)
 *
 * The ellipse solver reaches these numerically (sampling points, measuring
 * chords and turn angles), so exact agreement is not guaranteed at every
 * rounding boundary. The tolerance tests below pin exactly how far it can drift.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  calculateEllipseFromStaves,
  calculateEllipseFromWidth,
  calculateCircleFromDiameter,
  calculateCircleFromStaveWidth,
  calculateConicalCircleFromDiameters,
  calculateConicalEllipseFromStaves,
  MIN_STAVES
} from '../src/utils/ellipseFormulas.ts';

import { validateEllipseInputs } from '../src/utils/ellipseValidation.ts';
import type { EllipseInputs } from '../src/types/ellipse.ts';

/** Analytic reference: chord of a regular N-gon inscribed in diameter D. */
const exactWidth = (D: number, N: number) => D * Math.sin(Math.PI / N);
/** Analytic reference: half the exterior angle. */
const exactTilt = (N: number) => 180 / N;
/** Analytic reference: diameter that N chords of width w close into. */
const exactDiameter = (w: number, N: number) => w / Math.sin(Math.PI / N);

const DIAMETERS = [0.5, 1, 3.25, 6, 12, 18.5, 24, 37.125, 100, 999.9];
const STAVE_COUNTS = [3, 4, 5, 6, 7, 8, 10, 12, 16, 20, 24, 32, 48, 60, 100, 144, 200];
const PRECISIONS = [1, 2, 3];

/** Deterministic LCG so the fuzz sweep is reproducible. */
function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

describe('Circle mode reproduces the analytic cylinder formulas', () => {
  test('concave stave width matches D * sin(pi/N) to 4dp', () => {
    for (const D of DIAMETERS) {
      for (const N of STAVE_COUNTS) {
        const out = calculateCircleFromDiameter(D, N, 2, 0);
        const want = Number(exactWidth(D, N).toFixed(4));
        for (const stave of out.staves) {
          assert.ok(
            Math.abs(stave.concaveWidth - want) <= 0.0001 * 1.000001,
            `D=${D} N=${N} stave ${stave.index}: got ${stave.concaveWidth}, want ${want}`
          );
        }
      }
    }
  });

  test('convex width matches (D + 2t) * sin(pi/N) to 4dp', () => {
    for (const D of DIAMETERS) {
      for (const N of STAVE_COUNTS) {
        for (const t of [0.125, 0.25, 0.5, 0.75, 1, 2.5]) {
          const out = calculateCircleFromDiameter(D, N, 2, t);
          const want = Number(exactWidth(D + 2 * t, N).toFixed(4));
          for (const stave of out.staves) {
            assert.ok(
              Math.abs(stave.convexWidth! - want) <= 0.0001 * 1.000001,
              `D=${D} N=${N} t=${t}: got ${stave.convexWidth}, want ${want}`
            );
          }
        }
      }
    }
  });

  test('blade tilt matches 180/N within one unit in the last decimal', () => {
    for (const D of DIAMETERS) {
      for (const N of STAVE_COUNTS) {
        for (const p of PRECISIONS) {
          const out = calculateCircleFromDiameter(D, N, p, 0);
          const want = Number(exactTilt(N).toFixed(p));
          const ulp = Math.pow(10, -p) * 1.000001;
          for (const stave of out.staves) {
            assert.ok(
              Math.abs(stave.startBladeTilt - want) <= ulp,
              `D=${D} N=${N} p=${p}: start ${stave.startBladeTilt} vs ${want}`
            );
            assert.ok(
              Math.abs(stave.endBladeTilt - want) <= ulp,
              `D=${D} N=${N} p=${p}: end ${stave.endBladeTilt} vs ${want}`
            );
          }
        }
      }
    }
  });

  test('blade tilt matches EXACTLY when 180/N is not on a rounding boundary', () => {
    const onBoundary = (N: number, p: number) => {
      const scaled = exactTilt(N) * Math.pow(10, p);
      return Math.abs(scaled - Math.floor(scaled) - 0.5) < 1e-9;
    };
    for (const D of DIAMETERS) {
      for (const N of STAVE_COUNTS) {
        for (const p of PRECISIONS) {
          if (onBoundary(N, p)) continue;
          const out = calculateCircleFromDiameter(D, N, p, 0);
          assert.equal(out.staves[0].startBladeTilt, Number(exactTilt(N).toFixed(p)));
        }
      }
    }
  });

  test('unrounded blade tilt is exact to 11 decimal places', () => {
    for (const N of STAVE_COUNTS) {
      const out = calculateCircleFromDiameter(12, N, 12, 0);
      assert.ok(
        Math.abs(out.staves[0].startBladeTilt - exactTilt(N)) < 1e-11,
        `N=${N}: ${out.staves[0].startBladeTilt} vs ${exactTilt(N)}`
      );
    }
  });

  test('every stave of a circle is identical', () => {
    for (const N of STAVE_COUNTS) {
      const out = calculateCircleFromDiameter(18, N, 3, 0.5);
      const first = out.staves[0];
      for (const stave of out.staves) {
        assert.equal(stave.concaveWidth, first.concaveWidth);
        assert.equal(stave.convexWidth, first.convexWidth);
        assert.equal(stave.startBladeTilt, first.startBladeTilt);
        assert.equal(stave.endBladeTilt, first.endBladeTilt);
      }
    }
  });

  test('reports the diameter it used', () => {
    for (const D of DIAMETERS) {
      const out = calculateCircleFromDiameter(D, 12, 2, 0);
      assert.equal(out.diameter, Number(D.toFixed(4)));
    }
  });

  test('convex width omitted when thickness is zero', () => {
    const out = calculateCircleFromDiameter(12, 8, 2, 0);
    for (const stave of out.staves) assert.equal(stave.convexWidth, undefined);
  });

  test('fuzz sweep: 3000 random diameter/stave/thickness combinations', () => {
    const rng = makeRng(20260907);
    for (let i = 0; i < 3000; i++) {
      const D = Number((rng() * 240 + 0.25).toFixed(4));
      const N = MIN_STAVES + Math.floor(rng() * 198);
      const t = rng() < 0.5 ? 0 : Number((rng() * 2).toFixed(4));
      const p = PRECISIONS[Math.floor(rng() * PRECISIONS.length)];

      const out = calculateCircleFromDiameter(D, N, p, t);
      const wantWidth = Number(exactWidth(D, N).toFixed(4));
      const wantTilt = Number(exactTilt(N).toFixed(p));
      const s = out.staves[0];

      assert.ok(
        Math.abs(s.concaveWidth - wantWidth) <= 0.0001 * 1.000001,
        `width D=${D} N=${N}: ${s.concaveWidth} vs ${wantWidth}`
      );
      assert.ok(
        Math.abs(s.startBladeTilt - wantTilt) <= Math.pow(10, -p) * 1.000001,
        `tilt D=${D} N=${N} p=${p}: ${s.startBladeTilt} vs ${wantTilt}`
      );
      if (t > 0) {
        const wantConvex = Number(exactWidth(D + 2 * t, N).toFixed(4));
        assert.ok(
          Math.abs(s.convexWidth! - wantConvex) <= 0.0001 * 1.000001,
          `convex D=${D} N=${N} t=${t}: ${s.convexWidth} vs ${wantConvex}`
        );
      }
    }
  });

  test('last-digit drift stays rare and only at rounding boundaries', () => {
    // The numeric solver disagrees with the closed form only where 180/N lands
    // exactly on a .5 boundary. If that ever stops being true it is a real math
    // difference, not a rounding artifact, and this fails.
    const rng = makeRng(42);
    let total = 0;
    let drift = 0;
    const affected = new Set<number>();

    for (let i = 0; i < 20000; i++) {
      const D = Number((rng() * 300 + 0.25).toFixed(4));
      const N = MIN_STAVES + Math.floor(rng() * 198);
      const p = PRECISIONS[Math.floor(rng() * PRECISIONS.length)];

      const out = calculateCircleFromDiameter(D, N, p, 0);
      total++;
      if (out.staves[0].startBladeTilt !== Number(exactTilt(N).toFixed(p))) {
        drift++;
        affected.add(N);
      }
    }

    assert.ok(drift / total < 0.02, `drift regressed to ${((drift / total) * 100).toFixed(2)}%`);

    for (const N of affected) {
      const onAnyBoundary = PRECISIONS.some(p => {
        const scaled = exactTilt(N) * Math.pow(10, p);
        return Math.abs(scaled - Math.floor(scaled) - 0.5) < 1e-9;
      });
      assert.ok(
        onAnyBoundary,
        `N=${N} drifted but 180/N=${exactTilt(N)} is not on a rounding boundary`
      );
    }
  });
});

describe('Circle mode equals ellipse mode with equal axes', () => {
  test('the original hypothesis: circle(D,N) === ellipse(D,D,N)', () => {
    for (const D of DIAMETERS) {
      for (const N of STAVE_COUNTS) {
        for (const t of [0, 0.5]) {
          const circle = calculateCircleFromDiameter(D, N, 2, t);
          const ellipse = calculateEllipseFromStaves(D, D, N, 2, t);
          assert.equal(circle.totalStaves, ellipse.totalStaves);
          assert.deepEqual(circle.staves, ellipse.staves);
        }
      }
    }
  });

  test('a true ellipse still varies per stave (merge did not flatten it)', () => {
    const out = calculateEllipseFromStaves(24, 12, 16, 3, 0);
    assert.ok(new Set(out.staves.map(s => s.concaveWidth)).size > 1);
    assert.ok(new Set(out.staves.map(s => s.startBladeTilt)).size > 1);
  });
});

describe('From-stave-width: the capability that only cylinder had', () => {
  test('solves diameter = w / sin(pi/N)', () => {
    for (const N of [3, 6, 8, 12, 16, 24, 60]) {
      for (const w of [0.75, 1.5, 3, 4.25]) {
        const out = calculateCircleFromStaveWidth(w, N, 2, 0);
        const want = Number(exactDiameter(w, N).toFixed(4));
        assert.ok(
          Math.abs(out.diameter! - want) <= 0.0001 * 1.000001,
          `w=${w} N=${N}: got ${out.diameter}, want ${want}`
        );
      }
    }
  });

  test('round trips: the derived diameter reproduces the requested stave width', () => {
    for (const N of [3, 6, 12, 24, 48]) {
      for (const w of [1.5, 3, 4.25]) {
        const out = calculateCircleFromStaveWidth(w, N, 2, 0);
        assert.ok(
          Math.abs(out.staves[0].concaveWidth - w) < 0.0005,
          `w=${w} N=${N}: stave came back ${out.staves[0].concaveWidth}`
        );
        assert.equal(out.totalStaves, N);
      }
    }
  });

  test('is a different question from the ellipse from-width mode', () => {
    // Ellipse from-width holds dimensions fixed and solves for the COUNT.
    const byWidth = calculateEllipseFromWidth(12, 12, 3, 2, 0);
    assert.equal(byWidth.diameter, undefined);
    assert.ok(byWidth.totalStaves >= MIN_STAVES);

    // Circle from-stave-width holds the COUNT fixed and solves for the diameter.
    const byStave = calculateCircleFromStaveWidth(3, 12, 2, 0);
    assert.equal(byStave.totalStaves, 12);
    assert.ok(byStave.diameter! > 0);
  });

  test('the two directions are consistent with each other', () => {
    for (const N of [6, 8, 12, 16, 24]) {
      for (const w of [1.5, 3, 4.25]) {
        const circle = calculateCircleFromStaveWidth(w, N, 2, 0);
        const back = calculateEllipseFromWidth(circle.diameter!, circle.diameter!, w, 2, 0);
        assert.equal(back.totalStaves, N, `w=${w} N=${N}: ellipse chose ${back.totalStaves}`);
      }
    }
  });
});

describe('Stave floor lowered from 4 to 3', () => {
  test('MIN_STAVES is 3', () => {
    assert.equal(MIN_STAVES, 3);
  });

  test('a 3-stave circle is exact', () => {
    const out = calculateCircleFromDiameter(12, 3, 2, 0);
    assert.equal(out.totalStaves, 3);
    assert.ok(Math.abs(out.staves[0].concaveWidth - Number(exactWidth(12, 3).toFixed(4))) <= 0.0001);
    assert.equal(out.staves[0].startBladeTilt, 60);
  });

  test('a 3-stave ellipse works too', () => {
    const out = calculateEllipseFromStaves(24, 12, 3, 3, 0);
    assert.equal(out.totalStaves, 3);
    for (const s of out.staves) assert.ok(s.concaveWidth > 0);
  });

  test('below the floor still throws', () => {
    assert.throws(() => calculateEllipseFromStaves(12, 12, 2, 2, 0), /Invalid inputs/);
    assert.throws(() => calculateCircleFromDiameter(12, 2, 2, 0), /Invalid inputs/);
    assert.throws(() => calculateCircleFromStaveWidth(3, 2, 2, 0), /Invalid inputs/);
  });
});

describe('Validation agrees with the solver about the floor', () => {
  const base: EllipseInputs = {
    shape: 'ellipse',
    length: 24,
    width: 12,
    useConical: false
  };

  test('validation no longer accepts a count the solver rejects', () => {
    // Previously validation allowed N>=2 while the formula threw below 4,
    // so N=2 and N=3 passed validation and then hard-errored.
    for (const N of [1, 2]) {
      const result = validateEllipseInputs({ ...base, numberOfStaves: N }, 'width');
      assert.equal(result.isValid, false, `N=${N} should fail validation`);
    }
    assert.equal(validateEllipseInputs({ ...base, numberOfStaves: 3 }, 'width').isValid, true);
  });

  test('circle mode requires a diameter, or a stave width when solving for one', () => {
    const circle: EllipseInputs = {
      shape: 'circle',
      length: 0,
      width: 0,
      useConical: false,
      circleCalcMode: 'fromDiameter',
      numberOfStaves: 12
    };

    assert.equal(validateEllipseInputs(circle, 'width').isValid, false);
    assert.equal(validateEllipseInputs({ ...circle, diameter: 12 }, 'width').isValid, true);

    const byWidth: EllipseInputs = { ...circle, circleCalcMode: 'fromStaveWidth' };
    assert.equal(validateEllipseInputs(byWidth, 'width').isValid, false);
    assert.equal(validateEllipseInputs({ ...byWidth, staveWidth: 3 }, 'width').isValid, true);
  });

  test('circle mode ignores the unused length/width axes', () => {
    // Circle mode never populates them before calculating, so requiring them
    // would make the form unusable.
    const circle: EllipseInputs = {
      shape: 'circle',
      length: undefined as unknown as number,
      width: undefined as unknown as number,
      useConical: false,
      circleCalcMode: 'fromDiameter',
      diameter: 12,
      numberOfStaves: 8
    };
    assert.equal(validateEllipseInputs(circle, 'width').isValid, true);
  });
});

describe('Cone (conical circle) coopering', () => {
  test('both ends match the analytic chord for their own diameter', () => {
    for (const [fd, bd] of [[12, 8], [8, 12], [24, 6], [3, 2.5], [100, 99]]) {
      for (const N of [3, 6, 8, 12, 24]) {
        const out = calculateConicalCircleFromDiameters(fd, bd, 10, N, 2, 0);
        for (const s of out.staves) {
          assert.ok(
            Math.abs(s.concaveWidth - Number(exactWidth(fd, N).toFixed(4))) <= 0.0001 * 1.000001,
            `side A ${fd}->${bd} N=${N}: ${s.concaveWidth}`
          );
          assert.ok(
            Math.abs(s.sideBConcaveWidth! - Number(exactWidth(bd, N).toFixed(4))) <= 0.0001 * 1.000001,
            `side B ${fd}->${bd} N=${N}: ${s.sideBConcaveWidth}`
          );
        }
      }
    }
  });

  test('every stave of a cone is identical', () => {
    for (const N of [3, 5, 8, 16, 32]) {
      const out = calculateConicalCircleFromDiameters(14, 9, 7, N, 3, 0.5);
      const first = out.staves[0];
      for (const s of out.staves) {
        assert.equal(s.concaveWidth, first.concaveWidth);
        assert.equal(s.sideBConcaveWidth, first.sideBConcaveWidth);
        assert.equal(s.taperAngle, first.taperAngle);
        assert.equal(s.taperRise, first.taperRise);
        assert.equal(s.startBladeTilt, first.startBladeTilt);
      }
    }
  });

  test('blade tilt still follows 180/N (a cone is a circle in cross-section)', () => {
    for (const N of [3, 6, 12, 24, 48]) {
      const out = calculateConicalCircleFromDiameters(12, 8, 10, N, 3, 0);
      const want = Number(exactTilt(N).toFixed(3));
      assert.ok(Math.abs(out.staves[0].startBladeTilt - want) <= 0.001 * 1.000001);
    }
  });

  test('equals the conical ellipse with equal axes', () => {
    for (const [fd, bd] of [[12, 8], [20, 5]]) {
      for (const t of [0, 0.5]) {
        const cone = calculateConicalCircleFromDiameters(fd, bd, 9, 12, 2, t);
        const ell = calculateConicalEllipseFromStaves(fd, fd, bd, bd, 9, 12, 2, t);
        assert.deepEqual(cone.staves, ell.staves);
      }
    }
  });

  test('a straight cylinder has zero taper', () => {
    const out = calculateConicalCircleFromDiameters(12, 12, 10, 12, 3, 0);
    assert.equal(out.staves[0].taperAngle, 0);
    assert.equal(out.staves[0].taperRise, 0);
  });

  test('taper is symmetric: swapping the ends gives the same magnitude', () => {
    const a = calculateConicalCircleFromDiameters(12, 8, 10, 12, 3, 0);
    const b = calculateConicalCircleFromDiameters(8, 12, 10, 12, 3, 0);
    assert.equal(a.staves[0].taperAngle, b.staves[0].taperAngle);
    assert.equal(a.staves[0].taperRise, b.staves[0].taperRise);
  });

  test('rejects invalid cone inputs', () => {
    assert.throws(() => calculateConicalCircleFromDiameters(0, 8, 10, 12, 2, 0), /Invalid inputs/);
    assert.throws(() => calculateConicalCircleFromDiameters(12, 0, 10, 12, 2, 0), /Invalid inputs/);
    assert.throws(() => calculateConicalCircleFromDiameters(12, 8, 0, 12, 2, 0), /Invalid inputs/);
    assert.throws(() => calculateConicalCircleFromDiameters(12, 8, 10, 2, 2, 0), /Invalid inputs/);
  });
});

describe('Taper rise/run: per-edge offset over the stave length', () => {
  test('rise is HALF the width difference, because both edges taper', () => {
    for (const [fd, bd] of [[12, 8], [20, 5], [6, 5.5], [100, 40]]) {
      for (const N of [3, 6, 12, 24]) {
        for (const depth of [4, 10, 33.5]) {
          const out = calculateConicalCircleFromDiameters(fd, bd, depth, N, 3, 0);
          const s = out.staves[0];
          const widthDiff = Math.abs(s.sideBConcaveWidth! - s.concaveWidth);
          assert.ok(
            Math.abs(s.taperRise! - widthDiff / 2) <= 0.0001 * 1.000001,
            `${fd}->${bd} N=${N} d=${depth}: rise ${s.taperRise} vs half-diff ${widthDiff / 2}`
          );
        }
      }
    }
  });

  test('the two long edges together account for the full width change', () => {
    // This is the property that makes the cone close up: 2 x per-edge taper
    // must equal the difference between the end widths.
    for (const [fd, bd] of [[18, 7], [9, 14]]) {
      for (const N of [4, 9, 20]) {
        const out = calculateConicalCircleFromDiameters(fd, bd, 12, N, 3, 0);
        const s = out.staves[0];
        const narrow = Math.min(s.concaveWidth, s.sideBConcaveWidth!);
        const wide = Math.max(s.concaveWidth, s.sideBConcaveWidth!);
        assert.ok(
          Math.abs(narrow + 2 * s.taperRise! - wide) <= 0.0002,
          `${fd}->${bd} N=${N}: ${narrow} + 2*${s.taperRise} != ${wide}`
        );
      }
    }
  });

  test('rise equals run * tan(taperAngle)', () => {
    for (const [fd, bd] of [[12, 8], [30, 11]]) {
      for (const depth of [5, 16]) {
        const out = calculateConicalCircleFromDiameters(fd, bd, depth, 12, 12, 0);
        const s = out.staves[0];
        const fromAngle = s.taperRun! * Math.tan((s.taperAngle! * Math.PI) / 180);
        assert.ok(
          Math.abs(s.taperRise! - fromAngle) < 1e-6,
          `${fd}->${bd} d=${depth}: ${s.taperRise} vs ${fromAngle}`
        );
      }
    }
  });

  test('run is the stave length', () => {
    for (const depth of [1, 7.25, 40]) {
      const out = calculateConicalCircleFromDiameters(12, 8, depth, 12, 2, 0);
      assert.equal(out.staves[0].taperRun, Number(depth.toFixed(4)));
      assert.equal(out.staves[0].taperRun, out.staves[0].length);
    }
  });

  test('conical ellipse gets the same treatment, per stave', () => {
    const out = calculateConicalEllipseFromStaves(24, 12, 18, 9, 10, 16, 3, 0);
    // Staves differ around an ellipse, so each carries its own taper.
    assert.ok(new Set(out.staves.map(s => s.taperRise)).size > 1);
    for (const s of out.staves) {
      const widthDiff = Math.abs(s.sideBConcaveWidth! - s.concaveWidth);
      assert.ok(Math.abs(s.taperRise! - widthDiff / 2) <= 0.0001 * 1.000001);
      assert.equal(s.taperRun, 10);
    }
  });

  test('non-conical results carry no taper fields', () => {
    const cyl = calculateCircleFromDiameter(12, 12, 2, 0);
    assert.equal(cyl.staves[0].taperRise, undefined);
    assert.equal(cyl.staves[0].taperRun, undefined);
    const ell = calculateEllipseFromStaves(24, 12, 12, 2, 0);
    assert.equal(ell.staves[0].taperRise, undefined);
  });
});

describe('Cone validation', () => {
  const cone = (over: Partial<EllipseInputs> = {}): EllipseInputs => ({
    shape: 'circle',
    length: 0,
    width: 0,
    useConical: true,
    numberOfStaves: 12,
    diameter: 12,
    sideBDiameter: 8,
    depth: 10,
    ...over
  });

  test('accepts a complete cone', () => {
    assert.equal(validateEllipseInputs(cone(), 'width').isValid, true);
  });

  test('requires both diameters and the depth', () => {
    assert.equal(validateEllipseInputs(cone({ diameter: undefined }), 'width').isValid, false);
    assert.equal(validateEllipseInputs(cone({ sideBDiameter: undefined }), 'width').isValid, false);
    assert.equal(validateEllipseInputs(cone({ depth: undefined }), 'width').isValid, false);
  });

  test('still enforces the stave floor', () => {
    assert.equal(validateEllipseInputs(cone({ numberOfStaves: 2 }), 'width').isValid, false);
    assert.equal(validateEllipseInputs(cone({ numberOfStaves: 3 }), 'width').isValid, true);
  });

  test('does not demand a stave width even if that sub-mode is left selected', () => {
    // The UI hides the from-stave-width toggle for cones; validation must not
    // trip over a stale selection.
    const stale = cone({ circleCalcMode: 'fromStaveWidth', staveWidth: undefined });
    assert.equal(validateEllipseInputs(stale, 'width').isValid, true);
  });
});
