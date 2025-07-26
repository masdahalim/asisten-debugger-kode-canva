import React, { useState, useEffect } from 'react';
import { DiagnosisIcon, CauseIcon, SolutionIcon, TipIcon, CopyIcon, CheckIcon } from './icons';

interface CodeBlockProps {
  code: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setIsCopied(true);
  };

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => {
        setIsCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  return (
    <div className="bg-slate-100 dark:bg-slate-950 rounded-lg my-2 relative border border-gray-200 dark:border-slate-700">
      <pre className="p-4 text-slate-800 dark:text-slate-300 font-mono text-sm overflow-x-auto">
        <code>{code}</code>
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1.5 rounded-md bg-slate-200 text-slate-600 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-950 focus:ring-teal-500 transition-colors"
        aria-label="Salin kode"
      >
        {isCopied ? <CheckIcon /> : <CopyIcon />}
      </button>
    </div>
  );
};


const ResultDisplay: React.FC<{ analysis: string }> = ({ analysis }) => {
  const parsedElements = [];
  const lines = analysis.split('\n');
  
  let inCodeBlock = false;
  let codeContent: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('```')) {
      if (inCodeBlock) {
        // End of code block
        if(codeContent.length > 0) {
            parsedElements.push(<CodeBlock key={`code-${parsedElements.length}`} code={codeContent.join('\n')} />);
        }
        codeContent = [];
        inCodeBlock = false;
      } else {
        // Start of code block
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeContent.push(line);
      continue;
    }

    if (line.trim() === '') {
        if(parsedElements.length > 0) {
            parsedElements.push(<div key={`space-${parsedElements.length}`} className="h-2"></div>);
        }
        continue;
    }

    let icon = null;
    let text = line;
    let className = 'text-gray-700 dark:text-slate-300';
    let containerClassName = 'flex items-start space-x-3';
    
    // Match headers with or without ":" and bold markdown
    const match = line.match(/^(✅|🔧|🛠️|📌)\s*(\*\*)?(.+?)(:|\*\*)?$/);
    if(match) {
        const [, emoji, , content] = match;
        text = content.trim();

        switch(emoji) {
            case '✅':
                icon = <DiagnosisIcon />;
                className = "font-semibold text-lg text-gray-900 dark:text-white";
                containerClassName += " mb-3";
                break;
            case '🔧':
                icon = <CauseIcon />;
                className = "font-semibold text-gray-900 dark:text-white";
                containerClassName += " mt-4";
                break;
            case '🛠️':
                icon = <SolutionIcon />;
                className = "font-semibold text-gray-900 dark:text-white";
                containerClassName += " mt-4";
                break;
            case '📌':
                icon = <TipIcon />;
                className = "font-semibold text-gray-900 dark:text-white";
                containerClassName += " mt-4";
                break;
        }
    }


    if (icon) {
        parsedElements.push(
            <div key={`line-${i}`} className={containerClassName}>
                <div className="flex-shrink-0 pt-1">{icon}</div>
                <div className="flex-grow">
                    <p className={className}>{text}</p>
                </div>
            </div>
        );
    } else {
        // Handle regular text lines, assuming they are details under a heading
        parsedElements.push(
             <div key={`line-${i}`} className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6"></div>
                <div className="flex-grow">
                    <p className="text-gray-600 dark:text-slate-400">{line}</p>
                </div>
            </div>
        );
    }
  }

  // Handle unterminated code block at the end of the file
  if (codeContent.length > 0) {
      parsedElements.push(<CodeBlock key="code-final" code={codeContent.join('\n')} />);
  }

  return <div className="space-y-2 text-base">{parsedElements}</div>;
};

export default ResultDisplay;