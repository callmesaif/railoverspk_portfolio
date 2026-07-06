'use client';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import { useEffect, useCallback } from 'react';

/* ── Toolbar button ────────────────────────── */
function Btn({ onClick, active, title, children, danger }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      style={{
        padding: '5px 8px',
        borderRadius: '6px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: 600,
        lineHeight: 1,
        minWidth: '28px',
        background: active ? 'rgba(30,144,255,0.25)' : 'transparent',
        color: danger ? '#f97070' : active ? '#1E90FF' : 'rgba(255,255,255,0.7)',
        transition: 'all 0.15s',
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
    >
      {children}
    </button>
  );
}

/* ── Divider ───────────────────────────────── */
function Sep() {
  return <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)', margin: '0 4px', flexShrink: 0 }} />;
}

/* ── Main Editor ───────────────────────────── */
export default function RichTextEditor({ value, onChange, placeholder = 'Write your post content here…' }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'rl-link' },
      }),
      Image.configure({
        HTMLAttributes: { class: 'rl-img' },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({ placeholder }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value || '',
    editorProps: {
      attributes: {
        style: 'outline:none; min-height:320px; padding:16px; font-size:14px; line-height:1.8; color:rgba(255,255,255,0.85);',
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  // Sync external value changes (e.g. on load)
  useEffect(() => {
    if (!editor) return;
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value || '', false);
    }
  }, [value, editor]);

  const addLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes('link').href;
    const url  = window.prompt('URL:', prev || 'https://');
    if (!url) return;
    if (url === '') { editor.chain().focus().unsetLink().run(); return; }
    editor.chain().focus().setLink({ href: url }).run();
  }, [editor]);

  const addImage = useCallback(() => {
    if (!editor) return;
    const url = window.prompt('Image URL (ImgBB link):');
    if (url) editor.chain().focus().setImage({ src: url }).run();
  }, [editor]);

  const insertTable = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', overflow: 'hidden', background: '#131320' }}>

      {/* ── Toolbar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '2px',
        padding: '8px 10px', borderBottom: '1px solid rgba(255,255,255,0.08)',
        background: '#0c0c12',
      }}>

        {/* Heading */}
        <Btn title="Heading 2" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          H2
        </Btn>
        <Btn title="Heading 3" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          H3
        </Btn>
        <Btn title="Heading 4" active={editor.isActive('heading', { level: 4 })} onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}>
          H4
        </Btn>

        <Sep />

        {/* Text style */}
        <Btn title="Bold" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
          <strong>B</strong>
        </Btn>
        <Btn title="Italic" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <em>I</em>
        </Btn>
        <Btn title="Underline" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <span style={{ textDecoration: 'underline' }}>U</span>
        </Btn>
        <Btn title="Strikethrough" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}>
          <span style={{ textDecoration: 'line-through' }}>S</span>
        </Btn>
        <Btn title="Code" active={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()}>
          {'</>'}
        </Btn>

        <Sep />

        {/* Alignment */}
        <Btn title="Align Left"   active={editor.isActive({ textAlign: 'left' })}    onClick={() => editor.chain().focus().setTextAlign('left').run()}>⬅</Btn>
        <Btn title="Align Center" active={editor.isActive({ textAlign: 'center' })}  onClick={() => editor.chain().focus().setTextAlign('center').run()}>⬆</Btn>
        <Btn title="Align Right"  active={editor.isActive({ textAlign: 'right' })}   onClick={() => editor.chain().focus().setTextAlign('right').run()}>➡</Btn>

        <Sep />

        {/* Lists */}
        <Btn title="Bullet List" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          • List
        </Btn>
        <Btn title="Numbered List" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          1. List
        </Btn>

        <Sep />

        {/* Block elements */}
        <Btn title="Blockquote" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          ❝
        </Btn>
        <Btn title="Code Block" active={editor.isActive('codeBlock')} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
          { '{ }' }
        </Btn>
        <Btn title="Horizontal Rule" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          ─
        </Btn>

        <Sep />

        {/* Link + Image + Table */}
        <Btn title="Insert Link" active={editor.isActive('link')} onClick={addLink}>
          🔗
        </Btn>
        <Btn title="Insert Image" onClick={addImage}>
          🖼
        </Btn>
        <Btn title="Insert Table" onClick={insertTable}>
          ⊞
        </Btn>

        <Sep />

        {/* Undo / Redo */}
        <Btn title="Undo" onClick={() => editor.chain().focus().undo().run()}>↩</Btn>
        <Btn title="Redo" onClick={() => editor.chain().focus().redo().run()}>↪</Btn>

        <Sep />

        {/* Clear formatting */}
        <Btn title="Clear Formatting" danger onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}>
          ✕ Clear
        </Btn>
      </div>

      {/* ── Editor area ── */}
      <EditorContent editor={editor} />

      {/* ── Editor styles ── */}
      <style>{`
        .tiptap p { margin: 0 0 0.75rem; }
        .tiptap h2 { font-family: 'Bebas Neue', sans-serif; font-size: 1.8rem; text-transform: uppercase; margin: 1.25rem 0 0.5rem; color: #fff; }
        .tiptap h3 { font-family: 'Bebas Neue', sans-serif; font-size: 1.4rem; text-transform: uppercase; margin: 1rem 0 0.4rem; color: #fff; }
        .tiptap h4 { font-size: 1rem; font-weight: 700; margin: 0.75rem 0 0.3rem; color: #fff; }
        .tiptap strong { color: #fff; font-weight: 700; }
        .tiptap em { font-style: italic; }
        .tiptap u { text-decoration: underline; }
        .tiptap s { text-decoration: line-through; opacity: 0.6; }
        .tiptap ul { padding-left: 1.5rem; margin: 0.5rem 0; list-style: disc; }
        .tiptap ol { padding-left: 1.5rem; margin: 0.5rem 0; list-style: decimal; }
        .tiptap li { margin-bottom: 0.3rem; }
        .tiptap blockquote { border-left: 3px solid var(--accent, #1E90FF); padding-left: 1rem; margin: 1rem 0; color: rgba(255,255,255,0.55); font-style: italic; }
        .tiptap code { background: rgba(255,255,255,0.08); border-radius: 4px; padding: 2px 6px; font-family: monospace; font-size: 13px; color: #1E90FF; }
        .tiptap pre { background: #050508; border-radius: 10px; padding: 1rem; margin: 1rem 0; overflow-x: auto; }
        .tiptap pre code { background: none; color: #3fca7a; padding: 0; }
        .tiptap hr { border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 1.5rem 0; }
        .tiptap a.rl-link { color: var(--accent, #1E90FF); text-decoration: underline; }
        .tiptap img.rl-img { max-width: 100%; border-radius: 10px; margin: 1rem 0; }
        .tiptap table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
        .tiptap th { background: rgba(30,144,255,0.15); border: 1px solid rgba(255,255,255,0.1); padding: 8px 12px; text-align: left; font-weight: 700; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: #1E90FF; }
        .tiptap td { border: 1px solid rgba(255,255,255,0.08); padding: 8px 12px; font-size: 13px; }
        .tiptap tr:nth-child(even) td { background: rgba(255,255,255,0.02); }
        .tiptap .is-editor-empty:first-child::before { content: attr(data-placeholder); color: rgba(255,255,255,0.2); pointer-events: none; float: left; height: 0; }
      `}</style>
    </div>
  );
}
