"use client";

import React from "react";
import ThemeToggleButton from "./ThemeToggleButton";
import LogoutButton from "./LogoutButton";

type Props = {
    brand?: string;
};

export default function Topbar({ brand = "Collab'Kan" }: Props) {
    return (
        <div className="topbar">
            <div className="brand">{brand}</div>
            <div className="actions">
                {/* <input className="input" placeholder="Rechercher…" /> */}
                <ThemeToggleButton className="btn" title="Basculer thème" />
                <LogoutButton />
            </div>
        </div>
    );
}
