document.addEventListener("DOMContentLoaded", function () {
    // 1️⃣ استدعاء الأزرار بناءً على الـ IDs الصحيحة الموجودة في الـ HTML
    const excelBtn = document.getElementById("btnGenerateExcel");
    const pdfBtn = document.getElementById("btnGeneratePdf");

    if (excelBtn) {
        excelBtn.addEventListener("click", generateExcelReport);
    } else {
        console.error("Excel button with ID 'btnGenerateExcel' was not found!");
    }

    if (pdfBtn) {
        pdfBtn.addEventListener("click", generatePdfReport);
    } else {
        console.error("PDF button with ID 'btnGeneratePdf' was not found!");
    }
});

// 2️⃣ دالة جلب المشاريع المفلترة بناءً على الـ IDs الصحيحة في الـ HTML
function getFilteredProjects() {
    // جلب قيم الفلاتر كما هي مسمية في الـ HTML
    const yearFilter = document.getElementById("academicYearFilter")?.value || "";
    const programFilter = document.getElementById("programFilter")?.value || "";

    let projects = [];

    // جلب البيانات من الـ Storage لو متوفرة
    if (typeof DoctorStorage !== "undefined" && typeof DoctorStorage.getAllProjects === "function") {
        projects = DoctorStorage.getAllProjects() || [];
    } else {
        // بيانات تجريبية خفيفة في حالة لو الـ Storage فاضي أو مش متحمل
        projects = [
            { teamNumber: 1, projectTitle: "Smart Crop System", teamLeader: { name: "Ahmed Hassan" }, department: "cs", academicYear: "2025/2026", status: "Approved" },
            { teamNumber: 2, projectTitle: "Hospital Management", teamLeader: { name: "Sara Mohamed" }, department: "is", academicYear: "2025/2026", status: "Pending" }
        ];
    }

    // تصفية المشاريع حسب الاختيارات
    return projects.filter(p => {
        const matchYear = !yearFilter || p.academicYear === yearFilter;
        const matchProgram = !programFilter || 
                             (p.department && p.department.toLowerCase() === programFilter.toLowerCase()) || 
                             (p.program && p.program.toLowerCase() === programFilter.toLowerCase());
        
        return matchYear && matchProgram;
    });
}

// 3️⃣ توليد تقرير الـ EXCEL
function generateExcelReport() {
    try {
        if (typeof XLSX === "undefined") {
            alert("SheetJS library is not loaded properly!");
            return;
        }

        const projects = getFilteredProjects();

        if (projects.length === 0) {
            alert("No projects found matching the selected filters!");
            return;
        }

        const data = projects.map(p => ({
            "Team #": p.teamNumber || "-",
            "Project Title": p.projectTitle || p.projectTitleEn || "-",
            "Leader Name": p.teamLeader?.name || p.teamLeaderNameAr || "-",
            "Program / Dept": (p.department || p.program || "-").toUpperCase(),
            "Academic Year": p.academicYear || "-",
            "Status": p.status || "Pending"
        }));

        const workbook = XLSX.utils.book_new();
        const sheet = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(workbook, sheet, "Projects Report");
        
        XLSX.writeFile(workbook, `Graduation_Projects_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (err) {
        console.error("Excel Generation Error:", err);
        alert("Error exporting Excel: " + err.message);
    }
}

// 4️⃣ توليد تقرير الـ PDF
function generatePdfReport() {
    try {
        if (!window.jspdf || !window.jspdf.jsPDF) {
            alert("jsPDF library is not loaded properly!");
            return;
        }

        const projects = getFilteredProjects();

        if (projects.length === 0) {
            alert("No projects found matching the selected filters!");
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // ترويسة الملف
        doc.setFontSize(16);
        doc.text("Graduation Projects Summary Report", 14, 15);
        
        doc.setFontSize(10);
        doc.text(`Generated Date: ${new Date().toLocaleDateString("en-US")}`, 14, 22);

        const tableHeaders = [["Team #", "Project Title", "Leader Name", "Program", "Year"]];
        const tableRows = projects.map(p => [
            p.teamNumber ? `Team ${p.teamNumber}` : "-",
            p.projectTitle || p.projectTitleEn || "-",
            p.teamLeader?.name || p.teamLeaderNameAr || "-",
            (p.department || p.program || "-").toUpperCase(),
            p.academicYear || "-"
        ]);

        if (typeof doc.autoTable === "function") {
            doc.autoTable({
                head: tableHeaders,
                body: tableRows,
                startY: 28,
                theme: 'striped',
                headStyles: { fillColor: [37, 99, 235] },
                styles: { fontSize: 9, cellPadding: 3 }
            });
        } else {
            let y = 35;
            projects.forEach((p, i) => {
                doc.setFontSize(10);
                doc.text(`${i + 1}. ${p.projectTitle} - Leader: ${p.teamLeader?.name || 'N/A'}`, 14, y);
                y += 8;
            });
        }

        doc.save(`Graduation_Projects_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
        console.error("PDF Generation Error:", err);
        alert("Error exporting PDF: " + err.message);
    }
}