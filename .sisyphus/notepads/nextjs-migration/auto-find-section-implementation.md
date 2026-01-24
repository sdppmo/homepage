# Auto Find Section Page Implementation

## Overview
The "Auto Find Section" page (`src/app/(protected)/k-col/auto-find-section/page.tsx`) was created by porting the UI from the original HTML file (`protected-source/auto-find-section.html`) and integrating it with the `findOptimalSection` Server Action.

## Implementation Details

### UI Porting
- The UI was ported using Tailwind CSS to match the original design, including the gradient background, card-like structure, and table styles.
- The page is a Client Component (`'use client'`) to handle form state and user interactions.

### State Management
- `useState` is used to manage the state of all input fields (column count, K factors, P-M-M limit, lengths, thickness ranges).
- `useState` is also used for the load data table (`loadData`) and the calculation results (`results`).
- `useEffect` is used to dynamically update the `loadData` state when the `columnCount` changes, preserving existing data where possible.

### Calculation Logic
- The `calculateAll` function is triggered when the "Auto Find Section Result" button is clicked.
- It iterates through each column in the `loadData`.
- For each column, it iterates through defined combinations (currently BH500xB300 and BH450xB250) and materials (SM420 and SM355).
- It calls the `findOptimalSection` Server Action for each combination/material pair.
- It selects the most economical section (lowest cost per meter) that satisfies the P-M-M limit and other constraints.
- The best result for each column is stored in the `results` state and displayed in the result table.

### Limitations and Future Work
- **Rolled H Sections**: The current implementation only considers built-up H sections (BH). Rolled H sections (Combination 3 in the original HTML) are not yet implemented in the Server Action and are therefore not included in the calculation.
- **Excel Import/Export**: The functionality to import/export load data and export results to Excel is not yet implemented.
- **Print Functionality**: The "계산서 출력" (Print Calculation Sheet) and "BOQ 인쇄" (Print BOQ) buttons are not yet functional.
- **BOQ Calculation**: The BOQ calculation feature is not yet implemented.
- **Input Validation**: Basic input validation is implemented (e.g., `min`, `max`, `step` in HTML attributes), but more robust validation could be added.
- **Error Handling**: Basic error handling is implemented for the Server Action call, but more comprehensive error handling and user feedback could be added.
- **Assumptions**: The calculation currently assumes `h1=h2` and `b1=b2` for the built-up sections, as per the combinations defined in the original HTML.

## File Structure
- `src/app/(protected)/k-col/auto-find-section/page.tsx`: The main page component.
- `src/actions/calculate.ts`: Contains the `findOptimalSection` Server Action.
- `src/lib/calculations/steel-section.ts`: Contains type definitions for the calculation.
