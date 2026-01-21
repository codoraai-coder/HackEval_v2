# Hackathon Management System - Admin Dashboard

A powerful and clean Admin Dashboard UI for a Hackathon Management System, styled with GLA University's color scheme. This React-based application provides comprehensive tools for managing hackathon events, teams, judges, scores, and mentors.

## 🎨 Design Features

- **GLA University Color Scheme**: Dark green (#1B4332), white background, and light green (#B7E4C7)
- **Modern UI**: Clean, minimalist design with flat modern layout
- **Responsive Design**: Fully responsive across all devices
- **Card-based Structure**: Organized information in clean card layouts
- **Professional Typography**: Clear sans-serif fonts (Inter)
- **Soft Shadows**: Subtle depth and visual hierarchy

## 🚀 Features

### 📊 Dashboard
- Overview statistics and key metrics
- Recent activities feed
- Upcoming events timeline
- Quick action buttons

### 📅 Round Scheduler
- Create and manage hackathon rounds
- Set start/end times and upload deadlines
- Round status management (Draft/Live/Completed)
- List and calendar view options
- Add/edit round details with modal forms

### 👥 Judge Assignment
- Assign judges to teams
- Filter by category and problem statements
- Judge availability management
- Team-judge assignment tracking
- Judge recommendations based on expertise

### 📈 Score Compiler
- View per-team scorecards
- Average scores and qualifications
- Score breakdown by categories (Innovation, Technical, Presentation, Feasibility)
- Export functionality
- Detailed scorecard modals with visual score bars

### 🏆 Leaderboard
- Overall and category-wise rankings
- Rank changes and trends
- Publish/unpublish functionality
- Export leaderboard data
- Top 3 teams with special styling

### 👨‍🏫 Mentor Management
- Add/edit mentor profiles
- Toggle availability status
- Assign mentors to teams
- Mentor expertise categorization
- Contact information and bio management
- Mentor statistics and ratings

## 🛠️ Technology Stack

- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and development server
- **React Router** - Client-side routing
- **Lucide React** - Beautiful icons
- **CSS3** - Custom styling with CSS variables
- **Responsive Design** - Mobile-first approach

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hackathon-admin-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 🏗️ Project Structure

```
├── src/
│   ├── components/
│   │   ├── Dashboard.jsx          # Main dashboard component
│   │   ├── RoundScheduler.jsx     # Round management
│   │   ├── JudgeAssignment.jsx    # Judge-team assignments
│   │   ├── ScoreCompiler.jsx      # Score management
│   │   ├── Leaderboard.jsx        # Rankings and leaderboard
│   │   ├── MentorManagement.jsx   # Mentor profiles
│   │   ├── Sidebar.jsx           # Navigation sidebar
│   │   ├── Header.jsx            # Top header
│   │   ├── Sidebar.css          # Sidebar styles
│   │   └── Header.css           # Header styles
│   ├── App.jsx                   # Main app component
│   ├── App.css                  # App-specific styles
│   ├── main.jsx                 # React entry point
│   └── index.css                # Global styles
├── index.html                   # Main HTML file
├── vite.config.js              # Vite configuration
├── package.json                # Dependencies and scripts
└── .eslintrc.cjs              # ESLint configuration
```

## 🎯 Key Components

### Sidebar Navigation
- GLA University branding
- Icon-based navigation
- Active state indicators
- Responsive mobile menu

### Dashboard Cards
- Statistics overview
- Color-coded metrics
- Trend indicators
- Quick access actions

### Data Tables
- Sortable columns
- Search and filter functionality
- Responsive design
- Action buttons

### Modal Forms
- Add/edit functionality
- Form validation
- Responsive design
- Clean user experience

## 🎨 Color Palette

- **Primary Dark**: #1B4332 (Dark Green)
- **Primary Light**: #B7E4C7 (Light Green)
- **White**: #FFFFFF
- **Success**: #10B981 (Green)
- **Warning**: #F59E0B (Orange)
- **Error**: #EF4444 (Red)
- **Info**: #3B82F6 (Blue)

## 📱 Responsive Design

The dashboard is fully responsive and optimized for:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🔧 Customization

### Adding New Features
1. Create new component in `src/components/`
2. Add route in `App.jsx`
3. Add navigation item in `Sidebar.jsx`
4. Style with CSS variables

### Modifying Colors
Update CSS variables in `src/index.css`:
```css
:root {
  --primary-dark: #1B4332;
  --primary-light: #B7E4C7;
  /* ... other colors */
}
```

## 📊 Data Management

The application currently uses mock data. To integrate with a backend:

1. Replace mock data arrays with API calls
2. Add state management (Redux/Context)
3. Implement error handling
4. Add loading states

## 🚀 Development & Build

### Development
```bash
npm run dev          # Start development server
npm run lint         # Run ESLint
```

### Production Build
```bash
npm run build        # Build for production
npm run preview      # Preview production build
```

### Deploy to Netlify/Vercel
1. Connect your repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🎓 GLA University

This dashboard is designed specifically for GLA University's hackathon management needs, featuring the university's official color scheme and branding elements.

---

**Built with ❤️ for GLA University Hackathon Management** 