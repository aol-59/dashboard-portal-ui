import { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/lib/language";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Database, Send, Loader2, Copy, Check, Clock, Save } from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sql?: string;
  data?: Record<string, unknown>[];
  columns?: string[];
  error?: string;
}

const MOCK_RESPONSES: Record<string, Partial<ChatMessage>> = {
  default: {
    content: "إليك نتائج استعلامك:",
    sql: `SELECT e.name, e.department, COUNT(t.id) AS total_tasks\nFROM employees e\nLEFT JOIN tasks t ON t.assignee_id = e.id\nWHERE e.status = 'active'\nGROUP BY e.name, e.department\nORDER BY total_tasks DESC\nLIMIT 10;`,
    columns: ["name", "department", "total_tasks"],
    data: [
      { name: "أحمد الشمري", department: "تقنية المعلومات", total_tasks: 42 },
      { name: "فاطمة العلي", department: "الموارد البشرية", total_tasks: 38 },
      { name: "محمد القحطاني", department: "المالية", total_tasks: 35 },
      { name: "نورة السعيد", department: "التسويق", total_tasks: 29 },
      { name: "خالد الدوسري", department: "العمليات", total_tasks: 24 },
    ],
  },
  error: {
    content: "",
    error: "خطأ في بناء الاستعلام: عمود 'salry' غير موجود. هل تقصد 'salary'؟",
  },
};

function mockChat(_question: string): Promise<Partial<ChatMessage>> {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (_question.includes("خطأ") || _question.includes("error")) {
        resolve(MOCK_RESPONSES.error);
      } else {
        resolve(MOCK_RESPONSES.default);
      }
    }, 1500);
  });
}

const CRON_PRESETS = [
  { label: "كل دقيقة", value: "* * * * *" },
  { label: "كل 5 دقائق", value: "*/5 * * * *" },
  { label: "كل ساعة", value: "0 * * * *" },
  { label: "يوميًا الساعة 9", value: "0 9 * * *" },
  { label: "أسبوعيًا الإثنين", value: "0 9 * * 1" },
];

export default function TextToSQLPage() {
  const { language } = useLanguage();
  const isAr = language === "ar";

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleSql, setScheduleSql] = useState("");
  const [scheduleName, setScheduleName] = useState("");
  const [scheduleCron, setScheduleCron] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async () => {
    const q = input.trim();
    if (!q || loading) return;

    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", content: q };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await mockChat(q);
      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: res.content || "",
        sql: res.sql,
        data: res.data,
        columns: res.columns,
        error: res.error,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } finally {
      setLoading(false);
    }
  };

  const copySQL = (sql: string, msgId: string) => {
    navigator.clipboard.writeText(sql);
    setCopiedId(msgId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openSchedule = (sql: string) => {
    setScheduleSql(sql);
    setScheduleName("");
    setScheduleCron("");
    setScheduleOpen(true);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] -m-4 md:-m-6" dir={isAr ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-border/40 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-primary/10">
            <Database className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">تحدث مع قاعدة البيانات</h1>
            <p className="text-sm text-muted-foreground">اطرح أسئلة بلغة طبيعية</p>
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
            <Database className="h-12 w-12 opacity-30" />
            <p className="text-sm">ابدأ بطرح سؤال عن بياناتك</p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-start" : "justify-end"}`}
          >
            <div
              className={`max-w-[85%] md:max-w-[70%] ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-2xl rounded-ss-sm px-4 py-3"
                  : ""
              }`}
            >
              {msg.role === "user" && <p className="text-sm">{msg.content}</p>}

              {msg.role === "assistant" && (
                <div className="space-y-3">
                  {msg.error && (
                    <div className="bg-destructive/10 text-destructive rounded-lg p-3 text-sm">
                      {msg.error}
                    </div>
                  )}

                  {msg.content && !msg.error && (
                    <Card className="px-4 py-3 shadow-sm">
                      <p className="text-sm text-foreground">{msg.content}</p>
                    </Card>
                  )}

                  {msg.sql && (
                    <div className="relative" dir="ltr">
                      <div className="bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto">
                        <pre className="whitespace-pre-wrap">{msg.sql}</pre>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-7 w-7"
                        onClick={() => copySQL(msg.sql!, msg.id)}
                      >
                        {copiedId === msg.id ? (
                          <Check className="h-3.5 w-3.5 text-primary" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  )}

                  {msg.data && msg.columns && (
                    <Card className="overflow-hidden shadow-sm">
                      <div dir="ltr">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              {msg.columns.map((col) => (
                                <TableHead key={col} className="font-semibold">
                                  {col}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {msg.data.map((row, i) => (
                              <TableRow key={i}>
                                {msg.columns!.map((col) => (
                                  <TableCell key={col}>{String(row[col] ?? "")}</TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      <div className="p-3 border-t border-border/40 flex justify-end" dir={isAr ? "rtl" : "ltr"}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5"
                          onClick={() => openSchedule(msg.sql || "")}
                        >
                          <Save className="h-3.5 w-3.5" />
                          حفظ وجدولة
                        </Button>
                      </div>
                    </Card>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-end">
            <Card className="px-4 py-3 shadow-sm">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </Card>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-border/40 bg-background/80 backdrop-blur-sm px-6 py-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="اطرح سؤالاً عن بياناتك..."
            disabled={loading}
            className="h-12 rounded-xl text-sm"
          />
          <Button type="submit" size="icon" className="h-12 w-12 rounded-xl shrink-0" disabled={loading || !input.trim()}>
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </Button>
        </form>
      </div>

      {/* Schedule Dialog */}
      <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <DialogContent dir={isAr ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle>جدولة الاستعلام</DialogTitle>
            <DialogDescription>احفظ الاستعلام وجدوله للتشغيل التلقائي</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">اسم الاستعلام</label>
              <Input
                value={scheduleName}
                onChange={(e) => setScheduleName(e.target.value)}
                placeholder="مثال: تقرير المبيعات اليومي"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">جدول التشغيل</label>
              <div className="flex flex-wrap gap-2">
                {CRON_PRESETS.map((p) => (
                  <Button
                    key={p.value}
                    variant={scheduleCron === p.value ? "default" : "outline"}
                    size="sm"
                    type="button"
                    onClick={() => setScheduleCron(p.value)}
                    className="gap-1.5"
                  >
                    <Clock className="h-3.5 w-3.5" />
                    {p.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">تعبير Cron مخصص</label>
              <Input
                dir="ltr"
                value={scheduleCron}
                onChange={(e) => setScheduleCron(e.target.value)}
                placeholder="* * * * *"
                className="font-mono text-sm"
              />
            </div>

            {scheduleSql && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">الاستعلام</label>
                <div dir="ltr" className="bg-muted rounded-lg p-3 font-mono text-xs overflow-x-auto max-h-24">
                  <pre className="whitespace-pre-wrap">{scheduleSql}</pre>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={() => setScheduleOpen(false)} disabled={!scheduleName || !scheduleCron}>
              حفظ الجدولة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
