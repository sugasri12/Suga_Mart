// Universal API Base URL configuration for SUGA'S MART
// Automatically configures API endpoint whether accessed via:
// 1. Mobile browser on LAN Wi-Fi (e.g. http://10.201.119.35:5000/)
// 2. Desktop browser on Localhost (e.g. http://localhost:5000/)
// 3. VS Code Live Server on LAN / Localhost (e.g. http://10.201.119.35:5500/)
// 4. Direct file system (file:///)

window.API_BASE = (function () {
    if (!window.location || !window.location.protocol || !window.location.protocol.startsWith("http")) {
        return "http://localhost:5000";
    }
    // If opened directly through the Node server (port 5000), use relative URLs
    if (window.location.port === "5000" || window.location.port === "") {
        return "";
    }
    // If opened through Live Server (e.g. port 5500), connect to port 5000 on the same host
    return `${window.location.protocol}//${window.location.hostname}:5000`;
})();
