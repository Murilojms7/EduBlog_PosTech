"use client";
import { createComment, getPostById } from "@/services/api";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import ReactMarkdown from "react-markdown";

const getRandomImage = (postId: string | number) => {
    const seed = typeof postId === 'string' ? parseInt(postId.replace(/\D/g, '')) || Math.floor(Math.random() * 1000) : postId;
    return `https://picsum.photos/seed/${seed}/1200/600`;
};

const calculateReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return minutes;
};

const formatDate = (dateString: string) => {
    if (!dateString) return "Data não disponível";
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
};

const formatRelativeTime = (dateString: string) => {
    if (!dateString) return "Data não disponível";
    
    try {
        let dateStr = dateString.trim();
        if (!dateStr.includes('Z') && !dateStr.match(/[+-]\d{2}:\d{2}$/)) {
            if (dateStr.match(/\.\d+$/)) {
                dateStr = dateStr + 'Z';
            } else if (!dateStr.includes('T')) {
                dateStr = dateStr + 'T00:00:00Z';
            } else {
                dateStr = dateStr + 'Z';
            }
        }
        
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
            console.warn("Data inválida recebida:", dateString);
            return "Data inválida";
        }
        
        const now = new Date();
        const diffInMilliseconds = now.getTime() - date.getTime();
        
        if (diffInMilliseconds < 0) {
            return "agora";
        }
        
        const diffInSeconds = Math.floor(diffInMilliseconds / 1000);
        
        if (diffInSeconds < 60) {
            return "agora";
        }
        
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) {
            return diffInMinutes === 1 ? "há 1 minuto" : `há ${diffInMinutes} minutos`;
        }
        
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) {
            return diffInHours === 1 ? "há 1 hora" : `há ${diffInHours} horas`;
        }
        
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 30) {
            return diffInDays === 1 ? "há 1 dia" : `há ${diffInDays} dias`;
        }
        
        const diffInMonths = Math.floor(diffInDays / 30);
        if (diffInMonths < 12) {
            return diffInMonths === 1 ? "há 1 mês" : `há ${diffInMonths} meses`;
        }
        
        const diffInYears = Math.floor(diffInMonths / 12);
        return diffInYears === 1 ? "há 1 ano" : `há ${diffInYears} anos`;
    } catch (error) {
        console.error("Erro ao formatar tempo relativo:", error, "Data recebida:", dateString);
        return "Data inválida";
    }
};

const getAvatarUrl = (name: string, id?: number) => {
    const seed = id || name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return `https://i.pravatar.cc/150?img=${(seed % 70) + 1}`;
};

