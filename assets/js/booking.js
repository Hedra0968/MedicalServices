// Booking form + Newsletter forms, backed by Firestore.
// Shared by index.html and contact.html (same field ids on both).
const CLINIC_SLOTS = [
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
];
const CLOSED_WEEKDAYS = [5, 6]; // Friday, Saturday
const BOOKING_WINDOW_DAYS = 30;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const bookingForm = document.getElementById("bookingForm");
const patientDoctor = document.getElementById("patientDoctor");
const patientDate = document.getElementById("patientDate");
const patientTime = document.getElementById("patientTime");
const patientDepartment = document.getElementById("patientDepartment");
const selectedPackageBadge = document.getElementById("selectedPackageBadge");
const selectedPackageText = document.getElementById("selectedPackageText");

function toISODate(d) {
  return d.toISOString().split("T")[0];
}

if (patientDate) {
  const today = new Date();
  const max = new Date();
  max.setDate(max.getDate() + BOOKING_WINDOW_DAYS);
  patientDate.min = toISODate(today);
  patientDate.max = toISODate(max);
}

function resetTimeSelect(message) {
  if (!patientTime) return;
  patientTime.innerHTML = `<option value="" selected disabled>${message}</option>`;
  patientTime.disabled = true;
  patientTime.classList.remove("is-valid", "is-invalid");
}

function refreshTimeSlots() {
  if (!patientDoctor || !patientDate || !patientTime) return;
  const doctor = patientDoctor.value;
  const date = patientDate.value;
  if (!doctor || !date) {
    resetTimeSelect("Select doctor & date first");
    return;
  }
  const weekday = new Date(date + "T00:00:00").getDay();
  if (CLOSED_WEEKDAYS.includes(weekday)) {
    resetTimeSelect("Clinic closed on this day");
    patientDate.classList.add("is-invalid");
    return;
  }
  patientDate.classList.remove("is-invalid");
  resetTimeSelect("Loading available times...");
  db.collection("bookings")
    .where("doctor", "==", doctor)
    .where("date", "==", date)
    .get()
    .then((snapshot) => {
      const taken = new Set();
      snapshot.forEach((doc) => taken.add(doc.data().time));
      const available = CLINIC_SLOTS.filter((slot) => !taken.has(slot));
      if (!available.length) {
        resetTimeSelect("No slots available this day");
        return;
      }
      patientTime.innerHTML =
        '<option value="" selected disabled>Choose a time</option>' +
        available
          .map((slot) => `<option value="${slot}">${slot}</option>`)
          .join("");
      patientTime.disabled = false;
    })
    .catch(() => resetTimeSelect("Could not load times"));
}

patientDoctor?.addEventListener("change", refreshTimeSlots);
patientDate?.addEventListener("change", refreshTimeSlots);

// Book Now (from Price List) -> preselects department + scrolls to form
document.querySelectorAll(".book-now-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const card = btn.closest(".book-package");
    const pkg = card.getAttribute("data-package");
    const dept = card.getAttribute("data-department");
    if (patientDepartment && dept) patientDepartment.value = dept;
    if (selectedPackageBadge && selectedPackageText) {
      selectedPackageText.textContent = `Selected Package: ${pkg}`;
      selectedPackageBadge.classList.remove("d-none");
    }
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  });
});

document.getElementById("clearPackageBtn")?.addEventListener("click", () => {
  selectedPackageBadge?.classList.add("d-none");
});

