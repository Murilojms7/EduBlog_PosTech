"use client";

import { Bold, Italic, Underline, List, ListOrdered, Link as LinkIcon, Type, Clock, Save, Send, CheckCircle, XCircle, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createPost } from "@/services/api";

export default function CriarPostPage() {
    const router = useRouter();
    const [title, setTitle] = useState("The Impact of Technology in Modern Classrooms");

    // ALTERADO: Inicia vazio para evitar erro de Hidratação (diferença entre server e client)
    const [author, setAuthor] = useState("");

    const [content, setContent] = useState("");
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const editorRef = useRef<HTMLDivElement>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    // NOVO: Carrega os dados do usuário apenas quando estiver no navegador (Client-side)
    useEffect(() => {
        const storedName = localStorage.getItem("name");
        if (storedName) {
            setAuthor(storedName);
        }
    }, []);

    useEffect(() => {
        const autoSaveInterval = setInterval(() => {
            if (title || content) {
                setLastSaved(new Date());
            }
        }, 30000);

        return () => clearInterval(autoSaveInterval);
    }, [title, content]);

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => {
                setNotification(null);
            }, 4000);

            return () => clearTimeout(timer);
        }
    }, [notification]);

    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ type, message });
    };

    const execCommand = (command: string, value?: string) => {
        // Nota: document.execCommand é deprecated, mas funciona.
        // Em um refatoramento futuro, considere usar uma lib como Tiptap.
        if (typeof document !== 'undefined') {
            document.execCommand(command, false, value);
            if (editorRef.current) {
                setContent(editorRef.current.innerHTML);
            }
        }
    };

    const handleContentChange = () => {
        if (editorRef.current) {
            setContent(editorRef.current.innerHTML);
        }
    };

    const hasContent = () => {
        if (!editorRef.current) return false;
        const text = editorRef.current.textContent || editorRef.current.innerText || "";
        return text.trim().length > 0;
    };

    const handlePublish = async () => {
        if (!title.trim() || !hasContent() || !author.trim()) {
            showNotification('error', "Por favor, preencha todos os campos");
            return;
        }

        setIsPublishing(true);
        setNotification(null);

        try {
            // Aqui é seguro usar localStorage pois esta função só é chamada pelo click do usuário
            const role = localStorage.getItem("role");
            const editorContent = editorRef.current?.innerHTML || content;

            const postData = {
                title: title.trim(),
                content: editorContent.trim(),
                author: author.trim(),
            };

            const result = await createPost(role, postData);
            showNotification('success', "Post publicado com sucesso!");

            setTimeout(() => {
                if (result && result.id) {
                    router.push(`/post/${result.id}`);
                } else {
                    router.push("/post/my-post");
                }
            }, 2000);
        } catch (err) {
            showNotification('error', "Erro ao publicar post. Tente novamente.");
            console.error("Erro ao publicar:", err);
        } finally {
            setIsPublishing(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-white">
            {/* Notification Toast */}
            {notification && (
                <div className={`fixed top-4 right-4 z-50 animate-slide-in-right ${notification.type === 'success'
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                    } border rounded-lg shadow-lg px-4 py-3 min-w-[300px] max-w-md flex items-center gap-3`}>
                    {notification.type === 'success' ? (
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    ) : (
                        <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    )}
                    <p className="flex-1 text-sm font-medium">{notification.message}</p>
                    <button
                        onClick={() => setNotification(null)}
                        className="text-gray-400 hover:text-gray-600 transition flex-shrink-0"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}
            <div className="flex flex-col gap-3 px-4 sm:px-8 md:px-12 lg:px-20 xl:px-40 pt-10 flex justify-center">
                <p className="text-4xl font-black text-blue-600">Criar Publicação</p>
                <p className="text-base text-gray-600">
                    Crie uma publicação para o seu blog
                </p>
            </div>
            <main className="px-4 sm:px-8 md:px-12 lg:px-20 xl:px-40 py-10 flex justify-center">
                <div className="w-full max-w-4xl flex flex-col gap-6">
                    {/* Title Section */}
                    <div className="flex flex-col gap-3">
                        <label htmlFor="title" className="text-sm font-semibold text-gray-700">
                            Title
                        </label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                            placeholder="Enter post title"
                        />
                    </div>

                    {/* Content Section */}
                    <div className="flex flex-col gap-3">
                        <label className="text-sm font-semibold text-gray-700">
                            Content
                        </label>
                        {/* Toolbar */}
                        <div className="flex items-center gap-2 p-2 border border-gray-300 rounded-t-lg bg-gray-50">
                            {/* ... Botões mantidos iguais ... */}
                            <button
                                type="button"
                                onClick={() => execCommand("bold")}
                                className="p-2 hover:bg-gray-200 rounded transition"
                                title="Bold"
                            >
                                <Bold className="w-4 h-4 text-gray-700" />
                            </button>
                            <button
                                type="button"
                                onClick={() => execCommand("italic")}
                                className="p-2 hover:bg-gray-200 rounded transition"
                                title="Italic"
                            >
                                <Italic className="w-4 h-4 text-gray-700" />
                            </button>
                            <button
                                type="button"
                                onClick={() => execCommand("underline")}
                                className="p-2 hover:bg-gray-200 rounded transition"
                                title="Underline"
                            >
                                <Underline className="w-4 h-4 text-gray-700" />
                            </button>
                            <div className="w-px h-6 bg-gray-300 mx-1"></div>
                            <button
                                type="button"
                                onClick={() => execCommand("insertUnorderedList")}
                                className="p-2 hover:bg-gray-200 rounded transition"
                                title="Bullet List"
                            >
                                <List className="w-4 h-4 text-gray-700" />
                            </button>
                            <button
                                type="button"
                                onClick={() => execCommand("insertOrderedList")}
                                className="p-2 hover:bg-gray-200 rounded transition"
                                title="Numbered List"
                            >
                                <ListOrdered className="w-4 h-4 text-gray-700" />
                            </button>
                            <div className="w-px h-6 bg-gray-300 mx-1"></div>
                            <button
                                type="button"
                                onClick={() => {
                                    const url = prompt("Enter URL:");
                                    if (url) execCommand("createLink", url);
                                }}
                                className="p-2 hover:bg-gray-200 rounded transition"
                                title="Insert Link"
                            >
                                <LinkIcon className="w-4 h-4 text-gray-700" />
                            </button>
                            <button
                                type="button"
                                onClick={() => execCommand("formatBlock", "p")}
                                className="p-2 hover:bg-gray-200 rounded transition"
                                title="Text Format"
                            >
                                <Type className="w-4 h-4 text-gray-700" />
                            </button>
                        </div>
                        {/* Editor */}
                        <div
                            ref={editorRef}
                            contentEditable
                            onInput={handleContentChange}
                            className="w-full min-h-[400px] px-4 py-3 border border-gray-300 border-t-0 rounded-b-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 resize-y overflow-y-auto"
                            style={{ whiteSpace: "pre-wrap" }}
                            data-placeholder="Start writing your amazing post here..."
                        />
                        <style jsx>{`
                            [contenteditable][data-placeholder]:empty:before {
                                content: attr(data-placeholder);
                                color: #9ca3af;
                                pointer-events: none;
                            }
                        `}</style>
                    </div>

                    {/* Author Section */}
                    <div className="flex flex-col gap-3">
                        <label htmlFor="author" className="text-sm font-semibold text-gray-700">
                            Author
                        </label>
                        {/* ALTERADO: Removemos o acesso direto ao localStorage aqui */}
                        <input
                            type="text"
                            id="author"
                            value={author}
                            onChange={(e) => setAuthor(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                            placeholder="Enter author name"
                        />
                    </div>

                    {/* Footer/Action Bar */}
                    <div className="flex items-center justify-end pt-4 border-t border-gray-200">
                        {/* Action Buttons */}
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={handlePublish}
                                disabled={isSaving || isPublishing || !title.trim() || !hasContent() || !author.trim()}
                                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                <Send className="w-4 h-4" />
                                {isPublishing ? "Publishing..." : "Publish"}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}