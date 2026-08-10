// ============================================================================
// Programs data module
// ----------------------------------------------------------------------------
// This is the single source of truth for the academic programs shown on the
// "Users & Programs" admin page. It is intentionally kept OUTSIDE the HTML
// file so program records are data, not markup.
//
// There is currently no backend/API in this project, so this module persists
// data in the browser via localStorage — this is why adding/removing a
// program now survives a page reload instead of resetting.
//
// To connect this to a real database later, replace the body of getAll/add/
// update/remove below with fetch() calls to your API (e.g. GET/POST/PUT/
// DELETE /api/programs) — the rest of the app only talks to ProgramsStorage,
// so no other file needs to change.
// ============================================================================

// Seed/default data — used only the very first time the app runs on a
// browser (i.e. when localStorage has nothing saved yet).
const DefaultProgramsDB = [
    { id: 1, name: "Computer Science" },
    { id: 2, name: "Software Engineering" },
    { id: 3, name: "Cyber Security" }
];

const ProgramsStorage = (function () {
    const STORAGE_KEY = "programs_db";

    function readFromStorage() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) return JSON.parse(saved);
        } catch (e) {
            console.warn("Could not read programs from storage, falling back to defaults.", e);
        }
        return null;
    }

    function persist() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(programs));
    }

    // Load saved data, or seed localStorage with the defaults on first run.
    let programs = readFromStorage();
    if (!programs) {
        programs = DefaultProgramsDB.slice();
        persist();
    }

    return {
        // Returns all programs currently stored.
        getAll: () => programs.slice(),

        // Adds a new program and persists it. Returns the created record.
        add: (name) => {
            const nextId = programs.reduce((max, p) => Math.max(max, p.id), 0) + 1;
            const newProgram = { id: nextId, name };
            programs.push(newProgram);
            persist();
            return newProgram;
        },

        // Renames an existing program by id and persists the change.
        update: (id, name) => {
            const program = programs.find((p) => p.id === id);
            if (program) {
                program.name = name;
                persist();
            }
            return program;
        },

        // Removes a program by id and persists the change.
        remove: (id) => {
            programs = programs.filter((p) => p.id !== id);
            persist();
        }
    };
})();
