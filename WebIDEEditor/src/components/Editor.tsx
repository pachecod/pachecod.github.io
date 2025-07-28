import React, { useEffect, useRef, useState } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLine } from '@codemirror/view';
import { defaultKeymap, indentWithTab } from '@codemirror/commands';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { FileType } from '../types';
import { Copy } from 'lucide-react';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  language: FileType;
}

const Editor: React.FC<EditorProps> = ({ value, onChange, language }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const editorViewRef = useRef<EditorView>();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!editorRef.current) return;
    
    const getLanguage = () => {
      switch(language) {
        case FileType.HTML: return html();
        case FileType.CSS: return css();
        case FileType.JS: return javascript();
        default: return html();
      }
    };

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        onChange(update.state.doc.toString());
      }
    });

    const startState = EditorState.create({
      doc: value,
      extensions: [
        lineNumbers(),
        highlightActiveLine(),
        getLanguage(),
        keymap.of([
          ...defaultKeymap,
          indentWithTab
        ]),
        oneDark,
        EditorView.lineWrapping,
        updateListener,
        EditorState.tabSize.of(2),
      ],
    });

    const view = new EditorView({
      state: startState,
      parent: editorRef.current,
    });

    editorViewRef.current = view;

    return () => {
      view.destroy();
    };
  }, [language]); // Only re-create editor when language changes

  useEffect(() => {
    if (editorViewRef.current) {
      const currentValue = editorViewRef.current.state.doc.toString();
      
      if (value !== currentValue) {
        editorViewRef.current.dispatch({
          changes: {
            from: 0,
            to: currentValue.length,
            insert: value,
          },
        });
      }
    }
  }, [value]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(
        editorViewRef.current?.state.doc.toString() || ''
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      alert('Failed to copy code');
    }
  };

  return (
    <div className="h-full bg-gray-900 overflow-auto flex flex-col">
      <div className="flex items-center justify-end px-2 py-1 bg-gray-800 border-b border-gray-700">
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded transition-colors relative"
          title="Copy code to clipboard"
        >
          <Copy size={14} />
          <span>Copy Code</span>
          {copied && (
            <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-xs rounded whitespace-nowrap border border-gray-700">Copied!</span>
          )}
        </button>
      </div>
      <div className="h-full" ref={editorRef} />
    </div>
  );
};

export default Editor;