/**
 * Worker process entry point
 * Starts all Bull queue processors
 */

// Import all feature workers
import '../features/statements/workers/statementProcessor.js';

console.log('All workers started successfully');
console.log('Listening for jobs on:');
console.log('- statement-processing queue');
console.log('- subscription-detection queue');
console.log('- transaction-sync queue');
console.log('- notifications queue');
