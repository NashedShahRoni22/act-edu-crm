"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { useState, useRef } from "react";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Undo2,
  Redo2,
  Link as LinkIcon,
  Image as ImageIcon,
  Heading2,
  ChevronDown,
} from "lucide-react";

const RichTextEditor = ({ value, onChange, placeholder = "Enter your content...", placeholders = [] }) => {
  const [showPlaceholderDropdown, setShowPlaceholderDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
      }),
      Image.configure({
        allowBase64: true,
      }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
  });

  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  if (!editor) {
    return <div className="w-full h-64 bg-gray-100 rounded animate-pulse" />;
  }

  const addLink = () => {
    if (linkUrl) {
      editor.chain().focus().extendMarkRange("link").setLink({ href: linkUrl }).run();
      setLinkUrl("");
      setShowLinkInput(false);
    }
  };

  const insertPlaceholder = (placeholderCode) => {
    const placeholderText = `{{${placeholderCode}}}`;
    editor.chain().focus().insertContent(placeholderText).run();
    setShowPlaceholderDropdown(false);
  };

  const formatPlaceholderName = (placeholder) => {
    if (typeof placeholder === "string") {
      return placeholder
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }
    return placeholder.description || placeholder.code;
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && showLinkInput) {
      addLink();
    }
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="border-b border-gray-200 bg-gray-50 p-2 flex flex-wrap gap-1 items-center">
        {/* Text Formatting */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-200 transition ${
            editor.isActive("bold") ? "bg-primary text-white" : ""
          }`}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-200 transition ${
            editor.isActive("italic") ? "bg-primary text-white" : ""
          }`}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>

        {/* Divider */}
        <div className="w-px bg-gray-300 mx-1" />

        {/* Headings */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded hover:bg-gray-200 transition text-sm font-bold ${
            editor.isActive("heading", { level: 2 }) ? "bg-primary text-white" : ""
          }`}
          title="Heading"
        >
          <Heading2 className="w-4 h-4" />
        </button>

        {/* Divider */}
        <div className="w-px bg-gray-300 mx-1" />

        {/* Lists */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-gray-200 transition ${
            editor.isActive("bulletList") ? "bg-primary text-white" : ""
          }`}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-gray-200 transition ${
            editor.isActive("orderedList") ? "bg-primary text-white" : ""
          }`}
          title="Ordered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        {/* Divider */}
        <div className="w-px bg-gray-300 mx-1" />

        {/* Blockquote */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded hover:bg-gray-200 transition ${
            editor.isActive("blockquote") ? "bg-primary text-white" : ""
          }`}
          title="Blockquote"
        >
          <Quote className="w-4 h-4" />
        </button>

        {/* Divider */}
        <div className="w-px bg-gray-300 mx-1" />

        {/* Link */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowLinkInput(!showLinkInput);
              if (!showLinkInput) {
                setTimeout(() => document.getElementById("link-input")?.focus(), 0);
              }
            }}
            className={`p-2 rounded hover:bg-gray-200 transition ${
              editor.isActive("link") ? "bg-primary text-white" : ""
            }`}
            title="Add Link"
          >
            <LinkIcon className="w-4 h-4" />
          </button>

          {showLinkInput && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg p-2 z-10">
              <input
                id="link-input"
                type="text"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="https://example.com"
                className="w-40 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="button"
                onClick={addLink}
                className="ml-2 px-2 py-1 bg-primary text-white rounded text-xs hover:bg-primary-deep"
              >
                Add
              </button>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px bg-gray-300 mx-1" />

        {/* Undo/Redo */}
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-2 rounded hover:bg-gray-200 transition disabled:opacity-50"
          title="Undo"
        >
          <Undo2 className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-2 rounded hover:bg-gray-200 transition disabled:opacity-50"
          title="Redo"
        >
          <Redo2 className="w-4 h-4" />
        </button>

        {/* Divider */}
        {placeholders.length > 0 && <div className="w-px bg-gray-300 mx-1" />}

        {/* Placeholders Dropdown */}
        {placeholders.length > 0 && (
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setShowPlaceholderDropdown(!showPlaceholderDropdown)}
              className="flex items-center gap-1.5 px-2 py-2 rounded hover:bg-gray-200 transition text-sm font-medium text-gray-700"
              title="Insert Placeholder"
            >
              <span>Placeholders</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showPlaceholderDropdown ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown Menu */}
            {showPlaceholderDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-w-xs">
                <div className="max-h-80 overflow-y-auto">
                  {placeholders.map((placeholder, index) => {
                    const code = typeof placeholder === "string" ? placeholder : placeholder.code;
                    const name = formatPlaceholderName(placeholder);
                    return (
                      <button
                        key={code || index}
                        type="button"
                        onClick={() => insertPlaceholder(code)}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors"
                      >
                        <code className="text-xs font-mono text-blue-600 block mb-0.5">{`{{${code}}}`}</code>
                        <span className="text-xs text-gray-500">{name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Editor Content */}
      <div className="px-4 py-3 min-h-64 text-sm">
        <EditorContent
          editor={editor}
          className="focus:outline-none [&_.is-editor-empty:first-child::before]:text-gray-300 [&_.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]"
          data-placeholder={placeholder}
        />
      </div>
    </div>
  );
}

export default RichTextEditor;
