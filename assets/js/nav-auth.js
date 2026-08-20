// Navbar auth state: swaps Login button for user name + Logout on every page.
// Depends on firebase-config.js being loaded first.
(function () {
  const loginBtn = document.getElementById("navLoginBtn");
  const userDesktop = document.getElementById("navUserDesktop");
  const userLink = document.getElementById("navUserLink");
  const logoutBtn = document.getElementById("navLogoutBtn");
  const loginMobileWrap = document.getElementById("navLoginMobileWrap");
  const userMobileWrap = document.getElementById("navUserMobileWrap");
  const userLinkMobile = document.getElementById("navUserLinkMobile");
  const logoutBtnMobile = document.getElementById("navLogoutBtnMobile");
  if (!loginBtn) return;
  function renderLoggedIn(name, role) {
    const profilePage =
      role === "doctor" ? "profile-doctor.html" : "profile-patient.html";
    const roleLabel = role === "doctor" ? "Doctor" : "Patient";
    const label = `${name} <span class="role-badge">${roleLabel}</span>`;
    loginBtn.classList.add("d-none");
    userDesktop.classList.remove("d-none");
    userLink.innerHTML = label;
    userLink.setAttribute("href", profilePage);

    loginMobileWrap.classList.add("d-none");
    userMobileWrap.classList.remove("d-none");
    userLinkMobile.innerHTML = label;
    userLinkMobile.setAttribute("href", profilePage);
  }
  function renderLoggedOut() {
    loginBtn.classList.remove("d-none");
    userDesktop.classList.add("d-none");
    loginMobileWrap.classList.remove("d-none");
    userMobileWrap.classList.add("d-none");
  }
  function doLogout() {
    auth.signOut().then(() => {
      window.location.href = "login.html";
    });
  }
  logoutBtn?.addEventListener("click", doLogout);
  logoutBtnMobile?.addEventListener("click", doLogout);
  auth.onAuthStateChanged((user) => {
    if (!user) {
      renderLoggedOut();
      return;
    }
    db.collection("users")
      .doc(user.uid)
      .get()
      .then((doc) => {
        if (doc.exists) {
          const data = doc.data();
          renderLoggedIn(data.name || "User", data.role || "patient");
        } else {
          renderLoggedIn(user.email, "patient");
        }
      })
      .catch(() => renderLoggedIn(user.email, "patient"));
  });
})();