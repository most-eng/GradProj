document.addEventListener("DOMContentLoaded", function () {
    const tableBody = document.getElementById("projectsTableBody");
    const searchInput = document.getElementById("projectSearchInput");
    
    // ربط الـ IDs المضبوطة من ملف الـ HTML
    const programSelect = document.getElementById("programFilter");
    const yearSelect = document.getElementById("academicYearFilter");

    // عرض كل المشاريع عند أول فتح للموقع
    renderProjects(DoctorStorage.getAllProjects());

    // تفعيل الـ Events عند التغيير
    if (searchInput) searchInput.addEventListener("input", filterProjects);
    if (programSelect) programSelect.addEventListener("change", filterProjects);
    if (yearSelect) yearSelect.addEventListener("change", filterProjects);

    function filterProjects() {
        const query = searchInput ? searchInput.value.toLowerCase().trim() : "";
        const selectedProgram = programSelect ? programSelect.value.toLowerCase().trim() : "";
        const selectedYear = yearSelect ? yearSelect.value.trim() : "";

        let list = DoctorStorage.getAllProjects();

        // 1. فلترة السيرش (Search Input)
        if (query) {
            list = list.filter(p => 
                (p.projectTitleAr && p.projectTitleAr.toLowerCase().includes(query)) ||
                (p.projectTitleEn && p.projectTitleEn.toLowerCase().includes(query)) ||
                (p.teamLeaderNameAr && p.teamLeaderNameAr.toLowerCase().includes(query)) ||
                (p.leaderId && p.leaderId.includes(query))
            );
        }

        // 2. فلترة البرنامج الدراسي (Program Filter)
        if (selectedProgram) {
            list = list.filter(p => {
                if (!p.program) return true; // لو الخاصية مش موجودة في داتا المشروع ما يخفيش الصف
                const prog = p.program.toLowerCase();
                
                if (selectedProgram === "cs") {
                    return prog.includes("cs") || prog.includes("computer");
                }
                if (selectedProgram === "is") {
                    return prog.includes("is") || prog.includes("information");
                }
                return prog.includes(selectedProgram);
            });
        }

        // 3. فلترة السنة الدراسية (Academic Year Filter)
        if (selectedYear) {
            list = list.filter(p => {
                if (!p.academicYear) return true;
                return p.academicYear.trim() === selectedYear;
            });
        }

        renderProjects(list);
    }

    function renderProjects(data) {
        if (!tableBody) return;
        tableBody.innerHTML = "";

        if (data.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; color: #94A3B8; padding: 24px;">
                        No matching projects found.
                    </td>
                </tr>`;
            return;
        }

        data.forEach(project => {
            const row = document.createElement("tr");

            // Status Badge Formatting
            let badgeClass = "badge-pending";
            switch (project.status) {
                case "Accepted": badgeClass = "badge-accepted"; break;
                case "Rejected": badgeClass = "badge-rejected"; break;
                case "Minor revision": badgeClass = "badge-minor"; break;
                case "Major revision": badgeClass = "badge-major"; break;
                case "Under review": badgeClass = "badge-review"; break;
                case "Under decision": badgeClass = "badge-decision"; break;
                default: badgeClass = "badge-pending"; break;
            }

            row.innerHTML = `
                <td><strong>${project.teamNumber}</strong></td>
                <td>
                    <div class="project-title-cell">
                        <span class="title-ar">${project.projectTitleAr}</span>
                        <span class="title-en">(${project.projectTitleEn})</span>
                    </div>
                </td>
                <td class="arabic-student-name">${project.teamLeaderNameAr}</td>
                <td>${project.membersCount} Members</td>
                <td>${project.leaderId}</td>
                <td><span class="status-badge ${badgeClass}">${project.status}</span></td>
                <td>
                    <a href="../project-details/index.html?id=${project.id}" class="btn-icon-view" title="View Details">
                        <i class="fa-solid fa-eye"></i>
                    </a>
                </td>
            `;

            tableBody.appendChild(row);
        });
    }
});