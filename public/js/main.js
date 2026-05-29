document.addEventListener("DOMContentLoaded", () => {
  const mobileMenuButton = document.getElementById("mobile-menu-button");
  const mobileMenu = document.getElementById("mobile-menu");

  if (!mobileMenuButton || !mobileMenu) {
    return;
  }

  function openMenu() {
    mobileMenu.classList.remove("hidden");
    mobileMenuButton.setAttribute("aria-expanded", "true");
    mobileMenuButton.textContent = "✕";
  }

  function closeMenu() {
    mobileMenu.classList.add("hidden");
    mobileMenuButton.setAttribute("aria-expanded", "false");
    mobileMenuButton.textContent = "☰";
  }

  function toggleMenu(event) {
    event.preventDefault();
    event.stopPropagation();

    if (mobileMenu.classList.contains("hidden")) {
      openMenu();
    } else {
      closeMenu();
    }
  }

  mobileMenuButton.addEventListener("click", toggleMenu);

  mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("click", (event) => {
    const clickedInsideMenu = mobileMenu.contains(event.target);
    const clickedButton = mobileMenuButton.contains(event.target);

    if (!clickedInsideMenu && !clickedButton) {
      closeMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 768) {
      closeMenu();
    }
  });
});