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

window.addEventListener("load", function () {
  const loader = document.getElementById("pageLoader");
  if (loader) {
    loader.classList.add("hidden"); // loader.style.display = 'none';
  }
});

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
// "page" values are written relative to the PROJECT ROOT (where index.html
// and the "html" folder both live). ROOT_PREFIX is worked out automatically
// below from the src="" this very script was loaded with, so it resolves
// correctly whether the current page is one level deep (html/about.html)
// or two levels deep (html/services-details/xyz.html).
function getRootPrefix() {
  const src = document.currentScript ? document.currentScript.getAttribute("src") || "" : "";
  const marker = "assets/js/";
  const idx = src.indexOf(marker);
  return idx >= 0 ? src.slice(0, idx) : "";
}

const ROOT_PREFIX = getRootPrefix();

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
  if (!match) {
    alert(
      `No results found for "${query}". Try: About, Services, Doctors, Blogs, Contact, Price List, Login.`,
    );
    return;
  }
  const currentFileName = location.pathname.split("/").pop() || "index.html";
  const targetFileName = match.page.split("/").pop();
  if (targetFileName === currentFileName) {
    if (match.hash) {
      const el = document.getElementById(match.hash);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  } else {
    window.location.href =
      ROOT_PREFIX + match.page + (match.hash ? "#" + match.hash : "");
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

// Scroll Reveal
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

// Footer Newsletter Handling (Works on all pages)
document.addEventListener("DOMContentLoaded", () => {
  const newsletterForm = document.getElementById("footerNewsletterForm");
  const newsletterEmail = document.getElementById("footerNewsletterEmail");
  const newsletterMsg = document.getElementById("footerNewsletterMsg");

  if (!newsletterForm) return;

  newsletterForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = newsletterEmail ? newsletterEmail.value.trim() : "";
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !emailPattern.test(email)) {
      if (newsletterMsg) {
        newsletterMsg.textContent = "Invalid email.";
        newsletterMsg.className = "form-msg error";
      }
      return;
    }

    // Success state
    if (newsletterMsg) {
      newsletterMsg.textContent = "Thank you for subscribing!";
      newsletterMsg.className = "form-msg success";
    }

    newsletterForm.reset();
  });
});

// PWA: register service worker (path resolved via ROOT_PREFIX above)
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register(ROOT_PREFIX + "sw.js").catch(() => {});
}