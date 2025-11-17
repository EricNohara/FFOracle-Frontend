"use client";

export default function CheckboxInput({
    checked,
    onChange,
    label,
}: {
    checked: boolean;
    onChange: (value: boolean) => void;
    label: string;
}) {
    return (
        <label
            style={{
                display: "flex",
                alignItems: "center",
                gap: "2rem",
                cursor: "pointer",
                color: "var(--color-txt-secondary)",
                fontSize: "0.8rem",
            }}
        >
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                style={{ transform: "scale(1.2)", cursor: "pointer", accentColor: "var(--color-primary)" }}
            />
            {label}
        </label>
    );
}
