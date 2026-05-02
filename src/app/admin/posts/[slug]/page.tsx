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
  Paper,
  Button,
  Tooltip,
} from "@mui/material";
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import Link from "next/link";

// Usaremos un componente simple para renderizar el JSONB de TipTap
const PoeticRenderer = ({ content }: { content: any }) => {
  if (!content) return null;

  // Una implementación simple para transformar el JSON de TipTap en HTML poético
  // Para una implementación real, se podría usar @tiptap/html o similar
  // Aquí usaremos una técnica de renderizado recursivo simple
  
  const renderNode = (node: any, index: number): React.ReactNode => {
    if (!node) return null;

    const key = `${node.type}-${index}`;

    switch (node.type) {
      case 'doc':
        return node.content?.map((child: any, i: number) => renderNode(child, i));
      
      case 'heading':
        const HeadingTag = `h${node.attrs?.level || 1}` as any;
        return (
          <Typography 
            key={key}
            variant={HeadingTag} 
            sx={{ 
              fontFamily: '"Lora", serif', 
              fontWeight: 800,
              mt: 6,
              mb: 3,
              textAlign: 'center',
              lineHeight: 1.2
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
              fontSize: '1.25rem',
              lineHeight: 2,
              mb: 4,
              color: '#222',
              textAlign: 'justify',
              textJustify: 'inter-word'
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
              py: 2,
              px: { xs: 4, md: 8 },
              borderLeft: '2px solid',
              borderColor: 'primary.main',
              fontStyle: 'italic',
              position: 'relative'
            }}
          >
            <Typography sx={{ fontSize: '1.6rem', fontFamily: '"Lora", serif', color: '#555', lineHeight: 1.6 }}>
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
            if (mark.type === 'link') text = <a href={mark.attrs.href} target="_blank" rel="noopener noreferrer" style={{ color: '#000', textDecoration: 'underline' }}>{text}</a>;
          });
        }
        return <span key={key}>{text}</span>;

      case 'bulletList':
        return <ul key={key} style={{ paddingLeft: '2rem', marginBottom: '2rem' }}>{node.content?.map((child: any, i: number) => renderNode(child, i))}</ul>;
      
      case 'listItem':
        return <li key={key} style={{ marginBottom: '1rem', fontFamily: '"Lora", serif', fontSize: '1.1rem' }}>{node.content?.map((child: any, i: number) => renderNode(child, i))}</li>;

      case 'horizontalRule':
        return <Divider key={key} sx={{ my: 10, width: '40%', mx: 'auto', opacity: 0.3 }} />;

      default:
        return null;
    }
  };

  return <Box>{renderNode(content, 0)}</Box>;
};

export default function PostDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchPost = async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*, profiles(name)")
        .eq("slug", slug)
        .single();

      if (data) setPost(data);
      setLoading(false);
    };

    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: '#fcfcfb' }}>
        <CircularProgress color="inherit" size={30} />
      </Box>
    );
  }

  if (!post) {
    return (
      <Container sx={{ py: 10, textAlign: 'center' }}>
        <Typography variant="h5">Obra no encontrada.</Typography>
        <Button onClick={() => router.back()} sx={{ mt: 2 }}>Volver</Button>
      </Container>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: '#fdfdfb', // Tono papel marfil
      color: '#1a1a1a',
      pb: 15
    }}>
      {/* Barra de Navegación Discreta */}
      <Box sx={{ position: 'fixed', top: 20, left: 20, zIndex: 100 }}>
        <Tooltip title="Volver a la lista">
          <IconButton 
            onClick={() => router.back()}
            sx={{ 
              bgcolor: 'white', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              border: '1px solid #eee',
              '&:hover': { bgcolor: '#fafafa' }
            }}
          >
            <BackIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ position: 'fixed', top: 20, right: 20, zIndex: 100 }}>
        <Button 
          component={Link} 
          href={`/admin/posts/edit/${post.id}`}
          variant="contained"
          startIcon={<EditIcon />}
          sx={{ 
            bgcolor: '#1a1a1a', 
            borderRadius: 0, 
            px: 3,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            '&:hover': { bgcolor: '#000' }
          }}
        >
          Editar Obra
        </Button>
      </Box>

      <Container maxWidth="sm" sx={{ pt: { xs: 10, md: 20 } }}>
          <Stack spacing={4} sx={{ alignItems: "center" }}>
          {/* Título Poético */}
          <Typography 
            variant="h1" 
            sx={{ 
              fontFamily: '"Lora", serif', 
              fontWeight: 800, 
              fontSize: { xs: '3rem', md: '4.5rem' },
              textAlign: 'center',
              lineHeight: 1.1,
              letterSpacing: -2,
              mb: 2
            }}
          >
            {post.title}
          </Typography>

          {/* Sello Literudo */}
          <Box sx={{ 
            width: 40, 
            height: 1, 
            bgcolor: 'primary.main', 
            my: 4,
            opacity: 0.6
          }} />

          {/* Resumen / Bajada */}
          {post.excerpt && (
            <Typography 
              sx={{ 
                fontFamily: '"Lora", serif', 
                fontSize: '1.5rem',
                fontStyle: 'italic',
                textAlign: 'center',
                color: '#555',
                lineHeight: 1.6,
                maxWidth: '90%',
                mb: 10
              }}
            >
              {post.excerpt}
            </Typography>
          )}

          {/* Cuerpo de la Obra */}
          <Box sx={{ width: '100%', mt: 8 }}>
            <PoeticRenderer content={post.content} />
          </Box>

          <Divider sx={{ my: 15, width: '20%', opacity: 0.2 }} />

          {/* Firma del Autor */}
          <Stack spacing={1} sx={{ alignItems: "center" }}>
            <Typography variant="caption" sx={{ letterSpacing: 3, textTransform: 'uppercase', opacity: 0.4 }}>
              Escrito por
            </Typography>
            <Typography sx={{ fontFamily: '"Lora", serif', fontSize: '1.2rem', fontWeight: 700 }}>
              {post.profiles?.name || "Autor Anónimo"}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.3, mt: 1 }}>
              {new Date(post.created_at).toLocaleDateString('es-ES', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}
            </Typography>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
