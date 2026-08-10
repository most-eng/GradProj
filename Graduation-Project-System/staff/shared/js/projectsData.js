/* ==========================================================================
   SHARED PROJECTS DATABASE (IN-MEMORY)
   ========================================================================== */

// مصفوفة المشاريع المشتركة بين الأدمن والستاف
window.RegisteredProjectsDB = [
    {
        id: "1",
        title: "Potato Rot Processing System",
        leader: "Hamza Abdelkarim",
        program: "Computer Science",
        date: "25/7/2026",
        status: "Pending Review",
        reviewers: ["Dr. Mostafa Shobeir"],
        academicYear: "2025/2026",
        teamMembers: ["Hamza Abdelkarim", "Ahmed Ali", "Omar Hassan"],
        problemStatement: "Early detection of potato rot disease using computer vision models to reduce crop loss.",
        projectIdea: "An automated web and mobile application integrating deep learning models to classify potato health status from uploaded leaf images.",
        comments: []
    }
];

// دالة جلب المشروع حسب الـ ID
function getProjectById(id) {
    return window.RegisteredProjectsDB.find(p => String(p.id) === String(id));
}

// دالة تحديث مراجعة الدكتور
function submitProjectReview(projectId, status, comment, reviewerName) {
    const project = getProjectById(projectId);
    if (project) {
        project.status = status;
        if (comment) {
            project.comments.push({
                author: reviewerName,
                text: comment,
                date: new Date().toLocaleDateString('en-GB')
            });
        }
        return true;
    }
    return false;
}