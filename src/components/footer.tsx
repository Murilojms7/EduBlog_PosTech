export default function Footer() {
    return (
        <footer className="border-t mt-16 py-8">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-600 text-sm">
                        ©2004 EduBlog. Todos os direitos reservados.
                    </p>
                    <div className="flex gap-6 text-sm">
                        <a href="#" className="text-gray-600 hover:text-gray-900 transition">
                            Sobre
                        </a>
                        <a href="#" className="text-gray-600 hover:text-gray-900 transition">
                            Ajuda
                        </a>
                        <a href="#" className="text-gray-600 hover:text-gray-900 transition">
                            Termos de Serviço
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}