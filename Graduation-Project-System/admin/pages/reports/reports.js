// ============================================================================
// Reports page
// ----------------------------------------------------------------------------
// The Excel and PDF files are now generated entirely by the backend (see
// reports-api.md — GET /api/reports/export/excel and .../export/pdf), using
// a specific structure defined server-side. This page's only job is to call
// those endpoints with the selected filters and hand the browser the file
// they stream back — no client-side spreadsheet/PDF generation anymore.
// ============================================================================

const REPORTS_API_BASE_URL = "http://localhost:5000/api";

document.addEventListener("DOMContentLoaded", function () {
    // فلتر البرنامج بيتملى ببرامج قسم الأدمن الحالي بس
    if (typeof populateProgramFilter === "function") {
        populateProgramFilter(document.getElementById("programFilter"));
    }

    const excelBtn = document.getElementById("btnGenerateExcel");
    const pdfBtn = document.getElementById("btnGeneratePdf");

    if (excelBtn) {
        excelBtn.addEventListener("click", () => downloadReport("excel"));
    } else {
        console.error("Excel button with ID 'btnGenerateExcel' was not found!");
    }

    if (pdfBtn) {
        pdfBtn.addEventListener("click", () => downloadReport("pdf"));
    } else {
        console.error("PDF button with ID 'btnGeneratePdf' was not found!");
    }
});

// Reads the signed-in admin's JWT. Uses the same localStorage key the
// AdminApi login client uses, so this "just works" once login is wired
// back in — no changes needed here when that happens.
function getAdminToken() {
    return localStorage.getItem("admin_token");
}

// Builds the query string for /api/reports/export/excel|pdf from whatever
// filters are currently selected on this page.
//
// NOTE — Program filter isn't sent yet: the dropdown here is populated
// from this app's local per-department program list (department-config.js),
// which doesn't carry the real numeric `programs.id` the backend's
// `program` query param expects. Once the programs list comes from the
// real GET /api/programs endpoint instead of the local mock, pass its
// numeric id through here as `params.set("program", id)`.
function buildReportQuery() {
    const params = new URLSearchParams();

    const academicYear = document.getElementById("academicYearFilter")?.value || "";
    if (academicYear) {
        // The UI shows "2026/2027"; the backend stores it with a hyphen
        // ("2026-2027") — see reports-api.md.
        params.set("academicYear", academicYear.replace("/", "-"));
    }

    return params.toString();
}

// Calls GET /api/reports/export/:type, streams the response into a Blob,
// and triggers a normal browser download — same as clicking a direct link
// to the file, just with the Authorization header the endpoint requires.
async function downloadReport(type) {
    const token = getAdminToken();

    if (!token) {
        alert("You need to be signed in as an admin to generate reports.");
        return;
    }

    const btnId = type === "excel" ? "btnGenerateExcel" : "btnGeneratePdf";
    const btn = document.getElementById(btnId);
    const originalHtml = btn ? btn.innerHTML : "";

    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> <span>Generating...</span>`;
    }

    try {
        const query = buildReportQuery();
        const url = `${REPORTS_API_BASE_URL}/reports/export/${type}${query ? "?" + query : ""}`;

        const response = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) {
            let message = `Could not generate the report (HTTP ${response.status}).`;
            try {
                const errorBody = await response.json();
                if (errorBody && errorBody.error && errorBody.error.message) {
                    message = errorBody.error.message;
                }
            } catch (e) {
                // Response wasn't JSON — keep the generic message above.
            }
            throw new Error(message);
        }

        const blob = await response.blob();

        // Prefer the filename the backend sends; fall back to a sensible default.
        const disposition = response.headers.get("Content-Disposition") || "";
        const filenameMatch = disposition.match(/filename="?([^"]+)"?/);
        const filename = filenameMatch
            ? filenameMatch[1]
            : (type === "excel" ? "projects_report.xlsx" : "projects_report.pdf");

        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
        console.error(`${type} report download failed:`, err);
        alert(err.message || "Could not reach the server. Is the backend running?");
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = originalHtml;
        }
    }
}