// Booking Submit
if (bookingForm) {
  bookingForm.addEventListener("submit", function (e) {
    e.preventDefault();
    let valid = true;
    function checkField(el, isValid) {
      if (!el) return;
      el.classList.toggle("is-invalid", !isValid);
      el.classList.toggle("is-valid", isValid);
      if (!isValid) valid = false;
    }
    const nameEl = document.getElementById("patientName");
    const emailEl = document.getElementById("patientEmail");
    const phoneEl = document.getElementById("patientPhone");
    const deptEl = document.getElementById("patientDepartment");
    const doctorEl = document.getElementById("patientDoctor");
    const dateEl = document.getElementById("patientDate");
    const messageEl = document.getElementById("patientMessage");
    checkField(nameEl, nameEl.value.trim().length >= 3);
    checkField(emailEl, emailPattern.test(emailEl.value.trim()));
    checkField(phoneEl, /^[0-9+\s]{8,15}$/.test(phoneEl.value.trim()));
    checkField(deptEl, deptEl.value !== "");
    checkField(doctorEl, doctorEl.value !== "");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const chosenDate = dateEl.value
      ? new Date(dateEl.value + "T00:00:00")
      : null;
    const dateOk =
      chosenDate &&
      chosenDate >= today &&
      !CLOSED_WEEKDAYS.includes(chosenDate.getDay());
    checkField(dateEl, dateOk);
    checkField(
      patientTime,
      patientTime && patientTime.value !== "" && !patientTime.disabled,
    );

    if (!valid) return;

    const submitBtn = bookingForm.querySelector("button[type=submit]");
    submitBtn.disabled = true;
    const bookedPackage =
      selectedPackageBadge && !selectedPackageBadge.classList.contains("d-none")
        ? selectedPackageText.textContent.replace("Selected Package: ", "")
        : null;
    const doctor = doctorEl.value;
    const date = dateEl.value;
    const time = patientTime.value;

    // Re-check the slot right before saving to avoid double-booking.
    db.collection("bookings")
      .where("doctor", "==", doctor)
      .where("date", "==", date)
      .where("time", "==", time)
      .get()
      .then((snapshot) => {
        if (!snapshot.empty) {
          throw { code: "slot-taken" };
        }
        return db.collection("bookings").add({
          name: nameEl.value.trim(),
          email: emailEl.value.trim().toLowerCase(),
          phone: phoneEl.value.trim(),
          department: deptEl.options[deptEl.selectedIndex].text,
          doctor,
          date,
          time,
          message: messageEl.value.trim(),
          package: bookedPackage,
          uid:
            typeof auth !== "undefined" && auth.currentUser
              ? auth.currentUser.uid
              : null,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
      })
      .then(() => {
        showBookingMsg("Appointment booked!", "success");
        bookingForm.reset();
        bookingForm
          .querySelectorAll(".is-valid, .is-invalid")
          .forEach((el) => el.classList.remove("is-valid", "is-invalid"));
        resetTimeSelect("Select doctor & date first");
        selectedPackageBadge?.classList.add("d-none");
        submitBtn.disabled = false;
      })
      .catch((err) => {
        if (err.code === "slot-taken") {
          showBookingMsg("That time was just taken. Pick another.", "error");
          refreshTimeSlots();
        } else {
          showBookingMsg("Could not book. Try again.", "error");
        }
        submitBtn.disabled = false;
      });
  });
}

function showBookingMsg(text, type) {
  let msg = document.getElementById("bookingFormMsg");
  if (!msg) {
    msg = document.createElement("p");
    msg.id = "bookingFormMsg";
    msg.className = "form-msg";
    bookingForm
      .querySelector("button[type=submit]")
      .insertAdjacentElement("afterend", msg);
  }
  msg.textContent = text;
  msg.className = "form-msg " + type;
}

// Newsletter (main + footer) -> Firestore, one doc per email
function setupNewsletter(formId, inputId, msgId) {
  const form = document.getElementById(formId);
  if (!form) return;
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const input = document.getElementById(inputId);
    const msg = document.getElementById(msgId);
    const email = input.value.trim().toLowerCase();
    if (!emailPattern.test(email)) {
      msg.textContent = "Invalid email.";
      msg.className = "form-msg error";
      return;
    }
    const ref = db.collection("newsletter").doc(email);
    ref
      .get()
      .then((doc) => {
        if (doc.exists) {
          msg.textContent = "Already subscribed.";
          msg.className = "form-msg error";
          return;
        }
        return ref
          .set({
            email,
            subscribedAt: firebase.firestore.FieldValue.serverTimestamp(),
          })
          .then(() => {
            msg.textContent = "Subscribed!";
            msg.className = "form-msg success";
            form.reset();
          });
      })
      .catch(() => {
        msg.textContent = "Could not subscribe.";
        msg.className = "form-msg error";
      });
  });
}

setupNewsletter("newsletterForm", "newsletterEmail", "newsletterMsg");
setupNewsletter(
  "footerNewsletterForm",
  "footerNewsletterEmail",
  "footerNewsletterMsg",
);