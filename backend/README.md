# Website Archiving Backend

This is the backend service for the Website Archiving project. It provides API endpoints to archive websites, list archives, and serve archived content. It also computes and exposes the percent difference between archived snapshots.

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [npm](https://www.npmjs.com/)

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/WebsiteArchiving.git
   cd WebsiteArchiving/backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

   This will install all required packages, including `express`, `diff`, and others.

## Running the Server

Start the backend server with:

```bash
npm start
```

By default, the server will listen on port `3001`. You can change the port by setting the `PORT` environment variable.

## Environment Variables

- `PORT` (optional): The port the backend will listen on (default: 3001).

## API Endpoints

All endpoints are prefixed with `/api/archives`.

### Archive a Website
- **POST** `/api/archives/archive`
  - Body: `{ "url": "https://example.com" }`
  - Archives the given website and saves a snapshot.

### List All Domains
- **GET** `/api/archives/domains`
  - Returns a list of all archived domains.

### List Archives for a Domain
- **GET** `/api/archives/:domain`
  - Returns an array of archives for the domain, sorted by newest first.
  - Each archive object includes:
    - `timestamp`: When the archive was taken
    - `path`: Path to the archive
    - `percentDifference`: Percent change from the previous archive (0 for the oldest)
    - `changed`: Boolean, true if there was any change from the previous archive

### Get a Specific Archive
- **GET** `/api/archives/:domain/:timestamp`
  - Returns info about a specific archive.

### Serve Archived Content
- **GET** `/snapshots/:domain/:timestamp/...`
  - Serves static files from the archive (e.g., HTML, CSS, images).

## Archive Diffing

- The backend uses the [`diff`](https://www.npmjs.com/package/diff) package to compute the percent difference between the main file (`index/index.html`) of each archive and the previous one.
- The `percentDifference` property is used by the frontend to visualize changes over time.

## Notes

- Make sure the `archives` directory is writable by the backend process.
- The backend is designed to work with the frontend in the `../frontend` directory.

## License

MIT

