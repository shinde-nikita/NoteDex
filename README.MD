# 📚 NoteDex: Personal, Study-Focused Flashcard Web App

NoteDex is a simple, minimalist web application for creating, organizing, and studying flashcards. It is designed to be distraction-free and fully personal, with all data stored locally in your browser.

## ✨ Features

* **Deck Management:** Create, rename, and delete card decks.
* **Card Management:** Easily add, edit, and delete individual flashcards.
* **Flashcard Mode:** Flip cards to reveal the back.
* **Quiz Mode:** Multiple-choice quiz generation from the current deck's cards.
* **Progress Tracking:** Track which cards you mark as "Known" or "Unknown."
* **Responsive Design:** Works seamlessly on mobile and desktop devices.
* **Data Persistence:** Uses **Local Storage**—no external database needed.

## 🚀 Running Locally

The easiest way to run NoteDex is by using a simple local HTTP server (which is recommended for Local Storage to function correctly and for future deployment):

### Prerequisites
1.  **Node.js:** Ensure you have Node.js installed.

### Steps
1.  **Clone the Repository:**
    ```bash
    git clone [Your-Repo-URL] notedex
    cd notedex
    ```
2.  **Install Dependencies:**
    ```bash
    npm install
    ```
3.  **Start the Server:**
    ```bash
    npm start
    ```
    The app should now be running at: **http://localhost:3000**

## 🌐 Deployment to Static Hosts

Because NoteDex is a static application (HTML/CSS/JS) using Local Storage, it can be deployed for free on platforms like **GitHub Pages, Netlify, or Vercel**.

1.  Push the code to your GitHub repository.
2.  Set up GitHub Pages to build from the `main` branch.
3.  Your app will be live at `your-username.github.io/notedex`.