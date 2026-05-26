'use client';

import React, { useRef, useEffect, useState } from 'react';

interface RichTextEditorProps {
  value: string; // Markdown format
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  minHeight?: string;
}

export function RichTextEditor({ value, onChange, placeholder = '', className = '', id, minHeight }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isUpdatingRef = useRef(false);
  const lastMarkdownRef = useRef<string | null>(null);

  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isBulletList, setIsBulletList] = useState(false);
  const [isNumberedList, setIsNumberedList] = useState(false);

  const updateActiveStates = () => {
    if (typeof document !== 'undefined') {
      setIsBold(document.queryCommandState('bold'));
      setIsItalic(document.queryCommandState('italic'));
      setIsBulletList(document.queryCommandState('insertUnorderedList'));
      setIsNumberedList(document.queryCommandState('insertOrderedList'));
    }
  };

  // Convert Markdown to HTML
  const markdownToHtml = (markdown: string): string => {
    if (!markdown) return '';
    const lines = markdown.split('\n');
    let html = '';
    let inList: 'ul' | 'ol' | null = null;

    const parseInline = (text: string): string => {
      let formatted = text;
      formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
      formatted = formatted.replace(/`(.*?)`/g, '<code>$1</code>');
      formatted = formatted.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
      return formatted;
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const ulMatch = line.match(/^[-*+]\s+(.*)/);
      const olMatch = line.match(/^\d+\.\s+(.*)/);

      if (ulMatch) {
        if (inList === 'ol') {
          html += '</ol>';
          inList = null;
        }
        if (!inList) {
          html += '<ul>';
          inList = 'ul';
        }
        html += `<li>${parseInline(ulMatch[1])}</li>`;
      } else if (olMatch) {
        if (inList === 'ul') {
          html += '</ul>';
          inList = null;
        }
        if (!inList) {
          html += '<ol>';
          inList = 'ol';
        }
        html += `<li>${parseInline(olMatch[1])}</li>`;
      } else {
        if (inList === 'ul') {
          html += '</ul>';
          inList = null;
        } else if (inList === 'ol') {
          html += '</ol>';
          inList = null;
        }
        
        if (line.trim() === '') {
          html += '<br />';
        } else {
          const headingMatch = line.match(/^(#{1,6})\s+(.*)/);
          if (headingMatch) {
            const level = headingMatch[1].length;
            const text = headingMatch[2];
            html += `<h${level}>${parseInline(text)}</h${level}>`;
          } else {
            html += `<div>${parseInline(line)}</div>`;
          }
        }
      }
    }

    if (inList === 'ul') {
      html += '</ul>';
    } else if (inList === 'ol') {
      html += '</ol>';
    }

    return html;
  };

  // Convert HTML to Markdown
  const htmlToMarkdown = (html: string): string => {
    if (!html) return '';

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    const processNode = (node: Node): string => {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.nodeValue || '';
      }

      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        const tagName = el.tagName.toLowerCase();

        let innerMarkdown = '';
        for (let i = 0; i < el.childNodes.length; i++) {
          innerMarkdown += processNode(el.childNodes[i]);
        }

        switch (tagName) {
          case 'strong':
          case 'b':
            return innerMarkdown.trim() ? `**${innerMarkdown}**` : '';
          case 'em':
          case 'i':
            return innerMarkdown.trim() ? `*${innerMarkdown}*` : '';
          case 'code':
            return innerMarkdown.trim() ? `\`${innerMarkdown}\`` : '';
          case 'a':
            const href = el.getAttribute('href') || '';
            return `[${innerMarkdown}](${href})`;
          case 'li':
            return innerMarkdown;
          case 'ul': {
            let listItems = '';
            for (let i = 0; i < el.children.length; i++) {
              const liText = processNode(el.children[i]);
              listItems += `- ${liText}\n`;
            }
            return `\n${listItems}\n`;
          }
          case 'ol': {
            let listItems = '';
            for (let i = 0; i < el.children.length; i++) {
              const liText = processNode(el.children[i]);
              listItems += `${i + 1}. ${liText}\n`;
            }
            return `\n${listItems}\n`;
          }
          case 'p':
          case 'div': {
            if (el.innerHTML === '<br>' || el.innerHTML === '') {
              return '\n';
            }
            return `\n${innerMarkdown}\n`;
          }
          case 'br':
            return '\n';
          case 'h1':
            return `\n# ${innerMarkdown}\n`;
          case 'h2':
            return `\n## ${innerMarkdown}\n`;
          case 'h3':
            return `\n### ${innerMarkdown}\n`;
          default:
            return innerMarkdown;
        }
      }

      return '';
    };

    let markdown = '';
    for (let i = 0; i < tempDiv.childNodes.length; i++) {
      markdown += processNode(tempDiv.childNodes[i]);
    }

    markdown = markdown
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    return markdown;
  };

  // Sync Markdown prop changes down to editor HTML
  useEffect(() => {
    if (!editorRef.current) return;

    if (lastMarkdownRef.current !== null && value === lastMarkdownRef.current) {
      return;
    }

    const expectedHtml = markdownToHtml(value);
    editorRef.current.innerHTML = expectedHtml;
    lastMarkdownRef.current = value;
  }, [value]);

  const handleInput = () => {
    if (!editorRef.current) return;
    isUpdatingRef.current = true;
    const html = editorRef.current.innerHTML;
    const markdown = htmlToMarkdown(html);
    lastMarkdownRef.current = markdown;
    onChange(markdown);
    isUpdatingRef.current = false;
  };

  const handleFormat = (command: string, arg: string = '') => {
    document.execCommand(command, false, arg);
    handleInput();
    updateActiveStates();
  };

  const handleLink = () => {
    const url = prompt('Nhập địa chỉ liên kết (URL):', 'https://');
    if (url) {
      handleFormat('createLink', url);
    }
  };

  const handleCode = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const text = range.toString();
      if (text) {
        const codeEl = document.createElement('code');
        codeEl.textContent = text;
        range.deleteContents();
        range.insertNode(codeEl);
        handleInput();
      } else {
        const codeEl = document.createElement('code');
        codeEl.textContent = 'mã';
        range.insertNode(codeEl);
        handleInput();
      }
      updateActiveStates();
    }
  };

  return (
    <div className="border border-slate-200 rounded-md overflow-hidden bg-slate-50 transition-all focus-within:ring-2 focus-within:ring-sky-500/20">
      {/* Editor Scoped CSS Style Tag */}
      <style dangerouslySetInnerHTML={{ __html: `
        .rich-text-editor-content {
          min-height: 120px;
          outline: none;
        }
        .rich-text-editor-content:empty:before {
          content: attr(data-placeholder);
          color: #94a3b8;
          font-weight: 600;
          pointer-events: none;
          display: block;
        }
        .rich-text-editor-content ul {
          list-style-type: disc !important;
          padding-left: 1.25rem !important;
          margin-top: 0.25rem !important;
          margin-bottom: 0.25rem !important;
        }
        .rich-text-editor-content ol {
          list-style-type: decimal !important;
          padding-left: 1.25rem !important;
          margin-top: 0.25rem !important;
          margin-bottom: 0.25rem !important;
        }
        .rich-text-editor-content li {
          margin-top: 0.125rem !important;
          margin-bottom: 0.125rem !important;
          line-height: 1.375 !important;
        }
        .rich-text-editor-content strong, .rich-text-editor-content b {
          font-weight: 800 !important;
          color: #0f172a !important;
        }
        .rich-text-editor-content em, .rich-text-editor-content i {
          font-style: italic !important;
          color: #334155 !important;
        }
        .rich-text-editor-content code {
          font-family: monospace !important;
          font-size: 0.75rem !important;
          color: #e11d48 !important;
          background-color: #f1f5f9 !important;
          padding: 0.125rem 0.375rem !important;
          border-radius: 0.25rem !important;
          border: 1px solid #e2e8f0 !important;
        }
        .rich-text-editor-content a {
          color: #0284c7 !important;
          font-weight: 800 !important;
          text-decoration: underline !important;
        }
      `}} />

      {/* Editor Toolbar */}
      <div className="flex items-center gap-1.5 p-2 bg-slate-50 border-b border-slate-200 text-slate-500 select-none">
        <button
          type="button"
          onClick={() => handleFormat('bold')}
          className={`p-1 px-2.5 rounded text-xs font-bold transition-all ${
            isBold 
              ? 'bg-sky-100 text-sky-700 shadow-sm' 
              : 'hover:bg-slate-200 hover:text-slate-800 text-slate-500'
          }`}
          title="In đậm"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => handleFormat('italic')}
          className={`p-1 px-2.5 rounded text-xs italic font-bold transition-all ${
            isItalic 
              ? 'bg-sky-100 text-sky-700 shadow-sm' 
              : 'hover:bg-slate-200 hover:text-slate-800 text-slate-500'
          }`}
          title="In nghiêng"
        >
          I
        </button>
        <div className="w-[1px] h-4 bg-slate-200 mx-1" />
        <button
          type="button"
          onClick={() => handleFormat('insertUnorderedList')}
          className={`p-1 rounded flex items-center justify-center transition-all ${
            isBulletList 
              ? 'bg-sky-100 text-sky-700 shadow-sm' 
              : 'hover:bg-slate-200 hover:text-slate-800 text-slate-500'
          }`}
          title="Danh sách đầu dòng"
        >
          <span className="material-symbols-outlined text-[16px]">format_list_bulleted</span>
        </button>
        <button
          type="button"
          onClick={() => handleFormat('insertOrderedList')}
          className={`p-1 rounded flex items-center justify-center transition-all ${
            isNumberedList 
              ? 'bg-sky-100 text-sky-700 shadow-sm' 
              : 'hover:bg-slate-200 hover:text-slate-800 text-slate-500'
          }`}
          title="Danh sách số"
        >
          <span className="material-symbols-outlined text-[16px]">format_list_numbered</span>
        </button>
        <button
          type="button"
          onClick={handleCode}
          className="p-1 hover:bg-slate-200 hover:text-slate-800 rounded flex items-center justify-center transition-all"
          title="Định dạng mã"
        >
          <span className="material-symbols-outlined text-[16px]">code</span>
        </button>
        <button
          type="button"
          onClick={handleLink}
          className="p-1 hover:bg-slate-200 hover:text-slate-800 rounded flex items-center justify-center transition-all"
          title="Chèn liên kết"
        >
          <span className="material-symbols-outlined text-[16px]">link</span>
        </button>
      </div>

      {/* Editor area */}
      <div
        ref={editorRef}
        id={id}
        contentEditable
        onInput={handleInput}
        onKeyUp={updateActiveStates}
        onMouseUp={updateActiveStates}
        onFocus={updateActiveStates}
        onBlur={updateActiveStates}
        data-placeholder={placeholder}
        style={minHeight ? { minHeight } : undefined}
        className={`rich-text-editor-content w-full p-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-50/50 leading-snug overflow-y-auto resize-none ${className}`}
      />
    </div>
  );
}
