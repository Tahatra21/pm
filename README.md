# Worktion

Worktion is a modern, high-performance Project Management dashboard designed to handle complex workflows, team health tracking, and project timelines with a clean, "AstroVista" aesthetic.

## Features

- **Dashboard**: A comprehensive overview of team productivity, workload balance, project stats, and upcoming schedules.
- **Project Timeline**: A Gantt-style chart for visualizing multi-day/multi-month project tasks.
- **Kanban Boards**: Drag-and-drop task management for various project streams.
- **Inbox & Notifications**: Keep track of unread messages and task updates.
- **User Settings**: Customizable user preferences, timezone settings, and dark/light modes.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/) / Radix UI
- **Database**: SQLite / Prisma (for local and rapid development)
- **Icons**: [Lucide React](https://lucide.dev/)

## Getting Started

1. **Clone the repository:**
   ```bash
   git clone git@github.com:Tahatra21/pm.git
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up the database:**
   *(Ensure you have Prisma configured locally)*
   ```bash
   npx prisma generate
   npx prisma db push
   # Optional: Seed the database
   npm run seed
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## License

Private repository. All rights reserved.
