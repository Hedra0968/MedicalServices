// Navbar: transparent at top -> solid color on scroll
const mainNav = document.getElementById("mainNav");

function handleNavScroll() {
  if (window.scrollY > 50) {
    mainNav.classList.add("scrolled");
  } else {
    mainNav.classList.remove("scrolled");
  }
}

if (mainNav) {
  window.addEventListener("scroll", handleNavScroll);
  handleNavScroll(); // check on load too (in case page reloads mid-scroll)
}

// Search Box Toggle (Desktop)
const searchButton = document.getElementById("searchButton");
const searchBox = document.getElementById("searchBox");

if (searchButton && searchBox) {
  searchButton.addEventListener("click", () => {
    searchBox.classList.toggle("show");
  });

  // close search box
  document.addEventListener("click", (e) => {
    const clickedInsideBox = searchBox.contains(e.target);
    const clickedButton = searchButton.contains(e.target);
    if (!clickedInsideBox && !clickedButton) {
      searchBox.classList.remove("show");
    }
  });
}

// Close mobile menu automatically
const navMenu = document.getElementById("navMenu");
if (navMenu) {
  const navLinks = navMenu.querySelectorAll(".nav-link, .login-btn-mobile");
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      const bsCollapse = bootstrap.Collapse.getOrCreateInstance(navMenu);
      bsCollapse.hide();
    });
  });
}

// Site Search
const searchIndex = [
  {
    keywords: ["home", "medstar", "hospital"],
    page: "index.html",
    hash: "home",
    label: "Home",
  },
  {
    keywords: ["about", "who we are", "about us"],
    page: "about.html",
    hash: "",
    label: "About Us",
  },
  {
    keywords: [
      "services",
      "general treatment",
      "dental",
      "teeth",
      "cardiac",
      "heart",
      "ent",
      "ear",
      "eye",
      "vision",
      "blood",
    ],
    page: "services.html",
    hash: "",
    label: "Services",
  },
  {
    keywords: [
      "doctors",
      "doctor",
      "zyad ali",
      "mazen osama",
      "aisha mostafa",
      "surgeon",
      "ophthalmology",
      "dentist",
    ],
    page: "doctors.html",
    hash: "",
    label: "Doctors",
  },
  {
    keywords: ["blogs", "blog", "news", "checkup", "health tips"],
    page: "blogs.html",
    hash: "",
    label: "Blogs",
  },
  {
    keywords: ["contact", "appointment", "book", "booking"],
    page: "contact.html",
    hash: "",
    label: "Contact",
  },
  {
    keywords: ["login", "sign in", "sign up", "register", "account"],
    page: "login.html",
    hash: "",
    label: "Login",
  },
  {
    keywords: ["help", "emergency help", "pharmacy"],
    page: "index.html",
    hash: "help",
    label: "Help",
  },
  {
    keywords: ["price", "pricing", "plastic surgery", "package"],
    page: "index.html",
    hash: "price-list",
    label: "Price List",
  },
  {
    keywords: ["info", "rooms", "patients", "experience"],
    page: "index.html",
    hash: "info",
    label: "Our Numbers",
  },
  {
    keywords: ["call", "hotline", "emergency"],
    page: "index.html",
    hash: "call",
    label: "Emergency Call",
  },
  {
    keywords: ["newsletter", "subscribe"],
    page: "index.html",
    hash: "newsletter",
    label: "Newsletter",
  },
];

function performSearch(query) {
  const q = query.trim().toLowerCase();
  if (!q) return;
  const match = searchIndex.find((item) =>
    item.keywords.some((k) => k.includes(q) || q.includes(k)),
  );
  const currentFile = location.pathname.split("/").pop() || "index.html";
  if (!match) {
    alert(
      `No results found for "${query}". Try: About, Services, Doctors, Blogs, Contact, Price List, Login.`,
    );
    return;
  }
  if (match.page === currentFile) {
    if (match.hash) {
      const el = document.getElementById(match.hash);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  } else {
    window.location.href = match.page + (match.hash ? "#" + match.hash : "");
  }
}

function bindSearchForm(formId, inputId) {
  const form = document.getElementById(formId);
  const input = document.getElementById(inputId);
  if (!form || !input) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    performSearch(input.value);
    input.value = "";
    if (searchBox) searchBox.classList.remove("show");
    if (navMenu) bootstrap.Collapse.getOrCreateInstance(navMenu).hide();
  });
}

bindSearchForm("searchForm", "siteSearch");
bindSearchForm("mobileSearchForm", "mobileSiteSearch");

// Counter Animation (Info numbers)
const counters = document.querySelectorAll(".counter");

function animateCounter(el) {
  const target = +el.getAttribute("data-target");
  const duration = 1500; // ms
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

// Scroll Reveal (used across sections)
// Any element with class="reveal" fades up into view on scroll
const revealEls = document.querySelectorAll(".reveal");

if (revealEls.length) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 },
  );
  revealEls.forEach((el) => revealObserver.observe(el));
}

// Doctors Slider: duplicate cards once for a seamless continuous loop
// (new doctor cards added later are duplicated automatically too)
const doctorsTrack = document.getElementById("doctorsTrack");
if (doctorsTrack) {
  doctorsTrack.innerHTML += doctorsTrack.innerHTML;
}

// Price List "Book Now", Booking form validation/save, and Newsletter forms
// are all handled in booking.js (Firestore) to avoid duplicate global declarations.

// Back To Top
const backToTop = document.getElementById("backToTop");
if (backToTop) {
  window.addEventListener("scroll", () => {
    if (window.scrollY > 400) {
      backToTop.classList.add("show");
    } else {
      backToTop.classList.remove("show");
    }
  });
  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

