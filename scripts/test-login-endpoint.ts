// Using native fetch (Node 18+)
// If running in an environment without global fetch, this will fail.
// But this project uses 'tsx' and likely Node 18+.

async function testLogin() {
  // Use 127.0.0.1 to avoid IPv6 issues with localhost
  // Port 3001 is the backend server port (defined in server.ts)
  const url = "http://127.0.0.1:3001/api/auth/login";

  const credentials = {
    email: "admin@kumbisaly.com",
    password: "password123",
  };

  console.log(`Attempting to login to ${url} with email: ${credentials.email}`);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    console.log(`Response Status: ${response.status} ${response.statusText}`);

    const data = await response.json();

    if (response.ok) {
      console.log("Login Successful!");
      console.log("User:", data.user);
      console.log("Token:", data.token ? "(Present)" : "(Missing)");
    } else {
      console.error("Login Failed:", data);
    }
  } catch (error) {
    console.error("Network or Script Error:", error);
    if (error instanceof Error && "cause" in error) {
      console.error("Cause:", (error as Error & { cause: unknown }).cause);
    }
  }
}

testLogin();
