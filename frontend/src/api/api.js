function apiCall(endpoint, options) {
    // Simulate an API call
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve({ data: { message: "API call successful" } });
        }, 1000);
    });
}