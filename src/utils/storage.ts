import type { SavedCalculation } from '../types/pyramid';

const STORAGE_KEY = 'pyramidCalculatorHistory';

/**
 * Get all saved calculations from localStorage
 * @returns Array of saved calculations, sorted by timestamp (newest first)
 */
export function getSavedCalculations(): SavedCalculation[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return [];
    }
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) {
      console.warn('Invalid calculator history data format, resetting...');
      return [];
    }
    // Sort by timestamp descending (newest first)
    return parsed.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('Error reading calculator history:', error);
    return [];
  }
}

/**
 * Save a new calculation to localStorage
 * @param calculation - The calculation to save
 */
export function saveCalculation(calculation: SavedCalculation): void {
  try {
    const existing = getSavedCalculations();
    existing.unshift(calculation); // Add to beginning (newest)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  } catch (error) {
    console.error('Error saving calculation:', error);
    throw new Error('Failed to save calculation');
  }
}

/**
 * Delete a calculation from localStorage
 * @param id - The ID of the calculation to delete
 */
export function deleteCalculation(id: string): void {
  try {
    const existing = getSavedCalculations();
    const filtered = existing.filter((calc) => calc.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting calculation:', error);
    throw new Error('Failed to delete calculation');
  }
}
