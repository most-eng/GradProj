// ============================================================================
// Programs data module
// ----------------------------------------------------------------------------
// This is the single source of truth for the academic programs shown on the
// "Staff and Programs" admin page. Scoped per department (via
// department-config.js): Computer Science admins (Dr. Hassan El-Mahdy) see
// and manage Computer Science / Software Engineering / Artificial
// Intelligence; Information Systems admins (Dr. Osama Farouk) see
// Information Systems / Cybersecurity / Artificial Intelligence — the same
// list PROGRAMS_BY_DEPARTMENT drives the Program filter dropdowns with.
//
// There is currently no backend/API in this project, so this module
// persists data in the browser via localStorage — this is why adding/
// removing a program now survives a page reload instead of resetting.
//
// To connect this to a real database later, replace the body of getAll/add/
// update/remove below with fetch() calls to your API (e.g. GET/POST/PUT/
// DELETE /api/programs) — the rest of the app only talks to ProgramsStorage,
// so no other file needs to change.
// ============================================================================

const ProgramsStorage = (function () {
    function storageKey() {
        const dept = typeof getCurrentAdminDept === "function" ? getCurrentAdminDept() : "CS";
        return `programs_db_${dept}`;
    }

    function defaultProgramsForDept() {
        const dept = typeof getCurrentAdminDept === "function" ? getCurrentAdminDept() : "CS";
        const programs = (typeof PROGRAMS_BY_DEPARTMENT !== "undefined" && PROGRAMS_BY_DEPARTMENT[dept]) || [];
        return programs.map((p, index) => ({ id: index + 1, name: p.label }));
    }

    function readFromStorage() {
        try {
            const saved = localStorage.getItem(storageKey());
            if (saved) return JSON.parse(saved);
        } catch (e) {
            console.warn("Could not read programs from storage, falling back to defaults.", e);
        }
        return null;
    }

    function persist(programs) {
        localStorage.setItem(storageKey(), JSON.stringify(programs));
    }

    // Load saved data, or seed localStorage with this department's default
    // programs on first run.
    let programs = readFromStorage();
    if (!programs) {
        programs = defaultProgramsForDept();
        persist(programs);
    }

    return {
        // Returns all programs currently stored for the signed-in admin's department.
        getAll: () => programs.slice(),

        // Adds a new program and persists it. Returns the created record.
        add: (name) => {
            const nextId = programs.reduce((max, p) => Math.max(max, p.id), 0) + 1;
            const newProgram = { id: nextId, name };
            programs.push(newProgram);
            persist(programs);
            return newProgram;
        },

        // Renames an existing program by id and persists the change.
        update: (id, name) => {
            const program = programs.find((p) => p.id === id);
            if (program) {
                program.name = name;
                persist(programs);
            }
            return program;
        },

        // Removes a program by id and persists the change.
        remove: (id) => {
            programs = programs.filter((p) => p.id !== id);
            persist(programs);
        }
    };
})();
