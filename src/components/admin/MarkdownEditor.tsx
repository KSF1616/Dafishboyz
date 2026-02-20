import React, { useState } from 'react';
import { Eye, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

export const MarkdownEditor: React.FC<Props> = ({ value, onChange, placeholder, rows = 6 }) => {
  const [preview, setPreview] = useState(false);

  const renderMarkdown = (text: string) => {
    return text
      .split('\n')
      .map((line, i) => {
        if (line.startsWith('# ')) return <h1 key={i} className="text-xl font-bold mb-2">{line.slice(2)}</h1>;
        if (line.startsWith('## ')) return <h2 key={i} className="text-lg font-semibold mb-2">{line.slice(3)}</h2>;
        if (line.startsWith('- ')) return <li key={i} className="ml-4 list-disc">{line.slice(2)}</li>;
        if (line.match(/^\d+\. /)) return <li key={i} className="ml-4 list-decimal">{line.replace(/^\d+\. /, '')}</li>;
        if (line.startsWith('**') && line.endsWith('**')) return <p key={i} className="font-bold">{line.slice(2, -2)}</p>;
        return line ? <p key={i} className="mb-1">{line}</p> : <br key={i} />;
      });
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Button type="button" size="sm" variant={!preview ? 'default' : 'outline'} onClick={() => setPreview(false)}>
          <Edit3 className="w-3 h-3 mr-1" /> Edit
        </Button>
        <Button type="button" size="sm" variant={preview ? 'default' : 'outline'} onClick={() => setPreview(true)}>
          <Eye className="w-3 h-3 mr-1" /> Preview
        </Button>
      </div>
      {preview ? (
        <div className="min-h-[150px] p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300">
          {value ? renderMarkdown(value) : <span className="text-gray-400">Nothing to preview</span>}
        </div>
      ) : (
        <Textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows} className="font-mono text-sm" />
      )}
    </div>
  );
};
