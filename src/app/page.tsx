"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Linkedin, Twitter, Loader2, Copy } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { prism } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface ScrapedResult {
    success: boolean;
    mode: 'markdown' | 'json';
    raw_content: Array<{
        url: string;
        retrieved_at: string;
        content_type: string;
        content: string;
    }>;
    claude_result: string;
    original_url: string;
    schema_used: string | null;
    custom_prompt: string | null;
}

function HomePageContent() {
    const [url, setUrl] = useState("");
    const [mode, setMode] = useState<'markdown' | 'json'>('json');
    const [customPrompt, setCustomPrompt] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<ScrapedResult | null>(null);
    const [error, setError] = useState("");

    async function handleScrape() {
        if (!url) return;
        
        setIsLoading(true);
        setError("");
        setResults(null);

        try {
            const response = await fetch('/api/scrape', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    url, 
                    mode,
                    prompt: customPrompt || null
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to scrape website');
            }

            setResults(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        handleScrape();
    }

    const [copySuccess, setCopySuccess] = useState(false);

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    return (
        <div className="min-h-screen max-w-4xl mx-auto px-4 flex flex-col justify-between w-full py-8">
            <div className="flex-grow flex flex-col justify-center">
                <div>
                    <h1 className="text-5xl font-bold mb-3 bg-main">
                        Claude Web Scraper
                    </h1>
                    <p className="mb-10">Let Claude analyze any website and turn it into structured data.</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-5 mb-8">
                    <div className="space-y-2">
                        <Label htmlFor="url">Website URL *</Label>
                        <Input
                            id="url"
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://example.com"
                            required
                        />
                    </div>

                    <div className="space-y-3">
                        <Label>Extraction Mode</Label>
                        <RadioGroup 
                            value={mode} 
                            onValueChange={(value: 'markdown' | 'json') => setMode(value)}
                            className="flex gap-6"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="markdown" id="markdown" />
                                <Label htmlFor="markdown">Markdown</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="json" id="json" />
                                <Label htmlFor="json">Structured JSON</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {mode === 'json' && (
                        <div className="space-y-2">
                            <Label htmlFor="prompt">Prompt</Label>
                            <textarea
                                id="prompt"
                                value={customPrompt}
                                onChange={(e) => setCustomPrompt(e.target.value)}
                                placeholder='Extract product information including name, price, and availability'
                                className="w-full min-h-[80px] px-3 py-2 text-sm border rounded-md border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                rows={3}
                            />
                            <p className="text-xs text-muted-foreground">
                                Describe what specific data you want to extract
                            </p>
                        </div>
                    )}
                    
                    <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={!url || isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Scraping...
                            </>
                        ) : (
                            'Scrape Website'
                        )}
                    </Button>
                </form>

                {error && (
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="text-red-600">Error</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>{error}</p>
                        </CardContent>
                    </Card>
                )}

                {results && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>Result</span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => copyToClipboard(results.claude_result)}
                                >
                                    <Copy className="h-4 w-4 mr-2" />
                                    {copySuccess ? 'Copied!' : 'Copy'}
                                </Button>
                            </CardTitle>
                            <CardDescription>
                                Scraped from: {results.original_url}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="max-h-96 overflow-y-auto">
                                {results.mode === 'json' ? (
                                    <div className="border rounded-md">
                                        <SyntaxHighlighter
                                            language="json"
                                            style={prism}
                                            customStyle={{
                                                fontSize: 14,
                                                margin: 0,
                                                backgroundColor: '#f8f9fa',
                                                borderRadius: '6px',
                                                padding: 16
                                            }}
                                            wrapLongLines={true}
                                        >
                                            {(() => {
                                                try {
                                                    const parsed = JSON.parse(results.claude_result);
                                                    return JSON.stringify(parsed, null, 2);
                                                } catch (e) {
                                                    return results.claude_result;
                                                }
                                            })()}
                                        </SyntaxHighlighter>
                                    </div>
                                ) : (
                                    <div className="border rounded-md">
                                        <SyntaxHighlighter
                                            language="markdown"
                                            style={prism}
                                            customStyle={{
                                                fontSize: 14,
                                                margin: 0,
                                                backgroundColor: '#f8f9fa',
                                                borderRadius: '6px',
                                                padding: 16
                                            }}
                                            wrapLongLines={true}
                                        >
                                            {results.claude_result}
                                        </SyntaxHighlighter>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            <div className="mt-16 flex flex-col items-center gap-4">
                <div className="flex justify-center items-center  text-sm md:text-md">
                    <p className="pr-2">by</p>  <a href={"https://kadoa.com"}><Image
                    src="/kadoa-logo.svg"
                    height={30}
                    width={100}
                    alt="kadoa"
                /></a><p className="px-2"> • </p> AI agents for web data (We're hiring!)
                </div>
            </div>
        </div>
    );
}

export default function HomePage() {
    return <HomePageContent />;
}
