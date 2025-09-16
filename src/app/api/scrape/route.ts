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
      prompt = `Fetch the content from ${url} and extract structured data. Your response must be ONLY valid JSON with no additional text, explanations, or markdown formatting.`;
      
      if (schema) {
        prompt += ` Use this exact JSON schema structure: ${schema}`;
      } else if (customPrompt) {
        prompt += ` Extract data based on these instructions: ${customPrompt}.`;
      } else {
        prompt += ` Extract the main content and organize it into a clean JSON format with relevant fields like title, description, content, etc.`;
      }
    }

    console.log(`[Scrape API] Prompt:`, prompt);
    console.log(`[Scrape API] Calling Claude API...`);

    // Prepare request payload
    const requestPayload = {
      model: "claude-sonnet-4-20250514",
      max_tokens: 5000,
      messages: [
        {
          role: "user",
          content: prompt
        }
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
    };

    // Log full request payload
    console.log(`[Scrape API] Request payload:`, JSON.stringify(requestPayload, null, 2));

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'web-fetch-2025-09-10',
        'content-type': 'application/json'
      },
      body: JSON.stringify(requestPayload)
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

    // Log full response for debugging
    console.log(`[Scrape API] Full response:`, JSON.stringify(data, null, 2));

    // Extract text content from Claude's response
    const textContent = data.content
      ?.filter(block => block.type === 'text')
      ?.map(block => block.text)
      ?.join('\n\n') || '';

    // Extract web_fetch results
    const rawContent = [];
    if (data.content && Array.isArray(data.content)) {
      for (const block of data.content) {
        if (block.type === 'web_fetch_tool_result' && block.content?.type === 'web_fetch_result') {
          const fetchResult = block.content;
          if (fetchResult.content?.type === 'document' && fetchResult.content.source) {
            rawContent.push({
              type: 'web_fetch',
              url: fetchResult.url,
              retrieved_at: fetchResult.retrieved_at,
              title: fetchResult.content.title || null,
              content_type: fetchResult.content.source.media_type || 'text/plain',
              content: fetchResult.content.source.data
            });
          }
        }
      }
    }

    // Clean up JSON responses
    let claudeResult = textContent;

    console.log(`[Scrape API] Extracted ${rawContent.length} web_fetch results`);
    console.log(`[Scrape API] Claude result:`, claudeResult.substring(0, 500) + '...');

    return NextResponse.json({
      success: true,
      mode: mode || 'json',
      raw_content: rawContent,
      claude_result: claudeResult,
      original_url: url || searchQuery,
      search_query: searchQuery || null,
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