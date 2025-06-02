# Website Archiver

## Overview

This project is an end-to-end web archiving tool, conceptually similar to the Wayback Machine. Given a URL, the application fetches the content of that page and recursively captures all linked pages on the same domain. It then preserves these pages and their assets (images, stylesheets, scripts) as a snapshot, allowing users to view past versions of a website at specific points in time.

The primary goal of this project is to demonstrate an understanding of web scraping, file system management, and building a full-stack web application.

## Features

* **URL Archiving:** Input any URL to initiate a deep archive of the website.
* **Recursive Fetching:** Automatically follows and archives internal links on the same domain.
* **Asset Preservation:** Saves HTML, CSS, JavaScript, images, and other critical assets to ensure snapshots appear and function as close to the original as possible.
* **Versioning:** Each archiving event creates a new timestamped snapshot.
* **Re-Archiving:** Manually trigger a new archive for an existing URL to capture updated content.
* **Snapshot Viewer:** Browse and view past archived versions of a website through a list of timestamps.
* **Content Comparison (Planned Enhancement):** Ability to compare two archived versions of a page and highlight the differences.
* **Automatic Scheduler (Planned Enhancement):** Option to set up recurring archives for a URL.

## Technical Stack

* **Frontend:** React
* **Backend:** Node.js with Express.js
* **Data Storage:** File-based storage for archived content; in-memory storage for metadata (with potential for simple JSON file persistence).

## Project Structure

The project is divided into two main parts: `frontend` (React application) and `backend` (Node.js/Express server).

```
website-archiver/
├── frontend/             # React application for the user interface
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.js
│   │   └── ...
│   ├── package.json
│   └── README.md
│
├── backend/              # Node.js/Express server for archiving logic
│   ├── archives/         # Directory where all archived website data is stored
│   │   ├── [example.com/](https://example.com/)          # Subdirectory for a specific domain
│   │   │   ├── 1717369200000/    # Timestamped snapshot directory (e.g., epoch milliseconds)
│   │   │   │   ├── index.html    # The archived main page HTML
│   │   │   │   ├── css/          # Directory for archived CSS files
│   │   │   │   │   └── style.css
│   │   │   │   ├── js/           # Directory for archived JavaScript files
│   │   │   │   │   └── script.js
│   │   │   │   ├── images/       # Directory for archived image files
│   │   │   │   │   └── logo.png
│   │   │   │   └── ...           # Other assets (fonts, videos, etc.)
│   │   │   └── 1717455600000/    # Another timestamped snapshot
│   │   │       └── ...
│   │   └── another-site.org/
│   │       └── ...
│   ├── src/
│   │   ├── controllers/
│   │   │   └── archiveController.js # Handles incoming API requests, orchestrates services
│   │   ├── routes/
│   │   │   └── archiveRoutes.js     # Defines API endpoints (e.g., /archive, /archives/:url)
│   │   ├── services/
│   │   │   ├── archiverService.js   # Core logic for fetching, parsing, downloading, rewriting
│   │   │   ├── fileStorageService.js# Handles saving/loading files to/from `archives/`
│   │   │   └── metadataService.js   # Manages in-memory/JSON metadata about archives
│   │   │   └── diffService.js       # (Optional) Logic for comparing HTML content
│   │   ├── utils/
│   │   │   ├── urlUtils.js          # Helpers for URL parsing, normalization, domain extraction
│   │   │   └── htmlRewriter.js      # Helpers for modifying HTML content (e.g., cheerio usage)
│   │   └── app.js                   # Main Express application setup, middleware, route registration
│   ├── .env                      # Environment variables (e.g., PORT)
│   ├── package.json              # Backend dependencies and scripts
│   └── README.md                 # Backend specific README
│
├── .gitignore                    # Git ignore file (e.g., node_modules, .env, archives)
├── README.md             # This file
└── writeup.md            # Project decisions, trade-offs, and future considerations
```

## Setup and Installation

Follow these steps to get the project up and running on your local machine.

### Prerequisites

* Node.js (LTS version recommended)
* npm (comes with Node.js) or Yarn

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd website-archiver
```

### 2. Backend Setup

Navigate into the `backend` directory and install dependencies:

```bash
cd backend
npm install # or yarn install
```

Create a `.env` file in the `backend` directory and add the following (you can choose any port):

```
PORT=3001
```

### 3. Frontend Setup

Open a **new terminal window**, navigate into the `frontend` directory, and install dependencies:

```bash
cd ../frontend
npm install # or yarn install
```

## Running the Application

You will need two separate terminal windows to run both the backend and frontend concurrently.

### 1. Start the Backend Server

In the `backend` directory terminal:

```bash
npm start # or yarn start
```

The backend server will start, typically on `http://localhost:3001` (or the port you specified in `.env`). You should see a message indicating the server is running.

### 2. Start the Frontend Development Server

In the `frontend` directory terminal:

```bash
npm start # or yarn start
```

This will open the React application in your default web browser, usually at `http://localhost:3000`.

## Usage

1.  **Input URL:** On the homepage, enter the URL of the website you wish to archive into the input field.
2.  **Archive:** Click the "Archive" button. The application will fetch the page and its internal links, saving them as a new snapshot. You'll see a list of archived versions appear.
3.  **View Snapshots:** Click on any timestamp in the list to view that specific archived version of the website in an iframe.
4.  **Re-Archive:** Use the "Re-Archive" button to capture a fresh snapshot of the current URL.

## Development Notes

* **File-Based Storage:** Archived content is stored in the `backend/archives/` directory. Each website gets its own subdirectory, and each snapshot is further organized by a timestamp.
* **In-Memory Metadata:** Currently, the metadata about archived URLs and their versions is stored in memory on the backend. This means the list of archives will reset if the backend server is restarted. For persistence, this could be extended to save to a simple JSON file.
* **Error Handling:** Basic error handling is in place for network requests and file operations.
* **URL Rewriting:** The backend attempts to rewrite relative URLs in the HTML and CSS to point to the locally saved assets. Absolute URLs to external domains are generally left as is.

## Future Enhancements

* **Persistent Metadata Storage:** Implement saving and loading archive metadata to a JSON file or a lightweight database (e.g., SQLite) to persist data across server restarts.
* **Advanced URL Rewriting:** More robust handling of dynamic content, JavaScript-injected URLs, and complex CSS `url()` properties.
* **Queue Management:** For large archives, implement a more sophisticated queuing system for fetching pages and assets to manage concurrency and prevent overwhelming the target server.
* **User Authentication:** If this were a multi-user application, authentication would be necessary to manage user-specific archives.
* **Scalability:** For production, consider cloud storage (e.g., AWS S3), a dedicated database (PostgreSQL, MongoDB), and a distributed task queue (e.g., Celery) for the archiving process.
