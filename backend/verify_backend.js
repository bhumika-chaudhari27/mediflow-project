const API_URL = 'http://localhost:5000/api';

async function testBackend() {
    try {
        console.log("1. Checking Server Health...");
        try {
            const res = await fetch(`${API_URL}/health`);
            console.log("Health Status:", res.status);
        } catch (e) {
            console.log("❌ Server might be down or /health missing:", e.message);
        }

        console.log("\n2. Logging in as Admin...");
        let adminToken;
        let res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@example.com', password: 'admin' })
        });

        let data = await res.json();

        if (res.ok) {
            adminToken = data.token;
            console.log("✅ Admin logged in.");
        } else {
            console.log("❌ Admin login failed. Trying to create temp admin...");
            res = await fetch(`${API_URL}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'Temp Admin', email: 'tempadmin2@test.com', password: 'password123', role: 'Admin' })
            });
            data = await res.json();
            if (res.ok) {
                adminToken = data.token;
                console.log("✅ Temp Admin created.");
            } else {
                console.log("❌ Temp Admin creation failed:", data.message);
                return;
            }
        }

        console.log("\n3. Creating a Donor User...");
        let donorId;
        let donorToken;

        // Create user
        const donorEmail = `donor${Date.now()}@test.com`;
        res = await fetch(`${API_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Test Donor', email: donorEmail, password: 'password123', role: 'User' })
        });
        data = await res.json();

        if (res.ok) {
            donorId = data.user.id || data.user._id;
            donorToken = data.token;
            console.log("✅ Test User created:", donorId);

            // Toggle Donor Status
            console.log("   - Updating profile to isDonor: true...");
            res = await fetch(`${API_URL}/users/profile/${donorId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${donorToken}`
                },
                body: JSON.stringify({ isDonor: true, bloodGroup: 'O+' })
            });
            const updateData = await res.json();
            if (res.ok) {
                console.log("✅ User profile updated to Donor.");
                console.log("   - isDonor:", updateData.user.isDonor);
            } else {
                console.log("❌ Profile update failed:", updateData);
            }

        } else {
            console.log("❌ Donor creation failed:", data);
        }

        console.log("\n4. Fetching Donor List as Admin...");
        res = await fetch(`${API_URL}/admin/donors`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });

        if (res.ok) {
            const donors = await res.json();
            console.log(`✅ Fetched ${donors.length} donors.`);
            const found = donors.find(d => d._id === donorId || d.id === donorId);
            if (found) {
                console.log("✅ SUCCESS: Created donor was found in the list!");
            } else {
                console.log("❌ FAILURE: Created donor was NOT found in the list.");
            }
            console.log("Donor List Sample:", donors.slice(0, 2));
        } else {
            console.log("❌ Fetching donors failed:", await res.text());
        }

    } catch (err) {
        console.error("Unexpected error:", err);
    }
}

testBackend();
