"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import CharacterCount from "@tiptap/extension-character-count";
import {
  Box,
  IconButton,
  Stack,
  Divider,
  Paper,
  Tooltip,
  Typography,
  Menu,
  MenuItem,
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
  Undo,
  Redo,
  FormatAlignLeft,
  FormatAlignCenter,
  FormatAlignRight,
  FormatAlignJustify,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Highlight as HighlightIcon,
  KeyboardArrowDown,
  CodeOff,
} from "@mui/icons-material";
import { useState } from "react";

interface EditorProps {
  content?: any;
  onChange: (json: any) => void;
}

const MenuBar = ({ editor }: { editor: any }) => {
  const [anchorElHeading, setAnchorElHeading] = useState<null | HTMLElement>(null);

  if (!editor) return null;

  return (
    <Paper
      elevation={0}
      sx={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        p: 0.5,
        borderBottom: "1px solid #eee",
        position: "sticky",
        top: 0,
        zIndex: 10,
        bgcolor: "#1a1a1a", // Toolbar oscura como en la captura
        color: "white",
        borderRadius: 0,
        gap: 0.5,
      }}
    >
      {/* Historial */}
      <Stack direction="row" spacing={0.5}>
        <IconButton size="small" onClick={() => editor.chain().focus().undo().run()} sx={{ color: 'white', opacity: 0.7 }}>
          <Undo fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={() => editor.chain().focus().redo().run()} sx={{ color: 'white', opacity: 0.7 }}>
          <Redo fontSize="small" />
        </IconButton>
      </Stack>

      <Divider orientation="vertical" flexItem sx={{ bgcolor: "rgba(255,255,255,0.1)", mx: 1 }} />

      {/* Títulos */}
      <IconButton 
        size="small" 
        onClick={(e) => setAnchorElHeading(e.currentTarget)}
        sx={{ color: editor.isActive('heading') ? 'primary.light' : 'white', borderRadius: 1, px: 1 }}
      >
        <Typography variant="caption" sx={{ fontWeight: 'bold', mr: 0.5 }}>
          {editor.isActive('heading', { level: 1 }) ? 'H1' : editor.isActive('heading', { level: 2 }) ? 'H2' : 'Texto'}
        </Typography>
        <KeyboardArrowDown fontSize="inherit" />
      </IconButton>
      <Menu
        anchorEl={anchorElHeading}
        open={Boolean(anchorElHeading)}
        onClose={() => setAnchorElHeading(null)}
      >
        <MenuItem onClick={() => { editor.chain().focus().setParagraph().run(); setAnchorElHeading(null); }}>Párrafo</MenuItem>
        <MenuItem onClick={() => { editor.chain().focus().toggleHeading({ level: 1 }).run(); setAnchorElHeading(null); }}>Título 1 (H1)</MenuItem>
        <MenuItem onClick={() => { editor.chain().focus().toggleHeading({ level: 2 }).run(); setAnchorElHeading(null); }}>Título 2 (H2)</MenuItem>
        <MenuItem onClick={() => { editor.chain().focus().toggleHeading({ level: 3 }).run(); setAnchorElHeading(null); }}>Título 3 (H3)</MenuItem>
      </Menu>

      <Divider orientation="vertical" flexItem sx={{ bgcolor: "rgba(255,255,255,0.1)", mx: 1 }} />

      {/* Listas y Bloques */}
      <Stack direction="row" spacing={0.5}>
        <IconButton 
          size="small" 
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          sx={{ color: editor.isActive('bulletList') ? 'primary.light' : 'white' }}
        >
          <FormatListBulleted fontSize="small" />
        </IconButton>
        <IconButton 
          size="small" 
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          sx={{ color: editor.isActive('orderedList') ? 'primary.light' : 'white' }}
        >
          <FormatListNumbered fontSize="small" />
        </IconButton>
        <IconButton 
          size="small" 
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          sx={{ color: editor.isActive('blockquote') ? 'primary.light' : 'white' }}
        >
          <FormatQuote fontSize="small" />
        </IconButton>
        <IconButton 
          size="small" 
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          sx={{ color: editor.isActive('codeBlock') ? 'primary.light' : 'white' }}
        >
          <Code fontSize="small" />
        </IconButton>
      </Stack>

      <Divider orientation="vertical" flexItem sx={{ bgcolor: "rgba(255,255,255,0.1)", mx: 1 }} />

      {/* Formato de Texto */}
      <Stack direction="row" spacing={0.5}>
        <IconButton 
          size="small" 
          onClick={() => editor.chain().focus().toggleBold().run()}
          sx={{ color: editor.isActive('bold') ? 'primary.light' : 'white' }}
        >
          <FormatBold fontSize="small" />
        </IconButton>
        <IconButton 
          size="small" 
          onClick={() => editor.chain().focus().toggleItalic().run()}
          sx={{ color: editor.isActive('italic') ? 'primary.light' : 'white' }}
        >
          <FormatItalic fontSize="small" />
        </IconButton>
        <IconButton 
          size="small" 
          onClick={() => editor.chain().focus().toggleStrike().run()}
          sx={{ color: editor.isActive('strike') ? 'primary.light' : 'white' }}
        >
          <StrikethroughS fontSize="small" />
        </IconButton>
        <IconButton 
          size="small" 
          onClick={() => editor.chain().focus().toggleCode().run()}
          sx={{ color: editor.isActive('code') ? 'primary.light' : 'white' }}
        >
          <CodeOff fontSize="small" />
        </IconButton>
        <IconButton 
          size="small" 
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          sx={{ color: editor.isActive('underline') ? 'primary.light' : 'white' }}
        >
          <FormatUnderlined fontSize="small" />
        </IconButton>
        <IconButton 
          size="small" 
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          sx={{ color: editor.isActive('highlight') ? 'primary.light' : 'white' }}
        >
          <HighlightIcon fontSize="small" />
        </IconButton>
        <IconButton 
          size="small" 
          onClick={() => {
            const url = window.prompt('URL del enlace:');
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }}
          sx={{ color: editor.isActive('link') ? 'primary.light' : 'white' }}
        >
          <LinkIcon fontSize="small" />
        </IconButton>
      </Stack>

      <Divider orientation="vertical" flexItem sx={{ bgcolor: "rgba(255,255,255,0.1)", mx: 1 }} />

      {/* Sub/Super script */}
      <Stack direction="row" spacing={0.5}>
        <IconButton 
          size="small" 
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
          sx={{ color: editor.isActive('superscript') ? 'primary.light' : 'white' }}
        >
          <SuperscriptIcon fontSize="small" />
        </IconButton>
        <IconButton 
          size="small" 
          onClick={() => editor.chain().focus().toggleSubscript().run()}
          sx={{ color: editor.isActive('subscript') ? 'primary.light' : 'white' }}
        >
          <SubscriptIcon fontSize="small" />
        </IconButton>
      </Stack>

      <Divider orientation="vertical" flexItem sx={{ bgcolor: "rgba(255,255,255,0.1)", mx: 1 }} />

      {/* Alineación */}
      <Stack direction="row" spacing={0.5}>
        <IconButton 
          size="small" 
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          sx={{ color: editor.isActive({ textAlign: 'left' }) ? 'primary.light' : 'white' }}
        >
          <FormatAlignLeft fontSize="small" />
        </IconButton>
        <IconButton 
          size="small" 
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          sx={{ color: editor.isActive({ textAlign: 'center' }) ? 'primary.light' : 'white' }}
        >
          <FormatAlignCenter fontSize="small" />
        </IconButton>
        <IconButton 
          size="small" 
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          sx={{ color: editor.isActive({ textAlign: 'right' }) ? 'primary.light' : 'white' }}
        >
          <FormatAlignRight fontSize="small" />
        </IconButton>
        <IconButton 
          size="small" 
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          sx={{ color: editor.isActive({ textAlign: 'justify' }) ? 'primary.light' : 'white' }}
        >
          <FormatAlignJustify fontSize="small" />
        </IconButton>
      </Stack>

      <Divider orientation="vertical" flexItem sx={{ bgcolor: "rgba(255,255,255,0.1)", mx: 1 }} />

      {/* Media */}
      <IconButton size="small" sx={{ color: 'white', ml: 'auto' }}>
        <AddPhotoAlternate fontSize="small" />
        <Typography variant="caption" sx={{ ml: 0.5, fontWeight: 'bold' }}>Add</Typography>
      </IconButton>
    </Paper>
  );
};

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
      Highlight,
      Superscript,
      Subscript,
      CharacterCount,
    ],
    immediatelyRender: false,
    content: content || "",
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[500px] literudo-editor',
      },
    },
  });

  if (!editor) return null;

  return (
    <Box sx={{ border: "1px solid #eee", borderRadius: 1, overflow: 'hidden' }}>
      <MenuBar editor={editor} />
      
      <Box
        sx={{
          p: 4,
          '& .literudo-editor': {
            fontFamily: '"Lora", serif',
            fontSize: '1.2rem',
            lineHeight: 1.8,
            color: '#222',
            '& h1': { fontSize: '2.5rem', fontWeight: 800, mb: 4, letterSpacing: -0.5 },
            '& h2': { fontSize: '1.8rem', fontWeight: 700, mb: 3, mt: 5, letterSpacing: -0.3 },
            '& p': { mb: 3 },
            '& blockquote': {
              borderLeft: '3px solid',
              borderColor: 'primary.main',
              pl: 4,
              py: 1,
              mx: 0,
              fontStyle: 'italic',
              fontSize: '1.4rem',
              color: '#555',
              my: 6,
            },
            '& ul, & ol': { pl: 4, mb: 4 },
            '& li': { mb: 1.5 },
            '& pre': {
              bgcolor: '#f5f5f5',
              p: 3,
              borderRadius: 1,
              fontFamily: 'monospace',
              fontSize: '0.9rem',
              overflowX: 'auto',
              my: 4
            },
            '& .is-editor-empty:first-of-type::before': {
              content: 'attr(data-placeholder)',
              float: 'left',
              color: '#adb5bd',
              pointerEvents: 'none',
              height: 0,
            },
          }
        }}
      >
        <EditorContent editor={editor} />
      </Box>

      {/* Contador de Palabras */}
      <Box sx={{ p: 1.5, borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end', bgcolor: '#fcfcfc' }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
          {editor.storage.characterCount.words()} palabras | {editor.storage.characterCount.characters()} caracteres
        </Typography>
      </Box>
    </Box>
  );
}
