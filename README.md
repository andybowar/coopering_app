# N-Sided Pyramid Calculator

A Progressive Web App (PWA) for calculating woodworking construction parameters for N-sided pyramids.

## Features

- Calculate 7 critical measurements for pyramid construction:
  - Base Side Length
  - Miter Angle
  - Miter Complement
  - Side Slope
  - Blade Tilt (Mitered Joints)
  - Blade Tilt (Butted Joints)
  - Dihedral Angle

- Input parameters:
  - Number of sides (N) - minimum 3
  - Base radius (R) - in inches
  - Pyramid height (H) - in inches

- PWA capabilities:
  - Install on mobile devices
  - Works offline after first visit
  - Responsive design

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Build for Production

```bash
npm run build
```

or for PWA specifically:

```bash
npm run build:pwa
```

## Technology Stack

- Quasar Framework v2
- Vue 3
- TypeScript
- PWA (Progressive Web App)
- Vite

## Formulas

The app uses the following geometric formulas for an N-sided pyramid:

1. **Base Side Length**: `2 * R * sin(π / N)`
2. **Miter Angle**: `90° - (180° / N)`
3. **Miter Complement**: `180° / N`
4. **Side Slope**: `atan(H / (R * cos(π / N))) * (180 / π)`
5. **Blade Tilt (Mitered)**: `asin(sin(sideSlope) * cos(π / N)) * (180 / π)`
6. **Blade Tilt (Butted)**: `atan(cos(π / N) * tan(sideSlope)) * (180 / π)`
7. **Dihedral Angle**: `180° - 2 * atan((R * cos(π / N)) / H) * (180 / π)`

Where:
- Apothem = `R * cos(π / N)`
- All trigonometric calculations use radians internally, convert to degrees for display
