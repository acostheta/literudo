"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Box,
  Container,
  Typography,
  IconButton,
  Stack,
  CircularProgress,
  Divider,
  Tooltip,
} from "@mui/material";
import {
  ArrowBack as BackIcon,
} from "@mui/icons-material";
import Link from "next/link";

// Reutilizamos el renderizador poético pero con toques más refinados para el público
const PublicPoeticRenderer = ({ content }: { content: any }) => {
  if (!content) return null;

  const renderNode = (node: any, index: number): React.ReactNode => {
    if (!node) return null;
    const key = `${node.type}-${index}`;

    switch (node.type) {
      case 'doc':
        return node.content?.map((child: any, i: number) => renderNode(child, i));
      
      case 'heading':
        const level = node.attrs?.level || 1;
        return (
          <Typography 
            key={key}
            variant={`h${level}` as any} 
            sx={{ 
              fontFamily: '"Lora", serif', 
              fontWeight: 800,
              mt: level === 1 ? 8 : 6,
              mb: 3,
              textAlign: level === 1 ? 'center' : 'left',
              lineHeight: 1.2,
              fontSize: level === 1 ? { xs: '2.5rem', md: '3.5rem' } : { xs: '1.8rem', md: '2.2rem' }
            }}
          >
            {node.content?.map((child: any, i: number) => renderNode(child, i))}
          </Typography>
        );

      case 'paragraph':
        return (
          <Typography 
            key={key}
            sx={{ 
              fontFamily: '"Lora", serif', 
              fontSize: '1.2rem',
              lineHeight: 2.1,
              mb: 4,
              color: '#2c2c2c',
              textAlign: 'justify',
              textJustify: 'inter-word',
              letterSpacing: '0.01em'
            }}
          >
            {node.content?.map((child: any, i: number) => renderNode(child, i))}
          </Typography>
        );

      case 'blockquote':
        return (
          <Box 
            key={key}
            sx={{ 
              my: 8, 
              py: 1,
              px: { xs: 3, md: 6 },
              borderLeft: '1.5px solid #1a1a1a',
              fontStyle: 'italic',
              bgcolor: 'rgba(0,0,0,0.02)',
              borderRadius: '0 8px 8px 0'
            }}
          >
            <Typography sx={{ fontSize: '1.5rem', fontFamily: '"Lora", serif', color: '#444', lineHeight: 1.6 }}>
              {node.content?.map((child: any, i: number) => renderNode(child, i))}
            </Typography>
          </Box>
        );

      case 'text':
        let text: React.ReactNode = node.text;
        if (node.marks) {
          node.marks.forEach((mark: any) => {
            if (mark.type === 'bold') text = <strong style={{ fontWeight: 800 }}>{text}</strong>;
            if (mark.type === 'italic') text = <em style={{ fontStyle: 'italic' }}>{text}</em>;
            if (mark.type === 'underline') text = <u style={{ textDecoration: 'underline' }}>{text}</u>;
            if (mark.type === 'highlight') text = <mark style={{ backgroundColor: '#fff59d', padding: '0 4px' }}>{text}</mark>;
            if (mark.type === 'link') text = <a href={mark.attrs.href} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>{text}</a>;
          });
        }
        return <span key={key}>{text}</span>;

      case 'bulletList':
        return <ul key={key} style={{ paddingLeft: '2rem', marginBottom: '2.5rem', listStyleType: 'circle' }}>{node.content?.map((child: any, i: number) => renderNode(child, i))}</ul>;
      
      case 'listItem':
        return <li key={key} style={{ marginBottom: '1.2rem', fontFamily: '"Lora", serif', fontSize: '1.1rem', color: '#333' }}>{node.content?.map((child: any, i: number) => renderNode(child, i))}</li>;

      case 'horizontalRule':
        return <Box key={key} sx={{ display: 'flex', justifyContent: 'center', my: 12, opacity: 0.2 }}>
          <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#000', mx: 1 }} />
          <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#000', mx: 1 }} />
          <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#000', mx: 1 }} />
        </Box>;

      default:
        return null;
    }
  };

  return <Box>{renderNode(content, 0)}</Box>;
};

