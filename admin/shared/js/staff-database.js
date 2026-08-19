// ============================================================================
// Staff data module
// ----------------------------------------------------------------------------
// Single source of truth for faculty staff members, backed by the real
// backend (GET/POST/PUT/DELETE /api/staff). Any staff member added on the
// "Staff and Programs" page is created in the database, scoped to the
// signed-in admin's own department — so the same list automatically feeds
// the "Select Reviewer" picker on the Project Details page too, with no
// separate hardcoded list to keep in sync.
//
// All methods are async (they return Promises), since they talk to the
// network. Callers use `await StaffStorage.getAll()` etc.
// ============================================================================

const StaffStorage = {
    // Returns all staff members in the admin's department.
    // Each item: { id, full_name, username, department_id, created_at }
    getAll: () => AdminApi.get("/staff"),

    // Adds a new staff member. Returns the created record.
    add: (fullName, username, password) =>
        AdminApi.post("/staff", { fullName, username, password }),

    // Updates an existing staff member's full name.
    update: (id, fullName) => AdminApi.put(`/staff/${id}`, { fullName }),

    // Removes a staff member by id.
    remove: (id) => AdminApi.del(`/staff/${id}`),
};
