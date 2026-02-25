const fetch = require('node-fetch');

async function testSignup() {
    try {
        const res = await fetch('http://localhost:5000/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: "Test Coordinator",
                email: "test_coord_" + Date.now() + "@mediflow.com",
                password: "Password123!",
                role: "Provider"
            })
        });
        const data = await res.json();
        console.log("Status:", res.status);
        console.log("Data:", JSON.stringify(data, null, 2));
    } catch (err) {
        console.error("Error:", err);
    }
}

testSignup();
