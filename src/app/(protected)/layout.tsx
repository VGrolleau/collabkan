import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AppShell from "@/components/AppShell";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
    const cookieStore = await cookies();
    const userId = cookieStore.get('session_user_id')?.value;

    if (!userId) {
        redirect("/login");
    }

    return (
        <div id="layout-container">
            <AppShell>{children}</AppShell>
        </div>
    );
}
