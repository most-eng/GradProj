document.addEventListener("DOMContentLoaded", function () {
    console.log("Staff Developers page ready.");
    
    // Logout handling
    const logoutBtn = document.getElementById("staffLogoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function(e) {
            e.preventDefault();
            alert("Logged out successfully");
        });
    }
});