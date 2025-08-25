const fetch = require('node-fetch');

async function testAPIEndpoints() {
  console.log('🧪 Testing API Endpoints...\n');
  
  const baseUrl = 'http://localhost:3000'; // Adjust if your server runs on different port
  
  // Test 1: Check if server is running
  console.log('1. Testing server connectivity...');
  try {
    const response = await fetch(`${baseUrl}/api/debug-env`);
    if (response.ok) {
      console.log('   ✅ Server is running');
    } else {
      console.log(`   ❌ Server responded with status: ${response.status}`);
    }
  } catch (error) {
    console.log(`   ❌ Server not accessible: ${error.message}`);
    console.log('   Make sure your Next.js development server is running (npm run dev)');
    return;
  }
  
  // Test 2: Test availability month endpoint
  console.log('\n2. Testing availability month endpoint...');
  try {
    const response = await fetch(`${baseUrl}/api/therapist/1/availability/month?year=2025&month=8`);
    const data = await response.json();
    
    if (response.ok) {
      console.log('   ✅ Month availability endpoint working');
      console.log(`   Available dates: ${data.availableDates?.length || 0}`);
    } else {
      console.log(`   ❌ Month availability failed: ${data.error}`);
    }
  } catch (error) {
    console.log(`   ❌ Month availability error: ${error.message}`);
  }
  
  // Test 3: Test availability slots endpoint
  console.log('\n3. Testing availability slots endpoint...');
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const testDate = tomorrow.toISOString().split('T')[0];
    
    const response = await fetch(`${baseUrl}/api/therapist/1/availability?date=${testDate}`);
    const data = await response.json();
    
    if (response.ok) {
      console.log('   ✅ Slots availability endpoint working');
      console.log(`   Available slots: ${data.slots?.length || 0}`);
    } else {
      console.log(`   ❌ Slots availability failed: ${data.error}`);
    }
  } catch (error) {
    console.log(`   ❌ Slots availability error: ${error.message}`);
  }
  
  console.log('\n📋 SUMMARY:');
  console.log('   If you see errors above, check:');
  console.log('   1. Is your Next.js server running? (npm run dev)');
  console.log('   2. Are the API routes properly configured?');
  console.log('   3. Are there any database connection issues?');
}

// Run the test
testAPIEndpoints()
  .catch((e) => {
    console.error('❌ Test failed:', e);
  });
