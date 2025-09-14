import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 180;

export async function POST(request: NextRequest) {
  try {
    const { url, mode, schema, prompt: customPrompt, searchQuery } = await request.json();
    
    // Log request details
    console.log(`[Scrape API] Request: ${mode} mode for ${url || 'search: ' + searchQuery}`);
    console.log(`[Scrape API] Has custom prompt: ${!!customPrompt}`);
    console.log(`[Scrape API] Has schema: ${!!schema}`);
    console.log(`[Scrape API] Has search query: ${!!searchQuery}`);
    
    if (!url && !searchQuery) {
      console.log(`[Scrape API] Error: No URL or search query provided`);
      return NextResponse.json(
        { error: 'URL or search query is required' },
        { status: 400 }
      );
    }

    let prompt = '';
    
    if (searchQuery) {
      // Search mode - first search, then extract from results
      if (mode === 'markdown') {
        prompt = `Search for "${searchQuery}" and return the most relevant content as markdown. Focus on recent, high-quality results.`;
      } else {
        prompt = `Search for "${searchQuery}" and extract structured data from the most relevant results. Return ONLY valid JSON.`;
        if (customPrompt) {
          prompt += ` ${customPrompt}`;
        }
      }
    } else if (mode === 'markdown') {
      prompt = `Extract and return all content from ${url} as markdown (nothing else around it). Don't hallucinate or make anything up, just 1:1 content.`;
    } else {
      // JSON mode with URL
      prompt = `Please analyze the content at ${url} and extract structured data. Return ONLY valid JSON, no explanations or text outside the JSON structure.`;
      
      if (schema) {
        prompt += ` Use this exact JSON schema structure: ${schema}`;
      } else if (customPrompt) {
        prompt += ` Extract data based on these instructions: ${customPrompt}. Structure it as clean JSON, only ouput JSON and nothing else.`;
      } else {
        prompt += ` Extract the main content and organize it into a clean JSON format with relevant fields like title, description, content, etc.`;
      }
    }

    console.log(`[Scrape API] Prompt:`, prompt);
    console.log(`[Scrape API] Calling Claude API...`);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'web-fetch-2025-09-10',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 5000,
        messages: [
          {
            role: "user",
            content: prompt
          },
          ...(mode === 'json' && !searchQuery ? [{
            role: "assistant",
            content: "{"
          }] : [])
        ],
        tools: [
          ...(searchQuery ? [{
            type: "web_search_20250305",
            name: "web_search",
            max_uses: 3
          }] : []),
          {
            type: "web_fetch_20250910",
            name: "web_fetch",
            max_uses: 5
          }
        ]
      })
    });

    console.log(`[Scrape API] Claude API response: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Scrape API] Claude API error: ${response.status}`, errorText.substring(0, 500));
      return NextResponse.json(
        { error: `API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Extract raw content from web_fetch tool
    const rawContent = [];
    let claudeResult = '';

    if (data.content && Array.isArray(data.content)) {
      for (const contentBlock of data.content) {
        if (contentBlock.type === 'web_fetch_tool_result') {
          const fetchResult = contentBlock.content;
          if (fetchResult && fetchResult.content && fetchResult.content.source) {
            rawContent.push({
              url: fetchResult.url,
              retrieved_at: fetchResult.retrieved_at,
              content_type: fetchResult.content.source.media_type,
              content: fetchResult.content.source.data
            });
          }
        }
        
        // Get Claude's final analysis/result (last text block)
        if (contentBlock.type === 'text') {
          claudeResult = contentBlock.text;
          
          // For JSON mode, clean up the response
          if (mode === 'json') {
            // Remove markdown code block wrapping if present
            claudeResult = claudeResult.replace(/^```json\s*/i, '').replace(/\s*```\s*$/i, '');
            
            // Prepend the opening brace that was prefilled if needed
            if (claudeResult && !claudeResult.trim().startsWith('{')) {
              claudeResult = '{' + claudeResult;
            }
          }
        }
      }
    }

    // Log processing results
    console.log(`[Scrape API] Success: ${rawContent.length} pages scraped`);

    return NextResponse.json({
      success: true,
      mode: mode || 'json',
      raw_content: rawContent,
      claude_result: claudeResult,
      original_url: url,
      schema_used: schema || null,
      custom_prompt: customPrompt || null
    });

  } catch (error) {
    console.error(`[Scrape API] Error:`, error);
    return NextResponse.json(
      { error: 'Failed to scrape the website. Please try again later.' },
      { status: 500 }
    );
  }
}