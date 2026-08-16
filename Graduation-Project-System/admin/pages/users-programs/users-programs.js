document.addEventListener("DOMContentLoaded", function () {
    const staffForm = document.getElementById("addStaffForm");
    const programForm = document.getElementById("addProgramForm");

    // Password show/hide toggle on the Add Staff form
    const togglePasswordBtn = document.getElementById("toggleStaffPassword");
    const staffPasswordInput = document.getElementById("staffPassword");
    if (togglePasswordBtn && staffPasswordInput) {
        togglePasswordBtn.addEventListener("click", function () {
            const showing = staffPasswordInput.type === "password";
            staffPasswordInput.type = showing ? "text" : "password";
            const icon = togglePasswordBtn.querySelector("i");
            if (icon) {
                icon.classList.toggle("fa-eye", !showing);
                icon.classList.toggle("fa-eye-slash", showing);
            }
        });
    }

    // 0️⃣ دالة إظهار الـ Toast Popup Notification فوق
    function showToast(message, isSuccess = false) {
        let toast = document.getElementById("toastNotification");

        // لو الـ Toast مش موجود في الـ HTML بنعمله dynamic
        if (!toast) {
            toast = document.createElement("div");
            toast.id = "toastNotification";
            toast.className = "toast-popup";
            document.body.appendChild(toast);
        }

        toast.textContent = message;
        toast.className = `toast-popup active ${isSuccess ? 'success' : 'error'}`;

        setTimeout(() => {
            toast.className = 'toast-popup';
        }, 3000);
    }

    // 1️⃣ إدارة أعضاء هيئة التدريس — rendered dynamically from StaffStorage
    //    (see /admin/shared/js/staff-database.js). Adding a member here
    //    persists them to storage, so the same list automatically feeds the
    //    "Select Reviewer" picker on the Project Details page — no separate
    //    hardcoded list to keep in sync.

    function createStaffRow(member) {
        const row = document.createElement("tr");
        row.dataset.staffId = member.id;

        row.innerHTML = `
            <td>${member.name}</td>
            <td>
                <div class="table-actions">
                    <button type="button" class="btn-action-edit" title="Edit"><i class="fa-solid fa-pen"></i></button>
                    <button type="button" class="btn-action-delete" title="Delete"><i class="fa-solid fa-trash"></i></button>
                </div>
            </td>
        `;

        attachActionEvents(row, {
            onDelete: () => StaffStorage.remove(member.id),
            onEdit: (newName) => StaffStorage.update(member.id, newName)
        });

        return row;
    }

    function renderStaff() {
        const staffTableBody = document.getElementById("staffTableBody");
        if (!staffTableBody || typeof StaffStorage === "undefined") return;

        staffTableBody.innerHTML = "";
        StaffStorage.getAll().forEach((member) => {
            staffTableBody.appendChild(createStaffRow(member));
        });
    }

    renderStaff();

    if (staffForm) {
        staffForm.addEventListener("submit", function (e) {
            e.preventDefault();

            // جلب العناصر عن طريق الـ ID المباشر بدلاً من nth-of-type
            const nameInput = document.getElementById("staffFullName");
            const userInput = document.getElementById("staffUsername");
            const passInput = document.getElementById("staffPassword");

            const fullName = nameInput ? nameInput.value.trim() : "";
            const username = userInput ? userInput.value.trim() : "";
            const password = passInput ? passInput.value.trim() : "";

            // التأكد من ملء الحقول
            if (!fullName || !username || !password) {
                showToast("⚠️ Please fill in all fields!");
                return;
            }

            // مطابقة الـ Username و الـ Password مع قاعدة البيانات DB
            const isValidDoctor = typeof RegisteredDoctorsDB !== "undefined" && RegisteredDoctorsDB.some(
                doc => doc.username === username && doc.password === password
            );

            if (!isValidDoctor) {
                showToast("❌ Incorrect Username or Password! Doctor not found in registered database.");
                return;
            }

            if (typeof StaffStorage === "undefined") {
                showToast("⚠️ Staff database is not available.");
                return;
            }

            // إضافة العضو الجديد في الـ storage — بيظهر تلقائياً في جدول
            // Current Staff Members وفي قائمة "Select Reviewer" كمان
            const newStaff = StaffStorage.add(fullName, username);
            const staffTableBody = document.getElementById("staffTableBody");
            if (staffTableBody) {
                staffTableBody.appendChild(createStaffRow(newStaff));
            }

            // إعادة تعيين الفورم وإظهار رسالة نجاح
            staffForm.reset();
            showToast(`✅ ${fullName} added successfully!`, true);
        });
    }

    // 2️⃣ Programs Management — rendered dynamically from ProgramsStorage
    //    (see /admin/shared/js/programs-database.js). Nothing here is
    //    hardcoded in the HTML anymore: on load we read whatever is in
    //    storage and build the rows; adding/editing/deleting a program
    //    updates that storage so the list survives a page reload.

    function createProgramRow(program) {
        const row = document.createElement("tr");
        row.dataset.programId = program.id;

        row.innerHTML = `
            <td>${program.name}</td>
            <td>
                <div class="table-actions">
                    <button type="button" class="btn-action-edit" title="Edit"><i class="fa-solid fa-pen"></i></button>
                    <button type="button" class="btn-action-delete" title="Delete"><i class="fa-solid fa-trash"></i></button>
                </div>
            </td>
        `;

        attachActionEvents(row, {
            onDelete: () => ProgramsStorage.remove(program.id),
            onEdit: (newName) => ProgramsStorage.update(program.id, newName)
        });

        return row;
    }

    function renderPrograms() {
        const programsTableBody = document.getElementById("programsTableBody");
        if (!programsTableBody || typeof ProgramsStorage === "undefined") return;

        programsTableBody.innerHTML = "";
        ProgramsStorage.getAll().forEach((program) => {
            programsTableBody.appendChild(createProgramRow(program));
        });
    }

    renderPrograms();

    if (programForm) {
        programForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const programInput = programForm.querySelector('input[type="text"]');
            const programName = programInput ? programInput.value.trim() : "";

            if (!programName) {
                showToast("⚠️ Please enter a program name!");
                return;
            }

            if (typeof ProgramsStorage === "undefined") {
                showToast("⚠️ Programs database is not available.");
                return;
            }

            const newProgram = ProgramsStorage.add(programName);
            const programsTableBody = document.getElementById("programsTableBody");
            if (programsTableBody) {
                programsTableBody.appendChild(createProgramRow(newProgram));
            }

            programForm.reset();
            showToast(`✅ Program "${programName}" added successfully!`, true);
        });
    }

    // 3️⃣ تفعيل أزرار الحذف والتعديل
    //    options.onDelete / options.onEdit are optional hooks used to persist
    //    the change back to a data store (e.g. ProgramsStorage). Staff rows
    //    don't pass any options, so they behave exactly as before.
    function attachActionEvents(row, options = {}) {
        const deleteBtn = row.querySelector(".btn-action-delete");
        const editBtn = row.querySelector(".btn-action-edit");

        // زر الحذف
        if (deleteBtn) {
            deleteBtn.onclick = function () {
                if (confirm("Are you sure you want to delete this item?")) {
                    if (typeof options.onDelete === "function") {
                        options.onDelete();
                    }
                    row.remove();
                    showToast("🗑️ Item deleted successfully.", true);
                }
            };
        }

        // زر التعديل
        if (editBtn) {
            editBtn.onclick = function () {
                const titleCell = row.querySelector("td:first-child");
                const currentText = titleCell.textContent.trim();
                const newText = prompt("Update name:", currentText);

                if (newText && newText.trim() !== "") {
                    const trimmed = newText.trim();
                    titleCell.textContent = trimmed;
                    if (typeof options.onEdit === "function") {
                        options.onEdit(trimmed);
                    }
                    showToast("✏️ Updated successfully!", true);
                }
            };
        }
    }
});
