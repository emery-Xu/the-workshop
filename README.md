# The Workshop 🛠️

A personal dashboard for creators — manage tasks, ideas, drafts, and notes in one place.

Built with Next.js 16 + React 19 + Tailwind CSS + shadcn/ui.

![The Workshop](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

## ✨ Features

- **📋 Tasks** — Kanban board with To Do / In Progress / Done columns
- **💡 Ideas** — Card-based idea capture with categories (Tweet / Product / Other)
- **✍️ Drafts** — Tweet draft management with status tracking (Draft / Ready / Posted)
- **📝 Notes** — Two-column notes with search and date picker
- **📱 Mobile** — Responsive design with hamburger menu
- **🔄 Auto-refresh** — 2-second polling for real-time sync
- **🌙 Dark theme** — Linear-inspired dark UI

## 🚀 Quick Start

```bash
# Clone the repo
git clone https://github.com/zohan724/the-workshop.git
cd the-workshop

# Install dependencies
npm install

# Set data directory (optional, defaults to ./data)
# Data is stored as JSON files

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

## 📁 Data Storage

Data is stored as simple JSON files (default: `/Users/jarvis/clawd/data/`).

You can change the path in `src/app/api/*/route.ts`:

```
data/
├── tasks.json
├── ideas.json
├── drafts.json
└── notes.json
```

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **UI:** React 19 + Tailwind CSS 4
- **Components:** shadcn/ui (Radix primitives)
- **Data:** JSON files (no database needed)

## 📖 Story

This project was built in one night by [Jarvis](https://github.com/clawdbot/clawdbot) (an AI assistant) for [@zohanlin](https://twitter.com/zohanlin).

The difference from other AI tools? Jarvis doesn't just give you code — he runs it, debugs it, and iterates until it works. That's what a real AI assistant should do.

## 🤝 Contributing

PRs welcome! Feel free to:
- Add new features
- Improve the UI
- Add more data backends (SQLite, Supabase, etc.)

## 📄 License

MIT © [Zohan Lin](https://twitter.com/zohanlin)

---

Built with ❤️ and 🤖 in Kaohsiung, Taiwan.
