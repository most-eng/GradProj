document.addEventListener("DOMContentLoaded", function () {
    // 0. Fill the Program filter with this admin's own department's programs
    if (typeof populateProgramFilter === "function") {
        populateProgramFilter(document.getElementById("programFilter"));
    }

    // 1. Calculate Dynamic Stats
    loadDashboardStats();

    // 2. Handle Registration Toggle
    initRegistrationToggle();
});

function loadDashboardStats() {
    // Fetch stored data (or fallback to empty arrays)
    const projects = JSON.parse(localStorage.getItem("projects_data")) || [];
    const students = JSON.parse(localStorage.getItem("students_data")) || [];
    const teams = JSON.parse(localStorage.getItem("teams_data")) || [];

    // Render counts (if localStorage is empty, show design default numbers 34, 235, 34)
    document.getElementById("totalProjectsCount").textContent = projects.length > 0 ? projects.length : 34;
    document.getElementById("totalStudentsCount").textContent = students.length > 0 ? students.length : 235;
    document.getElementById("totalTeamsCount").textContent = teams.length > 0 ? teams.length : 34;
}

function initRegistrationToggle() {
    const regStatusContainer = document.getElementById("regStatusContainer");
    const toggleRegBtn = document.getElementById("toggleRegBtn");

    // Check saved status (default is OPEN as per design)
    let isOpen = localStorage.getItem("registration_status") !== "closed";

    function updateUI() {
        if (isOpen) {
            regStatusContainer.innerHTML = `
                <div class="status-open-text">
                    <i class="fa-regular fa-square-check"></i> Registration is Open Now
                </div>
                <div class="status-desc">Students can add and edit projects</div>
            `;
            toggleRegBtn.textContent = "Close Registration";
            toggleRegBtn.style.backgroundColor = "#0D47A1";
        } else {
            regStatusContainer.innerHTML = `
                <div class="status-closed-text">
                    <i class="fa-solid fa-lock"></i> Registration is Closed Now
                </div>
                <div class="status-desc">Students cannot add or edit projects</div>
            `;
            toggleRegBtn.textContent = "Open Registration";
            toggleRegBtn.style.backgroundColor = "#166534";
        }
    }

    updateUI();

    if (toggleRegBtn) {
        toggleRegBtn.addEventListener("click", function () {
            isOpen = !isOpen;
            localStorage.setItem("registration_status", isOpen ? "open" : "closed");
            updateUI();
        });
    }
}