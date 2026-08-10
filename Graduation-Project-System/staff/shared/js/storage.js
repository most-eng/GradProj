/* ==========================================================================
   STAFF STORAGE MANAGEMENT (storage.js)
   ========================================================================== */

const STORAGE_KEY = "graduation_projects_db";

// البيانات المبدئية (مشروع واحد)
const defaultProjects = [
    {
        id: "1",
        title: "Potato Rot Processing System",
        leader: "Hamza Abdelkarim",
        program: "Computer Science",
        department: "Computer Science",
        date: "25/7/2026",
        status: "Pending Review",
        reviewers: ["Dr. Mostafa Shobeir"],
        academicYear: "2025/2026",
        leaderContact: { phone: "+20 100200300", role: "Backend Developer", studentId: "232000456" },
        teamMembers: [
            { name: "Hamza Abdelkarim", phone: "+20 100200300", role: "Backend Developer", studentId: "232000456" },
            { name: "Ahmed Ali", phone: "+20 100200300", role: "Frontend Developer", studentId: "232000457" },
            { name: "Omar Hassan", phone: "+20 100200300", role: "UI/UX Designer", studentId: "232000458" }
        ],
        problemStatement: "Early detection of potato rot disease using computer vision models to reduce crop loss.",
        projectIdea: "An automated web and mobile application integrating deep learning models to classify potato health status from uploaded leaf images.",
        problemObjectives: [
            "Providing continuous monitoring of potato quality.",
            "Providing instant alerts when rot is detected.",
            "Reducing manual inspection time and crop losses."
        ],
        expectedContribution: "Contributing to reduced crop loss, improved yield quality, and lower reliance on manual, time-consuming inspection methods.",
        comments: [],
        reviewDecision: null
    }
];

// تهيئة الداتا في الـ LocalStorage لو مش موجودة
function initStorage() {
    if (!localStorage.getItem(STORAGE_KEY)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultProjects));
    }
}

initStorage();

// ترقية أي بيانات قديمة محفوظة في المتصفح لنفس الشكل الجديد (department, teamMembers as objects...)
function migrateStorage() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    let projects;
    try {
        projects = JSON.parse(raw);
    } catch (e) {
        return;
    }

    let changed = false;

    projects.forEach(project => {
        if (project.department === undefined) {
            project.department = project.program || "Computer Science";
            changed = true;
        }

        if (Array.isArray(project.teamMembers) && project.teamMembers.length > 0 && typeof project.teamMembers[0] === "string") {
            project.teamMembers = project.teamMembers.map(name => ({
                name: name,
                phone: "—",
                role: "—",
                studentId: "—"
            }));
            changed = true;
        }

        if (project.leaderContact === undefined) {
            project.leaderContact = { phone: "—", role: "—", studentId: "—" };
            changed = true;
        }

        if (project.problemObjectives === undefined) {
            const fallback = defaultProjects.find(p => p.id === project.id);
            project.problemObjectives = (fallback && fallback.problemObjectives) || [];
            changed = true;
        }

        if (project.expectedContribution === undefined) {
            const fallback = defaultProjects.find(p => p.id === project.id);
            project.expectedContribution = (fallback && fallback.expectedContribution) || "";
            changed = true;
        }
    });

    if (changed) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    }
}

migrateStorage();

// الكائن الرئيسي للتعامل مع البيانات
const StaffStorage = {
    // جلب جميع المشاريع
    getAllProjects: function () {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : defaultProjects;
    },

    // جلب مشروع محدد برقم الـ ID
    getProjectById: function (id) {
        const projects = this.getAllProjects();
        return projects.find(p => p.id === String(id));
    },

    // تحديث قرار الدكتور والملاحظات للمشروع
    submitReview: function (projectId, statusDecision, doctorComment, reviewerName) {
        const projects = this.getAllProjects();
        const index = projects.findIndex(p => p.id === String(projectId));

        if (index !== -1) {
            projects[index].status = statusDecision;
            projects[index].reviewDecision = statusDecision;
            
            if (!projects[index].comments) {
                projects[index].comments = [];
            }

            if (doctorComment && doctorComment.trim() !== "") {
                projects[index].comments.push({
                    author: reviewerName,
                    text: doctorComment,
                    date: new Date().toLocaleDateString("en-GB")
                });
            }

            localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
            return true;
        }
        return false;
    }
};