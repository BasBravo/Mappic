# 🗺️ Mappic

**Design your world.**

Mappic is a creative web application that lets you generate beautiful, fully customizable map-based poster designs. Choose any location in the world, customize every detail with multiple styles and themes, and export print-ready designs.

With Mappic, you can create stunning visual representations of your favorite places, perfect for home decor, gifts, or personal projects.

---

## ✨ Features

- 🌍 **Interactive Map Rendering** — Any city or coordinate in the world
- 🎨 **Full Style Customization** — Colors, compositions, themes, and textures
- 🖼️ **Print-Ready Export** — High-quality poster layouts ready to print
- ⚡ **Fast & Responsive UI** — Built with Nuxt 4 + Vue 3 for optimal performance
- 💾 **Real-time Preview** — Instant visual feedback while designing
- 📁 **File Management** — Upload, organize, and manage your designs
- 🔐 **Firebase Integration** — Secure cloud storage and authentication
- 🌐 **Multi-language Support** — English, Spanish, and Chinese

---

## 🚀 Live Demo

👉 [https://mappic.app](https://mappic.app)

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** Nuxt 4 (Vue 3 + Composition API)
- **Language:** TypeScript 5
- **Styling:** TailwindCSS + Nuxt UI
- **Icons:** Tabler Icons
- **State Management:** Pinia
- **Validation:** Zod

### Backend & Services
- **Backend:** Firebase (Serverless)
  - **Database:** Firestore (NoSQL)
  - **Storage:** Firebase Storage (File uploads)
  - **Authentication:** Firebase Auth
- **API Layer:** Centralized services in `shared/services/`

### Development & Deployment
- **Package Manager:** npm / pnpm
- **Build Tool:** Nuxt (Vite)
- **Testing:** Vitest
- **Linting:** ESLint + Prettier
- **Deployment:** Vercel / Firebase Hosting

---

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or pnpm

### Clone & Setup

```bash
# Clone the repository
git clone https://github.com/BasBravo/Mappic.git
cd Mappic

# Install dependencies
npm install
# or
pnpm install
```

### Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Firebase Configuration
NUXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NUXT_PUBLIC_FIREBASE_PROJECT_ID=mappic-f4060
NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET=mappic-f4060.firebasestorage.app
NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NUXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

See `.env.example` for all available options.

---

## 🚀 Development

### Start Development Server

```bash
npm run dev
# or
pnpm dev
```

The application will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
# or
pnpm build
```

### Preview Production Build

```bash
npm run preview
# or
pnpm preview
```

### Run Tests

```bash
# Unit tests
npm run test:unit

# Component tests
npm run test:nuxt

# All tests
npm run test
```

### Code Quality

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Type checking
npm run typecheck

# Full validation (pre-push)
npm run validate
```

---

## 🏗️ Architecture

### Project Structure

```
mappic/
├── app/                          # Nuxt application
│   ├── components/               # Reusable UI components
│   ├── composables/              # Business logic hooks
│   ├── pages/                    # Route pages
│   ├── layouts/                  # Layout templates
│   ├── plugins/                  # Nuxt plugins
│   ├── middleware/               # Route middleware
│   └── utils/                    # Utility functions
│
├── shared/
│   └── services/                 # Firebase services layer
│       ├── file.ts               # File operations
│       ├── map.ts                # Map operations
│       ├── auth.ts               # Authentication
│       └── ...                   # Other services
│
├── stores/                       # Pinia stores (global state)
├── types/                        # TypeScript type definitions
├── helpers/                      # Helper functions
├── public/                       # Static assets
├── nuxt.config.ts                # Nuxt configuration
├── tsconfig.json                 # TypeScript configuration
└── tailwind.config.js            # Tailwind CSS configuration
```

### Architecture Pattern

```
Components (UI)
    ↓ uses
Composables (Business Logic)
    ↓ uses
Stores (State) + Services (Firebase)
    ↓ uses
Firebase (Firestore + Storage)
```

**Key Principles:**
- ✅ Components are UI-focused, no business logic
- ✅ Composables orchestrate services and stores
- ✅ Services are pure functions with explicit parameters
- ✅ Stores manage global state immutably
- ✅ Automatic URL normalization from Firebase
- ✅ Centralized error handling

### Services Layer

All Firebase operations are centralized in `shared/services/`:

- **file.ts** — File CRUD operations with URL normalization
- **map.ts** — Map CRUD operations with reference handling
- **auth.ts** — Authentication and user management
- **config.ts** — Configuration and constants

Services automatically normalize Firebase Storage URLs to ensure consistency across the application.

---

## 📚 Documentation

- **[AGENTS.md](./AGENTS.md)** — Comprehensive coding guidelines and patterns
- **[Memory Bank](./.windsurf/memory-bank/)** — Architecture and technical documentation
  - `projectbrief.md` — Project overview and goals
  - `productContext.md` — Product features and data structure
  - `systemPatterns.md` — Architecture and design patterns
  - `techContext.md` — Technical stack and configuration
  - `activeContext.md` — Current state and decisions
  - `progress.md` — Development progress and roadmap

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork the repository** and create a feature branch
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Follow the coding standards** in [AGENTS.md](./AGENTS.md)
   - Use TypeScript for type safety
   - Follow the component/composable/service pattern
   - Use TailwindCSS for styling
   - Use Tabler Icons for icons

3. **Write tests** for new features
   ```bash
   npm run test
   ```

4. **Validate your code** before pushing
   ```bash
   npm run validate
   ```

5. **Create a Pull Request** with a clear description of changes

### Development Workflow

```bash
# Create feature branch
git checkout -b feature/amazing-feature

# Make changes and commit
git add .
git commit -m "feat: add amazing feature"

# Push to your fork
git push origin feature/amazing-feature

# Create Pull Request on GitHub
```

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.

You are free to use, modify, and distribute this software for any purpose, commercial or personal.

---

## 👨‍💻 Author

**BasBravo**
- GitHub: [@BasBravo](https://github.com/BasBravo)
- Project: [Mappic](https://github.com/BasBravo/Mappic)

---

## 🙏 Acknowledgments

- Built with [Nuxt 4](https://nuxt.com)
- Powered by [Firebase](https://firebase.google.com)
- Styled with [TailwindCSS](https://tailwindcss.com) + [Nuxt UI](https://ui.nuxt.com)
- Icons from [Tabler Icons](https://tabler.io/icons)

---

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/BasBravo/Mappic/issues)
- **Discussions:** [GitHub Discussions](https://github.com/BasBravo/Mappic/discussions)
- **Documentation:** See [AGENTS.md](./AGENTS.md) and [Memory Bank](./.windsurf/memory-bank/)

---

## 🎯 Roadmap

- [ ] Advanced map styling options
- [ ] Batch export functionality
- [ ] Collaboration features
- [ ] Mobile app version
- [ ] API for third-party integrations
- [ ] Performance optimizations
- [ ] Additional language support

---

**Made with ❤️ by BasBravo**

*Design your world with Mappic.*
