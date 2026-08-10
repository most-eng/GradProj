// ============================================================================
// Staff data module
// ----------------------------------------------------------------------------
// Single source of truth for faculty staff members added on the
// "Users & Programs" admin page. Any staff member added there is stored
// here, and this same list feeds the "Select Reviewer" picker on the
// Project Details page — so a staff member added in one place shows up
// as an available reviewer automatically, with no separate hardcoded list
// to keep in sync.
//
// There is no backend/API in this project, so this module persists data in
// the browser via localStorage (same approach as programs-database.js).
// To connect this to a real database later, replace the body of
// getAll/add/update/remove below with fetch() calls to your API — the rest
// of the app only talks to StaffStorage, so no other file needs to change.
// ============================================================================

// Seed/default data — used only the very first time the app runs on a
// browser (i.e. when localStorage has nothing saved yet). This keeps the
// reviewer list populated out of the box instead of starting empty.
const DefaultStaffDB = [
    { id: 1, name: "دكتور حسن المهدي", username: "dr_hassan" },
    { id: 2, name: "دكتور أسامة فاروق", username: "dr_osama" },
    { id: 3, name: "دكتور مصطفى الخولي", username: "dr_mostafa" },
    { id: 4, name: "دكتور مصطفى شوبير", username: "dr_shobeir" }
];

const StaffStorage = (function () {
    const STORAGE_KEY = "staff_db";

    function readFromStorage() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) return JSON.parse(saved);
        } catch (e) {
            console.warn("Could not read staff from storage, falling back to defaults.", e);
        }
        return null;
    }

    function persist() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(staff));
    }

    // Load saved data, or seed localStorage with the defaults on first run.
    let staff = readFromStorage();
    if (!staff) {
        staff = DefaultStaffDB.slice();
        persist();
    }

    return {
        // Returns all staff members currently stored.
        getAll: () => staff.slice(),

        // Adds a new staff member and persists it. Returns the created record.
        add: (name, username) => {
            const nextId = staff.reduce((max, s) => Math.max(max, s.id), 0) + 1;
            const newStaff = { id: nextId, name, username: username || "" };
            staff.push(newStaff);
            persist();
            return newStaff;
        },

        // Renames an existing staff member by id and persists the change.
        update: (id, name) => {
            const member = staff.find((s) => s.id === id);
            if (member) {
                member.name = name;
                persist();
            }
            return member;
        },

        // Removes a staff member by id and persists the change.
        remove: (id) => {
            staff = staff.filter((s) => s.id !== id);
            persist();
        }
    };
})();
