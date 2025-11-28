"use client";
import { getPostById, updatePost } from "@/services/api";
import { CassetteTapeIcon, XIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// 1. Interface para evitar o uso de 'any'
interface PostData {
    id: string;
    title: string;
    content: string;
    author: string;
    created_at?: string;
    updated_at?: string;
    createdAt?: string;
    updatedAt?: string;
}

// Função para formatar data
const formatDate = (dateString: string) => {
    if (!dateString) return "Data não disponível";
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
};

export default function EditarPostPage() {
    const { id } = useParams();
    const router = useRouter();

    // 2. Substituímos <any> por <PostData | null>
    const [post, setPost] = useState<PostData | null>(null);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            const role = localStorage.getItem("role");
            // Cast seguro para PostData
            const data = await getPostById(role, id as string) as PostData;
            if (data) {
                setPost(data);
                setTitle(data.title || "");
                setContent(data.content || "");
            }
            setIsLoading(false);
        }
        loadData();
    }, [id]);

    const handleSave = async () => {
        if (!title.trim() || !content.trim()) {
            setError("Título e conteúdo são obrigatórios");
            return;
        }

        setIsSaving(true);
        setError(null);
        setSuccess(false);

        try {
            const role = localStorage.getItem("role");
            const postData = {
                title: title.trim(),
                content: content.trim(),
            };

            await updatePost(role, id as string, postData);
            setSuccess(true);

            setTimeout(() => {
                router.push(`/post/${id}`);
            }, 1000);
        } catch (err) {
            setError("Erro ao salvar alterações. Tente novamente.");
            console.error("Erro ao salvar:", err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        router.push(`/post/${id}`);
    };

    if (isLoading || !post) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-6">
                    <div className="flex flex-col items-center gap-2">
                        <p className="text-xl font-bold text-gray-800">Carregando publicação...</p>
                        <p className="text-sm text-gray-500">Aguarde um momento</p>
                    </div>
                    {/* Pontos animados */}
                    <div className="flex gap-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <main className="px-4 sm:px-8 md:px-12 lg:px-20 xl:px-40 py-10 flex justify-center">
                <div className="w-full max-w-6xl flex flex-col gap-6">

                    <div className="flex flex-col gap-3">
                        <p className="text-4xl font-black text-blue-600">Editar Publicação</p>
                        <p className="text-base text-gray-600">
                            Edite uma publicação para o seu blog
                        </p>
                    </div>

                    {/* Mensagens de feedback */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl">
                            Alterações salvas com sucesso! Redirecionando...
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-[70%_30%] gap-10">
                        {/* Formulário de criação de publicação */}
                        <div className="flex flex-col gap-3 text-gray-500">
                            <label htmlFor="title" className="text-md font-medium text-black">Título</label>
                            <input
                                type="text"
                                id="title"
                                value={title}
                                onChange={(e) => {
                                    setTitle(e.target.value);
                                    setError(null);
                                }}
                                placeholder="Título da publicação"
                                className="w-full p-2 border border-gray-300 rounded-xl bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled={isSaving}
                            />
                            <label htmlFor="content" className="text-md font-medium text-black">Conteúdo</label>
                            <textarea
                                id="content"
                                placeholder="Conteúdo da publicação"
                                value={content}
                                onChange={(e) => {
                                    setContent(e.target.value);
                                    setError(null);
                                }}
                                className="w-full p-2 border border-gray-300 rounded-xl bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={10}
                                disabled={isSaving}
                            />
                        </div>

                        {/* Área de ações */}
                        <div className="flex flex-col gap-3 text-gray-500">
                            <div className="flex flex-col gap-1 p-5 bg-white border-1 border-gray-200 m-2 rounded-2xl ">
                                <p className="font-bold text-black text-lg">Ações</p>
                                <hr className="border-gray-300 my-1" />
                                <div className="flex flex-col gap-3">
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="w-full p-2 border text-md gap-2 items-center justify-center border-gray-300 bg-blue-500 rounded-xl flex hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <CassetteTapeIcon className="w-4 h-4 text-white" />
                                        <p className="text-white font-medium">
                                            {isSaving ? "Salvando..." : "Salvar alterações"}
                                        </p>
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        disabled={isSaving}
                                        className="w-full text-md flex gap-2 items-center justify-center p-2 border border-gray-300 rounded-xl bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <XIcon className="w-4 h-4 text-gray-500" />
                                        <p className="text-gray-500 font-medium">Cancelar</p>
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-col gap-1 p-5 bg-white border-1 border-gray-200 m-2 rounded-2xl ">
                                <p className="font-bold text-black text-lg">Detalhes</p>
                                <hr className="border-gray-300 my-1" />
                                <div className="flex flex-col gap-3">
                                    <div className="flex flex-col gap-1 flex-row items-center justify-between">
                                        <p className="text-sm text-gray-500 font-medium text-black">Autor:</p>
                                        <p className="text-sm text-gray-500 font-medium text-black">{post.author}</p>
                                    </div>
                                    <div className="flex flex-col gap-1 flex-row items-center justify-between">
                                        <p className="text-sm text-gray-500 font-medium text-black">Status:</p>
                                        <p className="text-sm text-gray-500 font-medium text-black">Publicado</p>
                                    </div>
                                    <div className="flex flex-col gap-1 flex-row items-center justify-between">
                                        <p className="text-sm text-gray-500 font-medium text-black">Data de atualização:</p>
                                        <p className="text-sm text-gray-500 font-medium text-black">
                                            {formatDate(post.updated_at || post.updatedAt || post.created_at || post.createdAt || "")}
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-1 flex-row items-center justify-between">
                                        <p className="text-sm text-gray-500 font-medium text-black">Data de criação:</p>
                                        <p className="text-sm text-gray-500 font-medium text-black">
                                            {formatDate(post.created_at || post.createdAt || "")}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}