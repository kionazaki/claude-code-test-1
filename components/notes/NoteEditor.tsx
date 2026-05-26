"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Heading from "@tiptap/extension-heading";
import CodeBlock from "@tiptap/extension-code-block";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import { NoteToolbar } from "./NoteToolbar";

interface NoteEditorProps {
  content: object;
  onChange?: (json: object) => void;
  readOnly?: boolean;
  className?: string;
}

export function NoteEditor({
  content,
  onChange,
  readOnly = false,
  className = "",
}: NoteEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,  // we use the separate Heading extension
        codeBlock: false,
        horizontalRule: false,
      }),
      Heading.configure({ levels: [1, 2, 3] }),
      CodeBlock,
      HorizontalRule,
    ],
    content,
    editable: !readOnly,
    onUpdate({ editor }) {
      onChange?.(editor.getJSON());
    },
    editorProps: {
      attributes: {
        class: [
          "prose prose-sm sm:prose max-w-none focus:outline-none",
          "min-h-[200px] px-4 py-3",
          readOnly ? "" : "cursor-text",
        ].join(" "),
      },
    },
  });

  return (
    <div
      className={[
        "border border-gray-200 rounded-lg overflow-hidden",
        className,
      ].join(" ")}
    >
      {!readOnly && <NoteToolbar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  );
}
