import * as React from "react";

/**
 * Spexify's mark: a record with a spotlight. Replace this file to change the logo; the colours come from the theme's
 * {@code --brand} tokens in globals.css.
 */
export function SpexifyMark(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false" {...props}
             className={`block h-full w-full ${props.className ?? ""}`}>
            <circle cx="32" cy="32" r="30" fill="var(--brand)"/>
            <circle cx="32" cy="32" r="21" fill="none" stroke="var(--brand-foreground)" strokeOpacity="0.35" strokeWidth="2"/>
            <circle cx="32" cy="32" r="14" fill="none" stroke="var(--brand-foreground)" strokeOpacity="0.35" strokeWidth="2"/>
            <circle cx="32" cy="32" r="6" fill="var(--brand-foreground)"/>
            <path d="M40 10 L54 4 L50 20 Z" fill="var(--brand-accent)"/>
        </svg>
    );
}

export function SpexifyWordmark({className}: { className?: string }) {
    return (
        <span className={`font-semibold tracking-tight ${className ?? ""}`}>
            Spex<span className="text-(--brand)">ify</span>
        </span>
    );
}
