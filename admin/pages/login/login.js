document.addEventListener("DOMContentLoaded", function () {
    if (AdminApi.isLoggedIn()) {
        window.location.href = "../dashboard/index.html";
        return;
    }

    const form = document.getElementById("loginForm");
    const errorBox = document.getElementById("loginError");
    const loginBtn = document.getElementById("loginBtn");
    const passwordInput = document.getElementById("password");
    const toggleBtn = document.getElementById("togglePassword");

    toggleBtn.addEventListener("click", function () {
        const showing = passwordInput.type === "password";
        passwordInput.type = showing ? "text" : "password";
        const icon = toggleBtn.querySelector("i");
        icon.classList.toggle("fa-eye", !showing);
        icon.classList.toggle("fa-eye-slash", showing);
    });

    function showError(message) {
        errorBox.textContent = message;
        errorBox.classList.add("active");
    }

    function hideError() {
        errorBox.classList.remove("active");
    }

    form.addEventListener("submit", async function (e) {
        e.preventDefault();
        hideError();

        const username = document.getElementById("username").value.trim();
        const password = passwordInput.value.trim();

        if (!username || !password) {
            showError("Please enter both username and password.");
            return;
        }

        loginBtn.disabled = true;
        loginBtn.textContent = "Signing in...";

        try {
            await AdminApi.login(username, password);
            window.location.href = "../dashboard/index.html";
        } catch (err) {
            showError(err.message || "Invalid username or password.");
            loginBtn.disabled = false;
            loginBtn.textContent = "Sign In";
        }
    });
});
