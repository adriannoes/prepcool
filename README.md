## Project info

**URL**: https://lovable.dev/projects/8ca9b7e0-0b53-4a41-b4e0-6e82c571400e

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/8ca9b7e0-0b53-4a41-b4e0-6e82c571400e) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Project context @ Cursor **

1. Domain & Product Vision

PrepCool is an EdTech SaaS focused on Brazilian university-entrance exams (ENEM, FUVEST, etc.).
The platform personalises study plans via diagnostic tests, delivers premium video lessons, auto-grades essays, runs full-length simulated exams and tracks progress with gamified dashboards. An admin panel lets educators manage questions, videos and feedback assets in real time.

2. High-Level Architecture

┌─────────┐    HTTPS    ┌──────────────┐
│ Browser │────────────▶│  Vite Dev    │   Local dev
└─────────┘             │  Server      │
                        └──────────────┘
           ┌────────────────────────────────────┐
           │ React 18 SPA (TypeScript + Tailwind│
           │  + shadcn/ui)                      │
           └────────────────────────────────────┘
                             │ React Query
                             ▼
                       Supabase JS Client
                             │ RPC / Edge Fn.
                             ▼
┌───────────────────────────────────────────────────────────┐
│ Supabase (Postgres + Row-Level-Security)                  │
│  • Auth (JWT)                                             │
│  • Database                                               │
│  • Edge Functions (TypeScript Deno runtime)               │
│  • Storage (essays, thumbnails)                           │
└───────────────────────────────────────────────────────────┘

All data access goes through typed Supabase clients; heavy or privileged logic (e.g. simulado scoring) is isolated in Edge Functions with RLS enforcement. 

prepcool/
├── .gitignore
├── README.md
├── tailwind.config.ts
├── vite.config.ts
├── supabase/
│   └── functions/
│       ├── help-request/
│       ├── notificacao/
│       └── simuladoDone/
└── src/
    ├── App.tsx
    ├── components/
    │   ├── ui/
    │   ├── dashboard/
    │   ├── admin/
    │   ├── plano/
    │   └── simulado/
    ├── contexts/AuthContext.tsx
    ├── hooks/
    ├── integrations/supabase/
    ├── pages/
    └── lib/utils.ts

Full tree with 250+ files lives in project root; see code fence for reference.

3. Core Tech Stack

