function login(email, password) {
    // Simulate an API call to authenticate the user
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (email === "user@example.com" && password === "password") {
                resolve({ token: "fake-jwt-token" });
            } else {
                reject(new Error("Invalid credentials"));
            }
        }, 1000);
    });
}