// src/app/(protected)/Profile/page.tsx
"use client";

import { useEffect, useState } from "react";
import ChangePasswordForm from "@/components/ChangePasswordForm";
import { User } from "@prisma/client";

export default function ProfilePage() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            const res = await fetch("/api/users/me");
            if (res.ok) {
                const data = await res.json();
                setUser(data);
            } else {
                console.error("Non authentifié");
            }
        };
        fetchUser();
    }, []);

    if (!user) {
        return <p>Chargement ou non connecté...</p>;
    }

    return (
        <div className="p-6 max-w-xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Profil</h1>
            <div className="space-y-2 mb-6">
                <p><strong>Nom :</strong> {user.name}</p>
                <p><strong>Email :</strong> {user.email}</p>
                <p><strong>Rôle :</strong> {user.role}</p>
            </div>

            <div className="border-t pt-4">
                <ChangePasswordForm />
            </div>
        </div>
    );
}
