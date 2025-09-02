export function Avatar({ name, url, size = 28 }: { name: string; url?: string; size?: number }) {
  const initials =
    name
      .split(" ")
      .map((s) => s[0]?.toUpperCase())
      .slice(0, 2)
      .join("") || "U"
  if (url) {
    return (
      <img
        src={url || "/placeholder.svg"}
        alt={name}
        style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", border: "2px solid white" }}
      />
    )
  }
  return (
    <div
      aria-label={name}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "var(--primary)",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        fontSize: size * 0.38,
      }}
    >
      {initials}
    </div>
  )
}
