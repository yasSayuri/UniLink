export default function AuthHeader({ eyebrow, title, description }) {
  return (
    <div className="mb-8 text-left">
      <span className="text-sm text-slate-500 font-medium block mb-2">{eyebrow}</span>
      <h2 className="text-4xl sm:text-4xl font-extrabold tracking-tight leading-[1.15]">
        <span className="bg-gradient-to-b from-[#525B67] via-[#38414D] to-[#2B323B] bg-clip-text text-transparent">
          {title}
        </span>
      </h2>
      <p className="text-sm text-slate-500 mt-3 leading-relaxed">{description}</p>
    </div>
  );
}
