import type { SavedCalculation } from '../types/pyramid';
import type { SavedBoxCalculation } from '../types/box';

const STORAGE_KEY = 'pyramidSavedCalculations';
const BOX_STORAGE_KEY = 'boxSavedCalculations';

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
      console.warn('Invalid saved calculations data format, resetting...');
      return [];
    }
    // Sort by timestamp descending (newest first)
    return parsed.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('Error reading saved calculations:', error);
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

/**
 * Get all saved box calculations from localStorage
 * @returns Array of saved box calculations, sorted by timestamp (newest first)
 */
export function getSavedBoxCalculations(): SavedBoxCalculation[] {
  try {
    const data = localStorage.getItem(BOX_STORAGE_KEY);
    if (!data) {
      return [];
    }
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) {
      console.warn('Invalid saved box calculations data format, resetting...');
      return [];
    }
    // Sort by timestamp descending (newest first)
    return parsed.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('Error reading saved box calculations:', error);
    return [];
  }
}

/**
 * Save a new box calculation to localStorage
 * @param calculation - The box calculation to save
 */
export function saveBoxCalculation(calculation: SavedBoxCalculation): void {
  try {
    const existing = getSavedBoxCalculations();
    existing.unshift(calculation); // Add to beginning (newest)
    localStorage.setItem(BOX_STORAGE_KEY, JSON.stringify(existing));
  } catch (error) {
    console.error('Error saving box calculation:', error);
    throw new Error('Failed to save box calculation');
  }
}

/**
 * Delete a box calculation from localStorage
 * @param id - The ID of the box calculation to delete
 */
export function deleteBoxCalculation(id: string): void {
  try {
    const existing = getSavedBoxCalculations();
    const filtered = existing.filter((calc) => calc.id !== id);
    localStorage.setItem(BOX_STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting box calculation:', error);
    throw new Error('Failed to delete box calculation');
  }
}
