// ============================================================================
// Programs data module
// ----------------------------------------------------------------------------
// Single source of truth for the academic programs shown on the
// "Staff and Programs" admin page, backed by the real backend
// (GET/POST/PUT/DELETE /api/programs). The backend already scopes this to
// the signed-in admin's own department (plus shared programs like
// Artificial Intelligence) and includes a leading "All CS/IS Programs"
// placeholder entry, so this module just passes the response straight
// through — no local department mapping needed anymore.
//
// All methods are async (they return Promises), since they talk to the
// network. Callers use `await ProgramsStorage.getAll()` etc.
// ============================================================================

const ProgramsStorage = {
    // Returns this admin's programs: [{ id: "", name: "All CS Programs" }, { id, name, created_at }, ...]
    getAll: () => AdminApi.get("/programs"),

    // Adds a new program. Returns the created record.
    add: (name) => AdminApi.post("/programs", { name }),

    // Renames an existing program.
    update: (id, name) => AdminApi.put(`/programs/${id}`, { name }),

    // Removes a program by id.
    remove: (id) => AdminApi.del(`/programs/${id}`),
};
