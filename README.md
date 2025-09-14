# Claude Web Scraper

A powerful web scraper powered by Claude AI that can extract content from any website and transform it into clean markdown or structured JSON data.

![Claude Web Scraper](https://img.shields.io/badge/Powered%20by-Claude%20AI-blue)
![Next.js](https://img.shields.io/badge/Next.js-15.1-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

- 🤖 **AI-Powered Extraction**: Uses Claude's advanced web_fetch tool to intelligently scrape and parse websites
- 📝 **Dual Output Modes**: Get content as clean Markdown or structured JSON
- 🎯 **Custom Extraction**: Define exactly what data you want with natural language prompts
- 🎨 **Beautiful UI**: Clean, modern interface with syntax highlighting
- ⚡ **Fast & Efficient**: Optimized for performance with lightweight dependencies
- 🔄 **Sub-page Crawling**: Automatically follows and extracts content from relevant sub-pages

## Demo

Try it live at: https://claude-web-scraper.vercel.app

## Prerequisites

- Node.js 18+ 
- An Anthropic API key with access to Claude

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/claude-web-scraper.git
cd claude-web-scraper
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Add your Anthropic API key to `.env.local`:
```
ANTHROPIC_API_KEY=your_api_key_here
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Basic Usage

1. Enter a website URL you want to scrape
2. Choose your extraction mode:
   - **Markdown**: Extracts all content as clean markdown
   - **JSON**: Extracts structured data based on your instructions

### JSON Mode

In JSON mode, provide extraction instructions like:
- "Extract product information including name, price, and availability"
- "Get all article titles, authors, and publication dates"
- "Extract company details, services offered, and contact information"

The AI will intelligently identify and structure the requested data.

## API Endpoints

### POST `/api/scrape`

Scrapes a website and returns extracted content.

**Request Body:**
```json
{
  "url": "https://example.com",
  "mode": "json", // or "markdown"
  "prompt": "Extract product details" // optional, for JSON mode
}
```

**Response:**
```json
{
  "success": true,
  "mode": "json",
  "raw_content": [...], // Raw scraped content
  "claude_result": "...", // Processed result (JSON or Markdown)
  "original_url": "https://example.com"
}
```

## Technology Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **AI**: Claude API with web_fetch tool

## Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `ANTHROPIC_API_KEY` | Your Anthropic API key | Yes |

### Customization

You can customize various aspects of the scraper:

- **Max request duration**: Edit `maxDuration` in `/api/scrape/route.ts` (default: 180 seconds)
- **Claude model**: Change the model in the API route (default: claude-sonnet-4-20250514)
- **Max web fetches**: Adjust `max_uses` in the web_fetch tool configuration

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ by [Kadoa](https://kadoa.com)