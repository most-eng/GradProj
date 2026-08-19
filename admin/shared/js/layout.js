document.addEventListener("DOMContentLoaded", function () {
    // Guard: bounce to the login page if there's no active session.
    if (typeof AdminApi !== "undefined") {
        AdminApi.requireAuth();
    }

    const toggleBtn = document.getElementById("sidebarToggle");
    const sidebar = document.getElementById("sidebar");

    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener("click", () => sidebar.classList.toggle("open"));
    }

    // Wire up the "Logout" sidebar link wherever it appears.
    document.querySelectorAll(".sidebar-nav a").forEach((link) => {
        const label = link.textContent.trim().toLowerCase();
        if (label === "logout" && typeof AdminApi !== "undefined") {
            link.addEventListener("click", (e) => {
                e.preventDefault();
                AdminApi.logout();
            });
        }
    });
});
