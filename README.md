# 🩺 HealthBuddy — AI-Powered Medical Report Assistant

HealthBuddy is a premium, secure, and user-friendly web application that translates complex medical reports (PDFs) into clear, calm, and actionable plain English. It provides a visual summary dashboard of your health parameters, highlights key findings with status indicators, suggests specific questions to ask your doctor, and hosts an interactive, grounded chat assistant for follow-up questions.

---

## 🌟 Premium Features

*   **📄 Seamless PDF Parsing:** Extracts text securely from medical reports using a lightweight, server-side parsing pipeline.
*   **📊 Visual Findings Dashboard:** Displays a structured, color-coded grid of your parameters:
    *   🟢 **Normal:** Reassurance for values within normal ranges.
    *   🟡 **Notable:** Borderline or mildly out-of-range parameters to monitor.
    *   🔴 **Concerning:** Values significantly out of range that warrant medical attention.
*   **💬 Grounded Chat Assistant (RAG):** Ask follow-up questions about your report. The chatbot is strictly grounded in the document context via a local TF-IDF vector retrieval engine, preventing AI hallucinations.
*   **📋 Doctor Discussion Points:** Generates a list of suggested questions for your next physician consultation.
*   **🌐 Flexible AI Providers:** Swap between **Groq** (free tier Llama models) and **OpenRouter** (Claude, Gemini, etc.) using simple environment variables.
*   **🎨 Premium UI/UX:** A calm, modern health-tech interface built with custom typography, harmonized green palettes, subtle card elevations, and glassmorphism.

---

## 🛠️ Technology Stack

*   **Frontend & Orchestration:** Next.js 15 (App Router, Turbopack, React 18, TypeScript)
*   **Styling:** Tailwind CSS & Lucide React icons
*   **PDF Parsing:** `pdf-parse` v2 (Native TypeScript, node-only fallback)
*   **AI Service Layer:** Groq SDK / OpenRouter API
*   **RAG Engine:** Custom TF-IDF cosine-similarity retriever with an in-memory session store (Map-based with TTL)

---

## 🚀 Setup & Local Installation

### Prerequisites
*   Node.js (v20 or higher recommended)
*   An API Key from [Groq Console](https://console.groq.com) (Default) or [OpenRouter](https://openrouter.ai)

### Steps
1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/yourusername/healthbuddy.git
    cd healthbuddy
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Copy the template file to create `.env.local`:
    ```bash
    cp .env.local.example .env.local
    ```
    Open `.env.local` and enter your keys:
    ```bash
    # Choose provider: "groq" or "openrouter"
    AI_PROVIDER=groq
    
    # If using Groq:
    GROQ_API_KEY=gsk_your_key_here
    GROQ_MODEL=llama-3.3-70b-versatile
    ```

4.  **Run in Development Mode:**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) in your browser.

---

*Disclaimer: HealthBuddy is an educational tool designed to clarify medical reports. It does not provide medical diagnoses, treatment plans, or professional clinical opinions.*
