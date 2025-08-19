/**
 * Application startup initialization
 * Initializes background services when the app starts
 */

import { initializeBackgroundLiveScores } from '@/lib/server/live-scores-background';

let isInitialized = false;

/**
 * Initialize all background services
 * Should be called when the Next.js app starts
 */
export async function initializeBackgroundServices(): Promise<void> {
  if (isInitialized) {
    console.log('ℹ️ Background services already initialized');
    return;
  }

  try {
    console.log('🚀 Initializing background services...');
    
    // Initialize background live scores polling
    await initializeBackgroundLiveScores();
    
    isInitialized = true;
    console.log('✅ Background services initialized successfully');
    
  } catch (error) {
    console.error('❌ Failed to initialize background services:', error);
    // Don't set isInitialized to true, so it can be retried
  }
}

/**
 * Check if background services are initialized
 */
export function areBackgroundServicesInitialized(): boolean {
  return isInitialized;
}

/**
 * Reset initialization state (for testing)
 */
export function resetInitializationState(): void {
  isInitialized = false;
}