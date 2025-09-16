import type { Metadata } from "next";
import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import React from "react";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Claude Web Scraper",
  description: "Let Claude analyze any website and turn it into structured data - by Kadoa",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
    <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased text-text dark:text-darkText mx-auto w-[750px] max-w-full px-5`}
    >
    {children}

    </body>
    </html>
  );
}
