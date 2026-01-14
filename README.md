# OneWordReader

A cross-platform speed reading application built with Electron, React, and Node.js. Displays text from Markdown files one word at a time at adjustable speeds, with visual progress tracking and customizable themes.

## Features

- **File Import**: Load .md files and automatically strip formatting to plain text
- **Speed Reading**: Adjustable reading speed from 300 to 900 words per minute in 50 wpm increments
- **Pop-out Display**: Dedicated always-on-top window for distraction-free reading
- **Progress Tracking**: Real-time progress bar and percentage indicator
- **Resume/Pause**: Continue reading from where you left off
- **Phrase Pausing**: Automatic 200ms pause at sentence endings (words with periods)
- **Custom Fonts**: Select and apply local fonts to the display
- **Dark Mode**: Toggle between light and dark themes, synced across windows
- **Text Filtering**: Removes punctuation except letters, numbers, dots, and apostrophes

## Installation

1. Clone the repository
2. Run `npm install`
3. Run `npm run dev` to start in development mode

## Usage

1. Click "Import .md File" to select a Markdown file
2. Adjust the reading speed using the slider (300-900 wpm)
3. Click "Start" to begin reading
4. Use the pop-out window for focused reading
5. "Stop" to pause, "Start" again to resume from current position
6. Toggle "Night Mode" for dark theme
7. "Change Font" to select a custom font

## Building

Run `npm run build` to build for production, then `npm start` to run the built app.

## Technologies

- Electron for cross-platform desktop app
- React for UI components
- Vite for development and building
- Node.js for file processing

## License

MIT License