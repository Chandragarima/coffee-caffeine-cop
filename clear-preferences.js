// Script to clear preferences from localStorage
console.log('Clearing preferences from localStorage...');

// Check if we're in a browser environment
if (typeof window !== 'undefined' && window.localStorage) {
  const STORAGE_KEY = 'coffeepolice_preferences';
  
  // Check if preferences exist
  const existing = localStorage.getItem(STORAGE_KEY);
  if (existing) {
    console.log('Found existing preferences:', existing);
    localStorage.removeItem(STORAGE_KEY);
    console.log('✅ Preferences cleared successfully!');
  } else {
    console.log('No existing preferences found.');
  }
} else {
  console.log('❌ Not in browser environment. Please run this in the browser console.');
  console.log('To clear preferences manually:');
  console.log('1. Open browser developer tools (F12)');
  console.log('2. Go to Console tab');
  console.log('3. Run: localStorage.removeItem("coffeepolice_preferences")');
  console.log('4. Refresh the page');
}
