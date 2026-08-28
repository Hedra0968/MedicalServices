# Medical Services — Full Project Documentation

> This is the complete, up-to-date documentation for everything currently in the project.

---

## 1. Project Idea

**Medical Services** is a full hospital booking platform where a patient can browse services, doctors, and pricing, create a real account (as a Patient or Doctor), book an actual appointment, track it from a personal profile page, cancel it, or delete their account entirely. All data is stored on **Firebase** (Authentication + Firestore) — not fake or local-only data. The site is also installable as a **PWA (Progressive Web App)** on mobile and desktop.

---

## 2. Full Folder Structure (current)

```
MedicalServices-main/                 <-- project root
├── index.html                        <-- Home page (lives at the root)
├── manifest.json                     <-- PWA app manifest
├── sw.js                             <-- Service Worker (caching)
├── html/
│   ├── about.html
│   ├── services.html
│   ├── doctors.html
│   ├── blogs.html
│   ├── contact.html
│   ├── login.html
│   ├── profile-patient.html
│   ├── profile-doctor.html
│   └── services-details/
│       └── services-details-1.html ... 6.html   (individual service detail pages)
└── assets/
    ├── bootstrap/          (Bootstrap library)
    ├── icons/fontawesome/  (icon library)
    ├── images/
    │   └── icons/          (PWA icons: icon-192.png, icon-512.png)
    ├── css/
    │   ├── main.css        <-- shared settings for all pages except index
    │   ├── style.css       <-- styles specific to index.html only
    │   ├── about.css, services.css, doctors.css, blogs.css,
    │   │   contact.css, login.css, profile.css, services-details.css
    └── js/
        ├── main.js              <-- shared script for all pages except index
        ├── index.js             <-- script specific to index.html only
        ├── firebase-config.js   <-- Firebase connection (loaded on every page)
        ├── nav-auth.js          <-- updates the navbar based on login state (shared)
        ├── transition.js        <-- page loader + page-to-page transition (shared)
        ├── booking.js           <-- booking logic + time slots + newsletter (index, contact, and other pages that include the footer newsletter form)
        ├── login.js             <-- login page logic only
        ├── profile-patient.js, profile-doctor.js
        └── about.js, services.js, doctors.js, blogs.js, contact.js, services-details.js
```

**Important:** `index.html` sits at the **project root**, while every other page (about, services, doctors, blogs, contact, login, profile-*) lives inside the `html/` folder, and the service detail pages live one level deeper, inside `html/services-details/`. Every relative path in the project has to respect this difference — this is exactly what caused the earlier search bug (explained in the Search section below).

---

## 3. Every Page in the Project (15 pages)

| Page | Location | Purpose |
|---|---|---|
| `index.html` | root | Home page: Hero, About, stats, services, pricing, doctors slider, blog posts, booking form, newsletter |
| `html/about.html` | `html/` | Detailed About page: intro (`about-intro`), stats (`info`), help (`help`), hospital journey (`journey`), fun facts (`fun-facts`), testimonials (`good-vibes`), call-to-action (`call`) |
| `html/services.html` | `html/` | All services (`sec1-hero`, `sec2-main`, `sec3-main`, `sec4-main`) with links to each service's detail page |
| `html/services-details/services-details-1..6.html` | `html/services-details/` | A standalone detail page for each of the 6 services |
| `html/doctors.html` | `html/` | All doctors in detail (`sec1-container`, `sec2-container`) |
| `html/blogs.html` | `html/` | Medical articles (`article`, `blogs`) |
| `html/contact.html` | `html/` | Booking form + real embedded map + quick contact channels + testimonials + emergency bar |
| `html/login.html` | `html/` | Sign in / Sign up, with role selection (Patient / Doctor) |
| `html/profile-patient.html` | `html/` | Patient profile: their bookings + cancel + delete account — **not listed in the navbar** |
| `html/profile-doctor.html` | `html/` | Doctor profile: bookings matched to their name + delete account — **not listed in the navbar** |

---

## 4. Core Tools Used

