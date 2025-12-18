// src/testFirebase.js (temporary)
import { firebaseService } from './services/firebaseService';

async function testFirebase() {
  console.log('=== Testing Firebase Connection ===');
  
  // Test write
  try {
    await firebaseService.setReaction('test_post_1', 'like');
    console.log('✓ Write test passed');
  } catch (error) {
    console.error('✗ Write test failed:', error);
  }
  
  // Test read
  try {
    const reactions = await firebaseService.getReactions('test_post_1');
    console.log('✓ Read test passed:', reactions);
  } catch (error) {
    console.error('✗ Read test failed:', error);
  }
}

testFirebase();