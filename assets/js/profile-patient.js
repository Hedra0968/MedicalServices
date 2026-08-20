const profileName = document.getElementById("profileName");
const profileEmail = document.getElementById("profileEmail");
const bookingsList = document.getElementById("bookingsList");
const bookingsMsg = document.getElementById("bookingsMsg");
const deleteAccountBtn = document.getElementById("deleteAccountBtn");
const deleteAccountMsg = document.getElementById("deleteAccountMsg");

let currentUser = null;

auth.onAuthStateChanged((user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  currentUser = user;
  db.collection("users")
    .doc(user.uid)
    .get()
    .then((doc) => {
      const data = doc.exists
        ? doc.data()
        : { name: user.email, role: "patient" };
      if (data.role === "doctor") {
        window.location.href = "profile-doctor.html";
        return;
      }
      profileName.textContent = data.name || "Patient";
      profileEmail.textContent = user.email;
      loadBookings(user.email);
    });
});

function loadBookings(email) {
  bookingsMsg.textContent = "";
  db.collection("bookings")
    .where("email", "==", email)
    .get()
    .then((snapshot) => {
      bookingsList.innerHTML = "";
      if (snapshot.empty) {
        bookingsList.innerHTML =
          '<p class="booking-empty">No appointments yet. Book one from the Contact page.</p>';
        return;
      }
      snapshot.forEach((doc) => {
        const b = doc.data();
        const card = document.createElement("div");
        card.className = "booking-card";
        card.innerHTML = `
          <div class="booking-info">
            <h3>${b.doctor || "Doctor"}</h3>
            <p>${b.department || ""}</p>
            <p>Date: ${b.date || "-"}</p>
            ${b.package ? `<span class="pkg">${b.package}</span>` : ""}
          </div>
          <button type="button" class="btn btn-outline-danger btn-sm" data-id="${doc.id}">Cancel</button>
        `;
        card
          .querySelector("button")
          .addEventListener("click", () => cancelBooking(doc.id, email));
        bookingsList.appendChild(card);
      });
    })
    .catch(() => {
      bookingsMsg.textContent = "Could not load appointments.";
      bookingsMsg.className = "form-msg error";
    });
}

function cancelBooking(id, email) {
  if (!confirm("Cancel this appointment?")) return;
  db.collection("bookings")
    .doc(id)
    .delete()
    .then(() => {
      bookingsMsg.textContent = "Appointment cancelled.";
      bookingsMsg.className = "form-msg success";
      loadBookings(email);
    })
    .catch(() => {
      bookingsMsg.textContent = "Could not cancel appointment.";
      bookingsMsg.className = "form-msg error";
    });
}

deleteAccountBtn?.addEventListener("click", () => {
  if (!currentUser) return;
  if (!confirm("Delete your account permanently? This cannot be undone."))
    return;
  const uid = currentUser.uid;
  db.collection("users")
    .doc(uid)
    .delete()
    .then(() => currentUser.delete())
    .then(() => {
      window.location.href = "login.html";
    })
    .catch((err) => {
      if (err.code === "auth/requires-recent-login") {
        deleteAccountMsg.textContent =
          "Please sign out and sign in again, then retry.";
      } else {
        deleteAccountMsg.textContent = "Could not delete account. Try again.";
      }
    });
});