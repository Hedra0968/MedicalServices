window.addEventListener("pageshow", function (event) {
  if (event.persisted) {
    const loader = document.getElementById("pageLoader");
    if (loader) {
      loader.style.display = "none";
      loader.style.opacity = "0";
    }
    document.body.style.opacity = "1";
    document.body.style.visibility = "visible";
  }
});