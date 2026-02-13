# 45° Blade Tilt Constraint Implementation

## Overview

Refactored the pyramid calculator to enforce the **45° maximum blade tilt** constraint that exists on standard table saws. The calculator now validates all calculations against this physical limitation and provides helpful feedback when designs exceed it.

---

## Changes Made

### 1. **Updated Type Definitions** (`src/types/pyramid.ts`)

Added new fields to `PyramidOutputs`:
```typescript
interface PyramidOutputs {
  // ... existing fields ...

  // Table saw constraint checks
  isMiteredFeasible: boolean;      // Can mitered cuts be made with ≤45° tilt?
  isButtedFeasible: boolean;       // Can butted cuts be made with ≤45° tilt?
  maxHeightFor45Deg: number;       // Maximum height that keeps blade tilt ≤ 45°
  warnings: string[];              // User-friendly warning messages
}
```

### 2. **Enhanced Formula Calculations** (`src/utils/pyramidFormulas.ts`)

#### Added Constraint Checking:
- Checks if `bladeTiltMitered ≤ 45°`
- Checks if `bladeTiltButted ≤ 45°`
- Sets boolean flags for feasibility

#### Added Maximum Height Calculator:
New function: `calculateMaxHeightFor45Deg(N, R)`

**Formula derivation:**
```
For mitered cuts:
  bladeTilt = asin(sin(sideSlope) * cos(π/N))

When bladeTilt = 45° (max):
  sin(45°) = sin(sideSlope) * cos(π/N)
  sin(sideSlope) = sin(45°) / cos(π/N)
  sideSlope = asin(sin(45°) / cos(π/N))

Since sideSlope = atan(H / apothem):
  H_max = apothem * tan(sideSlope_max)
```

#### Added Warning Generation:
- Generates specific warnings when blade tilts exceed 45°
- Suggests maximum height for feasible cuts
- Different messages for mitered vs butted joints

### 3. **Enhanced UI Display** (`src/components/ResultsDisplay.vue`)

#### Warning Banner:
- Yellow warning banner appears when constraints are violated
- Shows all warnings from calculations
- Prominent placement above results

#### Visual Indicators:
- **Red background** on blade tilt values that exceed 45°
- **Red error icon** next to infeasible values
- **Red text color** for values > 45°
- **Blue info section** showing suggested maximum height

#### Max Height Display:
- Only shows when a constraint is violated
- Displays the maximum height that would keep blade tilt ≤ 45°
- Blue background to distinguish from errors

#### Updated Copy Function:
- Includes ✓ or ⚠️ indicators for each blade tilt
- Appends warnings section
- Includes suggested max height when applicable

---

## Example Test Results

### Test 1: Normal Hexagon (PASSES)
```
Inputs: N=6, R=10", H=8"
Blade Tilt (Mitered): 35.99° ✓ OK
Blade Tilt (Butted):  38.66° ✓ OK
Max Height for 45°:   12.247"
```
✅ Both cuts are feasible with standard table saw

### Test 2: Tall Hexagon (FAILS)
```
Inputs: N=6, R=10", H=15"
Blade Tilt (Mitered): 48.59° ⚠️ EXCEEDS 45°
Blade Tilt (Butted):  56.31° ⚠️ EXCEEDS 45°
Max Height for 45°:   12.247"

WARNINGS:
- Mitered blade tilt (48.59°) exceeds 45° table saw limit.
  Reduce height to 12.247" or less.
- Butted blade tilt (56.31°) exceeds 45° table saw limit.
  Consider alternative cutting method.
```
❌ Design exceeds table saw capabilities

### Test 3: Very Tall Square (MIXED)
```
Inputs: N=4, R=10", H=20"
Blade Tilt (Mitered): 41.81° ✓ OK
Blade Tilt (Butted):  63.435° ⚠️ EXCEEDS 45°

WARNINGS:
- Butted blade tilt (63.435°) exceeds 45° table saw limit.
  Consider alternative cutting method.
```
⚠️ Mitered joints work, butted joints don't

---

## User Experience Flow

### When Constraints Are Met:
1. User enters dimensions
2. Clicks "Calculate"
3. Results display normally
4. All values shown in standard colors
5. No warnings displayed

### When Constraints Are Exceeded:
1. User enters dimensions
2. Clicks "Calculate"
3. **Yellow warning banner appears** at top of results
4. Specific warnings explain the issue
5. **Red highlighting** on infeasible blade tilts
6. **Blue info box** shows suggested maximum height
7. User can adjust height and recalculate

---

## Benefits

### 1. **Safety**
- Prevents users from attempting impossible cuts
- Avoids damage to equipment or workpiece
- Ensures all cuts are within table saw capabilities

### 2. **Practical Guidance**
- Calculates exact maximum height for feasible cuts
- Provides specific suggestions for adjustments
- Distinguishes between mitered and butted joint limitations

### 3. **Clear Feedback**
- Visual indicators (colors, icons) make issues obvious
- Plain language warnings explain the problem
- Suggested solutions provided immediately

### 4. **Flexibility**
- Still calculates and displays all values (including infeasible ones)
- Allows users to see how close they are to limits
- Users can make informed decisions about alternatives

---

## Technical Notes

### Why 45°?

Standard table saw blade tilts are limited to:
- **0°** = Blade perpendicular to table (90° to workpiece)
- **45°** = Maximum tilt (45° to table, 45° to workpiece)

This is a **mechanical limitation** of the saw's trunnion mechanism and blade guard clearance.

### Calculation Accuracy

The `maxHeightFor45Deg` calculation is precise and derived from the exact blade tilt formula. It represents the theoretical maximum - in practice, users may want to stay slightly below this value for safety margin.

### Edge Cases

- If the geometry makes 45° mathematically impossible (very rare), `maxHeightFor45Deg` returns 999999" (effectively infinite)
- Both mitered and butted joint methods are checked independently
- Warnings are specific to which method exceeds the limit

---

## Future Enhancements

Potential additions (not currently implemented):

1. **Safety Margin Setting**: Allow users to set constraint to 43° or 44° for comfort
2. **Alternative Methods**: Suggest hand plane or band saw approaches when limits are exceeded
3. **Multi-Stage Cutting**: Calculate if cuts could be done in multiple passes
4. **Jig Recommendations**: Suggest using specialized jigs for extreme angles

---

## Summary

The calculator now **enforces real-world table saw constraints**, making it not just mathematically correct, but **practically useful** for actual woodworking. Users immediately know if their design is feasible and get specific guidance on adjustments when needed.

**Key Principle**: The tool should help users succeed in the shop, not just calculate abstract numbers.
