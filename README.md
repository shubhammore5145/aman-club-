# Aman Sport Club | Premium Gym Management SaaS Platform

A multi-tenant, enterprise-grade Gym Management Software-as-a-Service (SaaS) platform built with **React**, **TypeScript**, **Tailwind CSS**, **Framer Motion**, and **Supabase (PostgreSQL & Row Level Security)**.

The platform is designed for commercial fitness enterprises, with **Aman Sport club** as the flagship tenant, offering complete data isolation, automated membership workflows, live biometric/QR check-in turnstiles, GST-compliant tax invoicing, and trainer performance tracking.

---

## 🌟 Key Architecture & Capabilities

### 1. Multi-Tenant SaaS Architecture
- **Tenant Isolation**: Every gym record (`members`, `payments`, `attendance`, `workout_plans`, `expenses`, `equipment`) is strictly keyed by `gym_id`.
- **4 Distinct Roles**:
  1. **Super Admin**: Master platform overview, gym provisioning, suspension/activation, SaaS subscription tiers (Free, Basic, Pro, Enterprise), platform MRR.
  2. **Gym Owner (Aman Singh)**: Full club operations, member registrations, package pricing, P&L expenses, real PDF tax receipts.
  3. **Head Trainer (Vikram Sharma)**: Trainee assignments, custom workout routines, diet charts, check-in validation.
  4. **Gym Member (Rahul Verma)**: Self-service fitness hub, high-resolution contactless QR badge pass, workout schedules, payment history.

### 2. Contactless Turnstile & QR Attendance
- **Live Laser QR Scanner**: Viewfinder with duplicate check-in prevention for same-day sessions.
- **Digital Member Pass**: High-resolution SVG QR badges with member code (e.g. `AMAN-001`), validity countdown, and 1-click WhatsApp card sharing.

### 3. Automated Invoicing & PDF Receipts
- **Client-side PDF Generation**: Branded, GST-compliant tax invoices via `jsPDF` with club logo, line-item breakdowns, tax numbers, and signatory verification stamps.
- **WhatsApp Web Integration**: Direct payment confirmation sharing with pre-filled WhatsApp link templates.

### 4. P&L and Business Intelligence
- Real-time financial calculations (Gross Revenue, Outflows/Expenses, Net Profit).
- Recharts visualizations: 6-month revenue trends, weekly attendance heatmaps, and expense distribution by category.

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 18+ (tested on Node v22.18.0)
- npm or pnpm

### Installation & Run

```bash
# 1. Clone repository
git clone <repo-url>
cd "aman gym"

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

The application will be accessible at `http://localhost:5173`.

---

## 🗄️ Supabase PostgreSQL Setup & Migrations

The platform includes full SQL migrations and seed data for live Supabase deployment:

1. Create a project at [supabase.com](https://supabase.com).
2. Navigate to **SQL Editor** in your Supabase Dashboard.
3. Run the migration script:
   - [supabase/migrations/20261112000000_init_gym_saas.sql](file:///c:/Users/shubh/Desktop/aman%20gym/supabase/migrations/20261112000000_init_gym_saas.sql)
4. (Optional) Run the seed script for Aman Sport club:
   - [supabase/seed.sql](file:///c:/Users/shubh/Desktop/aman%20gym/supabase/seed.sql)
5. Add your Supabase credentials to `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

*Note: If no Supabase credentials are provided, the platform automatically runs in Dual-Mode Local Storage Sync, providing zero-configuration interactive access.*

---

## 🎭 Role Simulation Bar

The interface features an interactive **Role Simulator Bar** fixed at the top of the application to test and review all four roles seamlessly:
- Click **Super Admin** to inspect multi-tenant metrics, manage gyms, and review SaaS subscriptions.
- Click **Gym Owner** to manage Aman Sport club, add members, record payments, and download receipts.
- Click **Trainer** to manage assigned athletes and track shift schedules.
- Click **Member** to view the personalized athlete portal and scan the QR pass.

---

## 🛠️ Tech Stack Breakdown

| Layer | Technologies |
|---|---|
| **Frontend Framework** | React 18, TypeScript, Vite |
| **Styling & Design System** | Tailwind CSS (Dark Charcoal & Athletic Orange) |
| **Icons & Micro-interactions** | Lucide React Icons, Framer Motion |
| **Data Visualization** | Recharts (Area, Bar, Pie charts) |
| **Hardware & Media Integrations** | `qrcode.react`, `jspdf`, `canvas-confetti` |
| **Database & Auth** | Supabase Cloud, PostgreSQL, Row Level Security (RLS) |
| **Deployment Target** | Vercel / Supabase Cloud |

---

## 🏢 Tenancy Isolation Policy

```sql
-- RLS Gym-isolation rule example:
CREATE POLICY "Gym owners & trainers can manage members in their gym"
  ON public.members FOR ALL
  USING (gym_id = public.get_user_gym_id() OR public.is_super_admin());
```
Members, payments, workouts, and expenses are strictly segregated by `gym_id`. Gym A cannot read or modify Gym B's data under any condition.
