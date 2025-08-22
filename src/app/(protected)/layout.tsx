// src/app/(protected)/layout.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AppShell from "@/components/AppShell";
import { ThemeProvider } from "@/context/ThemeContext";
import { UserProvider } from "@/context/UserContext";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
    const cookieStore = await cookies();
    const userId = cookieStore.get('session_user_id')?.value;

    if (!userId) {
        redirect("/login");
    }

    return (
        <ThemeProvider>
            <UserProvider>
                <div id="layout-container">
                    <AppShell>{children}</AppShell>
                </div>
            </UserProvider>
        </ThemeProvider>
    );
}
