# Claude Web Scraper

Extract data from websites using Claude's web_fetch and web_search tools. Convert any website to markdown or structured JSON.

![Next.js](https://img.shields.io/badge/Next.js-15.1-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## What it does

- Extract content from any website URL
- Search the web and extract data from results
- Output as clean markdown or structured JSON
- Use natural language to specify what data to extract

## Demo

https://claude-web-scraper.vercel.app

## Setup

**Requirements:**
- Node.js 18+
- Anthropic API key

**Install:**

```bash
git clone https://github.com/kadoa-org/claude-web-scraper.git
cd claude-web-scraper
npm install
```

**Configure:**

Create `.env.local`:
```
ANTHROPIC_API_KEY=your_api_key_here
```

**Run:**

```bash
npm run dev
```

Open http://localhost:3000

## Usage

**Input options:**
- Website URL: Extract from a specific page
- Web search: Search first, then extract from results

**Output formats:**
- Markdown: Clean formatted text
- JSON: Structured data with custom prompts

**Examples:**

Extract product data:
```
URL: https://example.com/products
Prompt: "Get product names, prices, and availability"
```

Search and extract:
```
Search: "quantum computing news 2024"
Prompt: "Extract titles, dates, and key points"
```

## Tech Stack

- Next.js 15, TypeScript
- Tailwind CSS, shadcn/ui
- Claude API (web_fetch, web_search)

## Development

```bash
npm run dev    # Development server
npm run build  # Production build
npm run lint   # Linting
```

## License

MIT License - see [LICENSE](LICENSE)

---

Made with ❤️ by [Kadoa](https://kadoa.com)