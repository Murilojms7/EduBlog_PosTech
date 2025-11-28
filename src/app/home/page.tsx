"use client";

import { SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { getPosts } from "@/services/api";
import Link from "next/link";

// 1. Criamos uma interface para tipar os dados e evitar o erro de "Unexpected any"
interface PostData {
    id: string | number;
    title: string;
    author: string;
    content?: string;
    description?: string;
    imageUrl?: string;
}

const getRandomImage = (postId: string | number) => {
    const seed = typeof postId === 'string' ? parseInt(postId.replace(/\D/g, '')) || Math.floor(Math.random() * 1000) : postId;
    return `https://picsum.photos/seed/${seed}/800/600`;
};

const getDescription = (post: PostData) => {
    if (post.description && post.description.trim()) {
        return post.description;
    }

    if (post.content) {
        const textContent = post.content.replace(/<[^>]*>/g, '');
        const cleanContent = textContent.replace(/\s+/g, ' ').trim();
        return cleanContent.length > 150
            ? cleanContent.substring(0, 150) + '...'
            : cleanContent;
    }

    return 'Sem descrição disponível';
};

export default function Home() {
    // Tipamos o useState com a interface
    const [posts, setPosts] = useState<PostData[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            const role = "user";
            try {
                // Adicionamos 'as PostData[]' para garantir que a API retorna o formato certo
                const data = await getPosts(role) as PostData[];
                setPosts(data);
            } catch (error) {
                console.error("Erro ao carregar posts:", error);
                setPosts([]);
            } finally {
                setIsLoading(false);
            }
        }
        loadData();
    }, []);

    // 2. CORREÇÃO PRINCIPAL: Estado Derivado.
    // Em vez de usar useEffect para atualizar um state secundário,
    // calculamos a variável diretamente. Isso remove o erro de sincronização do React.
    const filteredPosts = !searchTerm.trim()
        ? posts
        : posts.filter((post) =>
            post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (post.description && post.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <main className="px-4 sm:px-8 md:px-12 lg:px-20 xl:px-40 py-10 flex justify-center">
                <div className="w-full max-w-6xl flex flex-col gap-6">

                    <div className="flex flex-col gap-3">
                        <p className="text-4xl font-black text-blue-600">Blog Acadêmico</p>
                        <p className="text-base text-gray-600">
                            Uma coleção de posts de professores e alunos
                        </p>
                    </div>

                    {/* Search & Filters */}
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col md:flex-row gap-4 items-center">
                            <div className="flex-grow w-full">
                                <label className="w-full">
                                    <div className="flex items-center rounded-lg bg-gray-100 h-12 px-4 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition">
                                        <SearchIcon className="w-5 h-5 text-gray-500" />
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder="Pesquisar publicação por título..."
                                            className="flex-1 px-4 font-medium bg-transparent border-none focus:outline-none text-sm text-gray-700 placeholder-gray-500"
                                        />
                                    </div>
                                </label>
                            </div>
                        </div>
                        {/* Contador de resultados */}
                        {!isLoading && (
                            <div className="text-sm text-gray-600">
                                {searchTerm ? (
                                    <span>
                                        {filteredPosts.length === 0
                                            ? "Nenhum resultado encontrado"
                                            : `${filteredPosts.length} ${filteredPosts.length === 1 ? 'resultado encontrado' : 'resultados encontrados'} para "${searchTerm}"`
                                        }
                                    </span>
                                ) : (
                                    <span>
                                        {filteredPosts.length} {filteredPosts.length === 1 ? 'publicação' : 'publicações'} disponível{filteredPosts.length === 1 ? '' : 'eis'}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Cards */}
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="flex flex-col items-center gap-6">
                                <div className="flex flex-col items-center gap-2">
                                    <p className="text-xl font-bold text-gray-800">Carregando posts...</p>
                                    <p className="text-sm text-gray-500">Aguarde um momento</p>
                                </div>
                                <div className="flex gap-2">
                                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredPosts.length === 0 ? (
                                <div className="col-span-full flex flex-col items-center justify-center py-12">
                                    <p className="text-lg text-gray-600">
                                        {searchTerm ? `Nenhum post encontrado para "${searchTerm}"` : "Nenhum post encontrado"}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-2">
                                        {searchTerm ? "Tente pesquisar com outros termos" : "Tente novamente mais tarde"}
                                    </p>
                                </div>
                            ) : (
                                filteredPosts.map((post, index) => {
                                    const imageUrl = post.imageUrl || getRandomImage(post.id || index);
                                    return (
                                        <Link
                                            key={post.id}
                                            href={`/post/${post.id}`}
                                            className="flex flex-col rounded-xl bg-white shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-2 group"
                                        >
                                            <div
                                                className="w-full bg-center bg-cover aspect-video rounded-t-xl bg-gradient-to-br from-blue-100 to-purple-100 transition-transform duration-500 hover:scale-110"
                                                style={{
                                                    backgroundImage: `url("${imageUrl}")`,
                                                }}
                                            />
                                            <div className="p-4 flex flex-col flex-grow">
                                                <p className="text-lg font-bold text-black transition-colors duration-300 hover:text-blue-600">{post.title}</p>
                                                <p className="text-sm mt-1 text-gray-500">By {post.author}</p>
                                                <p className="text-sm mt-2 flex-grow text-gray-700 line-clamp-3">
                                                    {getDescription(post)}
                                                </p>
                                                <span className="text-blue-600 font-semibold mt-4 transition-all duration-300 hover:text-blue-700 hover:translate-x-1 inline-block">
                                                    Ler mais →
                                                </span>
                                            </div>
                                        </Link>
                                    );
                                })
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}