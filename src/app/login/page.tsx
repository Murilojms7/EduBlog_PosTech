"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, GraduationCap } from "lucide-react";
import { login } from "@/services/api";
import background from "@/assents/undraw_online-community_3o0l.png";
import Image from "next/image";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!email.trim() || !password.trim()) {
            setError("Por favor, preencha todos os campos");
            return;
        }

        setIsLoading(true);

        try {
            const response = await login(email, password);
            console.log(response);
            if (response.role) {
                localStorage.setItem("role", response.role);
            }
            if (response.name) {
                localStorage.setItem("name", response.name);
            }

            router.push("/");
        } catch (err: unknown) {
            // Tipagem segura do erro
            const errorMessage = err instanceof Error ? err.message : "Email ou senha incorretos. Tente novamente.";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Painel Esquerdo */}
            <div className="hidden lg:flex lg:w-1/2 bg- relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center pb-10">
                    <Image src={background} alt="Login Background" className="w-200 h-110 object-cover" />
                </div>
            </div>

            {/* Painel Direito */}
            <div className="w-full lg:w-1/2 bg-blue-50 flex items-center justify-center p-8">
                <div className="w-full max-w-md ">
                    <div className="flex items-center gap-2 mb-8">
                        <GraduationCap className="w-8 h-8 text-blue-600" />
                        <h2 className="text-2xl font-bold text-blue-600">EduBlog</h2>
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Teacher Login</h1>
                    <p className="text-gray-600 mb-8">Welcome back! Please enter your details.</p>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-black mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setError(null);
                                }}
                                placeholder="Digite seu email"
                                className="w-full px-4 py-3 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                disabled={isLoading}
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-black mb-2">
                                Senha
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        setError(null);
                                    }}
                                    placeholder="Digite sua senha"
                                    className="w-full px-4 py-3 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                                    disabled={isLoading}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                                    disabled={isLoading}
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <a href="#" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                                Forgot Password?
                            </a>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? "Entrando..." : "Login"}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-600">
                        Don&apos;t have an account?{" "}
                        <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                            Contact Admin
                        </a>
                    </div>

                    <div className="mt-8 text-center">
                        <a href="#" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                            Help & Support
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}