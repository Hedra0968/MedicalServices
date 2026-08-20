// Tabs Toggle (Sign In / Sign Up)
const tabSignIn = document.getElementById("tabSignIn");
const tabSignUp = document.getElementById("tabSignUp");
const indicator = document.getElementById("authTabIndicator");
const signInForm = document.getElementById("signInForm");
const signUpForm = document.getElementById("signUpForm");
const authMsg = document.getElementById("authMsg");

function showSignIn() {
  tabSignIn.classList.add("active");
  tabSignUp.classList.remove("active");
  indicator.classList.remove("move-right");
  signInForm.classList.remove("d-none");
  signUpForm.classList.add("d-none");
  authMsg.textContent = "";
  authMsg.className = "auth-msg";
}

function showSignUp() {
  tabSignUp.classList.add("active");
  tabSignIn.classList.remove("active");
  indicator.classList.add("move-right");
  signUpForm.classList.remove("d-none");
  signInForm.classList.add("d-none");
  authMsg.textContent = "";
  authMsg.className = "auth-msg";
}

tabSignIn?.addEventListener("click", showSignIn);
tabSignUp?.addEventListener("click", showSignUp);
document.getElementById("goToSignUp")?.addEventListener("click", (e) => {
  e.preventDefault();
  showSignUp();
});
document.getElementById("goToSignIn")?.addEventListener("click", (e) => {
  e.preventDefault();
  showSignIn();
});

// Helpers
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function showMsg(text, type) {
  authMsg.textContent = text;
  authMsg.className = "auth-msg " + type;
}

function setError(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text || "";
}

function markField(input, isValid) {
  if (isValid) {
    input.classList.remove("is-invalid");
    input.classList.add("is-valid");
  } else {
    input.classList.add("is-invalid");
    input.classList.remove("is-valid");
  }
}

function friendlyError(code) {
  switch (code) {
    case "auth/email-already-in-use":
      return "This email is already registered.";
    case "auth/invalid-email":
      return "Invalid email address.";
    case "auth/weak-password":
      return "Password is too weak.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Incorrect email or password.";
    case "auth/too-many-requests":
      return "Too many attempts. Try again later.";
    default:
      return "Something went wrong. Please try again.";
  }
}

function redirectByRole(role) {
  window.location.href =
    role === "doctor" ? "profile-doctor.html" : "profile-patient.html";
}

// Password Strength Meter
const pwInput = document.getElementById("signUpPassword");
const pwFill = document.getElementById("pwStrengthFill");
const pwLabel = document.getElementById("pwStrengthLabel");

function passwordScore(pw) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

pwInput?.addEventListener("input", () => {
  const pw = pwInput.value;
  if (!pw) {
    pwFill.style.width = "0%";
    pwLabel.textContent = "";
    return;
  }
  const score = passwordScore(pw);
  if (pw.length < 6 || score <= 1) {
    pwFill.style.width = "30%";
    pwFill.style.backgroundColor = "#d9534f";
    pwLabel.textContent = "Weak";
  } else if (score <= 3) {
    pwFill.style.width = "65%";
    pwFill.style.backgroundColor = "#f0ad4e";
    pwLabel.textContent = "Medium";
  } else {
    pwFill.style.width = "100%";
    pwFill.style.backgroundColor = "#28a745";
    pwLabel.textContent = "Strong";
  }
});

// Sign Up
signUpForm?.addEventListener("submit", function (e) {
  e.preventDefault();
  const nameEl = document.getElementById("signUpName");
  const emailEl = document.getElementById("signUpEmail");
  const passEl = document.getElementById("signUpPassword");
  const confirmEl = document.getElementById("signUpConfirm");
  const role =
    document.querySelector('input[name="signUpRole"]:checked')?.value ||
    "patient";
  const name = nameEl.value.trim();
  const email = emailEl.value.trim().toLowerCase();
  const password = passEl.value;
  const confirm = confirmEl.value;
  let valid = true;
  const nameOk = name.length >= 3;
  markField(nameEl, nameOk);
  setError("errSignUpName", nameOk ? "" : "At least 3 characters.");
  if (!nameOk) valid = false;
  const emailOk = emailPattern.test(email);
  markField(emailEl, emailOk);
  setError("errSignUpEmail", emailOk ? "" : "Invalid email.");
  if (!emailOk) valid = false;
  const passOk = password.length >= 6;
  markField(passEl, passOk);
  setError("errSignUpPassword", passOk ? "" : "Min 6 characters.");
  if (!passOk) valid = false;
  const confirmOk = confirm === password && confirm.length > 0;
  markField(confirmEl, confirmOk);
  setError("errSignUpConfirm", confirmOk ? "" : "Passwords don't match.");
  if (!confirmOk) valid = false;
  if (!valid) return;
  const submitBtn = signUpForm.querySelector("button[type=submit]");
  submitBtn.disabled = true;
  auth
    .createUserWithEmailAndPassword(email, password)
    .then((cred) =>
      db.collection("users").doc(cred.user.uid).set({
        name,
        email,
        role,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      })
    )
    .then(() => {
      return auth.signOut();
    })
    .then(() => {
      signUpForm.reset();
      submitBtn.disabled = false;
      showSignIn();
      showMsg("Account created successfully! Please sign in.", "success");
    })
    .catch((err) => {
      showMsg(friendlyError(err.code), "error");
      submitBtn.disabled = false;
    });
});

// Sign In
signInForm?.addEventListener("submit", function (e) {
  e.preventDefault();
  const emailEl = document.getElementById("signInEmail");
  const passEl = document.getElementById("signInPassword");
  const email = emailEl.value.trim().toLowerCase();
  const password = passEl.value;
  let valid = true;
  const emailOk = emailPattern.test(email);
  markField(emailEl, emailOk);
  setError("errSignInEmail", emailOk ? "" : "Invalid email.");
  if (!emailOk) valid = false;
  const passOk = password.length >= 6;
  markField(passEl, passOk);
  setError("errSignInPassword", passOk ? "" : "Min 6 characters.");
  if (!passOk) valid = false;
  if (!valid) return;
  const submitBtn = signInForm.querySelector("button[type=submit]");
  submitBtn.disabled = true;
  auth
    .signInWithEmailAndPassword(email, password)
    .then((cred) => db.collection("users").doc(cred.user.uid).get())
    .then((doc) => {
      const data = doc.exists ? doc.data() : { name: "there", role: "patient" };
      showMsg(`Welcome back, ${data.name}!`, "success");
      setTimeout(() => redirectByRole(data.role), 900);
    })
    .catch((err) => {
      showMsg(friendlyError(err.code), "error");
      submitBtn.disabled = false;
    });
});

// Clear inputs on page load to prevent browser autofill display
window.addEventListener("DOMContentLoaded", () => {
  const signInEmail = document.getElementById("signInEmail");
  const signInPassword = document.getElementById("signInPassword");
  const signUpEmail = document.getElementById("signUpEmail");
  const signUpPassword = document.getElementById("signUpPassword");
  const signUpConfirm = document.getElementById("signUpConfirm");
  if (signInEmail) signInEmail.value = "";
  if (signInPassword) signInPassword.value = "";
  if (signUpEmail) signUpEmail.value = "";
  if (signUpPassword) signUpPassword.value = "";
  if (signUpConfirm) signUpConfirm.value = "";
});