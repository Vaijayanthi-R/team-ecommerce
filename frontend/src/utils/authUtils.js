function setAuthToken(token) {
    localStorage.setItem("authToken", token);
}

function getAuthToken() {
    return localStorage.getItem("authToken");
}

function removeAuthToken() {
    localStorage.removeItem("authToken");
}