// ============================================================================
// Admin API client
// ----------------------------------------------------------------------------
// Single place that knows how to talk to the backend for the admin portal:
// where the API lives, how to attach the JWT, and what to do when a request
// fails or the session expires. Every other admin script goes through
// AdminApi.get/post/put/del instead of calling fetch() directly.
//
// If your backend isn't running on http://localhost:5000, change API_BASE_URL
// below — nothing else needs to change.
// ============================================================================

const AdminApi = (function () {
    const API_BASE_URL = "http://localhost:5000/api";
    const TOKEN_KEY = "admin_token";
    const USER_KEY = "admin_user";
    const LOGIN_PATH = "../login/index.html";

    function getToken() {
        return localStorage.getItem(TOKEN_KEY);
    }

    function getUser() {
        try {
            return JSON.parse(localStorage.getItem(USER_KEY));
        } catch (e) {
            return null;
        }
    }

    function setSession(token, user) {
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(user || {}));
    }

    function clearSession() {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    }

    function isLoggedIn() {
        return !!getToken();
    }

    // Call this at the top of every protected admin page. Sends the visitor
    // to the login page if there's no token yet.
    function requireAuth() {
        if (!isLoggedIn()) {
            window.location.href = LOGIN_PATH;
        }
    }

    function logout() {
        clearSession();
        window.location.href = LOGIN_PATH;
    }

    async function request(path, { method = "GET", body, auth = true } = {}) {
        const headers = { "Content-Type": "application/json" };

        if (auth) {
            const token = getToken();
            if (token) headers["Authorization"] = `Bearer ${token}`;
        }

        let response;
        try {
            response = await fetch(`${API_BASE_URL}${path}`, {
                method,
                headers,
                body: body !== undefined ? JSON.stringify(body) : undefined,
            });
        } catch (networkErr) {
            throw new Error("Could not reach the server. Is the backend running?");
        }

        let payload = null;
        try {
            payload = await response.json();
        } catch (e) {
            // No JSON body — leave payload as null.
        }

        if (response.status === 401 && auth) {
            clearSession();
            window.location.href = LOGIN_PATH;
            throw new Error("Session expired. Please log in again.");
        }

        if (!response.ok) {
            const message =
                (payload && payload.error && payload.error.message) ||
                "Something went wrong. Please try again.";
            throw new Error(message);
        }

        return payload ? payload.data : null;
    }

    return {
        API_BASE_URL,
        getToken,
        getUser,
        setSession,
        clearSession,
        isLoggedIn,
        requireAuth,
        logout,

        get: (path) => request(path, { method: "GET" }),
        post: (path, body) => request(path, { method: "POST", body }),
        put: (path, body) => request(path, { method: "PUT", body }),
        del: (path) => request(path, { method: "DELETE" }),

        // Logs an admin in and stores the session. Throws on invalid credentials.
        login: async (username, password) => {
            const data = await request("/auth/admin/login", {
                method: "POST",
                body: { username, password },
                auth: false,
            });
            setSession(data.token, data.admin || { username });
            return data;
        },
    };
})();
