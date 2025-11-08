# AI-Powered Thesis Repository - Frontend

Modern, responsive React frontend for the AI-Powered Thesis Repository.

## Features

- 🏠 **Home Page** - Beautiful landing page with search functionality
- 🔍 **Search Page** - Browse and search theses with semantic search
- 📄 **Document Page** - View full thesis details with similar theses
- ℹ️ **About Page** - Learn about the project and technology stack
- 📱 **Responsive Design** - Works seamlessly on mobile and desktop
- 🎨 **Modern UI** - Clean design with Tailwind CSS

## Tech Stack

- **React** - UI Library
- **Vite** - Build Tool
- **Tailwind CSS** - Styling
- **React Router** - Routing
- **Axios** - HTTP Client

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Backend server running on `http://localhost:3000`

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   └── Navbar.jsx         # Navigation component
│   ├── pages/
│   │   ├── Home.jsx            # Landing page
│   │   ├── Search.jsx          # Search page
│   │   ├── Document.jsx        # Document detail page
│   │   └── About.jsx           # About page
│   ├── services/
│   │   └── api.js              # API service layer
│   ├── App.jsx                 # Main app component
│   ├── main.jsx                # Entry point
│   └── index.css               # Global styles
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

## API Integration

The frontend connects to the backend API running on `http://localhost:3000`. The proxy is configured in `vite.config.js` for development.

## Available Pages

- `/` - Home/Landing page
- `/search` - Search theses
- `/search?q=query` - Search with query
- `/document/:id` - View thesis details
- `/about` - About the project

## Customization

### Colors

Edit `tailwind.config.js` to customize the primary color scheme:

```javascript
colors: {
  primary: {
    // Your custom colors
  },
}
```

### API URL

For production, set the API URL:

```bash
VITE_API_URL=https://your-api-url.com
```

## Development

The app uses:
- Hot Module Replacement (HMR) for instant updates
- Tailwind CSS for utility-first styling
- React Router for client-side routing
- Axios for API calls

## License

ISC

