import { useLanguage } from "@/lib/language";

export default function TextToSQLPage() {
  const { language } = useLanguage();

  return (
    <div className="h-[calc(100vh-3.5rem)] -m-4 md:-m-6">
      <iframe
        src={`http://localhost:3000?embed=true&lang=${language}`}
        className="w-full h-full border-0"
        title="Text-to-SQL Assistant"
        allow="clipboard-write"
      />
    </div>
  );
}
