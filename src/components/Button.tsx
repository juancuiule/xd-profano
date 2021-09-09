interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: React.ReactChild;
}

export default function Button(props: Props) {
  const { style, onClick, label, type } = props;
  return (
    <button
      type={type}
      style={{
        padding: "24px 40px",
        height: "67px",
        border: "2px solid var(--primary)",
        cursor: "pointer",
        fontSize: "19px",
        lineHeight: "19px",
        fontFamily: "var(--font-sans-serif)",
        textTransform: "uppercase",
        color: "var(--primary)",
        background: "transparent",
        marginTop: "auto",
        ...style
      }}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
