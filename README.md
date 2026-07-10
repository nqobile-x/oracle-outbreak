# Outbreak Oracle (Prototype)

A disease surveillance dashboard concept: Gemini reads simulated multi-source signals (social media, news, search trends, weather, travel) and produces a structured outbreak risk assessment.

<!-- SCREENSHOT PLACEHOLDER: add a screenshot of the dashboard with an active alert here -->

## Overview

Epidemiologists spotted COVID-era outbreaks in scattered signals long before official announcements: clinic complaints on social media, search spikes for symptoms, local news of a "mystery illness". This prototype explores whether an LLM can do that cross-referencing automatically. It feeds Gemini a bundle of signals for a region and asks for a risk assessment in a strict JSON schema, which then drives a live dashboard with alert levels, a world map, and a spoken briefing.

**Note:** the input data in this prototype is simulated. Each analysis cycle generates a randomized scenario (region plus symptom cluster) to demonstrate the pipeline; it is not connected to real feeds. A more developed version of this concept lives in my [OutbreakOracle](https://github.com/nqobile-x/OutbreakOracle) repo.

## Key features

- **Structured AI risk assessment**: Gemini responds against a typed JSON schema (alert level, risk score, disease hypothesis, location, contributing signals, recommended actions), so the UI never has to parse free text
- **Alert-level dashboard** with five severity tiers from MINIMAL to CRITICAL, each with its own visual treatment
- **World map** that highlights the affected region for the current assessment
- **Spoken briefing**: the assessment can be read aloud using Gemini speech generation
- **Context-aware chatbot** that answers follow-up questions about the current analysis
- **Continuous monitoring loop** that re-runs the analysis on an interval, like a real surveillance system would

## Tech stack

- React 19 + TypeScript
- Vite 6
- `@google/genai` (structured output with response schemas, chat sessions, speech generation)
- SVG world map, Web Audio playback

## How it works

`App.tsx` builds a scenario prompt bundling five signal types for a random region, and `services/geminiService.ts` sends it to Gemini with a `responseSchema` that forces a machine-readable verdict. The typed result flows into the dashboard, map, and chatbot as plain props. The chatbot gets the current analysis injected into its session so its answers stay anchored to what is on screen.

## Setup

Prerequisites: Node.js and a Gemini API key.

1. `npm install`
2. Create `.env.local`:
   ```
   GEMINI_API_KEY=your_key_here
   ```
3. `npm run dev` and open http://localhost:3000

## Usage

The dashboard runs an analysis automatically on load and refreshes on a cycle. Watch the alert level and signals panel change with each simulated scenario, click the speaker icon to hear the briefing, and open the chat to interrogate the current assessment ("why is the risk score 72?").

## What I learned

This was where I learned to stop asking LLMs for prose. Defining a strict response schema turned the model from a text generator into a reliable data source the UI could render deterministically: no regex parsing, no malformed answers. Simulating the input feeds also made the architecture honest about its boundaries, so real data sources could be swapped in later without touching the analysis or UI layers.

## Contact

Portfolio: [nqobile-x.github.io/Nqobille](https://nqobile-x.github.io/Nqobille/)
