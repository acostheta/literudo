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
  Button,
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
import { useState, useEffect } from "react";

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
        px: 2,
        py: 1,
        borderBottom: "1px solid #f0f0f0",
        position: "sticky",
        top: 0,
        zIndex: 10,
        bgcolor: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(10px)",
        borderRadius: 0,
        gap: 0.5,
      }}
    >
      {/* Marca Discreta */}
      <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
        <Typography sx={{ 
          fontSize: '0.65rem', 
          fontWeight: 900, 
          letterSpacing: 2, 
          color: 'primary.main',
          textTransform: 'uppercase',
          border: '1.5px solid',
          borderColor: 'primary.main',
          px: 1,
          py: 0.2,
          borderRadius: 0.5
        }}>
          Literudo
        </Typography>
      </Box>

      <Divider orientation="vertical" flexItem sx={{ height: 20, my: 'auto', mr: 1, opacity: 0.5 }} />

      {/* Historial */}
      <Stack direction="row" spacing={0.2}>
        <Tooltip title="Deshacer (Ctrl+Z)">
          <IconButton size="small" onClick={() => editor.chain().focus().undo().run()} sx={{ color: '#666' }}>
            <Undo sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Rehacer (Ctrl+Y)">
          <IconButton size="small" onClick={() => editor.chain().focus().redo().run()} sx={{ color: '#666' }}>
            <Redo sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      </Stack>

      <Divider orientation="vertical" flexItem sx={{ height: 20, my: 'auto', mx: 1, opacity: 0.5 }} />

      {/* Títulos */}
      <IconButton 
        size="small" 
        onClick={(e) => setAnchorElHeading(e.currentTarget)}
        sx={{ 
          color: editor.isActive('heading') ? 'primary.main' : '#444', 
          borderRadius: 1, 
          px: 1.5,
          bgcolor: editor.isActive('heading') ? 'rgba(var(--mui-palette-primary-mainChannel), 0.08)' : 'transparent',
          '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' }
        }}
      >
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, mr: 0.5 }}>
          {editor.isActive('heading', { level: 1 }) ? 'Título Principal' : editor.isActive('heading', { level: 2 }) ? 'Subtítulo' : 'Cuerpo'}
        </Typography>
        <KeyboardArrowDown sx={{ fontSize: 14 }} />
      </IconButton>
      <Menu
        anchorEl={anchorElHeading}
        open={Boolean(anchorElHeading)}
        onClose={() => setAnchorElHeading(null)}
        slotProps={{ paper: { sx: { borderRadius: 0, boxShadow: '0 10px 30px rgba(0,0,0,0.1)', border: '1px solid #eee' } } }}
      >
        <MenuItem onClick={() => { editor.chain().focus().setParagraph().run(); setAnchorElHeading(null); }}>
          <Typography sx={{ fontSize: '0.9rem' }}>Texto Normal</Typography>
        </MenuItem>
        <MenuItem onClick={() => { editor.chain().focus().toggleHeading({ level: 1 }).run(); setAnchorElHeading(null); }}>
          <Typography sx={{ fontSize: '1.1rem', fontWeight: 800 }}>Título de Obra (H1)</Typography>
        </MenuItem>
        <MenuItem onClick={() => { editor.chain().focus().toggleHeading({ level: 2 }).run(); setAnchorElHeading(null); }}>
          <Typography sx={{ fontSize: '1rem', fontWeight: 700 }}>Sección (H2)</Typography>
        </MenuItem>
        <MenuItem onClick={() => { editor.chain().focus().toggleHeading({ level: 3 }).run(); setAnchorElHeading(null); }}>
          <Typography sx={{ fontSize: '0.9rem', fontWeight: 600 }}>Subsección (H3)</Typography>
        </MenuItem>
      </Menu>

      <Divider orientation="vertical" flexItem sx={{ height: 20, my: 'auto', mx: 1, opacity: 0.5 }} />

      {/* Formato de Texto Principal */}
      <Stack direction="row" spacing={0.2}>
        {[
          { icon: <FormatBold />, action: () => editor.chain().focus().toggleBold().run(), active: 'bold', label: 'Negrita' },
          { icon: <FormatItalic />, action: () => editor.chain().focus().toggleItalic().run(), active: 'italic', label: 'Cursiva' },
          { icon: <FormatUnderlined />, action: () => editor.chain().focus().toggleUnderline().run(), active: 'underline', label: 'Subrayado' },
          { icon: <StrikethroughS />, action: () => editor.chain().focus().toggleStrike().run(), active: 'strike', label: 'Tachado' },
        ].map((btn, i) => (
          <Tooltip key={i} title={btn.label}>
            <IconButton 
              size="small" 
              onClick={btn.action}
              sx={{ 
                color: editor.isActive(btn.active) ? 'primary.main' : '#444',
                bgcolor: editor.isActive(btn.active) ? 'rgba(var(--mui-palette-primary-mainChannel), 0.08)' : 'transparent',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' }
              }}
            >
              {btn.icon}
            </IconButton>
          </Tooltip>
        ))}
      </Stack>

      <Divider orientation="vertical" flexItem sx={{ height: 20, my: 'auto', mx: 1, opacity: 0.5 }} />

      {/* Bloques y Listas */}
      <Stack direction="row" spacing={0.2}>
        <Tooltip title="Lista con Viñetas">
          <IconButton size="small" onClick={() => editor.chain().focus().toggleBulletList().run()} sx={{ color: editor.isActive('bulletList') ? 'primary.main' : '#444' }}>
            <FormatListBulleted sx={{ fontSize: 20 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Cita Literaria">
          <IconButton size="small" onClick={() => editor.chain().focus().toggleBlockquote().run()} sx={{ color: editor.isActive('blockquote') ? 'primary.main' : '#444' }}>
            <FormatQuote sx={{ fontSize: 20 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Bloque de Código">
          <IconButton size="small" onClick={() => editor.chain().focus().toggleCodeBlock().run()} sx={{ color: editor.isActive('codeBlock') ? 'primary.main' : '#444' }}>
            <Code sx={{ fontSize: 20 }} />
          </IconButton>
        </Tooltip>
      </Stack>

      <Divider orientation="vertical" flexItem sx={{ height: 20, my: 'auto', mx: 1, opacity: 0.5 }} />

      {/* Alineación */}
      <Stack direction="row" spacing={0.2}>
        {[
          { icon: <FormatAlignLeft />, action: () => editor.chain().focus().setTextAlign('left').run(), align: 'left' },
          { icon: <FormatAlignCenter />, action: () => editor.chain().focus().setTextAlign('center').run(), align: 'center' },
          { icon: <FormatAlignJustify />, action: () => editor.chain().focus().setTextAlign('justify').run(), align: 'justify' },
        ].map((btn, i) => (
          <IconButton 
            key={i}
            size="small" 
            onClick={btn.action}
            sx={{ color: editor.isActive({ textAlign: btn.align }) ? 'primary.main' : '#444' }}
          >
            {btn.icon}
          </IconButton>
        ))}
      </Stack>

      <Divider orientation="vertical" flexItem sx={{ height: 20, my: 'auto', mx: 1, opacity: 0.5 }} />

      {/* Extras */}
      <Stack direction="row" spacing={0.2}>
        <IconButton 
          size="small" 
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          sx={{ color: editor.isActive('highlight') ? 'primary.main' : '#444' }}
        >
          <HighlightIcon sx={{ fontSize: 18 }} />
        </IconButton>
        <IconButton 
          size="small" 
          onClick={() => {
            const url = window.prompt('URL del enlace:');
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }}
          sx={{ color: editor.isActive('link') ? 'primary.main' : '#444' }}
        >
          <LinkIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Stack>

      <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
        <Button
          size="small"
          startIcon={<AddPhotoAlternate sx={{ fontSize: 18 }} />}
          sx={{ 
            color: 'primary.main', 
            fontSize: '0.7rem', 
            fontWeight: 700,
            textTransform: 'none',
            '&:hover': { bgcolor: 'rgba(var(--mui-palette-primary-mainChannel), 0.04)' }
          }}
        >
          Añadir Multimedia
        </Button>
      </Box>
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

  // Efecto para cargar el contenido cuando llega de forma asíncrona (edición)
  useEffect(() => {
    if (editor && content && editor.isEmpty) {
      editor.commands.setContent(content);
    }
  }, [editor, content]);

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