export default function PostPage() {
    const { id } = useParams();
    const [post, setPost] = useState<any>(null);
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState("");
    const [commentAuthorName, setCommentAuthorName] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [isPublishing, setIsPublishing] = useState(false);

    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ type, message });
    };

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => {
                setNotification(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            const role = "user";
            const data = await getPostById(role, id);
            if (data) {
                setPost(data);
                if (data.comments && Array.isArray(data.comments)) {
                    const mappedComments = data.comments.map((comment: any, index: number) => ({
                        id: comment.id || index + 1,
                        author: comment.name || "Anônimo",
                        content: comment.comment || "",
                        time: formatRelativeTime(comment.created_at),
                        avatar: getAvatarUrl(comment.name || "Anônimo", comment.id),
                        isAuthor: comment.name === data.author
                    }));
                    setComments(mappedComments);
                } else {
                    setComments([]);
                }
            }
            setIsLoading(false);
        }   
        loadData();
    }, [id]);

    const handlePostComment = async () => {
        if (commentAuthorName.trim() === "" || newComment.trim() === "") {
            showNotification('error', "Por favor, digite seu nome e comentário");
            return;
        }
        setIsPublishing(true);
        setNotification(null);

        try {
            const commentData = {
                comment: newComment.trim(),
                name: commentAuthorName.trim(),
            };
            const response = await createComment(id, commentData, "user");
            
            const role = "user";
            const updatedData = await getPostById(role, id);
            if (updatedData && updatedData.comments && Array.isArray(updatedData.comments)) {
                const mappedComments = updatedData.comments.map((comment: any, index: number) => ({
                    id: comment.id || index + 1,
                    author: comment.name || "Anônimo",
                    content: comment.comment || "",
                    time: formatRelativeTime(comment.created_at),
                    avatar: getAvatarUrl(comment.name || "Anônimo", comment.id),
                    isAuthor: comment.name === post?.author
                }));
                setComments(mappedComments);
            }
            
            showNotification('success', "Comentário publicado com sucesso!");
            setNewComment("");
            setCommentAuthorName("");
        } catch (err) {
            showNotification('error', "Erro ao publicar comentário. Tente novamente.");
            console.error("Erro ao publicar comentário:", err);
        } finally {
            setIsPublishing(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="text-center">
                    <p className="text-xl font-semibold text-gray-800">Carregando...</p>
                </div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="text-center">
                    <p className="text-xl font-semibold text-gray-800">Post não encontrado</p>
                </div>
            </div>
        );
    }

    const imageUrl = post.imageUrl || getRandomImage(post.id || id);
    const readingTime = calculateReadingTime(post.content || "");
    const publishedDate = formatDate(post.createdAt || post.publishedAt || new Date().toISOString());

    return (
        <div className="min-h-screen bg-white">
            {notification && (
                <div className={`fixed top-4 right-4 p-4 pr-10 rounded-lg shadow-lg transition-all duration-300 z-50 ${notification.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                    <button
                        onClick={() => setNotification(null)}
                        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label="Fechar notificação"
                    >
                        <X className="w-4 h-4" />
                    </button>
                    {notification.message}
                </div>
            )}
            {/* Conteúdo Principal */}
            <main className="max-w-4xl mx-auto px-6 py-12">
                {/* Título */}
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                    {post.title}
                </h1>

                {/* Informações do Autor */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="flex items-center gap-3 pr-4">
                        <img 
                            src={`https://i.pravatar.cc/150?img=1`}
                            alt={post.author || "Autor"}
                            className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                            <p className="font-semibold text-gray-900">{post.author || "Autor Desconhecido"}</p>
                        </div>
                    </div>
                    <div className="text-gray-600 text-sm">
                        <p>Publicado em {publishedDate} - {readingTime} min de leitura</p>
                    </div>
                </div>

                {/* Imagem Principal */}
                <div className="mb-10">
                    <img 
                        src={imageUrl}
                        alt={post.title}
                        className="w-full h-auto rounded-lg object-cover"
                    />
                </div>

                {/* Conteúdo do Artigo */}
                <div className="mb-12">
                    <div className="prose text-black prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-code:text-gray-800 prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:italic prose-ul:list-disc prose-ol:list-decimal prose-li:my-2 break-words overflow-wrap-anywhere">
                        <ReactMarkdown>
                            {post.content || "Conteúdo não disponível."}
                        </ReactMarkdown>
                    </div>
                </div>

                {/* Seção de Discussão */}
                <div className="border-t pt-8 mt-12">
                    <div className="flex items-center gap-2 mb-6">
                        <MessageCircle className="w-6 h-6 text-gray-700" />
                        <h2 className="text-2xl font-bold text-gray-900">
                            Discussão ({comments.length})
                        </h2>
                    </div>

                    {/* Input de Comentário */}
                    <div className="mb-8">
                        <div className="flex items-start gap-4 mb-4 text-black">
                            <img 
                                src="https://i.pravatar.cc/150?img=1"
                                alt="Seu perfil"
                                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                            />
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={commentAuthorName}
                                    onChange={(e) => setCommentAuthorName(e.target.value)}
                                    placeholder="Digite seu nome"
                                    className="w-full px-4 py-2 mb-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Junte-se à discussão..."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                    rows={3}
                                />
                                <button
                                    onClick={handlePostComment}
                                    className="mt-3 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                >
                                    
                                    {isPublishing ? "Publicando..." : "Publicar Comentário"}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Lista de Comentários */}
                    <div className="space-y-6">
                        {comments.map((comment) => (
                            <div key={comment.id} className="flex items-start gap-4">
                                <img 
                                    src={comment.avatar}
                                    alt={comment.author}
                                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                                />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="font-semibold text-gray-900">
                                            {comment.author}
                                        </p>
                                        {comment.isAuthor && (
                                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                                Autor
                                            </span>
                                        )}
                                        <span className="text-sm text-gray-500">
                                            {comment.time}
                                        </span>
                                    </div>
                                    <p className="text-gray-700 leading-relaxed">
                                        {comment.content}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
