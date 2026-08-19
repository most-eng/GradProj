const DoctorStorage = (function () {
    let registrationStatus = localStorage.getItem("registration_status") || "closed";

    const projects = [
        {
            id: 1,
            teamNumber: 1,
            projectTitleAr: "نظام معالجة المياه الحديثة",
            projectTitleEn: "Modern Water Treatment System",
            teamLeaderNameAr: "مصطفى أحمد محمد علي",
            leaderId: "212000456",
            membersCount: 6,
            status: "Pending",
            academicYear: "2025/2026",
            program: "cs", // Computer Science
            doctorComment: ""
        },
        {
            id: 2,
            teamNumber: 2,
            projectTitleAr: "نظام معالجة البطاطس الدولية",
            projectTitleEn: "International Potato Treatment System",
            teamLeaderNameAr: "مصطفى شوبير سيد مصطفى",
            leaderId: "212000457",
            membersCount: 8,
            status: "Under review",
            academicYear: "2025/2026",
            program: "is", // Information Systems
            doctorComment: "Needs further review on data models."
        },
        {
            id: 3,
            teamNumber: 3,
            projectTitleAr: "نظام معالجة الكلى الذكي",
            projectTitleEn: "Smart Kidney Treatment System",
            teamLeaderNameAr: "محمد أحمد محمود حسن",
            leaderId: "212000458",
            membersCount: 6,
            status: "Accepted",
            academicYear: "2025/2026",
            program: "cs",
            doctorComment: "Excellent idea and implementation!"
        },
        {
            id: 4,
            teamNumber: 4,
            projectTitleAr: "نظام كشف عفن البطاطس",
            projectTitleEn: "Potato Rot Detection System",
            teamLeaderNameAr: "مصطفى شوبير علي خليل",
            leaderId: "212000459",
            membersCount: 6,
            status: "Minor revision",
            academicYear: "2026/2027",
            program: "cs",
            doctorComment: "Please update the system architecture diagram."
        },
        {
            id: 5,
            teamNumber: 5,
            projectTitleAr: "منصة التداول المالي المتقدمة",
            projectTitleEn: "Advanced Financial Trading Platform",
            teamLeaderNameAr: "عبدالرحمن خالد عمر إبراهيم",
            leaderId: "212000460",
            membersCount: 5,
            status: "Rejected",
            academicYear: "2026/2027",
            program: "is",
            doctorComment: "Project scope is out of domain requirements."
        },
        {
            id: 6,
            teamNumber: 6,
            projectTitleAr: "تطبيق التنبؤ بالأحوال الجوية",
            projectTitleEn: "Weather Forecasting Mobile App",
            teamLeaderNameAr: "أحمد محمود فتحي سيد",
            leaderId: "212000461",
            membersCount: 7,
            status: "Pending Decision",
            academicYear: "2025/2026",
            program: "is",
            doctorComment: "Final decision pending dataset confirmation.",
            reviewers: ["Dr. Osama Farouk"],
            comments: [
                { author: "Dr. Osama Farouk", text: "Final decision pending dataset confirmation." }
            ]
        },
        {
            id: 7,
            teamNumber: 7,
            projectTitleAr: "نظام تشخيص الصور الطبية",
            projectTitleEn: "Medical Image Diagnosis System",
            teamLeaderNameAr: "عمر فاروق حسن إسماعيل",
            leaderId: "212000462",
            membersCount: 6,
            status: "Major revision",
            academicYear: "2026/2027",
            program: "cs",
            doctorComment: "Need to replace the classification algorithm."
        },
        {
            id: 8,
            teamNumber: 8,
            projectTitleAr: "منصة إدارة التعلم الإلكتروني",
            projectTitleEn: "E-Learning Management Platform",
            teamLeaderNameAr: "يوسف إبراهيم خليل منصور",
            leaderId: "212000463",
            membersCount: 5,
            status: "Accepted",
            academicYear: "2026/2027",
            program: "is",
            doctorComment: "Great work on UI/UX and database schema."
        },
        {
            id: 9,
            teamNumber: 9,
            projectTitleAr: "نظام تتبع حركة المرور",
            projectTitleEn: "Smart Traffic Monitoring System",
            teamLeaderNameAr: "كريم سامح عادل توفيق",
            leaderId: "212000464",
            membersCount: 6,
            status: "Pending",
            academicYear: "2025/2026",
            program: "cs",
            doctorComment: ""
        },
        {
            id: 10,
            teamNumber: 10,
            projectTitleAr: "تطبيق إدارة الصيدليات الذكية",
            projectTitleEn: "Smart Pharmacy Management App",
            teamLeaderNameAr: "حسام الدين مصطفى كامل",
            leaderId: "212000465",
            membersCount: 4,
            status: "Under review",
            academicYear: "2026/2027",
            program: "is",
            doctorComment: "Under evaluation by the committee."
        }
    ];

    // كل المشاريع لازم يكون عندها reviewers/comments حتى لو مش متسجلين
    // فوق صراحةً، عشان نافذة "Project Status" في صفحة project-details تقدر
    // تتعامل معاهم من غير ما تكسر.
    projects.forEach((project) => {
        if (!Array.isArray(project.reviewers)) project.reviewers = [];
        if (!Array.isArray(project.comments)) project.comments = [];
    });

    return {
        getAllProjects: () => projects,

        getProjectById: (id) => projects.find((p) => p.id === Number(id)),

        // دالة الفلترة الذكية لجلب المشاريع بناءً على السنة والبرنامج والـ status
        filterProjects: (year = "", program = "", status = "") => {
            return projects.filter(project => {
                const matchYear = !year || project.academicYear === year;
                const matchProgram = !program || project.program === program;
                const matchStatus = !status || project.status.toLowerCase() === status.toLowerCase();
                return matchYear && matchProgram && matchStatus;
            });
        },

        // Validation helper for Arabic Quadruple Name
        validateArabicQuadName: (name) => {
            const arabicQuadRegex = /^[\u0621-\u064A]+([\s]+[\u0621-\u064A]+){3}$/;
            return arabicQuadRegex.test(name.trim());
        }
    };
})();