- **HTML5**: same layout pattern on every page (Head → Navbar → content → Footer → Scripts).
- **CSS3 + CSS Variables**: all colors defined once in `:root` at the top of `main.css`/`style.css` (`--light-blue`, `--dark-gray`, `--light-gray`...) so the color palette can be changed from a single place.
- **Bootstrap 5**: the grid system (`container`, `row`, `col-*`) and ready-made components (Navbar, Forms, Buttons, Collapse) save a lot of manual code.
- **FontAwesome**: every icon on the site (search, social, medical icons, etc.).
- **Vanilla JavaScript**: no extra JS library (no jQuery, no React) — all interactivity is hand-written.
- **Firebase**: Authentication (login) + Firestore (database).

---

## 5. Responsive Design

Every CSS file has `@media` queries that adjust the layout per screen size. Main breakpoints used across the project:
- **991px**: the navbar collapses into a hamburger menu (☰) — via Bootstrap's Collapse component.
- **767px**: adjustments for larger mobile screens (smaller headings, single-column layouts).
- **575px and 400px**: fine-tuning of buttons and spacing for small mobile screens.

---

## 6. Navbar and Footer (shared across every page)

Same structure on all 15 pages: logo, nav links (Home/About/Services/Doctors/Blogs/Contact), a search icon, and a Login button that automatically swaps to the user's name + Logout once signed in (full explanation in the Firebase section below).

**The navbar's transparency changes on scroll:**
```js
function handleNavScroll() {
  if (window.scrollY > 50) mainNav.classList.add("scrolled");
  else mainNav.classList.remove("scrolled");
}
```

---

## 7. Site Search — and the two routing bugs that were fixed

**The idea:** a search box that takes a keyword and decides whether to scroll to a section on the current page, or navigate to a different page entirely.

### Bug #1 — hardcoded folder depth
Since `index.html` lives at the root while every other page lives inside `html/`, any hardcoded path (e.g. `"about.html"` with no prefix) would break whenever searching from a page at a different folder depth than expected.

**The fix, applied in `main.js`:**
```js
function getRootPrefix() {
  const src = document.currentScript ? document.currentScript.getAttribute("src") || "" : "";
  const marker = "assets/js/";
  const idx = src.indexOf(marker);
  return idx >= 0 ? src.slice(0, idx) : "";
}

const ROOT_PREFIX = getRootPrefix();
```
The code reads the exact path it was loaded with (`<script src="../assets/js/main.js">` or `<script src="../../assets/js/main.js">`), and automatically figures out "how far am I from the project root" — no need to hardcode a path that changes per page.

### Bug #2 — counting URL slashes instead of reading the script's own path
`index.js` originally used a *different* technique: it counted the number of `/` in `window.location.pathname` to guess its depth. This works fine when a site is served from a domain's true root, but **breaks specifically on GitHub Pages project sites**, because the URL there looks like `https://username.github.io/RepoName/index.html` — the repo name (`RepoName`) becomes an extra path segment that gets miscounted as if it were a real project folder. That extra miscounted level added one unnecessary `../` to every link generated from the Home page, sending visitors **outside the project entirely** (landing on the bare `github.io` domain, where GitHub shows a "There isn't a GitHub Pages site here" error — a different, more confusing 404 than a normal missing-file error).

**The fix:** `index.js` now uses the exact same `document.currentScript`-based technique as `main.js`, reading its own `<script src="./assets/js/index.js">` attribute instead of counting URL slashes — completely unaffected by whatever prefix a hosting provider adds to the URL.

```js
function getRootPrefix() {
  const src = document.currentScript ? document.currentScript.getAttribute("src") || "" : "";
  const marker = "assets/js/";
  const idx = src.indexOf(marker);
  return idx >= 0 ? src.slice(0, idx) : "";
}

const ROOT_PREFIX = getRootPrefix();
```

