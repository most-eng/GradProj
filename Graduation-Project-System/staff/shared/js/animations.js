document.addEventListener("DOMContentLoaded", function () {
    const animatedElements = document.querySelectorAll(".animate-fade-up");
    animatedElements.forEach((el, index) => {
        el.style.animationDelay = (index * 0.08) + "s";
        el.classList.add("fade-up-active");
    });
});
