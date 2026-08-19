// ============================================================================
// Department / Program configuration
// ----------------------------------------------------------------------------
// The college has two departments, each run by one admin. Each department
// offers its own three programs (Artificial Intelligence is offered by
// both, as a shared program).
//
// Which department the signed-in admin belongs to is read from
// localStorage("admin_dept") — the same key project-details.js already
// uses to pick between the two admin names — defaulting to Computer
// Science (Dr. Hassan El-Mahdy) when unset.
//
// There's no login/session system in this version of the app, so this is
// the stand-in for "which admin is currently signed in". Swap
// getCurrentAdminDept() for real session data once auth is wired in.
// ============================================================================

const ADMIN_DIRECTORY = {
    CS: { name: "Dr. Hassan El-Mahdy", department: "Computer Science" },
    IS: { name: "Dr. Osama Farouk", department: "Information Systems" },
};

const PROGRAMS_BY_DEPARTMENT = {
    CS: [
        { value: "cs", label: "Computer Science" },
        { value: "swe", label: "Software Engineering" },
        { value: "ai", label: "Artificial Intelligence" },
    ],
    IS: [
        { value: "is", label: "Information Systems" },
        { value: "cyber", label: "Cybersecurity" },
        { value: "ai", label: "Artificial Intelligence" },
    ],
};

// The one supported academic year across the app right now.
const CURRENT_ACADEMIC_YEAR = "2026/2027";

function getCurrentAdminDept() {
    const dept = (localStorage.getItem("admin_dept") || "CS").toUpperCase();
    return PROGRAMS_BY_DEPARTMENT[dept] ? dept : "CS";
}

function getCurrentAdmin() {
    return ADMIN_DIRECTORY[getCurrentAdminDept()];
}

function getProgramsForCurrentAdmin() {
    return PROGRAMS_BY_DEPARTMENT[getCurrentAdminDept()];
}

// Fills a <select> with the current admin's programs only, keeping a
// leading "All Programs"-style placeholder option.
function populateProgramFilter(selectEl, placeholderLabel) {
    if (!selectEl) return;
    const programs = getProgramsForCurrentAdmin();

    selectEl.innerHTML =
        `<option value="">${placeholderLabel || "Program"}</option>` +
        programs.map((p) => `<option value="${p.value}">${p.label}</option>`).join("");
}
