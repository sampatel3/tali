/**
 * Worker process entry point
 * Starts all Bull queue processors
 */

import './statementProcessor.js';

console.log('All workers started successfully');
console.log('Listening for jobs on:');
console.log('- statement-processing queue');
console.log('- subscription-detection queue');
console.log('- transaction-sync queue');
console.log('- notifications queue');
