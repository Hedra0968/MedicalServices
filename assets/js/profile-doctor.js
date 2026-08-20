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
        : { name: user.email, role: "doctor" };
      if (data.role !== "doctor") {
        window.location.href = "profile-patient.html";
        return;
      }
      profileName.textContent = data.name || "Doctor";
      profileEmail.textContent = user.email;
      loadBookings(data.name);
    });
});

function loadBookings(doctorName) {
  bookingsMsg.textContent = "";
  db.collection("bookings")
    .where("doctor", "==", doctorName)
    .get()
    .then((snapshot) => {
      bookingsList.innerHTML = "";
      if (snapshot.empty) {
        bookingsList.innerHTML =
          '<p class="booking-empty">No appointments matched to your name yet.</p>';
        return;
      }
      snapshot.forEach((doc) => {
        const b = doc.data();
        const card = document.createElement("div");
        card.className = "booking-card";
        card.innerHTML = `
          <div class="booking-info">
            <h3>${b.name || "Patient"}</h3>
            <p>${b.department || ""}</p>
            <p>Date: ${b.date || "-"}</p>
            <p>Phone: ${b.phone || "-"}</p>
          </div>
        `;
        bookingsList.appendChild(card);
      });
    })
    .catch(() => {
      bookingsMsg.textContent = "Could not load appointments.";
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