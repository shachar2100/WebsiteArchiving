# Website Archiving Frontend

This is the frontend for the Website Archiving project. It provides a modern React interface to archive websites, visualize archive history, and explore changes over time.

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [npm](https://www.npmjs.com/)

## Installation

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```

## Running the App

Start the frontend development server with:

```bash
npm start
```

The app will be available at [http://localhost:3000](http://localhost:3000) by default.

## Environment Variables

- By default, the frontend expects the backend to be running at `http://localhost:3001`.
- If your backend is running elsewhere, update the `API_BASE` variable in `src/App.js`.

## Features

- **Archive any website** by entering its URL.
- **Browse all archived domains** and select one to view its history.
- **Calendar view** of archive activity, with color-coded change visualization (gray/yellow/green/blue for no/low/medium/high change).
- **Multiple archives per day** supported.
- **Click a day** to see all archives for that day, each with a color box and percent difference.
- **View any archive** in a new tab.

## Project Structure

- `src/App.js` - Main React component and UI logic
- `public/` - Static assets and HTML
- `src/` - Source code

## Notes

- This frontend is designed to work with the backend in the `../backend` directory.
- Make sure the backend is running before using the frontend.

## License

MIT
