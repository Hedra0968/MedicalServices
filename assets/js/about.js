document.addEventListener("DOMContentLoaded", () => {
  const counters = document.querySelectorAll(".counter");
  function animateCounter(el) {
    const target = +el.getAttribute("data-target");
    const duration = 1500;
    const startTime = performance.now();
    function update(currentTime) {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      el.textContent = Math.floor(progress * target);
      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target;
      }
    }
    requestAnimationFrame(update);
  }

  if (counters.length) {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 },
    );
    counters.forEach((el) => counterObserver.observe(el));
  }

  const helpBoxes = document.querySelectorAll(".help-box");
  helpBoxes.forEach((box) => {
    box.addEventListener("click", () => {
      const desc = box.querySelector(".help-desc");
      if (desc) {
        desc.classList.toggle("active");
      }
    });
  });
});