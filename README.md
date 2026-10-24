# 📸 Instagram Story & Scheduling Module (MERN Stack)

A fully responsive, full-stack Instagram Clone featuring real-time story creation, automated post scheduling, administrative management controls, and mobile navigation. Built with the MERN stack and optimized for serverless cloud deployment on Vercel.

---

## 🚀 Live Demo & Deployment Links

* **Frontend Application:** [https://instagram-story-module.vercel.app](https://instagram-story-module.vercel.app)
* **Backend API Gateway:** [https://instagram-story-module-ozxc.vercel.app](https://instagram-story-module-ozxc.vercel.app)

---

## ✨ Key Features

* **📱 Fully Mobile-Responsive Design:**
  * Auto-adjusting UI layout that hides desktop sidebars on smaller screens.
  * Dedicated fixed mobile bottom navigation bar (`App.jsx` + CSS media query rules) for seamless view switching on phones.

* **📸 Story Upload & Scheduling Engine:**
  * **Serverless Storage Solution:** Implemented client-side Base64 string encoding using `FileReader` to bypass Vercel serverless file system write constraints.
  * **Instant & Scheduled Posts:** Support for instant story publishing and future dateTime scheduling using custom MongoDB schema attributes (`isScheduled`, `scheduledFor`).

* **🛠️ Admin & Security Controls:**
  * Dedicated **Admin Dashboard** for story moderation and system oversight.
  * **Security & Authentication** interface built for modular view state transitions.

* **🎨 Sleek UI/UX:**
  * Dark-mode aesthetics, custom story tray gradients, active state badges, and clean modal dialog overlays.

---

## 🛠️ Tech Stack & Technologies

* **Frontend:** React.js, Lucide React (Icons), CSS3 / Custom Media Queries, Vite
* **Backend:** Node.js, Express.js, CORS, MongoDB & Mongoose
* **Hosting & Deployment:** Vercel (Frontend Client & Express Serverless Functions)

---

## 🚀 Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/harshveenasoni131-sketch/instagram-story-module.git](https://github.com/harshveenasoni131-sketch/instagram-story-module.git)
   cd instagram-story-module
