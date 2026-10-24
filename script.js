
const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".navigation");

if (menuToggle && navigation) {
  menuToggle.addEventListener("click", () => {
    const isOpen = navigation.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navigation.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navigation.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

// Automatically update the copyright year.
const year = document.querySelector("#year");

if (year) {
  year.textContent = new Date().getFullYear();
}

// Subtle mouse-following dot for desktop users.
const mouseDot = document.querySelector(".mouse-dot");

if (mouseDot && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
  window.addEventListener("mousemove", (event) => {
    mouseDot.style.left = `${event.clientX}px`;
    mouseDot.style.top = `${event.clientY}px`;
    mouseDot.style.opacity = "0.7";
  });

  document.addEventListener("mouseleave", () => {
    mouseDot.style.opacity = "0";
  });
}

// Reveal selected sections as they enter the viewport.
const revealElements = document.querySelectorAll(
  ".section-heading, .about-content, .skill-card, .project-card, .approach-grid > div"
);

if ("IntersectionObserver" in window) {
  revealElements.forEach((element) => element.classList.add("reveal"));

  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          currentObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  revealElements.forEach((element) => observer.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("visible"));
}