**Important implementation detail:** `document.currentScript` is only valid while a script is first executing — it becomes `null` once code runs later inside an event handler (like a search form's `submit` listener). That's why `ROOT_PREFIX` is computed **once, at the top level**, right when the script loads, and the stored value is reused every time a search happens — rather than calling `getRootPrefix()` again from inside `performSearch()`.

Every entry in `searchIndex` is written as a path **relative to the project root** (e.g. `"html/about.html"`), and when navigating:
```js
window.location.href = ROOT_PREFIX + match.page + (match.hash ? "#" + match.hash : "");
```

---

## 8. Firebase in Detail

### Connection (`firebase-config.js`)
```js
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
```
`auth` and `db` are then available to every other JavaScript file on the same page (there's no module system — all scripts share the same global scope).

### The Three Firestore Collections

| Collection | Represents | Main fields |
|---|---|---|
| `users` | An account (Patient or Doctor) | `name`, `email`, `role`, `createdAt` — the document ID is the same as the Firebase Auth `uid` |
| `bookings` | A single appointment | `name`, `email`, `phone`, `department`, `doctor`, `date`, `time`, `message`, `package`, `uid` |
| `newsletter` | A single email subscription | `email`, `subscribedAt` — the document ID is the email itself |

### Security Rules
A separate `firestore.rules` file was created (meant to be pasted into the Firebase Console manually, not part of the site's own files) that defines:
- `users` documents: read, update, and delete only by the account owner (`request.auth.uid == userId`).
- `bookings`: anyone can read (so the booking form can show available time slots even before signing in), but deleting is restricted to the owner of that booking.
- `newsletter`: anyone can read and write (public form), with no update or delete allowed.

### The Reactive Navbar (`nav-auth.js`)
```js
auth.onAuthStateChanged((user) => {
  if (!user) { /* show the Login button */ }
  else { /* read the user's name and role from "users", show them instead of the button */ }
});
```
Runs automatically on every page whenever the login state changes, with no page refresh needed.

---

## 9. Login & Sign Up (`login.html` + `login.js`)

- Two tabs (Sign In / Sign Up) with a sliding indicator animated in CSS.
- At sign-up: role selection (Patient / Doctor) via radio buttons.
- **Password Strength Meter**: computes Weak/Medium/Strong live as the user types, based on length and the presence of uppercase/lowercase/numbers/symbols.
- **Actual sign-up:**
```js
auth.createUserWithEmailAndPassword(email, password)
  .then((cred) => db.collection("users").doc(cred.user.uid).set({ name, email, role, createdAt: ... }))
  .then(() => redirectByRole(role));
```
- **Sign in:**
```js
auth.signInWithEmailAndPassword(email, password)
  .then((cred) => db.collection("users").doc(cred.user.uid).get())
  .then((doc) => redirectByRole(doc.data().role));
```
After success, the user is automatically redirected to the profile page matching their role.

---

## 10. Profiles (Patient / Doctor)

Both pages are protected by an **Auth Guard**: if someone opens the page without being signed in, they're redirected straight to `login.html`. And if someone signs in with the wrong role for that page (e.g. a patient landing on the doctor profile), they're automatically redirected to their correct page.

| | Patient Profile | Doctor Profile |
|---|---|---|
| Query | `.where("email", "==", user.email)` | `.where("doctor", "==", data.name)` |
| Cancel button | Present | Not present |
| Data shown per card | Doctor, department, date, package | Patient name, department, date, phone |

**Deleting the account** (same logic on both pages):
```js
db.collection("users").doc(uid).delete()
  .then(() => currentUser.delete())
  .then(() => window.location.href = "login.html");
```
Two separate steps that must both happen: delete from the database, and delete from the authentication system itself.

---

## 11. The Booking System (`booking.js`) — the most important part of the project

**Available time slots:**
```js
const CLINIC_SLOTS = ["10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"];
const CLOSED_WEEKDAYS = [5, 6]; // Friday and Saturday
const BOOKING_WINDOW_DAYS = 30;
```
- Dates are limited to the next 30 days only.
- Fridays and Saturdays are rejected automatically.
- Once a doctor and date are chosen, the code asks Firestore for all existing bookings for that doctor on that day, and removes the already-taken time slots from the list.

**Double Booking Prevention:** right before the final save, one more real-time check runs against the database to make sure nobody else has just taken the same slot — if there's a conflict, the booking is rejected and the user is asked to pick another time.

**Linking "Book Now" to Pricing:** clicking a button in the pricing section auto-selects the matching department in the booking form, shows a badge with the chosen package, and smooth-scrolls to the form.

**Booking works even without signing in (Guest Booking)** — if the user is signed in, their `uid` is attached to the booking; if not, that field is stored as `null`.

---

## 12. Validation (everywhere)

Every form in the project is validated with plain JavaScript (not just HTML's `required` attribute):
- Name: at least 3 characters.
- Email: a Regex checks the format.
- Phone: digits only, within a reasonable length.
- Date & time: must be within the allowed range and not on a closed day.
- Password: at least 6 characters + a strength meter.

**There's a second layer of protection at the database level itself** (`firestore.rules`) — even if someone tampers with the code via developer tools and bypasses browser-side validation, the database itself rejects incomplete or malformed data.

---

## 13. Newsletter

The email is used as the **document ID** in the `newsletter` collection, so checking for duplicates is a simple `.doc(email).get()` instead of a more complex query.

---

## 14. Page Transitions (`transition.js`)

- A lightweight loader (`#pageLoader`) shows the moment any page opens and disappears quickly (under half a second).
- Clicking any internal link triggers a light fade-out before actually navigating, so the transition feels smoother than the browser's default instant jump.

---

## 15. PWA (installable app)

The site is now installable on mobile and desktop like a real app, using the site's own favicon as the app icon.

**Manifest (`manifest.json`)** describes the app's name, icons, theme color, and start page. **Service Worker (`sw.js`)** caches the core files so the app loads instantly on repeat visits.

**Important gotcha (learned the hard way):** a Service Worker aggressively caches files in the visitor's browser. If `sw.js` isn't written to self-update, visitors (including you, while testing) can keep seeing an **old, frozen version of the site** even after the real files on GitHub have been fixed — because the browser is silently serving its own cached copy instead of fetching the new one.

The current `sw.js` avoids this with three additions:
```js
self.addEventListener("install", (e) => {
  self.skipWaiting(); // activate the new service worker immediately
  ...
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    ).then(() => self.clients.claim()) // take control of open tabs right away
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request))); // network first, cache as fallback
});
```
`skipWaiting()` + `clients.claim()` force every update to take effect immediately instead of waiting for all tabs to close, `activate` deletes any old cached version, and `fetch` now tries the network first and only falls back to the cache if there's no connection — so visitors always see the latest deployed version.

**If something ever looks outdated again while testing:** open Chrome DevTools → Application tab → Service Workers → Unregister, and Application → Storage → Clear site data, or simply test in an Incognito window, before assuming the code itself is broken.

---

## 16. How the Files Talk to Each Other (overview)

```
Every HTML page
   │
   ├─ CSS: Bootstrap → FontAwesome → main.css (or style.css for index) → page-specific CSS
   │
   └─ JS (in order):
        Bootstrap JS
        → Firebase SDK (from CDN)
        → firebase-config.js   (sets up auth and db)
        → nav-auth.js          (uses auth and db to update the navbar)
        → transition.js        (loader + fade)
        → main.js (or index.js)  (search, scroll, reveal, service worker registration)
        → booking.js  (on pages that have a booking form or newsletter form)
        → the page's own script (about.js, login.js, profile-patient.js...)
```

`auth` and `db` (from `firebase-config.js`) are the "bridge" that every other file uses to talk to Firebase. A full automated check confirmed no two files declare the same global variable twice on any of the 15 pages.

---

## 17. Quick Discussion Questions & Answers

**Q: Why is `index.html` alone at the root while everything else is inside `html/`?**
A: A simple organizational choice — the home page is usually opened directly from the site's base URL, so it made sense to keep it at the root, while the rest of the pages are grouped together for organization.

**Q: What was the search bug, and how was it fixed?**
A: The search used hardcoded paths based on a wrong assumption about file locations, so it broke when searching from a page at a different folder depth. It was fixed by having the code detect its own location at runtime (by reading its own `<script src>`) instead of assuming a fixed depth.

**Q: Is the data in Firestore protected?**
A: Yes, through security rules (`firestore.rules`) that define exactly who can read/write/delete each type of data. The one intentional exception is reading `bookings`, which has to be public so the booking form can work correctly even before the user signs in.

**Q: What's the difference between `main.js` and `index.js`?**
A: `index.html` is fully self-contained and has its own script with everything in it (`index.js`), while every other page loads `main.js` (shared general-purpose functions) plus its own page-specific script.

**Q: How is double-booking the same appointment prevented?**
A: A two-step check — once to show only the currently available time slots, and again right at the moment of saving, to catch the rare case where two patients try to book the exact same slot at nearly the same time.
