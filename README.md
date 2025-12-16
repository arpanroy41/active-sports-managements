# 🏆 Active Sports Management System

A modern sports tournament management system for organizing office sports events with automated player matching, bracket visualization, and real-time updates.

## ✨ Features

- **Excel Import** - Bulk import player data from spreadsheets
- **Tournament Creation** - Create tournaments for various sports
- **Automated Matchmaking** - Randomized player pairing with bracket generation
- **Match Management** - Set winners and advance players through rounds
- **Live Bracket View** - Visual tournament progression (Quarterfinals → Finals)
- **Multi-team Support** - Players from different teams can compete
- **Role-Based Access** - Admin dashboard for management, player view for participants

## 🚀 Tech Stack

- **Frontend**: React 18.3.1 with PatternFly 6.4.0+
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Authentication**: JWT (built into Supabase)
- **Build Tool**: Vite
- **Hosting**: Vercel

## ⚡ Quick Start

### Prerequisites
- Node.js 16+
- Supabase account (sign up at supabase.com)

### Installation

```bash
# 1. Clone and install
git clone https://github.com/arpanroy41/active-sports-management.git
cd active-sports-management
npm install

# 2. Setup Supabase
# - Create project at supabase.com
# - Go to SQL Editor
# - Run: supabase-schema.sql
# - Copy Project URL and anon key from Settings → API

# 3. Configure environment
cat > .env << EOF
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
EOF

# 4. Start development server
npm run dev
```

Open http://localhost:5173

### Create Admin Account

1. Sign up through the app
2. In Supabase SQL Editor, run:
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
   ```
3. Log out and log back in to get admin access (JWT will be updated automatically)

## 🚀 Deployment

Deploy to Vercel:

```bash
npm install -g vercel
vercel
```

Set environment variables in Vercel dashboard:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## 🔒 Security Note

The project uses `xlsx` package which has a reported vulnerability. This is safe for this use case because:
- Excel upload is admin-only (authenticated, trusted users)
- Files are processed client-side in the browser
- No public file upload endpoint
- Internal office use with controlled environment

## 📝 License

MIT License - See [LICENSE](LICENSE) for details.

## 🙏 Support

- **Issues**: [GitHub Issues](https://github.com/arpanroy41/active-sports-management/issues)
- **Email**: arpanroy41@gmail.com

---

Made with ❤️ for better sports management
