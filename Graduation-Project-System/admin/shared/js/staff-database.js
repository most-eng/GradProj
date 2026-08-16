// ============================================================================
// Staff data module
// ----------------------------------------------------------------------------
// This is the single source of truth for faculty staff members added on the
// "Staff and Programs" admin page. Any staff member added there is stored
// here, and this same list feeds the "Select Reviewer" picker on the
// Project Details page — so a staff member added in one place shows up as
// an available reviewer automatically, with no separate hardcoded list to
// keep in sync.
//
// Scoped per department (via department-config.js) so each admin starts
// with an empty list and only ever sees/manages their own department's
// staff — Hassan El-Mahdy's additions never show up for Osama Farouk, and
// vice versa.
//
// There is no backend/API in this project, so this module persists data in
// the browser via localStorage (same approach as programs-database.js).
// To connect this to a real database later, replace the body of getAll/add/
// update/remove below with fetch() calls to your API — the rest of the app
// only talks to StaffStorage, so no other file needs to change.
// ============================================================================

const StaffStorage = (function () {
    function storageKey() {
        const dept = typeof getCurrentAdminDept === "function" ? getCurrentAdminDept() : "CS";
        return `staff_db_${dept}`;
    }

    function readFromStorage() {
        try {
            const saved = localStorage.getItem(storageKey());
            if (saved) return JSON.parse(saved);
        } catch (e) {
            console.warn("Could not read staff from storage.", e);
        }
        return null;
    }

    function persist(staff) {
        localStorage.setItem(storageKey(), JSON.stringify(staff));
    }

    // Every admin starts with an empty staff list and adds their own
    // department's staff members from here.
    let staff = readFromStorage() || [];

    return {
        // Returns all staff members currently stored for the signed-in admin's department.
        getAll: () => staff.slice(),

        // Adds a new staff member and persists it. Returns the created record.
        add: (name, username) => {
            const nextId = staff.reduce((max, s) => Math.max(max, s.id), 0) + 1;
            const newStaff = { id: nextId, name, username: username || "" };
            staff.push(newStaff);
            persist(staff);
            return newStaff;
        },

        // Renames an existing staff member by id and persists the change.
        update: (id, name) => {
            const member = staff.find((s) => s.id === id);
            if (member) {
                member.name = name;
                persist(staff);
            }
            return member;
        },

        // Removes a staff member by id and persists the change.
        remove: (id) => {
            staff = staff.filter((s) => s.id !== id);
            persist(staff);
        }
    };
})();
