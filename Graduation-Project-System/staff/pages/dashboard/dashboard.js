document.addEventListener("DOMContentLoaded", function () {
    const projectsContainer = document.getElementById("staffProjectsContainer");
    const loggedInDoctorName = document.getElementById("loggedInDoctorName");

    // 1️⃣ الحصول على اسم الدكتور المسجل دخول حالياً (أو افتراضي للتجربة)
    const currentDoctor = localStorage.getItem("staff_user") || "Dr. Mostafa Shobeir";
    if (loggedInDoctorName) {
        loggedInDoctorName.textContent = currentDoctor;
    }

    // 2️⃣ جلب كل المشاريع من الـ Storage
    const allProjects = (typeof RegisteredProjectsDB !== "undefined") ? RegisteredProjectsDB : [
        {
            id: "1",
            title: "Potato Rot Processing System",
            leader: "Hamza Abdelkarim",
            program: "Computer Science",
            date: "25/7/2026",
            status: "Pending Review",
            reviewers: ["Dr. Mostafa Shobeir"]
        }
    ];

    // 3️⃣ فلترة المشاريع المسندة فقط للدكتور ده
    const assignedProjects = allProjects.filter(project => 
        project.reviewers && project.reviewers.includes(currentDoctor)
    );

    // 4️⃣ رندر الشاشة (إما الكروت أو Empty State)
    renderStaffProjects(assignedProjects);

    function renderStaffProjects(projects) {
        if (!projectsContainer) return;
        projectsContainer.innerHTML = "";

        // لو مفيش مشاريع مسندة (صورة 1)
        if (projects.length === 0) {
            projectsContainer.innerHTML = `
                <div class="empty-state-box">
                    <p class="empty-state-text">No Projects Assigned For Review</p>
                </div>
            `;
            return;
        }

        // لو في مشاريع (صورة 2)
        projects.forEach(project => {
            const card = document.createElement("div");
            card.className = "project-card";

            card.innerHTML = `
                <div class="project-main-info">
                    <h3 class="project-title">
                        <i class="fa-regular fa-file-lines" style="color: #2563EB;"></i> 
                        ${project.title}
                    </h3>
                    <div class="project-meta-details">
                        <span class="project-meta-item">
                            <i class="fa-solid fa-user-group"></i> Leader: ${project.leader}
                        </span>
                        <span class="project-meta-item">
                            Program: ${project.program}
                        </span>
                        <span class="project-meta-item">
                            <i class="fa-regular fa-calendar-days"></i> Sent: ${project.date}
                        </span>
                    </div>
                </div>

                <div class="project-actions-box">
                    <span class="status-badge status-warning">
                        ● ${project.status || "Pending Review"}
                    </span>
                    <a href="../project-details/index.html?id=${project.id}" class="btn btn-outline-primary">
                        Review Project <i class="fa-solid fa-arrow-right"></i>
                    </a>
                </div>
            `;

            projectsContainer.appendChild(card);
        });
    }

    // زرار تسجيل الخروج
    const logoutBtn = document.getElementById("staffLogoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function (e) {
            e.preventDefault();
            localStorage.removeItem("staff_user");
            alert("Logged out successfully");
            // window.location.href = "../login/index.html";
        });
    }
});