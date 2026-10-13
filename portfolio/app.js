/**
 * AHMED MEDHAT — PORTFOLIO INTERACTIVITY SCRIPT
 */

document.addEventListener("DOMContentLoaded", () => {
  // 1. Architecture Tabs Functionality
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabPanes = document.querySelectorAll(".tab-pane");

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-tab");

      // Deactivate all buttons & panes
      tabButtons.forEach((b) => b.classList.remove("active"));
      tabPanes.forEach((p) => p.classList.remove("active"));

      // Activate clicked button and matching pane
      btn.classList.add("active");
      const targetPane = document.getElementById(targetId);
      if (targetPane) {
        targetPane.classList.add("active");
      }
    });
  });

  // 2. Back to Top Button
  const backToTopBtn = document.getElementById("backToTop");
  if (backToTopBtn) {
    backToTopBtn.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  }

  // 3. Navbar scroll effect
  const navbar = document.querySelector(".navbar");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      navbar.style.boxShadow = "0 14px 34px rgba(0, 0, 0, 0.75)";
      navbar.style.borderColor = "rgba(245, 158, 11, 0.25)";
    } else {
      navbar.style.boxShadow = "var(--shadow-md)";
      navbar.style.borderColor = "var(--border-subtle)";
    }
  });

  // 4. Smooth Anchor Scrolling
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  });

  console.log("⚡ Ahmed Medhat Portfolio Initialized Successfully!");
});
