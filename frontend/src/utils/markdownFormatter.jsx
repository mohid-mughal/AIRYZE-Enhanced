/**
 * Markdown Formatter Utility
 * Converts markdown text from AI responses to properly formatted HTML/React elements
 */

/**
 * Convert markdown text to HTML string
 * Supports: **bold**, *italic*, `code`, lists, line breaks
 */
export function markdownToHtml(text) {
  if (!text || typeof text !== 'string') return '';
  
  let html = text
    // Escape HTML entities first
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Bold: **text** or __text__
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    // Italic: *text* or _text_
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/_([^_]+)_/g, '<em>$1</em>')
    // Inline code: `code`
    .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>')
    // Numbered lists: 1. item
    .replace(/^(\d+)\.\s+(.+)$/gm, '<li class="ml-4 list-decimal">$2</li>')
    // Bullet lists: - item or * item
    .replace(/^[-*]\s+(.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
    // Line breaks
    .replace(/\n\n/g, '</p><p class="mb-2">')
    .replace(/\n/g, '<br/>');
  
  // Wrap in paragraph if not already wrapped
  if (!html.startsWith('<')) {
    html = `<p class="mb-2">${html}</p>`;
  }
  
  return html;
}

/**
 * React component that renders markdown content as HTML
 * Uses dangerouslySetInnerHTML - content is sanitized by markdownToHtml
 */
export function MarkdownContent({ content, className = '' }) {
  if (!content) return null;
  
  const html = markdownToHtml(content);
  
  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/**
 * Alternative: Format AI response to React elements (no dangerouslySetInnerHTML)
 * Returns an array of React elements
 */
export function formatAIResponse(text) {
  if (!text || typeof text !== 'string') return [text];
  
  const elements = [];
  const lines = text.split('\n');
  
  lines.forEach((line, lineIndex) => {
    if (!line.trim()) {
      elements.push(<br key={`br-${lineIndex}`} />);
      return;
    }
    
    // Process inline formatting
    const parts = [];
    let remaining = line;
    let partIndex = 0;
    
    // Process bold
    remaining = remaining.replace(/\*\*(.+?)\*\*/g, (match, content) => {
      return `{{BOLD:${content}}}`;
    });
    
    // Process italic
    remaining = remaining.replace(/\*([^*]+)\*/g, (match, content) => {
      return `{{ITALIC:${content}}}`;
    });
    
    // Process code
    remaining = remaining.replace(/`([^`]+)`/g, (match, content) => {
      return `{{CODE:${content}}}`;
    });
    
    // Split and create elements
    const tokens = remaining.split(/(\{\{(?:BOLD|ITALIC|CODE):[^}]+\}\})/);
    
    tokens.forEach((token, tokenIndex) => {
      if (token.startsWith('{{BOLD:')) {
        const content = token.slice(7, -2);
        parts.push(<strong key={`${lineIndex}-${tokenIndex}`}>{content}</strong>);
      } else if (token.startsWith('{{ITALIC:')) {
        const content = token.slice(9, -2);
        parts.push(<em key={`${lineIndex}-${tokenIndex}`}>{content}</em>);
      } else if (token.startsWith('{{CODE:')) {
        const content = token.slice(7, -2);
        parts.push(
          <code 
            key={`${lineIndex}-${tokenIndex}`}
            className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono"
          >
            {content}
          </code>
        );
      } else if (token) {
        parts.push(token);
      }
    });
    
    // Check if it's a list item
    const bulletMatch = line.match(/^[-*]\s+(.+)$/);
    const numberedMatch = line.match(/^(\d+)\.\s+(.+)$/);
    
    if (bulletMatch) {
      elements.push(
        <li key={`li-${lineIndex}`} className="ml-4 list-disc">
          {parts}
        </li>
      );
    } else if (numberedMatch) {
      elements.push(
        <li key={`li-${lineIndex}`} className="ml-4 list-decimal">
          {parts}
        </li>
      );
    } else {
      elements.push(
        <p key={`p-${lineIndex}`} className="mb-1">
          {parts}
        </p>
      );
    }
  });
  
  return elements;
}

export default { markdownToHtml, MarkdownContent, formatAIResponse };
