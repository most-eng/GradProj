document.addEventListener("DOMContentLoaded", function () {
    // العناصر الأساسية
    const statusModal = document.getElementById("statusModal");
    const openModalBtn = document.getElementById("changeStatusBtn");
    const closeModalBtn = document.getElementById("closeModalBtn");

    // عناصر الـ Add Reviewer النافذة الثانية
    const addReviewerBtn = document.getElementById("addReviewerBtn");
    const reviewersList = document.getElementById("reviewersList");
    const reviewerPickerModal = document.getElementById("reviewerPickerModal");
    const closePickerBtn = document.getElementById("closePickerBtn");
    const doctorsPickerList = document.getElementById("doctorsPickerList");

    const newCommentInput = document.getElementById("newCommentInput");
    const commentsList = document.getElementById("commentsList");
    const commentsCount = document.getElementById("commentsCount");
    const confirmBtn = document.getElementById("confirmBtn");

    const projectStatusBadge = document.getElementById("projectStatusBadge");
    const projectStatusText = document.getElementById("projectStatusText");
    const finalDecisionSelect = document.getElementById("finalDecisionSelect");

    // 0️⃣ تحديد المشروع الحالي من الـ URL (?id=) عشان نجيب حالته الحقيقية
    function getCurrentProject() {
        const params = new URLSearchParams(window.location.search);
        const projectId = parseInt(params.get("id"), 10);

        if (typeof DoctorStorage === "undefined") return null;
        const allProjects = DoctorStorage.getAllProjects();

        if (!projectId) return allProjects[0] || null;
        return allProjects.find((p) => p.id === projectId) || allProjects[0] || null;
    }

    const currentProject = getCurrentProject();

    // 1️⃣ اسم الأدمن ديناميكياً
    function getCurrentAdminName() {
        const activeDepartment = localStorage.getItem("admin_dept") || "CS";
        return activeDepartment.toUpperCase() === "CS" ? "Dr. Hassan El-Mahdy" : "Dr. Osama Farouk";
    }

    // 2️⃣ عرض حالة المشروع (Project Status) — للعرض فقط، مش قابلة للتعديل
    //    الحالة بتتغيّر تلقائياً حسب مرحلة سير العمل: Pending -> Under review -> Under decision
    function renderStatusBadge(status) {
        if (!projectStatusBadge || !projectStatusText) return;

        const normalized = (status || "Pending").trim();
        projectStatusText.textContent = normalized;

        projectStatusBadge.classList.remove("status-under-review", "status-under-decision");

        if (normalized.toLowerCase() === "under review") {
            projectStatusBadge.classList.add("status-under-review");
        } else if (normalized.toLowerCase() === "under decision") {
            projectStatusBadge.classList.add("status-under-decision");
        }
        // "Pending" (and anything else) keeps the default warning/orange style.
    }

    renderStatusBadge(currentProject ? currentProject.status : "Pending");

    // لو المشروع عنده قرار نهائي متسجل بالفعل، نعرضه في الـ select
    if (finalDecisionSelect && currentProject && currentProject.finalDecision) {
        finalDecisionSelect.value = currentProject.finalDecision;
    }

    // 3️⃣ فتح وإغلاق modal الحالة الرئيسي
    if (openModalBtn) {
        openModalBtn.addEventListener("click", () => statusModal.classList.add("active"));
    }
    if (closeModalBtn) {
        closeModalBtn.addEventListener("click", () => statusModal.classList.remove("active"));
    }

    // 4️⃣ فتح وإغلاق modal قائمة الدكاترة (Picker)
    if (addReviewerBtn) {
        addReviewerBtn.addEventListener("click", function () {
            renderDoctorsPicker();
            reviewerPickerModal.classList.add("active");
        });
    }

    if (closePickerBtn) {
        closePickerBtn.addEventListener("click", function () {
            reviewerPickerModal.classList.remove("active");
        });
    }

    // إغلاق أي Modal عند الضغط خارجه
    window.addEventListener("click", function (e) {
        if (e.target === statusModal) statusModal.classList.remove("active");
        if (e.target === reviewerPickerModal) reviewerPickerModal.classList.remove("active");
    });

    // 5️⃣ رندر قائمة الدكاترة من StaffStorage مباشرة — نفس القائمة اللي
    //    بتتحدّث لحظياً من صفحة "Users & Programs" (Faculty Staff Management).
    //    أي عضو هيئة تدريس يتضاف هناك يظهر هنا تلقائياً من غير أي تعديل يدوي.
    function renderDoctorsPicker() {
        if (!doctorsPickerList) return;
        doctorsPickerList.innerHTML = "";

        const doctors = (typeof StaffStorage !== "undefined") ? StaffStorage.getAll() : [];

        if (doctors.length === 0) {
            doctorsPickerList.innerHTML = `<p class="doctors-picker-empty">No registered staff members yet. Add one from the Users & Programs page.</p>`;
            return;
        }

        doctors.forEach(doc => {
            const item = document.createElement("div");
            item.className = "doctor-pick-item";
            const docName = doc.name || doc.username;

            item.innerHTML = `
                <span><i class="fa-solid fa-user-doctor"></i> ${docName}</span>
                <i class="fa-solid fa-plus-circle"></i>
            `;

            item.addEventListener("click", function () {
                addReviewerTag(docName);
                reviewerPickerModal.classList.remove("active");
            });

            doctorsPickerList.appendChild(item);
        });
    }

    // دالة إضافة الدكتور المختار كصف كامل العرض (Trash icon يسار + الاسم)
    function addReviewerTag(name) {
        const row = document.createElement("div");
        row.className = "reviewer-item";
        row.innerHTML = `
            <button type="button" class="btn-delete-reviewer" title="Remove reviewer">
                <i class="fa-solid fa-trash-can"></i>
            </button>
            <span>${name}</span>
        `;

        row.querySelector(".btn-delete-reviewer").addEventListener("click", function () {
            row.remove();
        });

        reviewersList.appendChild(row);
    }

    // 6️⃣ تحديث عداد التعليقات "(N)" جنب لابل Comments
    function updateCommentsCount() {
        if (!commentsCount || !commentsList) return;
        const count = commentsList.querySelectorAll(".comment-card").length;
        commentsCount.textContent = `(${count})`;
    }

    function attachCommentDelete(commentCard) {
        commentCard.querySelector(".btn-delete-comment").addEventListener("click", function () {
            commentCard.remove();
            updateCommentsCount();
        });
    }

    // تفعيل زرار الحذف على أي تعليقات موجودة بالفعل (لو جاية من الستاف)
    commentsList.querySelectorAll(".comment-card").forEach(attachCommentDelete);
    updateCommentsCount();

    function addCommentCard(authorName, commentText) {
        const commentCard = document.createElement("div");
        commentCard.className = "comment-card";

        commentCard.innerHTML = `
            <div class="comment-header">
                <span class="comment-author">${authorName}</span>
                <button type="button" class="btn-delete-comment" title="Delete Comment">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
            <div class="comment-text">${commentText}</div>
        `;

        commentsList.appendChild(commentCard);
        attachCommentDelete(commentCard);
        updateCommentsCount();
    }

    // 7️⃣ الحفظ النهائي — بيحفظ القرار، المراجعين، وأي تعليق مكتوب في نفس الوقت
    //    (تم إلغاء زرار "Post Comment" المنفصل بناءً على طلب التصميم الجديد)
    if (confirmBtn) {
        confirmBtn.addEventListener("click", function () {
            const decision = finalDecisionSelect ? finalDecisionSelect.value : "";
            const commentText = newCommentInput ? newCommentInput.value.trim() : "";
            const reviewers = Array.from(reviewersList.querySelectorAll(".reviewer-item span"))
                .map((el) => el.textContent);

            if (commentText !== "") {
                addCommentCard(getCurrentAdminName(), commentText);
                newCommentInput.value = "";
            }

            if (currentProject) {
                currentProject.finalDecision = decision || currentProject.finalDecision || "";
                currentProject.reviewers = reviewers;
            }

            alert(`Changes saved successfully!\nFinal Decision: ${decision || "None"}\nReviewers: ${reviewers.length ? reviewers.join(", ") : "None"}`);
            statusModal.classList.remove("active");
        });
    }
});
