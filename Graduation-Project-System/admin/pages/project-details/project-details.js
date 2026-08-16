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
    const modalPhaseHint = document.getElementById("modalPhaseHint");
    const finalDecisionRow = document.getElementById("finalDecisionRow");
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
    if (currentProject) {
        if (!Array.isArray(currentProject.reviewers)) currentProject.reviewers = [];
        if (!Array.isArray(currentProject.comments)) currentProject.comments = [];
    }

    // 1️⃣ اسم الأدمن ديناميكياً
    function getCurrentAdminName() {
        const activeDepartment = localStorage.getItem("admin_dept") || "CS";
        return activeDepartment.toUpperCase() === "CS" ? "Dr. Hassan El-Mahdy" : "Dr. Osama Farouk";
    }

    // ─────────────────────────────────────────────────────────────────
    // مراحل سير العمل (workflow) بتاعة المشروع:
    //   "review"    → Pending / Under review   → الأدمن لسه بيبعت/مستني المراجعين
    //   "decision"  → Pending Decision         → الستاف خلصوا مراجعة، دور الأدمن ياخد القرار
    //   "done"      → Accepted/Rejected/...    → القرار النهائي اتبعت للطالب بالفعل
    // ─────────────────────────────────────────────────────────────────
    function getPhase(status) {
        const s = (status || "Pending").trim();
        if (s === "Pending" || s === "Under review") return "review";
        if (s === "Pending Decision") return "decision";
        return "done";
    }

    // 2️⃣ عرض حالة المشروع (Project Status) — للعرض فقط، مش قابلة للتعديل
    //    الحالة بتتغيّر تلقائياً حسب مرحلة سير العمل: Pending -> Under review -> Pending Decision -> (Final Decision)
    function renderStatusBadge(status) {
        if (!projectStatusBadge || !projectStatusText) return;

        const normalized = (status || "Pending").trim();
        projectStatusText.textContent = normalized;

        projectStatusBadge.classList.remove("status-under-review", "status-under-decision");

        if (normalized.toLowerCase() === "under review") {
            projectStatusBadge.classList.add("status-under-review");
        } else if (normalized.toLowerCase() === "pending decision") {
            projectStatusBadge.classList.add("status-under-decision");
        }
        // "Pending" (and final decisions like Accepted/Rejected) keep the default style.
    }

    // Shows/hides the Final Decision field and updates the helper hint
    // based on what phase the project is currently in.
    function updatePhaseUI() {
        const status = currentProject ? currentProject.status : "Pending";
        const phase = getPhase(status);

        if (finalDecisionRow) {
            finalDecisionRow.classList.toggle("hidden", phase === "review");
        }

        if (confirmBtn) {
            confirmBtn.disabled = false;
        }

        if (modalPhaseHint) {
            if (phase === "review") {
                modalPhaseHint.textContent = (status === "Pending")
                    ? 'Add reviewers below, then click "Send for Review" to send this project to staff.'
                    : 'This project is currently under review by staff. You can add more reviewers and send again if needed.';
            } else if (phase === "decision") {
                modalPhaseHint.textContent = 'Staff have finished reviewing this project. Select a final decision below, then click "Send for Review" to notify the student.';
            } else {
                modalPhaseHint.textContent = `This project's final decision ("${status}") has already been sent to the student. You can update it and send again if needed.`;
            }
        }
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
    //    بتتحدّث لحظياً من صفحة "Staff and Programs" (Faculty Staff Management).
    //    أي عضو هيئة تدريس يتضاف هناك يظهر هنا تلقائياً من غير أي تعديل يدوي.
    function renderDoctorsPicker() {
        if (!doctorsPickerList) return;
        doctorsPickerList.innerHTML = "";

        const doctors = (typeof StaffStorage !== "undefined") ? StaffStorage.getAll() : [];

        if (doctors.length === 0) {
            doctorsPickerList.innerHTML = `<p class="doctors-picker-empty">No registered staff members yet. Add one from the Staff and Programs page.</p>`;
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

    // تحميل المراجعين المسجّلين بالفعل على المشروع (لو الأدمن بعت المشروع قبل كده)
    if (currentProject && currentProject.reviewers && currentProject.reviewers.length) {
        currentProject.reviewers.forEach((name) => addReviewerTag(name));
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

    // تحميل تعليقات الستاف/الأدمن المسجّلة على المشروع بالفعل — دي اللي بتظهر
    // في حقل "Comments" جوه النافذة زي ما مطلوب بالظبط.
    if (currentProject && currentProject.comments && currentProject.comments.length) {
        currentProject.comments.forEach((c) => addCommentCard(c.author, c.text));
    } else {
        updateCommentsCount();
    }

    updatePhaseUI();

    // 7️⃣ الحفظ — الزرار الوحيد "Send for Review" وسلوكه بيختلف حسب مرحلة المشروع:
    //    - لو المشروع لسه Pending/Under review: بيبعت المشروع للمراجعين المختارين
    //      وتتغيّر الحالة لـ "Under review".
    //    - لو الستاف خلصوا (Pending Decision): بيسجّل القرار النهائي اللي
    //      الأدمن اختاره، وتتغيّر الحالة لقيمة القرار نفسه (زي "Accepted")
    //      عشان تبقى ظاهرة للطالب.
    if (confirmBtn) {
        confirmBtn.addEventListener("click", function () {
            const phase = getPhase(currentProject ? currentProject.status : "Pending");
            const commentText = newCommentInput ? newCommentInput.value.trim() : "";
            const reviewers = Array.from(reviewersList.querySelectorAll(".reviewer-item span"))
                .map((el) => el.textContent);

            if (phase === "review") {
                if (reviewers.length === 0) {
                    alert("Please add at least one reviewer before sending this project for review.");
                    return;
                }

                if (commentText !== "") {
                    addCommentCard(getCurrentAdminName(), commentText);
                    newCommentInput.value = "";
                }

                if (currentProject) {
                    currentProject.reviewers = reviewers;
                    currentProject.status = "Under review";
                    if (commentText !== "") {
                        currentProject.comments.push({ author: getCurrentAdminName(), text: commentText });
                    }
                }

                renderStatusBadge("Under review");
                updatePhaseUI();
                alert(`This project has been sent to ${reviewers.length} reviewer(s). Its status is now "Under Review."`);
                statusModal.classList.remove("active");
                return;
            }

            // phase === "decision" or "done" — the admin is recording (or updating) the final decision
            const decision = finalDecisionSelect ? finalDecisionSelect.value : "";

            if (!decision) {
                alert("Please select a final decision before sending.");
                return;
            }

            if (commentText !== "") {
                addCommentCard(getCurrentAdminName(), commentText);
                newCommentInput.value = "";
            }

            if (currentProject) {
                currentProject.finalDecision = decision;
                currentProject.reviewers = reviewers;
                currentProject.status = decision;
                if (commentText !== "") {
                    currentProject.comments.push({ author: getCurrentAdminName(), text: commentText });
                }
            }

            renderStatusBadge(decision);
            updatePhaseUI();
            alert(`The final decision ("${decision}") has been sent. The student will now see this decision along with the comments.`);
            statusModal.classList.remove("active");
        });
    }
});