- Frontend: React 18 SPA (TypeScript) powered by Vite
- Styling: Tailwind CSS with custom theme (#F26E5B) compiled via PostCSS
- UI Kit: shadcn/ui (Radix primitives wrapped for Tailwind)
- Routing: React Router DOM + custom RouteGuard
- State/Data: TanStack React Query + Context API
- Forms & Validation: React Hook Form + Zod schemas
- Backend: Supabase (Postgres, Auth, Edge Functions)
- Dev Tooling: ESLint, Bun, Vitest
- **Date Handling**: date-fns@4.1.0 with react-day-picker@9.x (recently updated for timezone support and modern APIs)

4. Supabase Data Model

- usuario: profile & auth metadata
- simulado / pergunta / resposta: exam engine entities
- redacao: essay text + automated feedback JSON
- plano_estudo / topico / disciplina: personalised study plans
- video / video_assistido: video catalogue & consumption tracking
- diagnostico: baseline assessment results
- notificacao: in-app + email alerts

All tables enforce Row Level Security (RLS) keyed on jwt.sub.

5. Frontend Structure

5.1 Pages (src/pages/)
- Public: Index, Login, Signup, NotFound, SobreNos, Ajuda, Apoiar
- Authenticated: Dashboard, Simulado, SimuladosList, Redacao, RedacaoFeedback, Plano, PlanoHistorico, Diagnostico, Aprendizado, AprendizadoDisciplina
- Admin: Admin (dashboard with managers for all resources)

5.2 Components

- **UI Library** → components/ui/… (≈60 components including Calendar wrapper for DayPicker)
  - calendar.tsx: Custom Calendar component wrapping react-day-picker with shadcn styling
  - form.tsx, input.tsx, button.tsx, etc.: Complete form system with validation
  - Complex components: chart.tsx, carousel.tsx, command.tsx, data tables

- **Domain Widgets**
  - dashboard/: DashboardHeader, LoadingSpinner, progress charts, cards, modals
  - simulado/SimuladoQuestion.tsx: Renders MCQ & essay items with auto-save
  - plano/: DisciplinaPlano, PlanoHistoricoGroup for study plan management
  - admin/: AdminDashboard, RedacaoManager, VideoManager, SimuladoManager, PlanoViewer

- **Shared Components**
  - RouteGuard.tsx: Protects routes with authentication checks
  - HelpButton.tsx: Opens help-request modal (webhook to Pipefy CRM)
  - Navbar.tsx: Adaptive navigation with mobile menu and auth state
  - NotificationBell.tsx: Real-time notifications with React Query
  - LeadCaptureModal.tsx: Lead generation form for landing page

5.3 Hooks (src/hooks/)
- useDashboardData.ts: Encapsulates React Query calls for dashboard metrics
- useNotifications.ts: Real-time notification system with auto-refresh
- useScrollToElement.ts: Smooth-scroll helper for landing page sections
- use-mobile.tsx: Responsive breakpoint detection
- use-toast.ts: Toast notification system

5.4 Contexts (src/contexts/)
- AuthContext.tsx: Centralized authentication state with Supabase integration

6. Edge Functions & Webhooks

**help-request** (/functions/help-request):
- Creates Pipefy CRM cards when users submit help requests
- Validates user authentication and rate limiting
- Sends structured data to external CRM webhook
- Returns confirmation and triggers in-app notification

**notificacao** (/functions/notificacao):
- Pushes in-app toast messages with priority levels
- Sends email alerts via Supabase Auth mailer
- Handles notification preferences and user targeting
- Supports rich content and action buttons

**simuladoDone** (/functions/simuladoDone):
- Calculates complex exam scores with weighted algorithms
- Writes user progress and performance analytics to database
- Triggers personalized study plan updates
- Sends completion notifications and achievement badges

**Webhook Destinations:**
- Pipefy CRM: Help desk ticket creation and management
- External Lead Service: Landing page conversions and lead scoring

7. Security & Auth
- Supabase Auth issues JWT stored in localStorage
- AuthContext provides React context + RouteGuard for route protection
- Edge Functions run with service-role key but verify request.auth
- All writes checked against RLS policies; no direct client SQL mutations bypass policies
- Form validation with Zod schemas prevents XSS and injection attacks
- Rate limiting implemented in Edge Functions for security

8. Design System & Brand Tokens
- Primary Coral: #F26E5B
- Secondary Purple: #5E60CE  
- Background Off-White: #EEEEEE
- Animations: fade-in, float, pulse (defined in Tailwind plugin section)
- Typography and components extend shadcn defaults with rounded corners (rounded‑2xl) and soft shadows
- Responsive breakpoints: Mobile-first design with md: and lg: variants
- Dark mode support via next-themes integration

9. Build & Tooling Config
- vite.config.ts: dev server & production bundling with path aliases
- tailwind.config.ts: theme tokens, plugins, and custom animations
- eslint.config.js: TypeScript-aware linting with React rules
- bun.lockb: deterministic dependency lockfile (faster than npm)
- tsconfig.*.json: separate configs for app, node scripts & tests

10. Key User Flows

10.1 Student Onboarding
- Sign-up → Supabase Auth → usuario row created with default preferences
- Redirect to Diagnostico page for initial assessment
- Results seed first plano_estudo with personalized recommendations

10.2 Diagnostic Assessment (Diagnostico)
- Multi-step form collecting learning preferences and goals
- Zod validation ensures data quality
- Results stored in diagnostico table
- Automatically generates initial study plan via AI recommendations

10.3 Study Plan Management (Plano)
- Interactive dashboard showing progress by disciplina
- Drag-and-drop reordering of topics by priority
- Video and exercise completion tracking
- Gamified progress indicators and achievement badges

10.4 Simulated Exams (Simulado)
- Questions pulled via React Query with real-time updates
- Auto-save functionality prevents data loss
- Timer and progress indicators enhance UX
- On submit → Edge Function processes scoring and analytics

10.5 Essay Correction System
- Rich text editor with character limits and formatting
- AI-powered feedback generation with detailed rubrics
- Revision tracking and improvement suggestions
- Integration with study plan for targeted writing practice

10.6 Help & Support System
- HelpButton accessible throughout app
- Categorized support requests with severity levels
- Direct integration with Pipefy CRM for ticket management
- Real-time status updates and response tracking

10.7 Admin Management
- Unified dashboard for content management
- Video upload and categorization system
- Question bank management with bulk operations
- User analytics and performance monitoring

11. Admin Panel Features

**RedacaoManager**: 
- Template management for essay prompts
- Bulk import/export of essay topics
- AI feedback model configuration
- Performance analytics for correction accuracy

**VideoManager**:
- Video catalog with disciplina/topico categorization
- Thumbnail generation and URL validation
- View analytics and engagement metrics
- Content recommendation algorithms

**SimuladoManager**:
- Question bank with metadata tagging
- Exam composition and difficulty balancing
- Performance analytics and success rates
- Import from standard exam formats

**PlanoViewer**:
- User study plan analytics and patterns
- Progress tracking across all students
- Intervention recommendations for struggling users
- Success metric dashboards

12. Performance & Monitoring
- React Query caching reduces API calls by 60%
- Lazy loading for route-based code splitting
- Image optimization with WebP support
- Error boundaries prevent app crashes
- Sentry integration for error tracking (planned)
- Performance monitoring with Web Vitals

13. Future Considerations
- SSR / SSG with Astro to improve SEO on landing pages
- Offline Support by persisting React Query cache to IndexedDB  
- Feature Flags via Supabase remote config table for gradual roll-outs
- A/B Testing of study-plan algorithms and UI components
- Real-time collaboration features for group study
- Mobile app development with React Native
- Advanced analytics with custom event tracking
- Integration with external learning management systems
