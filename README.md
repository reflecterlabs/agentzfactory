# AgentzFactory Web

🚀 **AI-Powered Web Builder** - Build websites with AI magic. Generate and deploy web apps in seconds.

![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Cloudflare](https://img.shields.io/badge/Cloudflare-F38020?style=for-the-badge&logo=Cloudflare&logoColor=white)

## ✨ Features

- **AI-Powered Generation** - Describe your app in plain English
- **Instant Deploy** - One-click deploy to Cloudflare Pages
- **Supabase Integration** - Built-in queue system with real-time updates
- **Modern Stack** - Vite + React + TypeScript + Tailwind CSS

## 🛠️ Tech Stack

- **Framework:** [Vite](https://vitejs.dev/) + [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Deploy:** [Cloudflare Pages](https://pages.cloudflare.com/)
- **Queue:** [Supabase](https://supabase.com/)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/agentzfactory/web.git
cd web

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## 📝 Development

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Deploy to Cloudflare Pages
npm run deploy
```

## 🌐 Deployment

This project is configured to deploy on [Cloudflare Pages](https://pages.cloudflare.com/).

### Manual Deploy

```bash
# Login to Cloudflare (first time only)
npx wrangler login

# Deploy
npm run deploy
```

### Automatic Deploy (GitHub Actions)

To set up automatic deployments on push to main:

1. Add `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` to your GitHub repository secrets
2. Push to main branch

## 🏗️ Project Structure

```
agentzfactory-web/
├── src/
│   ├── App.tsx           # Main application component
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles with Tailwind v4
├── index.html            # HTML entry point
├── vite.config.ts        # Vite configuration
├── wrangler.toml         # Cloudflare Pages config
├── package.json
└── README.md
```

## 🎨 Design System

### Colors
- Background: `#0a0a0a` (near black)
- Surface: `#141414` (dark gray)
- Accent: `#7c3aed` (violet)
- Accent Light: `#a78bfa` (light violet)
- Text Primary: `#ffffff`
- Text Secondary: `#a1a1aa`

### Gradients
- Primary: `linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #06b6d4 100%)`

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

---

Built with ❤️ by AgentzFactory
