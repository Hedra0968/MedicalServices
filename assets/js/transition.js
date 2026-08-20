// Lightweight page loader (first paint) + fade transition between internal pages.
(function () {
  const loader = document.getElementById("pageLoader");
  function hideLoader() {
    if (!loader) return;
    loader.classList.add("loaded");
  }
  if (document.readyState === "complete") {
    hideLoader();
  } else {
    window.addEventListener("load", hideLoader);
  }
  // Safety net in case "load" is delayed by slow assets.
  setTimeout(hideLoader, 500);
  // إخفاء اللودر وإزالة كلاس الـ fade-out عند الرجوع بالمتصفح (bfcache)
  window.addEventListener("pageshow", function (event) {
    document.body.classList.remove("page-fade-out");
    hideLoader();
  });
  document.addEventListener("click", (e) => {
    const link = e.target.closest("a[href]");
    if (!link) return;
    const href = link.getAttribute("href");
    if (
      !href ||
      href.startsWith("#") ||
      href.startsWith("http") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:") ||
      link.target === "_blank" ||
      !href.includes(".html")
    ) {
      return;
    }
    e.preventDefault();
    document.body.classList.add("page-fade-out");
    setTimeout(() => {
      window.location.href = href;
    }, 160);
  });
})();