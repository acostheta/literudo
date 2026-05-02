"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu, FloatingMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import CharacterCount from "@tiptap/extension-character-count";
import {
  Box,
  IconButton,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  Paper,
} from "@mui/material";
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  StrikethroughS,
  FormatListBulleted,
  FormatListNumbered,
  FormatQuote,
  AddPhotoAlternate,
  Link as LinkIcon,
  Title,
  Code,
} from "@mui/icons-material";

interface EditorProps {
  content?: any;
  onChange: (json: any) => void;
}

export default function Editor({ content, onChange }: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "El conocimiento es la única libertad... Empieza a escribir aquí.",
      }),
      Link.configure({
        openOnClick: false,
      }),
      Image,
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      CharacterCount,
    ],
    immediatelyRender: false,
    content: content || "",
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[400px] literudo-editor',
      },
    },
  });

  if (!editor) return null;

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      {/* Barra de Herramientas Flotante (Bubble Menu) */}
      <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
        <Paper
          elevation={4}
          sx={{
            display: 'flex',
            bgcolor: 'primary.main',
            color: 'white',
            borderRadius: 1,
            p: 0.5,
          }}
        >
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().toggleBold().run()}
            sx={{ color: editor.isActive('bold') ? 'white' : 'rgba(255,255,255,0.5)' }}
          >
            <FormatBold fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            sx={{ color: editor.isActive('italic') ? 'white' : 'rgba(255,255,255,0.5)' }}
          >
            <FormatItalic fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            sx={{ color: editor.isActive('underline') ? 'white' : 'rgba(255,255,255,0.5)' }}
          >
            <FormatUnderlined fontSize="small" />
          </IconButton>
          <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.1)', mx: 0.5 }} />
          <IconButton
            size="small"
            onClick={() => {
              const url = window.prompt('URL del enlace:');
              if (url) editor.chain().focus().setLink({ href: url }).run();
            }}
            sx={{ color: editor.isActive('link') ? 'white' : 'rgba(255,255,255,0.5)' }}
          >
            <LinkIcon fontSize="small" />
          </IconButton>
        </Paper>
      </BubbleMenu>

      {/* Floating Menu (Aparece al principio de líneas vacías) */}
      <FloatingMenu editor={editor} tippyOptions={{ duration: 100 }}>
        <Paper
          elevation={2}
          sx={{
            display: 'flex',
            bgcolor: 'white',
            border: '1px solid #eee',
            borderRadius: 1,
            p: 0.5,
          }}
        >
          <Tooltip title="Título 1">
            <IconButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
              <Title fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Lista">
            <IconButton onClick={() => editor.chain().focus().toggleBulletList().run()}>
              <FormatListBulleted fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Cita">
            <IconButton onClick={() => editor.chain().focus().toggleBlockquote().run()}>
              <FormatQuote fontSize="small" />
            </IconButton>
          </Tooltip>
        </Paper>
      </FloatingMenu>

      {/* Área de Edición Principal */}
      <Box
        sx={{
          '& .literudo-editor': {
            fontFamily: '"Lora", serif', // Fuente literaria
            lineHeight: 1.8,
            color: '#333',
            '& h1': { fontSize: '2.5rem', fontWeight: 700, mb: 4 },
            '& h2': { fontSize: '1.8rem', fontWeight: 600, mb: 3 },
            '& p': { mb: 2 },
            '& blockquote': {
              borderLeft: '4px solid #eee',
              pl: 3,
              fontStyle: 'italic',
              color: '#666',
              my: 4
            },
            '& ul, & ol': { pl: 4, mb: 3 },
            '& a': { color: 'primary.main', textDecoration: 'underline' },
          }
        }}
      >
        <EditorContent editor={editor} />
      </Box>

      {/* Contador de Palabras */}
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Typography variant="caption" color="text.secondary">
          {editor.storage.characterCount.words()} palabras | {editor.storage.characterCount.characters()} caracteres
        </Typography>
      </Box>
    </Box>
  );
}

// Helper to avoid SSR issues with Tooltip
import { Tooltip, Typography } from "@mui/material";
