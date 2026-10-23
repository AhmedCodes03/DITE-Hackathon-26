export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "left",
  className = "",
  eyebrowClassName = "",
  titleClassName = "",
  subtitleClassName = ""
}) {
  return (
    <div className={`${align === "center" ? "text-center max-w-none" : ""} ${className}`}>
      {eyebrow && (
        <p className={`text-xs font-medium uppercase tracking-[0.08em] text-[#2BA68A] ${eyebrowClassName}`}>
          {eyebrow}
        </p>
      )}
      {title && (
        <h2 className={`mt-2 font-['Instrument_Serif'] text-2xl text-[#2A2E35] sm:text-3xl ${titleClassName}`}>
          {title}
        </h2>
      )}
      {subtitle && (
        <p className={`mt-3 text-[#5A6872] leading-relaxed ${subtitleClassName}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
