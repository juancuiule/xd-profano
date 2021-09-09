export default function Stepper(props: { current: number; max: number }) {
  const { current, max } = props;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        fontFamily: "var(--font-sans-serif)",
        color: "var(--primary)",
        height: "28px"
      }}
    >
      <span
        style={{
          fontSize: "14px",
          lineHeight: "18px",
          fontWeight: 500
        }}
      >
        {current}/{max}
      </span>
      <div
        style={{
          width: "100%",
          height: "5px",
          marginTop: "5px",
          background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${
            (current / max) * 100
          }%, var(--gray-2) ${(current / max) * 100}%, var(--gray-2) 100%)`
        }}
      ></div>
    </div>
  );
}
