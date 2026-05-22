'use client';

import React from 'react';

export function MarkdownRenderer({ content, className = '' }: { content: string; className?: string }) {
  if (!content) return null;

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  
  let currentList: { type: 'ul' | 'ol'; items: string[] } | null = null;

  const renderTextWithStyles = (text: string): React.ReactNode[] => {
    // Regex matches bold **text** or italic *text* or inline code `code` or links [text](url)
    const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`|\[.*?\]\(.*?\))/g;
    const parts = text.split(regex);
    
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-extrabold text-slate-900">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={index} className="italic text-slate-800">{part.slice(1, -1)}</em>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={index} className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded font-mono text-xs text-rose-600">{part.slice(1, -1)}</code>;
      }
      if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
        const match = part.match(/\[(.*?)\]\((.*?)\)/);
        if (match) {
          const [, label, url] = match;
          return <a key={index} href={url} target="_blank" rel="noopener noreferrer" className="text-sky-650 hover:underline font-extrabold text-sky-650">{label}</a>;
        }
      }
      return part;
    });
  };

  const flushList = (key: number) => {
    if (!currentList) return null;
    const listType = currentList.type;
    const listItems = currentList.items;
    currentList = null;

    if (listType === 'ul') {
      return (
        <ul key={`list-${key}`} className="list-disc pl-4 my-1 space-y-0.5 text-slate-700">
          {listItems.map((item, idx) => (
            <li key={idx} className="leading-snug">{renderTextWithStyles(item)}</li>
          ))}
        </ul>
      );
    } else {
      return (
        <ol key={`list-${key}`} className="list-decimal pl-4 my-1 space-y-0.5 text-slate-700">
          {listItems.map((item, idx) => (
            <li key={idx} className="leading-snug">{renderTextWithStyles(item)}</li>
          ))}
        </ol>
      );
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    const ulMatch = line.match(/^(\s*)[-*+]\s+(.*)/);
    const olMatch = line.match(/^(\s*)\d+\.\s+(.*)/);

    if (ulMatch) {
      if (currentList && currentList.type !== 'ul') {
        elements.push(flushList(i));
      }
      if (!currentList) {
        currentList = { type: 'ul', items: [] };
      }
      currentList.items.push(ulMatch[2]);
    } else if (olMatch) {
      if (currentList && currentList.type !== 'ol') {
        elements.push(flushList(i));
      }
      if (!currentList) {
        currentList = { type: 'ol', items: [] };
      }
      currentList.items.push(olMatch[2]);
    } else {
      if (currentList) {
        elements.push(flushList(i));
      }
      if (line.trim() === '') {
        elements.push(<div key={i} className="h-1.5" />);
      } else {
        const headingMatch = line.match(/^(\s*)(#{1,6})\s+(.*)/);
        if (headingMatch) {
          const level = headingMatch[2].length;
          const text = headingMatch[3];
          if (level === 1) {
            elements.push(<h1 key={i} className="text-sm font-black text-slate-900 mt-1.5 mb-0.5">{renderTextWithStyles(text)}</h1>);
          } else if (level === 2) {
            elements.push(<h2 key={i} className="text-[13px] font-black text-slate-900 mt-1.5 mb-0.5">{renderTextWithStyles(text)}</h2>);
          } else {
            elements.push(<h3 key={i} className="text-[12px] font-bold text-slate-800 mt-1 mb-0.5">{renderTextWithStyles(text)}</h3>);
          }
        } else {
          elements.push(
            <p key={i} className="leading-snug">
              {renderTextWithStyles(line)}
            </p>
          );
        }
      }
    }
  }

  if (currentList) {
    elements.push(flushList(lines.length));
  }

  return <div className={`space-y-0.5 text-[12.5px] sm:text-[13px] leading-snug text-slate-700 break-words ${className}`}>{elements}</div>;
}
