"use client";
import { Search, ChevronDown, Pencil, Trash2, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { getPosts, deletePost } from "@/services/api";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Interface para os dados brutos da API
interface ApiPost {
    id: string;
    title: string;
    author?: string;
    created_at?: string;
    status?: "Published" | "Draft" | "Archived";
}

// Interface para o estado interno
interface Post {
    id: string;
    title: string;
    author: string;
    date: string;
    status: "Published" | "Draft" | "Archived";
}

export default function ManagePostsPage() {
    const router = useRouter();
    const [posts, setPosts] = useState<Post[]>([]);
    const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [authorFilter, setAuthorFilter] = useState<string>("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [isStatusOpen, setIsStatusOpen] = useState(false);
    const [isAuthorOpen, setIsAuthorOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const postsPerPage = 5;

    useEffect(() => {
        async function loadData() {
            const role = "user";
            // Asserção de tipo aqui resolve o problema do 'any'
            const data = await getPosts(role) as ApiPost[];

            const formattedPosts: Post[] = data.map((post) => ({
                id: post.id,
                title: post.title,
                author: post.author || "Unknown",
                date: post.created_at ? new Date(post.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A",
                status: post.status || "Draft",
            }));
            setPosts(formattedPosts);
        }
        loadData();
    }, []);

    // ... (O resto da lógica dos filtros mantém-se igual) ...
    useEffect(() => {
        let filtered = [...posts];

        if (searchTerm.trim()) {
            filtered = filtered.filter((post) =>
                post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                post.author?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (statusFilter !== "all") {
            filtered = filtered.filter((post) => post.status === statusFilter);
        }

        if (authorFilter !== "all") {
            filtered = filtered.filter((post) => post.author === authorFilter);
        }

        setFilteredPosts(filtered);
        setCurrentPage(1);
    }, [posts, searchTerm, statusFilter, authorFilter]);

    const uniqueAuthors = Array.from(new Set(posts.map((post) => post.author)));
    const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
    const startIndex = (currentPage - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    const currentPosts = filteredPosts.slice(startIndex, endIndex);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Published": return "bg-green-500";
            case "Draft": return "bg-orange-500";
            case "Archived": return "bg-gray-500";
            default: return "bg-gray-500";
        }
    };

    const handleDeletePost = async (postId: string, postTitle: string) => {
        const confirmed = window.confirm(
            `Tem certeza que deseja deletar a publicação "${postTitle}"?\n\nEsta ação não pode ser desfeita.`
        );

        if (!confirmed) return;

        try {
            setIsDeleting(postId);
            const role = localStorage.getItem("role");
            await deletePost(role, postId);

            // Recarregar
            const data = await getPosts(role) as ApiPost[];
            const formattedPosts: Post[] = data.map((post) => ({
                id: post.id,
                title: post.title,
                author: post.author || "Unknown",
                date: post.created_at ? new Date(post.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A",
                status: post.status || "Draft",
            }));
            setPosts(formattedPosts);
            alert("Publicação deletada com sucesso!");
        } catch (error) {
            console.error("Erro ao deletar publicação:", error);
            alert("Erro ao deletar publicação. Tente novamente.");
        } finally {
            setIsDeleting(null);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <main className="px-4 sm:px-8 md:px-12 lg:px-20 xl:px-40 py-10 flex justify-center overflow-x-auto">
                <div className="w-full max-w-6xl flex flex-col gap-6 min-w-0">
                    <div className="flex flex-col gap-3">
                        <p className="text-4xl font-black text-blue-600">Minhas Publicações</p>
                        <p className="text-base text-gray-600">Gerencie suas publicações</p>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        <div className="flex-grow w-full">
                            <div className="flex items-center rounded-lg bg-gray-100 h-12 px-4">
                                <Search className="w-5 h-5 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Search by title or author..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="flex-1 px-4 font-medium bg-transparent border-none focus:outline-none text-sm text-gray-700"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <div className="relative">
                                <button
                                    onClick={() => { setIsStatusOpen(!isStatusOpen); setIsAuthorOpen(false); }}
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-gray-700 font-medium text-sm hover:bg-gray-200 transition"
                                >
                                    Status <ChevronDown className="w-4 h-4" />
                                </button>
                                {isStatusOpen && (
                                    <div className="absolute top-full mt-2 left-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[150px]">
                                        {["all", "Published", "Draft", "Archived"].map(status => (
                                            <button
                                                key={status}
                                                onClick={() => { setStatusFilter(status); setIsStatusOpen(false); }}
                                                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700 capitalize"
                                            >
                                                {status}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="relative">
                                <button
                                    onClick={() => { setIsAuthorOpen(!isAuthorOpen); setIsStatusOpen(false); }}
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-gray-700 font-medium text-sm hover:bg-gray-200 transition"
                                >
                                    Author <ChevronDown className="w-4 h-4" />
                                </button>
                                {isAuthorOpen && (
                                    <div className="absolute top-full mt-2 left-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[150px] max-h-60 overflow-y-auto">
                                        <button onClick={() => { setAuthorFilter("all"); setIsAuthorOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700">All</button>
                                        {uniqueAuthors.map((author) => (
                                            <button key={author} onClick={() => { setAuthorFilter(author); setIsAuthorOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700">{author}</button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto shadow-sm">
                        <table className="w-full min-w-[800px]">
                            <thead className="bg-gray-50">
                                <tr>
                                    {["TITLE", "AUTHOR", "DATE", "STATUS", "ACTIONS"].map(h => (
                                        <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {currentPosts.length === 0 ? (
                                    <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Nenhum post encontrado</td></tr>
                                ) : (
                                    currentPosts.map((post) => (
                                        <tr key={post.id} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Link href={`/post/${post.id}`} className="text-sm font-medium text-gray-900 hover:text-blue-600 transition cursor-pointer">
                                                    {post.title}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-700">{post.author}</div></td>
                                            <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-700">{post.date}</div></td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-2 h-2 rounded-full ${getStatusColor(post.status)}`}></span>
                                                    <span className="text-sm text-gray-700">{post.status}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <Link href={`/post/${post.id}`} className="text-gray-700 hover:text-blue-600 transition" title="Ver detalhes"><Eye className="w-5 h-5" /></Link>
                                                    <button onClick={() => router.push(`/post/${post.id}/edit`)} className="text-gray-700 hover:text-blue-600 transition" title="Editar"><Pencil className="w-5 h-5" /></button>
                                                    <button onClick={() => handleDeletePost(post.id, post.title)} disabled={isDeleting === post.id} className="text-red-600 hover:text-red-900 transition disabled:opacity-50 disabled:cursor-not-allowed" title="Deletar">
                                                        {isDeleting === post.id ? <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div> : <Trash2 className="w-5 h-5" />}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-700">Showing {startIndex + 1} to {Math.min(endIndex, filteredPosts.length)} of {filteredPosts.length} results</div>
                        <div className="flex gap-2">
                            <button onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))} disabled={currentPage === 1} className="px-4 py-2 bg-gray-100 rounded-lg text-gray-700 font-medium text-sm hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"><ChevronLeft className="w-4 h-4" /> Previous</button>
                            <button onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} className="px-4 py-2 bg-gray-100 rounded-lg text-gray-700 font-medium text-sm hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1">Next <ChevronRight className="w-4 h-4" /></button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}