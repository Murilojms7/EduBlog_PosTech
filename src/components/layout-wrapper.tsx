"use client";

import { usePathname } from "next/navigation";
import Header from "./header";
import Footer from "./footer";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isLoginPage = pathname === "/login";

    return (
        <>
            {!isLoginPage && <Header />}
            {children}
            {!isLoginPage && <Footer />}
        </>
    );
}

