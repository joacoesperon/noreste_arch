# GEMINI.md - Project Context

## Project Overview
**norestearch** is the official portfolio website for an architecture studio. It is designed with a minimalist and elegant aesthetic to showcase architectural projects through high-quality visual content.

### Core Technology Stack
- **Framework**: Next.js 15+ (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion, GSAP
- **Utilities**: Lenis (Smooth Scroll), Swiper (Sliders), Fancyapps/ui (Lightbox)
- **Data Source**: Local JSON file (`content/projects.json`)
- **Admin Panel**: Custom interface at `/admin` for project and image management

### Architecture & Data Flow
- **Projects**: Project metadata is stored in `content/projects.json`.
- **Images**: Project-specific images are organized in `public/projects/[slug]/` under `exterior/` and `interior/` directories.
- **Admin**: The admin panel uses API routes (`src/app/api/`) to write updates directly to the filesystem (JSON and image uploads).
- **Deployment Note**: Due to filesystem persistence requirements for the admin panel, a VPS is recommended over serverless platforms like Vercel (unless an external CMS or storage is implemented).

---

## Building and Running

### Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```
The application will be available at `http://localhost:3000`.

### Production
```bash
# Generate production build
npm run build

# Start production server
npm run start
```

### Code Quality
```bash
# Run ESLint
npm run lint

# Check Types
npm run type-check
```

---

## Development Conventions

### File Structure (Current & Target)
The project follows a standard Next.js App Router structure with a focus on component modularity:
- `src/app/`: Routes and API endpoints.
- `src/components/`: Reusable UI components.
- `src/lib/`: Core logic, data fetching (from JSON), and utilities.
- `content/`: Data storage (JSON).
- `public/`: Static assets and project images.

### Naming & Style
- **Components**: `PascalCase` (e.g., `ProjectCard.tsx`)
- **Hooks**: `camelCase` with `use` prefix (e.g., `useTenueAnimation.ts`)
- **Utilities**: `camelCase` (e.g., `projects.ts`)
- **Tailwind**: Follow standard class ordering (Layout -> Box Model -> Typography -> Visuals).

### Image Optimization
Crucial for an architecture portfolio:
- Always use `next/image` for automatic optimization.
- Support formats: `image/avif`, `image/webp`.
- Use `placeholder="blur"` for progressive loading.
- Categorize images into `exterior` (context/volume) and `interior` (space/materiality) to maintain narrative flow.

### Key Components
- `HomeFeedRefactored`: The main landing page project grid with specialized animations.
- `ProjectClient`: Client-side wrapper for individual project pages.
- `Header/Footer`: Persistent site navigation.

---

## Admin Access
- **Path**: `/admin`
- **Password**: Defined in the admin logic (refer to `ADMIN_GUIA.md` for current credentials).
- **Functionality**: Create/Edit/Delete projects, upload and sort images (uses `dnd-kit`).