export default function PublicPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchPost = async () => {
      const { data } = await supabase
        .from("posts")
        .select("*, profiles(name, avatar_url)")
        .eq("slug", slug)
        .eq("status", "publicado")
        .single();

      if (data) setPost(data);
      setLoading(false);
    };

    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: '#fdfdfb' }}>
        <CircularProgress color="inherit" size={20} />
      </Box>
    );
  }

  if (!post) {
    return (
      <Container sx={{ py: 15, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ fontFamily: '"Lora", serif', mb: 4 }}>Esta página del libro está en blanco.</Typography>
        <Typography sx={{ mb: 6, opacity: 0.6 }}>La obra que buscas no existe o aún no ha sido revelada al mundo.</Typography>
        <Button component={Link} href="/" variant="outlined" color="inherit" sx={{ borderRadius: 0, px: 4 }}>
          Volver al Inicio
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: '#fdfdfb', 
      color: '#1a1a1a',
      pb: 20,
      animation: 'fadeIn 1.5s ease-in-out',
      '@keyframes fadeIn': {
        from: { opacity: 0, transform: 'translateY(10px)' },
        to: { opacity: 1, transform: 'translateY(0)' }
      }
    }}>
      {/* Botón Volver Discreto */}
      <Box sx={{ position: 'absolute', top: { xs: 20, md: 40 }, left: { xs: 20, md: 40 } }}>
        <IconButton component={Link} href="/" sx={{ opacity: 0.3, '&:hover': { opacity: 1 } }}>
          <BackIcon />
        </IconButton>
      </Box>

      <Container maxWidth="sm" sx={{ pt: { xs: 12, md: 24 } }}>
        <Stack spacing={2} sx={{ alignItems: "center" }}>
          {/* Categoría o Sello */}
          <Typography variant="caption" sx={{ letterSpacing: 4, textTransform: 'uppercase', opacity: 0.4, fontWeight: 700 }}>
            {post.category || 'Literudo'}
          </Typography>

          {/* Título Principal */}
          <Typography 
            variant="h1" 
            sx={{ 
              fontFamily: '"Lora", serif', 
              fontWeight: 800, 
              fontSize: { xs: '2.8rem', md: '4.8rem' },
              textAlign: 'center',
              lineHeight: 1,
              letterSpacing: -2,
              mt: 2,
              mb: 4
            }}
          >
            {post.title}
          </Typography>

          <Divider sx={{ width: 60, height: 2, bgcolor: '#1a1a1a', my: 6, opacity: 0.1, border: 'none' }} />

          {/* Resumen Poético */}
          {post.excerpt && (
            <Typography 
              sx={{ 
                fontFamily: '"Lora", serif', 
                fontSize: '1.4rem',
                fontStyle: 'italic',
                textAlign: 'center',
                color: '#555',
                lineHeight: 1.7,
                maxWidth: '90%',
                mb: 12
              }}
            >
              {post.excerpt}
            </Typography>
          )}

          {/* Cuerpo de la Obra */}
          <Box sx={{ width: '100%' }}>
            <PublicPoeticRenderer content={post.content} />
          </Box>

          {/* Firma Final */}
          <Box sx={{ mt: 15, width: '100%', textAlign: 'center' }}>
            <Divider sx={{ mb: 10, width: '30%', mx: 'auto', opacity: 0.1 }} />
            
            <Stack spacing={2} sx={{ alignItems: "center" }}>
              <Typography variant="caption" sx={{ letterSpacing: 3, textTransform: 'uppercase', opacity: 0.4 }}>
                Fin de la Obra
              </Typography>
              
              <Typography sx={{ fontFamily: '"Lora", serif', fontSize: '1.2rem', fontWeight: 700 }}>
                {post.profiles?.name || "Autor Anónimo"}
              </Typography>
              
              <Typography variant="caption" sx={{ opacity: 0.3, fontStyle: 'italic' }}>
                Publicado el {new Date(post.created_at).toLocaleDateString('es-ES', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </Typography>
            </Stack>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}

import { Button } from "@mui/material";
