# Resume Matcher — Project Overview

**Version:** Frontend 1.2.0 ("Nightvision") / Backend 2.0.0  
**License:** Apache 2.0  
**Repository:** [github.com/srbhr/Resume-Matcher](https://github.com/srbhr/Resume-Matcher)  
**Website:** [resumematcher.fyi](https://resumematcher.fyi)  
**Creator:** [Saurabh Rai](https://srbhr.com)

---

## What It Does

Resume Matcher is an **open-source, AI-powered web application** that helps job seekers create **tailored, job-specific resumes** from a single master resume. Instead of manually rewriting a resume for every job application, users upload one master resume, paste in a job description, and the application uses a large language model (LLM) to:

- Analyze the job description against the master resume
- Suggest targeted improvements (wording changes, keyword insertion, structural tweaks)
- Generate a custom cover letter and outreach message
- Score keyword matching between the resume and job description
- Export the final result as a polished PDF

The entire application runs locally or on a server, supports multiple AI providers (including free local models via Ollama), and never requires sending data to third parties unless the user chooses a cloud provider.

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Backend** | Python, FastAPI, Uvicorn | 3.13+, FastAPI 0.128 |
| **Frontend** | Next.js, React, TypeScript | 16.x, 19.x, 5.x |
| **Database** | TinyDB (JSON file) | 4.8 |
| **AI/LLM** | LiteLLM (multi-provider abstraction) | 1.83 |
| **Styling** | Tailwind CSS 4 (Swiss International Style) | 4.x |
| **PDF Export** | Playwright (headless Chromium) | 1.58 |
| **Document Parsing** | MarkItDown, pdfminer, python-docx | — |
| **Rich Text Editor** | TipTap | 3.20 |
| **Drag & Drop** | dnd-kit | 6.x/10.x |
| **Testing (Backend)** | pytest, pytest-asyncio, httpx | — |
| **Testing (Frontend)** | Vitest, Testing Library, jsdom | — |
| **Containerization** | Docker (multi-stage), Docker Compose | — |
| **Python Package Mgmt** | uv (Astral) | — |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  Browser                                                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Next.js 16 Frontend (React 19, TypeScript, Tailwind 4) │  │
│  │                                                          │  │
│  │  Pages:  Dashboard │ Builder │ Tailor │ Settings         │  │
│  │  Components: Resume templates, Rich editor, Diff viewer  │  │
│  └──────────────────────┬───────────────────────────────────┘  │
│                          │                                      │
│                          │ /api/v1/* (proxied by Next.js)       │
│                          ▼                                      │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│  Python FastAPI Backend                                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Routers:   health │ config │ resumes │ jobs │ enrichment│  │
│  │  Services:  parser │ improver │ refiner │ cover_letter   │  │
│  │  Prompts:   15+ LLM prompt templates                     │  │
│  └──────────────────────┬───────────────────────────────────┘  │
│                          │                                      │
│              ┌───────────┼──────────────┐                      │
│              ▼           ▼              ▼                      │
│  ┌──────────────┐ ┌────────────┐ ┌──────────────────┐         │
│  │  TinyDB      │ │ LiteLLM   │ │  Playwright      │         │
│  │  (JSON file) │ │ Router    │ │  (PDF renderer)   │         │
│  └──────────────┘ └─────┬──────┘ └──────────────────┘         │
│                          │                                      │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
              ┌─────────────────────┐
              │  AI Providers:      │
              │  ─────────────────  │
              │  • Ollama (local)   │
              │  • OpenAI           │
              │  • Anthropic        │
              │  • Google Gemini    │
              │  • OpenRouter       │
              │  • DeepSeek         │
              │  • OpenAI-compatible │
              └─────────────────────┘
```

The frontend and backend run as a single service. Next.js rewrites `/api/*` requests to the FastAPI backend. In production (Docker), both run on port 3000 with the API proxied under `/api/`.

---

## Directory Structure

```
Resume-Matcher/
├── apps/
│   ├── backend/               # Python FastAPI backend
│   │   ├── app/
│   │   │   ├── main.py        # FastAPI entry point, CORS, routers
│   │   │   ├── config.py      # Pydantic-settings + JSON config
│   │   │   ├── database.py    # TinyDB wrapper (resumes, jobs, improvements)
│   │   │   ├── llm.py         # LiteLLM integration, Router, health checks
│   │   │   ├── pdf.py         # Playwright PDF rendering
│   │   │   ├── routers/       # API route handlers
│   │   │   │   ├── health.py
│   │   │   │   ├── config.py       # LLM config, features, i18n, API keys
│   │   │   │   ├── resumes.py      # Resume CRUD, improve, preview, export
│   │   │   │   ├── jobs.py         # Job description upload
│   │   │   │   └── enrichment.py   # AI enrichment wizard
│   │   │   ├── services/      # Business logic
│   │   │   │   ├── parser.py       # Document parsing (PDF/DOCX → JSON)
│   │   │   │   ├── improver.py     # Diff-based resume improvement
│   │   │   │   ├── refiner.py      # Multi-pass refinement
│   │   │   │   └── cover_letter.py # Cover letter/outreach generation
│   │   │   ├── schemas/       # Pydantic models
│   │   │   └── prompts/       # LLM prompt templates
│   │   ├── data/              # Runtime data (config.json, database.json)
│   │   └── tests/
│   └── frontend/              # Next.js 16 React frontend
│       ├── app/               # App Router pages
│       │   ├── (default)/     # Route group (dashboard, builder, tailor, settings)
│       │   │   ├── dashboard/ # Master resume upload + tailored list
│       │   │   ├── builder/   # Resume builder (drag-drop, rich text, templates)
│       │   │   ├── tailor/    # Job description input + AI tailoring
│       │   │   └── settings/  # LLM provider, API keys, i18n, prompts
│       │   ├── print/         # Print/render pages (PDF generation)
│       │   └── css/globals.css
│       ├── components/        # Reusable React components
│       │   ├── ui/            # Base UI (button, card, dialog, input, etc.)
│       │   ├── builder/       # Resume builder (21+ components)
│       │   ├── resume/        # 4 resume template renderers
│       │   ├── enrichment/    # AI enrichment wizard
│       │   ├── preview/       # Print preview + pagination
│       │   ├── dashboard/     # Dashboard components
│       │   ├── tailor/        # Diff preview modal
│       │   ├── settings/      # Settings panels
│       │   └── common/        # Shared (error boundary, context)
│       ├── lib/               # Utilities
│       │   ├── api/           # API client (resume, config, enrichment)
│       │   ├── i18n/          # Internationalization
│       │   ├── types/         # TypeScript definitions
│       │   ├── context/       # React context (language, status cache)
│       │   └── constants/
│       ├── hooks/             # Custom React hooks
│       ├── messages/          # Translation JSON files (en, es, zh, ja, pt-BR)
│       └── tests/
├── assets/                    # Images, screenshots, demo GIFs
├── docker/                    # Docker support files
├── docs/                      # Documentation
├── .github/                   # CI/CD workflows, issue templates
├── Dockerfile                 # Multi-stage Docker build
└── docker-compose.yml
```

---

## Core Features & Workflows

### 1. Configuration & AI Provider Setup

Before using the application, users configure which LLM provider to use. Supported providers:

| Provider | Type | Cost |
|----------|------|------|
| **Ollama** | Local (fully offline) | Free |
| **OpenAI** | Cloud API | Pay-per-use |
| **Anthropic** | Cloud API | Pay-per-use |
| **Google Gemini** | Cloud API | Free tier available |
| **OpenRouter** | Cloud aggregator | Pay-per-use |
| **DeepSeek** | Cloud API | Low cost |
| **OpenAI-compatible** | Any (llama.cpp, vLLM, LM Studio) | Varies |

Users can also:
- Toggle features on/off (cover letter generation, outreach messages)
- Select UI language and content generation language
- Choose the improvement strategy (nudge, keyword enhance, full tailor)
- Customize cover letter and outreach message prompts
- Test the LLM connection with real-time feedback

### 2. Master Resume Upload (Dashboard)

The starting point. Users upload their comprehensive "master" resume as a PDF or DOCX file.

**Processing pipeline:**
1. File is received by the backend
2. Text is extracted using MarkItDown (or pdfminer/python-docx as fallbacks)
3. The extracted text is sent to the LLM with a structured parsing prompt
4. The LLM returns a structured JSON representation of the resume (sections, entries, bullet points)
5. The parsed resume is stored in TinyDB as the master resume

### 3. Resume Tailoring (Tailor Page)

The core feature. Users paste a job description and the system generates a tailored version.

**Improvement strategies:**
- **Nudge:** Conservative changes — rewords bullet points to better match the job description while preserving factual content
- **Keywords:** Extracts key terms from the job description and injects them naturally into relevant sections
- **Full Tailor:** Aggressive restructuring — rewrites bullet points to closely align with job requirements

**Pipeline:**
1. Job description is uploaded and stored
2. Backend extracts keywords from the JD via LLM
3. A skill target plan maps JD requirements to resume sections
4. The improver service generates targeted diffs (field-level changes)
5. Diffs are returned to the frontend for preview
6. User reviews changes in a diff modal (additions/removals highlighted)
7. User confirms or rejects changes
8. Confirmed changes are saved as a new tailored resume (the master is never modified)

**Truthfulness safeguards:** All improvement prompts include strict instructions never to fabricate experience, education, or skills. The LLM can rephrase and emphasize but not invent.

### 4. Resume Builder (Builder Page)

A full-featured resume editor for fine-tuning tailored resumes.

**Capabilities:**
- **Drag-and-drop** section reordering using dnd-kit
- **Rich text editing** of bullet points via TipTap editor
- **Add/remove sections:** Work Experience, Education, Projects, Certifications, Publications, Skills, Languages, Volunteer, Custom sections
- **4 visual templates:**
  - Classic Single Column
  - Classic Two Column
  - Modern Single Column
  - Modern Two Column
- **Cover letter editor** with live preview
- **Outreach message editor** with live preview
- **Formatting controls:** Font size, bold, italic, bullet styles, spacing
- **Section headers** with toggle visibility

### 5. AI Enrichment Wizard

An interactive feature that helps users improve weak or vague resume content.

**Steps:**
1. **Analyze** — AI scans the resume and identifies sections that lack impact (e.g., generic job descriptions, vague bullet points)
2. **Question** — AI asks targeted questions about the flagged sections (e.g., "What specific metrics can you provide for this role?")
3. **Enhance** — User provides answers, and the AI generates improved descriptions incorporating the new details
4. **Preview** — User reviews the AI-suggested changes in a diff view before applying them

This is particularly useful for users who struggle with quantifying their achievements or writing compelling bullet points.

### 6. PDF Export

Users can export their resume and cover letter as professionally formatted PDFs.

**How it works:**
- The frontend renders a dedicated print page with the chosen template
- Playwright (headless Chromium) captures the page as a PDF
- Supports A4 and Letter paper formats
- Configurable margins
- Falls back to system Chrome/Edge if Playwright browsers are not installed

### 7. Multi-Language Support

| Language | Code | UI | Content Generation |
|----------|------|----|--------------------|
| English | `en` | Full | Full |
| Spanish | `es` | Full | Full |
| Chinese (Simplified) | `zh` | Full | Full |
| Japanese | `ja` | Full | Full |
| Portuguese (Brazilian) | `pt-BR` | Full | Full |

The UI language controls the interface text, while the content language controls the language in which the LLM generates improvements and cover letters.

---

## API Endpoints

All endpoints are under `/api/v1`:

### Health & System
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Lightweight liveness check |
| GET | `/status` | Full system status (LLM health, DB stats) |

### Configuration
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/PUT | `/config/llm-api-key` | Get/update LLM provider config |
| POST | `/config/llm-test` | Test LLM connection |
| GET/PUT | `/config/features` | Feature toggles |
| GET/PUT | `/config/language` | Language settings |
| GET/PUT | `/config/prompts` | Prompt strategy selection |
| GET/PUT | `/config/feature-prompts` | Custom feature prompts |
| GET/POST/DELETE | `/config/api-keys` | Multi-provider API keys |
| POST | `/config/reset` | Reset database |

### Jobs
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/jobs/upload` | Upload job description(s) |
| GET | `/jobs/{job_id}` | Get job description |

### Resumes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/resumes/upload` | Upload and parse a resume |
| GET | `/resumes/` | List all resumes |
| GET | `/resumes/{resume_id}` | Get resume details |
| POST | `/resumes/{resume_id}/improve` | Generate AI improvements |
| POST | `/resumes/{resume_id}/preview` | Preview improvements |
| POST | `/resumes/{resume_id}/confirm` | Confirm and save improvements |
| POST | `/resumes/{resume_id}/regenerate` | Regenerate improvements with instructions |
| GET | `/resumes/{resume_id}/pdf` | Download resume as PDF |
| DELETE | `/resumes/{resume_id}` | Delete a resume |

### Enrichment
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/enrichment/analyze` | Analyze resume for weak content |
| POST | `/enrichment/enhance` | Enhance resume based on user answers |
| POST | `/enrichment/regenerate` | Regenerate section content |

---

## Data Storage

The application uses **TinyDB**, a lightweight document-oriented database stored as a single JSON file at `apps/backend/data/database.json`.

**Tables:**
- **resumes** — Parsed resume data, master/tailored status, metadata
- **jobs** — Job descriptions uploaded by the user
- **improvements** — Generated improvements, diff data, confirmation status

User configuration (API keys, provider settings, feature toggles, language preferences) is stored in `apps/backend/data/config.json`.

No external database server is required. All data stays on the local machine unless the user chooses a cloud AI provider.

---

## Deployment

### Docker (Recommended)
```bash
docker compose up
```
A single container serving both frontend and backend on port 3000. API keys and LLM configuration can be set via environment variables or the settings UI.

### Local Development
```bash
# Backend (from apps/backend/)
uv run uvicorn app.main:app --reload

# Frontend (from apps/frontend/)
npm run dev
```
The frontend dev server proxies `/api` requests to the backend.

---

## Design Philosophy

- **Truthfulness first:** The AI is explicitly instructed never to fabricate experience, education, or skills. It can rephrase, restructure, and de-emphasize but not invent.
- **Privacy by default:** All data is stored locally in a JSON file. The only external calls are to the chosen LLM provider (if not using local Ollama).
- **User in control:** Every AI suggestion is presented as a diff for review. Nothing is applied automatically. Users can accept, reject, or modify each change.
- **Multi-provider flexibility:** Users can choose any LLM provider from free local models to premium cloud APIs, with the same feature set.
- **Accessible:** The application supports 5 languages for both UI and content generation, making it usable for non-English speakers.
