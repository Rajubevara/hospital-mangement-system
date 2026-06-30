async function test() {
  try {
    console.log('Sending login request to live backend...');
    const response = await fetch('https://hospital-mangement-system-rpic.onrender.com/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'doctor@hms.com',
        password: 'password123'
      })
    });
    const text = await response.text();
    console.log('Status:', response.status);
    console.log('Raw Response:', text);
  } catch (error) {
    console.error('Error logging in:', error.message);
  }
}

test();
