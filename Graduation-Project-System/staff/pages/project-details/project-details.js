document.addEventListener("DOMContentLoaded", function () {
    // 1️⃣ معرفة المشروع المطلوب من الـ URL (مثلاً: ?id=1)
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get("id") || "1";

    const project = StaffStorage.getProjectById(projectId);

    if (!project) {
        alert("Project not found!");
        window.location.href = "../dashboard/index.html";
        return;
    }

    // 2️⃣ تعبئة بيانات المشروع في الصفحة (زي شكل صفحة الأدمن بالظبط)
    document.getElementById("pTitle").textContent = project.title;
    document.getElementById("pDepartment").textContent = project.department || project.program || "—";
    document.getElementById("pProgram").textContent = project.program || "—";
    document.getElementById("pAcademicYear").textContent = project.academicYear || "—";
    document.getElementById("pIdea").textContent = project.projectIdea || "N/A";
    document.getElementById("pProblem").textContent = project.problemStatement || "N/A";

    const objectivesEl = document.getElementById("pObjectives");
    if (project.problemObjectives && project.problemObjectives.length > 0) {
        objectivesEl.innerHTML = project.problemObjectives
            .map(point => `• ${point}`)
            .join("<br>");
    } else {
        objectivesEl.textContent = "N/A";
    }

    document.getElementById("pContribution").textContent = project.expectedContribution || "N/A";

    const statusEl = document.getElementById("pStatus");
    statusEl.textContent = project.status || "Pending Review";
    statusEl.className = "status-badge " + getStatusBadgeClass(project.status);

    function getStatusBadgeClass(status) {
        switch (status) {
            case "Accepted": return "status-success";
            case "Rejected": return "status-error";
            case "Minor revision":
            case "Major revision": return "status-warning";
            default: return "status-warning";
        }
    }

    // 3️⃣ جدول قائد الفريق
    const leaderTableBody = document.getElementById("pLeaderTableBody");
    const leaderContact = project.leaderContact || {};
    leaderTableBody.innerHTML = `
        <tr>
            <td>${project.leader || "—"}</td>
            <td>${leaderContact.phone || "—"}</td>
            <td>${leaderContact.role || "—"}</td>
            <td>${leaderContact.studentId || "—"}</td>
        </tr>
    `;

    // 4️⃣ جدول أعضاء الفريق
    const membersTableBody = document.getElementById("pMembersTableBody");
    membersTableBody.innerHTML = "";
    (project.teamMembers || []).forEach(member => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${member.name || member}</td>
            <td>${member.phone || "—"}</td>
            <td>${member.role || "—"}</td>
            <td>${member.studentId || "—"}</td>
        `;
        membersTableBody.appendChild(row);
    });

    // 5️⃣ التعامل مع الـ Modal
    const modal = document.getElementById("reviewModal");
    const openBtn = document.getElementById("openReviewModalBtn");
    const closeBtn = document.getElementById("closeModalBtn");
    const cancelBtn = document.getElementById("cancelModalBtn");
    const reviewForm = document.getElementById("reviewForm");

    openBtn.addEventListener("click", () => modal.classList.add("active"));
    closeBtn.addEventListener("click", () => modal.classList.remove("active"));
    cancelBtn.addEventListener("click", () => modal.classList.remove("active"));

    // 6️⃣ حفظ المراجعة عند الـ Submit
    reviewForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const selectedStatus = document.querySelector('input[name="reviewStatus"]:checked')?.value;
        const doctorComment = document.getElementById("doctorComment").value;
        const loggedInDoctor = localStorage.getItem("staff_user") || "Dr. Mostafa Shobeir";

        if (!selectedStatus) {
            alert("Please select a status decision.");
            return;
        }

        const success = StaffStorage.submitReview(projectId, selectedStatus, doctorComment, loggedInDoctor);

        if (success) {
            alert("Review submitted successfully!");
            modal.classList.remove("active");
            location.reload(); // إعادة تحميل الصفحة لرؤية الحالة الجديدة
        } else {
            alert("Failed to submit review.");
        }
    });
});