import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, FileText, Tag, LogOut, Edit, Trash2, Image, Users, Star, MessageSquare, Save, Newspaper, Upload, Eye } from "lucide-react";
import { getStoredToken, verifyAdminToken, removeToken, AdminTokenPayload } from "@/lib/jwt";
import { getAllViewsStats, getArticleViewsDetailed, getCategoryViewsDetailed, getAuthorViewsDetailed } from "@/hooks/usePageView";
import { ImageCropDialog } from "@/components/ImageCropDialog";
import { BannerCropDialog } from "@/components/BannerCropDialog";
import { RichTextEditor } from "@/components/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Article = Tables<"articles">;
type Category = Tables<"categories">;
type Banner = Tables<"banners">;
type Author = Tables<"authors">;
type ContactMessage = Tables<"contact_messages">;
type CategoryFeaturedArticle = Tables<"category_featured_articles">;

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("articles");
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [featuredArticles, setFeaturedArticles] = useState<CategoryFeaturedArticle[]>([]);
  const [viewsStats, setViewsStats] = useState({ articles: 0, categories: 0, authors: 0, site: 0, total: 0 });
  const [articleViewsDetailed, setArticleViewsDetailed] = useState<{ article_id: string; count: number }[]>([]);
  const [categoryViewsDetailed, setCategoryViewsDetailed] = useState<{ category_id: string; count: number }[]>([]);
  const [authorViewsDetailed, setAuthorViewsDetailed] = useState<{ author_id: string; count: number }[]>([]);
  const [isArticleDialogOpen, setIsArticleDialogOpen] = useState(false);
  const [isNewsDialogOpen, setIsNewsDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isBannerDialogOpen, setIsBannerDialogOpen] = useState(false);
  const [isAuthorDialogOpen, setIsAuthorDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isCropDialogOpen, setIsCropDialogOpen] = useState(false);
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [isBannerCropDialogOpen, setIsBannerCropDialogOpen] = useState(false);
  const [bannerCropImage, setBannerCropImage] = useState<string | null>(null);
  const [isArticleCropDialogOpen, setIsArticleCropDialogOpen] = useState(false);
  const [articleCropImage, setArticleCropImage] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const [articleForm, setArticleForm] = useState<Partial<TablesInsert<"articles">>>({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    author: "",
    cover_image: "",
    article_type: "texto",
    published: false,
    is_featured: false,
    author_id: null,
  });

  const [newsForm, setNewsForm] = useState<Partial<TablesInsert<"articles">>>({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    author: "",
    cover_image: "",
    article_type: "noticia",
    published: false,
    is_featured: false,
    author_id: null,
  });

  const [categoryForm, setCategoryForm] = useState<Partial<TablesInsert<"categories">>>({
    name: "",
    slug: "",
    color: "#e4142c",
  });

  const [bannerForm, setBannerForm] = useState<Partial<TablesInsert<"banners">>>({
    title: "",
    excerpt: "",
    image_url: "",
    article_slug: "",
    category: "",
    order_index: 0,
    active: true,
  });

  const [authorForm, setAuthorForm] = useState<Partial<TablesInsert<"authors">>>({
    name: "",
    slug: "",
    bio: "",
    avatar_url: "",
    instagram_url: "",
    facebook_url: "",
    twitter_url: "",
    youtube_url: "",
    show_in_list: true,
  });

  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const validateSession = async () => {
      const token = getStoredToken();
      if (!token) {
        navigate("/gatewayhorsemint/login");
        return;
      }
      const payload = await verifyAdminToken(token);
      if (!payload) {
        removeToken();
        toast({
          variant: "destructive",
          title: "Sessão expirada",
          description: "Sua sessão expirou ou é inválida. Faça login novamente.",
        });
        navigate("/gatewayhorsemint/login");
        return;
      }

      setIsAuthenticated(true);
      loadData();
    };

    validateSession();
  }, [navigate]);

  const loadData = async () => {
    await Promise.all([
      loadArticles(),
      loadCategories(),
      loadBanners(),
      loadAuthors(),
      loadMessages(),
      loadFeaturedArticles(),
      loadViewsStats(),
    ]);
  };

  const loadViewsStats = async () => {
    try {
      const [stats, articleDetails, categoryDetails, authorDetails] = await Promise.all([
        getAllViewsStats(),
        getArticleViewsDetailed(),
        getCategoryViewsDetailed(),
        getAuthorViewsDetailed(),
      ]);
      setViewsStats(stats);
      setArticleViewsDetailed(articleDetails);
      setCategoryViewsDetailed(categoryDetails);
      setAuthorViewsDetailed(authorDetails);
    } catch (error) {
    }
  };

  const loadArticles = async () => {
    const { data, error } = await supabase.from("articles").select("*").order("created_at", { ascending: false });
    if (error) {
      toast({ variant: "destructive", title: "Erro", description: "Erro ao carregar artigos." });
    } else {
      setArticles(data || []);
    }
  };
  const handleImageUpload = async (file: File, type: "author" | "banner" | "article"): Promise<string | null> => {
    try {
      setUploadingImage(true);
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = type === "author" ? `authors/${fileName}` : type === "banner" ? `banners/${fileName}` : `articles/${fileName}`;
      let processedFile = file;
      if (type === "banner") {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new window.Image();
        await new Promise((resolve, reject) => {
          img.onload = () => {
            canvas.width = 1920;
            canvas.height = 1080;
            ctx?.drawImage(img, 0, 0, 1920, 1080);
            canvas.toBlob((blob) => {
              if (blob) {
                processedFile = new File([blob], fileName, { type: "image/jpeg" });
                resolve(null);
              } else {
                reject(new Error("Erro ao processar imagem"));
              }
            }, "image/jpeg", 0.95);
          };
          img.onerror = reject;
          img.src = URL.createObjectURL(file);
        });
      }

      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(filePath, processedFile);

      if (uploadError) {
        toast({ variant: "destructive", title: "Erro", description: "Erro ao fazer upload da imagem." });
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("images")
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      toast({ variant: "destructive", title: "Erro", description: "Erro ao processar imagem." });
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const loadCategories = async () => {
    const { data, error } = await supabase.from("categories").select("*").order("name");
    if (error) {
      toast({ variant: "destructive", title: "Erro", description: "Erro ao carregar categorias." });
    } else {
      setCategories(data || []);
    }
  };

  const loadBanners = async () => {
    const { data, error } = await supabase.from("banners").select("*").order("order_index");
    if (error) {
      toast({ variant: "destructive", title: "Erro", description: "Erro ao carregar banners." });
    } else {
      setBanners(data || []);
    }
  };

  const loadAuthors = async () => {
    const { data, error } = await supabase.from("authors").select("*").order("name");
    if (error) {
      toast({ variant: "destructive", title: "Erro", description: "Erro ao carregar autores." });
    } else {
      setAuthors(data || []);
    }
  };

  const loadMessages = async () => {
    const { data, error } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
    if (error) {
      toast({ variant: "destructive", title: "Erro", description: "Erro ao carregar mensagens." });
    } else {
      setMessages(data || []);
    }
  };

  const loadFeaturedArticles = async () => {
    const { data, error } = await supabase.from("category_featured_articles").select("*");
    if (error) {
      toast({ variant: "destructive", title: "Erro", description: "Erro ao carregar destaques." });
    } else {
      setFeaturedArticles(data || []);
    }
  };

  const handleLogout = () => {
    removeToken();
    navigate("/gatewayhorsemint/login");
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleCreateArticle = async () => {
    if (!articleForm.title || !articleForm.content || !articleForm.author) {
      toast({ variant: "destructive", title: "Erro", description: "Preencha todos os campos obrigatórios." });
      return;
    }

    const slug = articleForm.slug || generateSlug(articleForm.title);
    const articleData: TablesInsert<"articles"> = {
      title: articleForm.title,
      slug,
      content: articleForm.content,
      excerpt: articleForm.excerpt || null,
      author: articleForm.author,
      cover_image: articleForm.cover_image || null,
      article_type: articleForm.article_type || "texto",
      published: articleForm.published || false,
      is_featured: articleForm.is_featured || false,
      author_id: articleForm.author_id || null,
      published_at: articleForm.published ? new Date().toISOString() : null,
    };

    const { data: newArticle, error } = await supabase.from("articles").insert(articleData).select().single();
    if (error) {
      toast({ variant: "destructive", title: "Erro", description: "Erro ao criar artigo." });
    } else {
      if (selectedCategories.length > 0 && newArticle) {
        const categoryLinks = selectedCategories.map(categoryId => ({
          article_id: newArticle.id,
          category_id: categoryId,
        }));
        await supabase.from("article_categories").insert(categoryLinks);
      }
      toast({ title: "Sucesso", description: "Artigo criado com sucesso!" });
      setIsArticleDialogOpen(false);
      resetArticleForm();
      loadArticles();
    }
  };

  const handleUpdateArticle = async (id: string) => {
    const { error } = await supabase
      .from("articles")
      .update(articleForm as TablesUpdate<"articles">)
      .eq("id", id);
    if (error) {
      toast({ variant: "destructive", title: "Erro", description: "Erro ao atualizar artigo." });
    } else {
      await supabase.from("article_categories").delete().eq("article_id", id);
      if (selectedCategories.length > 0) {
        const categoryLinks = selectedCategories.map(categoryId => ({
          article_id: id,
          category_id: categoryId,
        }));
        await supabase.from("article_categories").insert(categoryLinks);
      }
      toast({ title: "Sucesso", description: "Artigo atualizado com sucesso!" });
      setIsArticleDialogOpen(false);
      setEditingItem(null);
      resetArticleForm();
      loadArticles();
    }
  };

  const handleCreateNews = async () => {
    if (!newsForm.title || !newsForm.content || !newsForm.author) {
      toast({ variant: "destructive", title: "Erro", description: "Preencha todos os campos obrigatórios." });
      return;
    }

    const slug = newsForm.slug || generateSlug(newsForm.title);
    const newsData: TablesInsert<"articles"> = {
      title: newsForm.title,
      slug,
      content: newsForm.content,
      excerpt: newsForm.excerpt || null,
      author: newsForm.author,
      cover_image: newsForm.cover_image || null,
      article_type: "noticia",
      published: newsForm.published || false,
      is_featured: newsForm.is_featured || false,
      author_id: newsForm.author_id || null,
      published_at: newsForm.published ? new Date().toISOString() : null,
    };

    const { error } = await supabase.from("articles").insert(newsData);
    if (error) {
      toast({ variant: "destructive", title: "Erro", description: "Erro ao criar notícia." });
    } else {
      toast({ title: "Sucesso", description: "Notícia criada com sucesso!" });
      setIsNewsDialogOpen(false);
      setNewsForm({
        title: "",
        slug: "",
        content: "",
        excerpt: "",
        author: "",
        cover_image: "",
        article_type: "noticia",
        published: false,
        is_featured: false,
        author_id: null,
      });
      setEditingItem(null);
      loadArticles();
    }
  };

  const handleUpdateNews = async (id: string) => {
    const { error } = await supabase
      .from("articles")
      .update(newsForm as TablesUpdate<"articles">)
      .eq("id", id);
    if (error) {
      toast({ variant: "destructive", title: "Erro", description: "Erro ao atualizar notícia." });
    } else {
      toast({ title: "Sucesso", description: "Notícia atualizada com sucesso!" });
      setIsNewsDialogOpen(false);
      setEditingItem(null);
      setNewsForm({
        title: "",
        slug: "",
        content: "",
        excerpt: "",
        author: "",
        cover_image: "",
        article_type: "noticia",
        published: false,
        is_featured: false,
        author_id: null,
      });
      loadArticles();
    }
  };

  const handleDeleteArticle = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este artigo?")) return;
    const { error } = await supabase.from("articles").delete().eq("id", id);
    if (error) {
      toast({ variant: "destructive", title: "Erro", description: "Erro ao excluir artigo." });
    } else {
      toast({ title: "Sucesso", description: "Artigo excluído com sucesso!" });
      loadArticles();
    }
  };

  const handleCreateCategory = async () => {
    if (!categoryForm.name) {
      toast({ variant: "destructive", title: "Erro", description: "O nome da categoria é obrigatório." });
      return;
    }

    const slug = categoryForm.slug || generateSlug(categoryForm.name);
    const { error } = await supabase.from("categories").insert({
      name: categoryForm.name,
      slug,
      color: categoryForm.color || "#e4142c",
    });

    if (error) {
      toast({ variant: "destructive", title: "Erro", description: "Erro ao criar categoria." });
    } else {
      toast({ title: "Sucesso", description: "Categoria criada com sucesso!" });
      setIsCategoryDialogOpen(false);
      resetCategoryForm();
      loadCategories();
    }
  };

  const handleUpdateCategory = async (id: string) => {
    if (!categoryForm.name) {
      toast({ variant: "destructive", title: "Erro", description: "O nome da categoria é obrigatório." });
      return;
    }

    const slug = categoryForm.slug || generateSlug(categoryForm.name);
    const { error } = await supabase
      .from("categories")
      .update({
        name: categoryForm.name,
        slug,
        color: categoryForm.color || "#e4142c",
      })
      .eq("id", id);

    if (error) {
      toast({ variant: "destructive", title: "Erro", description: "Erro ao atualizar categoria." });
    } else {
      toast({ title: "Sucesso", description: "Categoria atualizada com sucesso!" });
      setIsCategoryDialogOpen(false);
      setEditingItem(null);
      resetCategoryForm();
      loadCategories();
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta categoria?")) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) {
      toast({ variant: "destructive", title: "Erro", description: "Erro ao excluir categoria." });
    } else {
      toast({ title: "Sucesso", description: "Categoria excluída com sucesso!" });
      loadCategories();
    }
  };

  const handleCreateBanner = async () => {
    if (!bannerForm.title || !bannerForm.image_url) {
      toast({ variant: "destructive", title: "Erro", description: "Preencha título e URL da imagem." });
      return;
    }

    const { error } = await supabase.from("banners").insert(bannerForm as TablesInsert<"banners">);
    if (error) {
      toast({ variant: "destructive", title: "Erro", description: "Erro ao criar banner." });
    } else {
      toast({ title: "Sucesso", description: "Banner criado com sucesso!" });
      setIsBannerDialogOpen(false);
      resetBannerForm();
      loadBanners();
    }
  };

  const handleUpdateBanner = async (id: string) => {
    const { error } = await supabase
      .from("banners")
      .update(bannerForm as TablesUpdate<"banners">)
      .eq("id", id);
    if (error) {
      toast({ variant: "destructive", title: "Erro", description: "Erro ao atualizar banner." });
    } else {
      toast({ title: "Sucesso", description: "Banner atualizado com sucesso!" });
      setIsBannerDialogOpen(false);
      setEditingItem(null);
      resetBannerForm();
      loadBanners();
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este banner?")) return;
    const { error } = await supabase.from("banners").delete().eq("id", id);
    if (error) {
      toast({ variant: "destructive", title: "Erro", description: "Erro ao excluir banner." });
    } else {
      toast({ title: "Sucesso", description: "Banner excluído com sucesso!" });
      loadBanners();
    }
  };

  const handleCreateAuthor = async () => {
    if (!authorForm.name) {
      toast({ variant: "destructive", title: "Erro", description: "O nome do autor é obrigatório." });
      return;
    }

    const slug = authorForm.slug || generateSlug(authorForm.name);
    const { error } = await supabase.from("authors").insert({
      ...authorForm,
      slug,
    } as TablesInsert<"authors">);

    if (error) {
      toast({ variant: "destructive", title: "Erro", description: "Erro ao criar autor." });
    } else {
      toast({ title: "Sucesso", description: "Autor criado com sucesso!" });
      setIsAuthorDialogOpen(false);
      resetAuthorForm();
      loadAuthors();
    }
  };

  const handleUpdateAuthor = async (id: string) => {
    const { error } = await supabase
      .from("authors")
      .update(authorForm as TablesUpdate<"authors">)
      .eq("id", id);
    if (error) {
      toast({ variant: "destructive", title: "Erro", description: "Erro ao atualizar autor." });
    } else {
      toast({ title: "Sucesso", description: "Autor atualizado com sucesso!" });
      setIsAuthorDialogOpen(false);
      setEditingItem(null);
      resetAuthorForm();
      loadAuthors();
    }
  };

  const handleDeleteAuthor = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este autor? Os artigos vinculados terão o autor desvinculado.")) return;
    await supabase.from("articles").update({ author_id: null }).eq("author_id", id);
    await supabase.from("author_views").delete().eq("author_id", id);
    const { error } = await supabase.from("authors").delete().eq("id", id);
    if (error) {
      toast({ variant: "destructive", title: "Erro", description: "Erro ao excluir autor. Verifique se não há referências pendentes." });
    } else {
      toast({ title: "Sucesso", description: "Autor excluído com sucesso!" });
      loadAuthors();
      loadArticles();
    }
  };

  const handleMarkMessageAsRead = async (id: string) => {
    const { error } = await supabase
      .from("contact_messages")
      .update({ read: true })
      .eq("id", id);
    if (error) {
      toast({ variant: "destructive", title: "Erro", description: "Erro ao marcar mensagem como lida." });
    } else {
      toast({ title: "Sucesso", description: "Mensagem marcada como lida!" });
      loadMessages();
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta mensagem?")) return;
    const { error } = await supabase.from("contact_messages").delete().eq("id", id);
    if (error) {
      toast({ variant: "destructive", title: "Erro", description: "Erro ao excluir mensagem." });
    } else {
      toast({ title: "Sucesso", description: "Mensagem excluída com sucesso!" });
      loadMessages();
    }
  };

  const handleSetFeatured = async (articleId: string, categoryId?: string) => {
    let finalCategoryId = categoryId;
    if (!finalCategoryId) {
      const { data: articleCategories } = await supabase
        .from("article_categories")
        .select("category_id")
        .eq("article_id", articleId)
        .limit(1);
      if (!articleCategories || articleCategories.length === 0) {
      toast({
        variant: "destructive",
        title: "Erro",
          description: "Este artigo não tem categorias. Adicione categorias ao artigo primeiro.",
      });
      return;
    }

      finalCategoryId = articleCategories[0].category_id;
    }

    const existing = featuredArticles.find(
      (fa) => fa.article_id === articleId && fa.category_id === finalCategoryId
    );
    if (existing) {
      const { error } = await supabase
        .from("category_featured_articles")
        .delete()
        .eq("id", existing.id);
      if (!error) {
        toast({ title: "Sucesso", description: "Destaque removido." });
        loadFeaturedArticles();
      }
    } else {
      const { error } = await supabase.from("category_featured_articles").insert({
        article_id: articleId,
        category_id: finalCategoryId,
        order_index: 0,
      });
      if (!error) {
        toast({ title: "Sucesso", description: "Artigo destacado!" });
        loadFeaturedArticles();
      }
    }
  };

  const resetArticleForm = () => {
    setArticleForm({
      title: "",
      slug: "",
      content: "",
      excerpt: "",
      author: "",
      cover_image: "",
      article_type: "texto",
      published: false,
      is_featured: false,
      author_id: null,
    });
    setSelectedCategories([]);
    setEditingItem(null);
  };

  const resetCategoryForm = () => {
    setCategoryForm({ name: "", slug: "", color: "#e4142c" });
  };

  const openEditCategory = (category: Category) => {
    setCategoryForm(category);
    setEditingItem(category.id);
    setIsCategoryDialogOpen(true);
  };

  const resetBannerForm = () => {
    setBannerForm({
      title: "",
      excerpt: "",
      image_url: "",
      article_slug: "",
      category: "",
      order_index: 0,
      active: true,
    });
    setEditingItem(null);
  };

  const resetAuthorForm = () => {
    setAuthorForm({
      name: "",
      slug: "",
      bio: "",
      avatar_url: "",
      instagram_url: "",
      facebook_url: "",
      twitter_url: "",
      youtube_url: "",
      show_in_list: true,
    });
    setEditingItem(null);
  };

  const openEditArticle = async (article: Article) => {
    setArticleForm(article);
    setEditingItem(article.id);
    const { data: articleCategories } = await supabase
      .from("article_categories")
      .select("category_id")
      .eq("article_id", article.id);
    if (articleCategories) {
      setSelectedCategories(articleCategories.map(ac => ac.category_id));
    }
    setIsArticleDialogOpen(true);
  };

  const openEditBanner = (banner: Banner) => {
    setBannerForm(banner);
    setEditingItem(banner.id);
    setIsBannerDialogOpen(true);
  };

  const openEditAuthor = (author: Author) => {
    setAuthorForm(author);
    setEditingItem(author.id);
    setIsAuthorDialogOpen(true);
  };
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-primary shadow-lg">
        <div className="container mx-auto px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div>
              <h1 className="text-base sm:text-xl font-bold text-white">Painel Admin</h1>
              <p className="text-white/70 text-xs hidden sm:block">Vozes da Maré</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            onClick={handleLogout}
            className="text-white hover:bg-white/10 hover:text-white text-sm sm:text-base"
          >
            <LogOut className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Sair</span>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-3 sm:px-6 py-4 sm:py-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-4 mb-6 sm:mb-8">
          <div 
            onClick={() => setActiveTab("articles")}
            className={`p-3 sm:p-4 rounded-xl cursor-pointer transition-all hover:scale-105 ${activeTab === "articles" ? "bg-primary text-white shadow-lg" : "bg-card border border-border hover:border-primary"}`}
          >
            <FileText className={`h-5 w-5 sm:h-6 sm:w-6 mb-1 sm:mb-2 ${activeTab === "articles" ? "text-white" : "text-primary"}`} />
            <p className={`text-xl sm:text-2xl font-bold ${activeTab === "articles" ? "text-white" : "text-foreground"}`}>
              {articles.filter(a => a.article_type === "texto").length}
            </p>
            <p className={`text-[10px] sm:text-xs ${activeTab === "articles" ? "text-white/80" : "text-muted-foreground"}`}>Artigos</p>
          </div>
          <div 
            onClick={() => setActiveTab("categories")}
            className={`p-3 sm:p-4 rounded-xl cursor-pointer transition-all hover:scale-105 ${activeTab === "categories" ? "bg-primary text-white shadow-lg" : "bg-card border border-border hover:border-primary"}`}
          >
            <Tag className={`h-5 w-5 sm:h-6 sm:w-6 mb-1 sm:mb-2 ${activeTab === "categories" ? "text-white" : "text-primary"}`} />
            <p className={`text-xl sm:text-2xl font-bold ${activeTab === "categories" ? "text-white" : "text-foreground"}`}>
              {categories.length}
            </p>
            <p className={`text-[10px] sm:text-xs ${activeTab === "categories" ? "text-white/80" : "text-muted-foreground"}`}>Categorias</p>
          </div>
          <div 
            onClick={() => setActiveTab("banners")}
            className={`p-3 sm:p-4 rounded-xl cursor-pointer transition-all hover:scale-105 ${activeTab === "banners" ? "bg-primary text-white shadow-lg" : "bg-card border border-border hover:border-primary"}`}
          >
            <Image className={`h-5 w-5 sm:h-6 sm:w-6 mb-1 sm:mb-2 ${activeTab === "banners" ? "text-white" : "text-primary"}`} />
            <p className={`text-xl sm:text-2xl font-bold ${activeTab === "banners" ? "text-white" : "text-foreground"}`}>
              {banners.length}
            </p>
            <p className={`text-[10px] sm:text-xs ${activeTab === "banners" ? "text-white/80" : "text-muted-foreground"}`}>Banners</p>
          </div>
          <div 
            onClick={() => setActiveTab("authors")}
            className={`p-3 sm:p-4 rounded-xl cursor-pointer transition-all hover:scale-105 ${activeTab === "authors" ? "bg-primary text-white shadow-lg" : "bg-card border border-border hover:border-primary"}`}
          >
            <Users className={`h-5 w-5 sm:h-6 sm:w-6 mb-1 sm:mb-2 ${activeTab === "authors" ? "text-white" : "text-primary"}`} />
            <p className={`text-xl sm:text-2xl font-bold ${activeTab === "authors" ? "text-white" : "text-foreground"}`}>
              {authors.length}
            </p>
            <p className={`text-[10px] sm:text-xs ${activeTab === "authors" ? "text-white/80" : "text-muted-foreground"}`}>Autores</p>
          </div>
          <div 
            onClick={() => setActiveTab("featured")}
            className={`p-3 sm:p-4 rounded-xl cursor-pointer transition-all hover:scale-105 ${activeTab === "featured" ? "bg-primary text-white shadow-lg" : "bg-card border border-border hover:border-primary"}`}
          >
            <Star className={`h-5 w-5 sm:h-6 sm:w-6 mb-1 sm:mb-2 ${activeTab === "featured" ? "text-white" : "text-primary"}`} />
            <p className={`text-xl sm:text-2xl font-bold ${activeTab === "featured" ? "text-white" : "text-foreground"}`}>
              {featuredArticles.length}
            </p>
            <p className={`text-[10px] sm:text-xs ${activeTab === "featured" ? "text-white/80" : "text-muted-foreground"}`}>Destaques</p>
          </div>
          <div 
            onClick={() => setActiveTab("messages")}
            className={`p-3 sm:p-4 rounded-xl cursor-pointer transition-all hover:scale-105 ${activeTab === "messages" ? "bg-primary text-white shadow-lg" : "bg-card border border-border hover:border-primary"}`}
          >
            <MessageSquare className={`h-5 w-5 sm:h-6 sm:w-6 mb-1 sm:mb-2 ${activeTab === "messages" ? "text-white" : "text-primary"}`} />
            <p className={`text-xl sm:text-2xl font-bold ${activeTab === "messages" ? "text-white" : "text-foreground"}`}>
              {messages.filter(m => !m.read).length}
            </p>
            <p className={`text-[10px] sm:text-xs ${activeTab === "messages" ? "text-white/80" : "text-muted-foreground"}`}>Não lidas</p>
          </div>
          <div 
            onClick={() => setActiveTab("views")}
            className={`p-3 sm:p-4 rounded-xl cursor-pointer transition-all hover:scale-105 ${activeTab === "views" ? "bg-primary text-white shadow-lg" : "bg-card border border-border hover:border-primary"}`}
          >
            <Eye className={`h-5 w-5 sm:h-6 sm:w-6 mb-1 sm:mb-2 ${activeTab === "views" ? "text-white" : "text-primary"}`} />
            <p className={`text-xl sm:text-2xl font-bold ${activeTab === "views" ? "text-white" : "text-foreground"}`}>
              {viewsStats.total}
            </p>
            <p className={`text-[10px] sm:text-xs ${activeTab === "views" ? "text-white/80" : "text-muted-foreground"}`}>Views</p>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-3 sm:px-6 pb-6 sm:pb-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="hidden">
            <TabsTrigger value="articles">Artigos</TabsTrigger>
            <TabsTrigger value="categories">Categorias</TabsTrigger>
            <TabsTrigger value="banners">Banners</TabsTrigger>
            <TabsTrigger value="authors">Autores</TabsTrigger>
            <TabsTrigger value="featured">Destaques</TabsTrigger>
            <TabsTrigger value="messages">Mensagens</TabsTrigger>
            <TabsTrigger value="views">Visualizações</TabsTrigger>
          </TabsList>

          <TabsContent value="articles">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Artigos (Textos)</CardTitle>
                  <CardDescription>Gerencie os textos que aparecem na página Textos.</CardDescription>
                </div>
                <Dialog open={isArticleDialogOpen} onOpenChange={(open) => {
                  setIsArticleDialogOpen(open);
                  if (!open) {
                    resetArticleForm();
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Artigo
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{editingItem ? "Editar Artigo" : "Criar Novo Artigo"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Título *</Label>
                        <Input
                          id="title"
                            value={articleForm.title || ""}
                            onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })}
                        />
                      </div>
                        <div className="space-y-2">
                          <Label htmlFor="slug">Slug</Label>
                          <Input
                            id="slug"
                            value={articleForm.slug || ""}
                            onChange={(e) => setArticleForm({ ...articleForm, slug: e.target.value })}
                            placeholder="Auto-gerado se vazio"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="author">Autor *</Label>
                        <Input
                          id="author"
                            value={articleForm.author || ""}
                            onChange={(e) => setArticleForm({ ...articleForm, author: e.target.value })}
                        />
                      </div>
                        <div className="space-y-2">
                          <Label htmlFor="author_id">Autor (ID)</Label>
                          <Select
                            value={articleForm.author_id || "none"}
                            onValueChange={(value) => setArticleForm({ ...articleForm, author_id: value === "none" ? null : value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um autor" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Nenhum</SelectItem>
                              {authors.map((author) => (
                                <SelectItem key={author.id} value={author.id}>
                                  {author.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                        <input type="hidden" value="texto" />
                      <div className="space-y-2">
                        <Label htmlFor="excerpt">Resumo</Label>
                        <Textarea
                          id="excerpt"
                          value={articleForm.excerpt || ""}
                          onChange={(e) => setArticleForm({ ...articleForm, excerpt: e.target.value })}
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="content">Conteúdo *</Label>
                        <RichTextEditor
                          value={articleForm.content || ""}
                          onChange={(content) => setArticleForm({ ...articleForm, content })}
                          placeholder="Escreva o conteúdo do artigo aqui..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cover_image">URL da Imagem de Capa</Label>
                        <div className="flex gap-2">
                        <Input
                            id="cover_image"
                            value={articleForm.cover_image || ""}
                            onChange={(e) => setArticleForm({ ...articleForm, cover_image: e.target.value })}
                          placeholder="https://exemplo.com/imagem.jpg"
                            className="flex-1"
                          />
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  setArticleCropImage(event.target?.result as string);
                                  setIsArticleCropDialogOpen(true);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="hidden"
                            id="articleCoverImageUpload"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById("articleCoverImageUpload")?.click()}
                            disabled={uploadingImage}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            {uploadingImage ? "Enviando..." : "Upload com Crop"}
                          </Button>
                            </div>
                        {articleForm.cover_image && (
                          <img src={articleForm.cover_image} alt="Preview" className="w-full h-48 object-cover rounded mt-2" style={{ aspectRatio: "1920/1080" }} />
                        )}
                        <p className="text-xs text-muted-foreground">Selecione uma imagem para ajustar o enquadramento (1920x1080)</p>
                        </div>
                      <div className="space-y-2">
                        <Label>Categorias</Label>
                        <div className="flex flex-wrap gap-2 p-3 border border-border rounded-lg bg-muted/30">
                          {categories.map((category) => (
                            <label
                              key={category.id}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-full cursor-pointer transition-all ${
                                selectedCategories.includes(category.id)
                                  ? "bg-primary text-white"
                                  : "bg-background border border-border hover:border-primary"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={selectedCategories.includes(category.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedCategories([...selectedCategories, category.id]);
                                  } else {
                                    setSelectedCategories(selectedCategories.filter(id => id !== category.id));
                                  }
                                }}
                                className="sr-only"
                              />
                              <span className="text-sm">{category.name}</span>
                            </label>
                          ))}
                          {categories.length === 0 && (
                            <p className="text-sm text-muted-foreground">Nenhuma categoria cadastrada</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="published"
                            checked={articleForm.published || false}
                            onCheckedChange={(checked) => setArticleForm({ ...articleForm, published: !!checked })}
                          />
                          <Label htmlFor="published">Publicado</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="is_featured"
                            checked={articleForm.is_featured || false}
                            onCheckedChange={(checked) => setArticleForm({ ...articleForm, is_featured: !!checked })}
                          />
                          <Label htmlFor="is_featured">Destaque</Label>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => {
                        setIsArticleDialogOpen(false);
                        resetArticleForm();
                      }}>
                        Cancelar
                      </Button>
                      <Button onClick={async (e) => {
                        e.preventDefault();
                        if (editingItem) {
                          await handleUpdateArticle(editingItem);
                        } else {
                          await handleCreateArticle();
                        }
                      }}>
                        {editingItem ? "Atualizar" : "Criar"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Título</TableHead>
                        <TableHead>Autor</TableHead>
                      <TableHead>Tipo</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                    {articles.filter((article) => article.article_type === "texto").map((article) => (
                        <TableRow key={article.id}>
                          <TableCell className="font-medium">{article.title}</TableCell>
                          <TableCell>{article.author}</TableCell>
                        <TableCell>Texto</TableCell>
                          <TableCell>
                          <span className={`px-2 py-1 text-xs rounded ${article.published ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                            {article.published ? "Publicado" : "Rascunho"}
                                </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => openEditArticle(article)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteArticle(article.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                            </div>
                          </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Categorias</CardTitle>
                  <CardDescription>Gerencie as categorias dos artigos.</CardDescription>
                </div>
                <Dialog open={isCategoryDialogOpen} onOpenChange={(open) => {
                  setIsCategoryDialogOpen(open);
                  if (!open) resetCategoryForm();
                }}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Categoria
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingItem ? "Editar Categoria" : "Criar Nova Categoria"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="categoryName">Nome *</Label>
                      <Input
                        id="categoryName"
                          value={categoryForm.name || ""}
                          onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="categorySlug">Slug</Label>
                        <Input
                          id="categorySlug"
                          value={categoryForm.slug || ""}
                          onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                          placeholder="Auto-gerado se vazio"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="categoryColor">Cor (RGB/Hex)</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="categoryColor"
                            type="color"
                            value={categoryForm.color || "#e4142c"}
                            onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                            className="w-20 h-10"
                          />
                          <Input
                            type="text"
                            value={categoryForm.color || "#e4142c"}
                            onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                            placeholder="#e4142c"
                            className="flex-1"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">Escolha uma cor RGB/Hex para a categoria</p>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => {
                        setIsCategoryDialogOpen(false);
                        resetCategoryForm();
                      }}>
                        Cancelar
                      </Button>
                      <Button onClick={() => editingItem ? handleUpdateCategory(editingItem) : handleCreateCategory()}>
                        {editingItem ? "Atualizar" : "Criar"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Cor</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell>{category.slug}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-6 h-6 rounded border border-border"
                              style={{ backgroundColor: category.color || "#e4142c" }}
                            />
                            <span>{category.color}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => openEditCategory(category)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteCategory(category.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="banners">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Banners</CardTitle>
                  <CardDescription>Gerencie os banners do carrossel principal.</CardDescription>
                </div>
                <Dialog open={isBannerDialogOpen} onOpenChange={(open) => {
                  setIsBannerDialogOpen(open);
                  if (!open) resetBannerForm();
                }}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Banner
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{editingItem ? "Editar Banner" : "Criar Novo Banner"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="bannerTitle">Título *</Label>
                        <Input
                          id="bannerTitle"
                          value={bannerForm.title || ""}
                          onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bannerExcerpt">Resumo</Label>
                        <Textarea
                          id="bannerExcerpt"
                          value={bannerForm.excerpt || ""}
                          onChange={(e) => setBannerForm({ ...bannerForm, excerpt: e.target.value })}
                          rows={2}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bannerImage">URL da Imagem *</Label>
                        <div className="flex gap-2">
                          <Input
                            id="bannerImage"
                            value={bannerForm.image_url || ""}
                            onChange={(e) => setBannerForm({ ...bannerForm, image_url: e.target.value })}
                            placeholder="https://exemplo.com/imagem.jpg"
                            className="flex-1"
                          />
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  setBannerCropImage(event.target?.result as string);
                                  setIsBannerCropDialogOpen(true);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="hidden"
                            id="bannerImageUpload"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById("bannerImageUpload")?.click()}
                            disabled={uploadingImage}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            {uploadingImage ? "Enviando..." : "Upload com Crop"}
                          </Button>
                        </div>
                        {bannerForm.image_url && (
                          <img src={bannerForm.image_url} alt="Preview" className="w-full h-48 object-cover rounded mt-2" style={{ aspectRatio: "1920/1080" }} />
                        )}
                        <p className="text-xs text-muted-foreground">Selecione uma imagem para ajustar o enquadramento (1920x1080)</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="bannerArticleSlug">Slug do Artigo</Label>
                          <Input
                            id="bannerArticleSlug"
                            value={bannerForm.article_slug || ""}
                            onChange={(e) => setBannerForm({ ...bannerForm, article_slug: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bannerCategory">Categoria</Label>
                          <Select
                            value={bannerForm.category || "none"}
                            onValueChange={(value) => setBannerForm({ ...bannerForm, category: value === "none" ? "" : value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma categoria" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Nenhuma</SelectItem>
                              {categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.name}>
                                  {cat.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="bannerOrder">Ordem</Label>
                          <Input
                            id="bannerOrder"
                            type="number"
                            value={bannerForm.order_index || 0}
                            onChange={(e) => setBannerForm({ ...bannerForm, order_index: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                        <div className="flex items-center space-x-2 pt-8">
                          <Checkbox
                            id="bannerActive"
                            checked={bannerForm.active || false}
                            onCheckedChange={(checked) => setBannerForm({ ...bannerForm, active: !!checked })}
                          />
                          <Label htmlFor="bannerActive">Ativo</Label>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsBannerDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={() => editingItem ? handleUpdateBanner(editingItem) : handleCreateBanner()}>
                        {editingItem ? "Atualizar" : "Criar"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Imagem</TableHead>
                      <TableHead>Ordem</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {banners.map((banner) => (
                      <TableRow key={banner.id}>
                        <TableCell className="font-medium">{banner.title}</TableCell>
                        <TableCell>
                          <img src={banner.image_url} alt={banner.title} className="w-16 h-10 object-cover rounded" />
                        </TableCell>
                        <TableCell>{banner.order_index}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 text-xs rounded ${banner.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                            {banner.active ? "Ativo" : "Inativo"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => openEditBanner(banner)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteBanner(banner.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="authors">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Autores</CardTitle>
                  <CardDescription>Gerencie os autores do site.</CardDescription>
                </div>
                <Dialog open={isAuthorDialogOpen} onOpenChange={(open) => {
                  setIsAuthorDialogOpen(open);
                  if (!open) resetAuthorForm();
                }}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Autor
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{editingItem ? "Editar Autor" : "Criar Novo Autor"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="authorName">Nome *</Label>
                          <Input
                            id="authorName"
                            value={authorForm.name || ""}
                            onChange={(e) => setAuthorForm({ ...authorForm, name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="authorSlug">Slug</Label>
                          <Input
                            id="authorSlug"
                            value={authorForm.slug || ""}
                            onChange={(e) => setAuthorForm({ ...authorForm, slug: e.target.value })}
                            placeholder="Auto-gerado se vazio"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="authorBio">Biografia</Label>
                        <Textarea
                          id="authorBio"
                          value={authorForm.bio || ""}
                          onChange={(e) => setAuthorForm({ ...authorForm, bio: e.target.value })}
                          rows={4}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="authorAvatar">URL do Avatar</Label>
                        <div className="flex gap-2">
                          <Input
                            id="authorAvatar"
                            value={authorForm.avatar_url || ""}
                            onChange={(e) => setAuthorForm({ ...authorForm, avatar_url: e.target.value })}
                            placeholder="https://exemplo.com/avatar.jpg"
                            className="flex-1"
                          />
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  setCropImage(event.target?.result as string);
                                  setCropFile(file);
                                  setIsCropDialogOpen(true);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="hidden"
                            id="authorAvatarUpload"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById("authorAvatarUpload")?.click()}
                            disabled={uploadingImage}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            {uploadingImage ? "Enviando..." : "Upload"}
                          </Button>
                        </div>
                        {authorForm.avatar_url && (
                          <div className="mt-2 flex justify-center">
                            <img src={authorForm.avatar_url} alt="Preview" className="w-24 h-24 rounded-full object-cover border-2 border-border" />
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="authorInstagram">Instagram</Label>
                          <Input
                            id="authorInstagram"
                            value={authorForm.instagram_url || ""}
                            onChange={(e) => setAuthorForm({ ...authorForm, instagram_url: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="authorFacebook">Facebook</Label>
                          <Input
                            id="authorFacebook"
                            value={authorForm.facebook_url || ""}
                            onChange={(e) => setAuthorForm({ ...authorForm, facebook_url: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="authorTwitter">Twitter</Label>
                          <Input
                            id="authorTwitter"
                            value={authorForm.twitter_url || ""}
                            onChange={(e) => setAuthorForm({ ...authorForm, twitter_url: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="authorYoutube">YouTube</Label>
                          <Input
                            id="authorYoutube"
                            value={authorForm.youtube_url || ""}
                            onChange={(e) => setAuthorForm({ ...authorForm, youtube_url: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="authorShowInList"
                          checked={authorForm.show_in_list || false}
                          onCheckedChange={(checked) => setAuthorForm({ ...authorForm, show_in_list: !!checked })}
                        />
                        <Label htmlFor="authorShowInList">Mostrar na lista</Label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAuthorDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={() => editingItem ? handleUpdateAuthor(editingItem) : handleCreateAuthor()}>
                        {editingItem ? "Atualizar" : "Criar"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Mostrar na Lista</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {authors.map((author) => (
                      <TableRow key={author.id}>
                        <TableCell className="font-medium">{author.name}</TableCell>
                        <TableCell>{author.slug}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 text-xs rounded ${author.show_in_list ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                            {author.show_in_list ? "Sim" : "Não"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => openEditAuthor(author)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteAuthor(author.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="featured">
            <Card>
              <CardHeader>
                <CardTitle>Destaques</CardTitle>
                <CardDescription>Escolha os artigos que aparecerão em destaque na página principal. O sistema detectará automaticamente a categoria de cada artigo.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <Label className="text-lg font-bold">Artigos em Destaque</Label>
                    {featuredArticles.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Nenhum artigo em destaque ainda.</p>
                    ) : (
                      <div className="space-y-2">
                        {featuredArticles.map((featured) => {
                          const article = articles.find((a) => a.id === featured.article_id);
                          const category = categories.find((c) => c.id === featured.category_id);
                          if (!article) return null;
                          return (
                            <div key={featured.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                              <div className="flex-1">
                                <p className="font-medium">{article.title}</p>
                                <p className="text-sm text-muted-foreground">
                                  Categoria: {category?.name || "Sem categoria"}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSetFeatured(article.id, featured.category_id)}
                              >
                                Remover
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 border-t pt-6">
                    <Label className="text-lg font-bold">Adicionar Artigo em Destaque</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Selecione um Artigo</Label>
                        <Select
                          onValueChange={(articleId) => {
                            handleSetFeatured(articleId);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um artigo" />
                          </SelectTrigger>
                          <SelectContent>
                            {articles
                              .filter((article) => {
                                return !featuredArticles.find((fa) => fa.article_id === article.id);
                              })
                              .map((article) => (
                                <SelectItem key={article.id} value={article.id}>
                                  {article.title}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          O sistema detectará automaticamente a categoria do artigo e o colocará na seção correta da página principal.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages">
            <Card>
              <CardHeader>
                <CardTitle>Mensagens de Contato</CardTitle>
                <CardDescription>Gerencie as mensagens recebidas pelo formulário de contato.</CardDescription>
              </CardHeader>
              <CardContent>
                {messages.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Nenhuma mensagem recebida ainda.</p>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div key={message.id} className={`border rounded-lg p-4 ${!message.read ? 'border-yellow-400 bg-yellow-50/50 dark:bg-yellow-900/10' : 'border-border'}`}>
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-semibold text-foreground">{message.name}</h4>
                              <span className={`px-2 py-0.5 text-xs rounded ${message.read ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}>
                                {message.read ? 'Lida' : 'Não lida'}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">{message.email}</p>
                            <p className="text-xs text-muted-foreground mt-1">{new Date(message.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {!message.read && (
                              <Button variant="outline" size="sm" onClick={() => handleMarkMessageAsRead(message.id)}>
                                <Save className="h-3 w-3 mr-1" />
                                Marcar lida
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteMessage(message.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                        <div className="border-t pt-3">
                          <p className="text-sm font-medium text-foreground mb-2">Assunto: {message.subject}</p>
                          <div className="bg-muted/50 rounded-lg p-3 max-h-64 overflow-y-auto">
                            <p className="text-sm text-foreground whitespace-pre-wrap break-words">{message.message}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="views">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                  <FileText className="h-8 w-8 mb-3 opacity-80" />
                  <p className="text-3xl font-bold">{viewsStats.articles}</p>
                  <p className="text-sm opacity-80">Visualizações de Artigos</p>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
                  <Tag className="h-8 w-8 mb-3 opacity-80" />
                  <p className="text-3xl font-bold">{viewsStats.categories}</p>
                  <p className="text-sm opacity-80">Visualizações de Categorias</p>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                  <Users className="h-8 w-8 mb-3 opacity-80" />
                  <p className="text-3xl font-bold">{viewsStats.authors}</p>
                  <p className="text-sm opacity-80">Visualizações de Autores</p>
                </div>
                <div className="bg-gradient-to-br from-primary to-red-600 rounded-xl p-6 text-white">
                  <Eye className="h-8 w-8 mb-3 opacity-80" />
                  <p className="text-3xl font-bold">{viewsStats.total}</p>
                  <p className="text-sm opacity-80">Total de Visualizações</p>
                </div>
              </div>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-500" />
                      Visualizações por Artigo
                    </CardTitle>
                    <CardDescription>Top artigos mais visualizados</CardDescription>
                  </div>
                  <Button onClick={loadViewsStats} variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Atualizar
                  </Button>
                </CardHeader>
                <CardContent>
                  {articleViewsDetailed.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">Nenhuma visualização registrada ainda.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Artigo</TableHead>
                          <TableHead className="text-right">Visualizações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {articleViewsDetailed.slice(0, 10).map((view) => {
                          const article = articles.find(a => a.id === view.article_id);
                          return (
                            <TableRow key={view.article_id}>
                              <TableCell className="font-medium">
                                {article?.title || "Artigo removido"}
                              </TableCell>
                              <TableCell className="text-right">
                                <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded-full text-sm font-semibold">
                                  {view.count}
                                </span>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-5 w-5 text-green-500" />
                    Visualizações por Categoria
                  </CardTitle>
                  <CardDescription>Top categorias mais visualizadas</CardDescription>
                </CardHeader>
                <CardContent>
                  {categoryViewsDetailed.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">Nenhuma visualização registrada ainda.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Categoria</TableHead>
                          <TableHead className="text-right">Visualizações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {categoryViewsDetailed.slice(0, 10).map((view) => {
                          const category = categories.find(c => c.id === view.category_id);
                          return (
                            <TableRow key={view.category_id}>
                              <TableCell className="font-medium">
                                {category?.name || "Categoria removida"}
                              </TableCell>
                              <TableCell className="text-right">
                                <span className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded-full text-sm font-semibold">
                                  {view.count}
                                </span>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-purple-500" />
                    Visualizações por Autor
                  </CardTitle>
                  <CardDescription>Top autores mais visualizados</CardDescription>
                </CardHeader>
                <CardContent>
                  {authorViewsDetailed.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">Nenhuma visualização registrada ainda.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Autor</TableHead>
                          <TableHead className="text-right">Visualizações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {authorViewsDetailed.slice(0, 10).map((view) => {
                          const author = authors.find(a => a.id === view.author_id);
                          return (
                            <TableRow key={view.author_id}>
                              <TableCell className="font-medium">
                                {author?.name || "Autor removido"}
                              </TableCell>
                              <TableCell className="text-right">
                                <span className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 px-2 py-1 rounded-full text-sm font-semibold">
                                  {view.count}
                                </span>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {cropImage && (
        <ImageCropDialog
          open={isCropDialogOpen}
          onOpenChange={setIsCropDialogOpen}
          imageSrc={cropImage}
          onCropComplete={async (croppedFile) => {
            const url = await handleImageUpload(croppedFile, "author");
            if (url) {
              setAuthorForm({ ...authorForm, avatar_url: url });
            }
            setCropImage(null);
            setCropFile(null);
          }}
        />
      )}

      {bannerCropImage && (
        <BannerCropDialog
          open={isBannerCropDialogOpen}
          onOpenChange={setIsBannerCropDialogOpen}
          imageSrc={bannerCropImage}
          onCropComplete={async (croppedFile) => {
            const url = await handleImageUpload(croppedFile, "banner");
            if (url) {
              setBannerForm({ ...bannerForm, image_url: url });
            }
            setBannerCropImage(null);
          }}
        />
      )}

      {articleCropImage && (
        <BannerCropDialog
          open={isArticleCropDialogOpen}
          onOpenChange={setIsArticleCropDialogOpen}
          imageSrc={articleCropImage}
          onCropComplete={async (croppedFile) => {
            const url = await handleImageUpload(croppedFile, "article");
            if (url) {
              setArticleForm({ ...articleForm, cover_image: url });
            }
            setArticleCropImage(null);
          }}
        />
      )}
    </div>
  );
}
