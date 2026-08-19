document.addEventListener("DOMContentLoaded", function () {
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get("id");

    // عناصر الصفحة
    const statusModal = document.getElementById("statusModal");
    const openModalBtn = document.getElementById("changeStatusBtn");
    const closeModalBtn = document.getElementById("closeModalBtn");

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

    let currentProject = null;
    // Reviewers picked in the UI before the project has ever been sent for
    // review (status still "Pending"). Once sent, the backend locks
    // reviewers permanently — the real, persisted list from the API takes
    // over and this local list is no longer used.
    let pendingReviewerPicks = [];

    if (!projectId) {
        alert("No project selected.");
        window.location.href = "../projects/index.html";
        return;
    }

    // ── تحميل بيانات المشروع الحقيقية من /api/projects/:id ──
    async function loadProject() {
        try {
            currentProject = await AdminApi.get(`/projects/${projectId}`);
            pendingReviewerPicks = [];
            renderProjectInfo();
            renderModalState();
        } catch (err) {
            alert(err.message || "Could not load this project.");
        }
    }

    function renderProjectInfo() {
        document.getElementById("teamDepartment").textContent = currentProject.department || "—";
        document.getElementById("teamProgram").textContent = currentProject.program_name || "—";
        document.getElementById("teamAcademicYear").textContent = currentProject.academic_year || "—";
        document.getElementById("teamRegulation").textContent = currentProject.regulation || "—";

        document.getElementById("projectTitleAr").textContent = currentProject.title_ar || "—";
        document.getElementById("projectTitleEn").textContent = currentProject.title_en ? `(${currentProject.title_en})` : "";
        document.getElementById("projectIdea").textContent = currentProject.idea || "—";
        document.getElementById("projectProblem").textContent = currentProject.problem_definition || "—";
        document.getElementById("projectObjectives").textContent = currentProject.objectives || "—";
        document.getElementById("projectContribution").textContent = currentProject.expected_contribution || "—";

        const members = currentProject.members || [];
        const leader = members.find((m) => m.is_leader);
        const others = members.filter((m) => !m.is_leader);

        const leaderBody = document.getElementById("leaderTableBody");
        leaderBody.innerHTML = leader
            ? `<tr>
                <td class="arabic-name">${leader.member_name}</td>
                <td>${leader.member_phone || "—"}</td>
                <td>${leader.track_or_role || "—"}</td>
                <td>${leader.student_code || "—"}</td>
               </tr>`
            : `<tr><td colspan="4" style="text-align:center; color:#94A3B8;">No leader recorded.</td></tr>`;

        const membersBody = document.getElementById("membersTableBody");
        membersBody.innerHTML = others.length
            ? others.map((m) => `
                <tr>
                    <td class="arabic-name">${m.member_name}</td>
                    <td>${m.member_phone || "—"}</td>
                    <td>${m.track_or_role || "—"}</td>
                    <td>${m.student_code || "—"}</td>
                </tr>`).join("")
            : `<tr><td colspan="4" style="text-align:center; color:#94A3B8;">No other members recorded.</td></tr>`;
    }

    // ── مراحل سير العمل، مطابقة لقيود الباك إند الحقيقية ──
    //   "pending"       → لسه الأدمن معينش المراجعين
    //   "underReview"   → اتبعت للمراجعين، الباك إند بيمنع تغييرهم دلوقتي
    //   "underDecision" → الستاف خلصوا، دور الأدمن ياخد القرار النهائي
    //   "done"          → القرار النهائي اتبعت للطالب بالفعل
    function getPhase(status) {
        if (status === "Pending") return "pending";
        if (status === "UnderReview") return "underReview";
        if (status === "UnderDecision") return "underDecision";
        return "done";
    }

    function formatStatusLabel(status) {
        const map = {
            Pending: "Pending",
            UnderReview: "Under Review",
            UnderDecision: "Pending Decision",
            Accepted: "Accepted",
            Rejected: "Rejected",
            MinorRevision: "Minor Revision",
            MajorRevision: "Major Revision",
        };
        return map[status] || status || "Pending";
    }

    function renderStatusBadge(status) {
        projectStatusText.textContent = formatStatusLabel(status);
        projectStatusBadge.classList.remove("status-under-review", "status-under-decision");
        if (status === "UnderReview") projectStatusBadge.classList.add("status-under-review");
        if (status === "UnderDecision") projectStatusBadge.classList.add("status-under-decision");
    }

    function renderReviewersList() {
        reviewersList.innerHTML = "";
        const phase = getPhase(currentProject.status);

        if (phase === "pending") {
            pendingReviewerPicks.forEach((r) => {
                const row = document.createElement("div");
                row.className = "reviewer-item";
                row.innerHTML = `
                    <button type="button" class="btn-delete-reviewer" title="Remove reviewer">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                    <span>${r.full_name}</span>
                `;
                row.querySelector(".btn-delete-reviewer").addEventListener("click", () => {
                    pendingReviewerPicks = pendingReviewerPicks.filter((p) => p.id !== r.id);
                    renderReviewersList();
                });
                reviewersList.appendChild(row);
            });
            return;
        }

        // Once sent, reviewers are locked by the backend — read-only from here on.
        (currentProject.reviewers || []).forEach((r) => {
            const row = document.createElement("div");
            row.className = "reviewer-item";
            row.innerHTML = `
                <i class="fa-solid fa-user-check" style="color:#16A34A;"></i>
                <span>${r.full_name}</span>
            `;
            reviewersList.appendChild(row);
        });
    }

    function addCommentCardDOM(author, text) {
        const card = document.createElement("div");
        card.className = "comment-card";
        card.innerHTML = `
            <div class="comment-header">
                <span class="comment-author">${author}</span>
            </div>
            <div class="comment-text">${text}</div>
        `;
        commentsList.appendChild(card);
    }

    function renderCommentsList() {
        commentsList.innerHTML = "";
        let count = 0;

        (currentProject.reviews || []).forEach((r) => {
            if (!r.comments) return;
            addCommentCardDOM(r.staff_name, r.comments);
            count++;
        });

        if (currentProject.finalDecision && currentProject.finalDecision.admin_comments) {
            addCommentCardDOM("Admin (Final Decision)", currentProject.finalDecision.admin_comments);
            count++;
        }

        commentsCount.textContent = `(${count})`;
    }

    function renderModalState() {
        const status = currentProject.status;
        const phase = getPhase(status);

        renderStatusBadge(status);
        renderReviewersList();
        renderCommentsList();

        finalDecisionRow.classList.toggle("hidden", phase === "pending" || phase === "underReview");
        addReviewerBtn.style.display = phase === "pending" ? "" : "none";
        newCommentInput.value = "";

        if (phase === "pending") {
            modalPhaseHint.textContent = 'Add reviewers below, then click "Send for Review" to send this project to staff.';
            confirmBtn.textContent = "Send for Review";
            confirmBtn.style.display = "";
        } else if (phase === "underReview") {
            modalPhaseHint.textContent = "This project is currently under review by staff. Reviewers can't be changed once sent.";
            confirmBtn.style.display = "none";
        } else if (phase === "underDecision") {
            modalPhaseHint.textContent = 'Staff have finished reviewing this project. Select a final decision below, then click "Send for Review" to notify the student.';
            confirmBtn.textContent = "Send for Review";
            confirmBtn.style.display = "";
            finalDecisionSelect.value = (currentProject.finalDecision && currentProject.finalDecision.admin_decision) || "";
        } else {
            modalPhaseHint.textContent = `This project's final decision ("${formatStatusLabel(status)}") has already been sent to the student.`;
            confirmBtn.style.display = "none";
            finalDecisionSelect.value = (currentProject.finalDecision && currentProject.finalDecision.admin_decision) || status;
        }
    }

    // ── فتح/قفل المودالز ──
    if (openModalBtn) openModalBtn.addEventListener("click", () => statusModal.classList.add("active"));
    if (closeModalBtn) closeModalBtn.addEventListener("click", () => statusModal.classList.remove("active"));
    if (addReviewerBtn) {
        addReviewerBtn.addEventListener("click", function () {
            renderDoctorsPicker();
            reviewerPickerModal.classList.add("active");
        });
    }
    if (closePickerBtn) closePickerBtn.addEventListener("click", () => reviewerPickerModal.classList.remove("active"));

    window.addEventListener("click", function (e) {
        if (e.target === statusModal) statusModal.classList.remove("active");
        if (e.target === reviewerPickerModal) reviewerPickerModal.classList.remove("active");
    });

    // ── قائمة الدكاترة من StaffStorage (الـ API الحقيقي) ──
    async function renderDoctorsPicker() {
        if (!doctorsPickerList) return;
        doctorsPickerList.innerHTML = `<p class="doctors-picker-empty">Loading staff members...</p>`;

        let doctors = [];
        try {
            doctors = (typeof StaffStorage !== "undefined") ? await StaffStorage.getAll() : [];
        } catch (err) {
            doctorsPickerList.innerHTML = `<p class="doctors-picker-empty">Could not load staff members: ${err.message}</p>`;
            return;
        }

        doctorsPickerList.innerHTML = "";

        const availableDoctors = doctors.filter(
            (doc) => !pendingReviewerPicks.some((p) => p.id === doc.id)
        );

        if (availableDoctors.length === 0) {
            doctorsPickerList.innerHTML = `<p class="doctors-picker-empty">No more registered staff members to add. Add one from the Staff and Programs page.</p>`;
            return;
        }

        availableDoctors.forEach((doc) => {
            const item = document.createElement("div");
            item.className = "doctor-pick-item";

            item.innerHTML = `
                <span><i class="fa-solid fa-user-doctor"></i> ${doc.full_name}</span>
                <i class="fa-solid fa-plus-circle"></i>
            `;

            item.addEventListener("click", function () {
                pendingReviewerPicks.push({ id: doc.id, full_name: doc.full_name });
                renderReviewersList();
                reviewerPickerModal.classList.remove("active");
            });

            doctorsPickerList.appendChild(item);
        });
    }

    // ── "Send for Review" — سلوكها بيختلف حسب مرحلة المشروع ──
    if (confirmBtn) {
        confirmBtn.addEventListener("click", async function () {
            const phase = getPhase(currentProject.status);
            const commentText = newCommentInput.value.trim();

            if (phase === "pending") {
                if (pendingReviewerPicks.length === 0) {
                    alert("Please add at least one reviewer before sending this project for review.");
                    return;
                }

                confirmBtn.disabled = true;
                try {
                    await AdminApi.post("/assignments", {
                        projectId: currentProject.id,
                        staffIds: pendingReviewerPicks.map((r) => r.id),
                    });
                    const sentCount = pendingReviewerPicks.length;
                    await loadProject();
                    alert(`This project has been sent to ${sentCount} reviewer(s). Its status is now "Under Review."`);
                    statusModal.classList.remove("active");
                } catch (err) {
                    alert(err.message || "Could not send this project for review.");
                } finally {
                    confirmBtn.disabled = false;
                }
                return;
            }

            if (phase === "underDecision" || phase === "done") {
                const decision = finalDecisionSelect.value;

                if (!decision) {
                    alert("Please select a final decision before sending.");
                    return;
                }

                if (decision !== "Accepted" && !commentText) {
                    alert("Comments are required unless the decision is Accepted.");
                    return;
                }

                confirmBtn.disabled = true;
                try {
                    await AdminApi.post("/reviews/final", {
                        projectId: currentProject.id,
                        decision,
                        comments: commentText || undefined,
                    });
                    await loadProject();
                    alert(`The final decision ("${formatStatusLabel(decision)}") has been sent. The student will now see this decision along with the comments.`);
                    statusModal.classList.remove("active");
                } catch (err) {
                    alert(err.message || "Could not submit the final decision.");
                } finally {
                    confirmBtn.disabled = false;
                }
            }
        });
    }

    loadProject();
});
