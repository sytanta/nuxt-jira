# 🚀 Jira Clone - Vue 3/Nuxt 3 Project Management Platform

A modern, full-featured project management application built with Vue 3, Nuxt 3 and is fully typed with TypeScript. This Jira-inspired clone provides comprehensive project tracking, team collaboration, and workflow management capabilities.

## ✨ Features

### 🏢 **Workspaces**

- Create and manage multiple workspaces
- Workspace-specific settings and configurations
- Team collaboration within isolated environments

### 📊 **Projects**

- Hierarchical project organization
- Project settings and configurations

### ✅ **Task Management**

- Create, assign, and track tasks
- Priority levels and status management

### 📋 **Multiple Views**

- **Kanban Board**: Drag-and-drop task management
- **Data Table**: Sortable and filterable task lists
- **Calendar View**: Timeline and deadline visualization

### 👥 **Team Collaboration**

- ✉️ **Invite System**
- **User Roles & Permissions**: Admin & Member access levels

### ⚙️ **Settings & Configuration**

- Workspace settings and preferences
- Project-specific configurations
- Member management

### 🖼️ **Media Management**

- Avatar uploads for workspaces & projects

### 🔒 **Authentication**

- GitHub OAuth integration
- Email/password authentication
- Secure session management

### 📱 **Responsive Design**

- Mobile-first approach
- Tablet and desktop optimized

## 🛠️ Tech Stack

- **Frontend Framework**: [Nuxt 3](https://nuxt.com/) with Vue 3 Composition API
- **Language**: TypeScript for type safety
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Shadcn UI](https://www.shadcn-vue.com/)
- **Backend**: [Appwrite](https://appwrite.io/) for backend services
- **Deployment**: [Vercel](https://vercel.com/) for seamless hosting
- **State Management**: Pinia & provide/inject for state management
- **Data Fetching**: @tanstack/vue-query
- **Authentication**: Appwrite Auth with email/password & GitHub OAuth

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Appwrite account and project setup

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/sytanta/nuxt-jira.git
cd nuxt-jira
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
```

3. **Environment Setup**
   Create a `.env` file in the root directory:

```env
# Appwrite Configuration
APPWRITE_KEY=
PUBLIC_APPWRITE_ENDPOINT=
PUBLIC_APPWRITE_PROJECT=
PUBLIC_APPWRITE_DATABASE_ID=
PUBLIC_APPWRITE_WORKSPACES_ID=workspace_collection_id
PUBLIC_APPWRITE_PROJECTS_ID=project_collection_id
PUBLIC_APPWRITE_MEMBERS_ID=member_collection_id
PUBLIC_APPWRITE_TASKS_ID=task_collection_id
PUBLIC_APPWRITE_IMAGES_BUCKET_ID=images_bucket_id

# Site Configuration
PUBLIC_SESSION_COOKIE_NAME=
PUBLIC_SITE_URL=http://localhost:3000
```

4. **Appwrite Setup**

- Create collections for: workspaces, projects, tasks, members, tasks
- Set collections' permissions
- Set up storage buckets for file uploads
- Configure GitHub oauth authentication provider

5. **Run Development Server**

```bash
npm run dev
# or
yarn dev
```

Visit `http://localhost:3000` to see your application.

## 🔧 Key Features Implementation

### Kanban Board

Drag-and-drop functionality using Vue.Draggable with real-time updates to Appwrite database.

### Calendar Integration

Built with a customized Full Calendar component showing tasks.

### File Upload System

Integrated with Appwrite Storage for secure image uploads.

## 🚢 Deployment

### Vercel Deployment

1. **Connect Repository**
   - Import your repository to Vercel
   - Configure build settings (Nuxt 3 preset)

2. **Environment Variables**
   - Add all environment variables in Vercel dashboard
   - Ensure production URLs are updated

3. **Deploy**

## 🎯 Inspiration

This project is inspired by the excellent Next.js tutorial: [Build a Jira Clone](https://www.youtube.com/watch?v=Av9C7xlV0fA) but reimagined with Vue 3 ecosystem and modern development practices.

## 📋 Roadmap

- [ ] Advanced reporting and exports
- [ ] Time tracking functionality
- [ ] Offline mode support
- [ ] Mobile app (Ionic/Capacitor)
- [ ] Integration with external tools (Slack, Discord)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Shadcn UI](https://www.shadcn-vue.com/) for beautiful components
- [Appwrite](https://appwrite.io/) for backend infrastructure
- [Nuxt 3](https://nuxt.com/) team for the amazing framework
- Original Next.js tutorial inspiration

## 📞 Support

If you have any questions or need help with setup, please open an issue.

---

**Happy coding! 🎉**
