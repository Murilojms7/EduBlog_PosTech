"use client";
import { createComment, getPostById } from "@/services/api";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import ReactMarkdown from "react-markdown";

// Interfaces para tipagem
interface Comment {
    id: string | number;
    author: string;
    content: string;
    time: string;
    avatar: string;
    isAuthor: boolean;
    name?: string;
    comment?: string;
    created_at?: string;
}

interface PostDetail {
    id: string | number;
    title: string;
    author: string;
    content: string;
    imageUrl?: string;
    createdAt?: string;
    publishedAt?: string;
    comments?: Comment[];
}

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
    return date.toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' });
};

const formatRelativeTime = (dateString: string) => {
    if (!dateString) return "Data não disponível";
    try {
        let dateStr = dateString.trim();
        if (!dateStr.includes('Z') && !dateStr.match(/[+-]\d{2}:\d{2}$/)) {
            dateStr += dateStr.includes('T') ? 'Z' : 'T00:00:00Z';
        }

        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return "Data inválida";

        const diffInSeconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
        if (diffInSeconds < 60) return "agora";

        const minutes = Math.floor(diffInSeconds / 60);
        if (minutes < 60) return minutes === 1 ? "há 1 minuto" : `há ${minutes} minutos`;

        const hours = Math.floor(minutes / 60);
        if (hours < 24) return hours === 1 ? "há 1 hora" : `há ${hours} horas`;

        const days = Math.floor(hours / 24);
        if (days < 30) return days === 1 ? "há 1 dia" : `há ${days} dias`;

        const months = Math.floor(days / 30);
        if (months < 12) return months === 1 ? "há 1 mês" : `há ${months} meses`;

        const years = Math.floor(months / 12);
        return years === 1 ? "há 1 ano" : `há ${years} anos`;
    } catch (error) {
        console.error("Erro data:", error);
        return "Data inválida";
    }
};

const getAvatarUrl = (name: string, id?: string | number) => {
    const seed = id || name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return `https://i.pravatar.cc/150?img=${(Number(seed) % 70) + 1}`;
};

export default function PostPage() {
    const { id } = useParams();
    // Tipagem correta dos estados
    const [post, setPost] = useState<PostDetail | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
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
            const timer = setTimeout(() => setNotification(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            const role = "user";
            // Cast do retorno da API
            const data = await getPostById(role, id as string) as PostDetail;
            if (data) {
                setPost(data);
                if (data.comments && Array.isArray(data.comments)) {
                    const mappedComments = data.comments.map((comment: Comment, index: number) => ({
                        id: comment.id || index + 1,
                        author: comment.name || "Anônimo",
                        content: comment.comment || "",
                        time: formatRelativeTime(comment.created_at || ""),
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
        if (!commentAuthorName.trim() || !newComment.trim()) {
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
            await createComment(id, commentData, "user");

            const role = "user";
            const updatedData = await getPostById(role, id) as PostDetail;
            if (updatedData?.comments) {
                const mappedComments = updatedData.comments.map((comment: Comment, index: number) => ({
                    id: comment.id || index + 1,
                    author: comment.name || "Anônimo",
                    content: comment.comment || "",
                    time: formatRelativeTime(comment.created_at || ""),
                    avatar: getAvatarUrl(comment.name || "Anônimo", comment.id),
                    isAuthor: comment.name === post?.author
                }));
                setComments(mappedComments);
            }

            showNotification('success', "Comentário publicado com sucesso!");
            setNewComment("");
            setCommentAuthorName("");
        } catch (err) {
            showNotification('error', "Erro ao publicar comentário.");
            console.error(err);
        } finally {
            setIsPublishing(false);
        }
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-white"><p className="text-xl font-semibold text-gray-800">Carregando...</p></div>;
    if (!post) return <div className="min-h-screen flex items-center justify-center bg-white"><p className="text-xl font-semibold text-gray-800">Post não encontrado</p></div>;

    const imageUrl = post.imageUrl || getRandomImage(post.id || (id as string));
    const readingTime = calculateReadingTime(post.content || "");
    const publishedDate = formatDate(post.createdAt || post.publishedAt || new Date().toISOString());

    return (
        <div className="min-h-screen bg-white">
            {notification && (
                <div className={`fixed top-4 right-4 p-4 pr-10 rounded-lg shadow-lg z-50 ${notification.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                    <button onClick={() => setNotification(null)} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
                    {notification.message}
                </div>
            )}
            <main className="max-w-4xl mx-auto px-6 py-12">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">{post.title}</h1>

                <div className="flex items-center gap-4 mb-8">
                    <div className="flex items-center gap-3 pr-4">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={`https://i.pravatar.cc/150?img=1`} alt={post.author || "Autor"} className="w-12 h-12 rounded-full object-cover" />
                        <div><p className="font-semibold text-gray-900">{post.author || "Autor Desconhecido"}</p></div>
                    </div>
                    <div className="text-gray-600 text-sm"><p>Publicado em {publishedDate} - {readingTime} min de leitura</p></div>
                </div>

                <div className="mb-10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imageUrl} alt={post.title} className="w-full h-auto rounded-lg object-cover" />
                </div>

                <div className="mb-12">
                    <div className="prose text-black prose-lg max-w-none break-words overflow-wrap-anywhere">
                        <ReactMarkdown>{post.content || "Conteúdo não disponível."}</ReactMarkdown>
                    </div>
                </div>

                <div className="border-t pt-8 mt-12">
                    <div className="flex items-center gap-2 mb-6">
                        <MessageCircle className="w-6 h-6 text-gray-700" />
                        <h2 className="text-2xl font-bold text-gray-900">Discussão ({comments.length})</h2>
                    </div>

                    <div className="mb-8">
                        <div className="flex items-start gap-4 mb-4 text-black">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="https://i.pravatar.cc/150?img=1" alt="Seu perfil" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                            <div className="flex-1">
                                <input type="text" value={commentAuthorName} onChange={(e) => setCommentAuthorName(e.target.value)} placeholder="Digite seu nome" className="w-full px-4 py-2 mb-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Junte-se à discussão..." className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" rows={3} />
                                <button onClick={handlePostComment} className="mt-3 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">{isPublishing ? "Publicando..." : "Publicar Comentário"}</button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {comments.map((comment) => (
                            <div key={comment.id} className="flex items-start gap-4">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={comment.avatar} alt={comment.author} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="font-semibold text-gray-900">{comment.author}</p>
                                        {comment.isAuthor && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Autor</span>}
                                        <span className="text-sm text-gray-500">{comment.time}</span>
                                    </div>
                                    <p className="text-gray-700 leading-relaxed">{comment.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}