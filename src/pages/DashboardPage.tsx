import { useParams } from "react-router-dom";
import { useLanguage } from "@/lib/language";
import { usePortalSummary } from "@/hooks/use-portal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DynamicIcon } from "@/components/DynamicIcon";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, Users, DollarSign, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const placeholderChart = [
  { name: "Jan", value: 400 }, { name: "Feb", value: 300 }, { name: "Mar", value: 500 },
  { name: "Apr", value: 280 }, { name: "May", value: 590 }, { name: "Jun", value: 430 },
];

const kpis = [
  { label: "Total Revenue", value: "$45,231", change: "+12.5%", icon: DollarSign },
  { label: "Active Users", value: "2,350", change: "+8.2%", icon: Users },
  { label: "Growth Rate", value: "15.3%", change: "+2.1%", icon: TrendingUp },
  { label: "Performance", value: "98.5%", change: "+0.5%", icon: Activity },
];

export default function DashboardPage() {
  const { slug } = useParams<{ slug: string }>();
  const { language } = useLanguage();
  const { data } = usePortalSummary();
  const entity = data?.entities.find((e) => e.slug === slug);

  const name = entity ? (language === "ar" ? entity.name_ar : entity.name) : slug;
  const color = entity?.color || "#10B981";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        {entity && (
          <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
            <DynamicIcon name={entity.icon} className="h-5 w-5" style={{ color }} />
          </div>
        )}
        <h1 className="text-2xl font-bold">{name}</h1>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.label}</CardTitle>
              <kpi.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className="text-xs text-primary">{kpi.change} from last month</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Analytics Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={placeholderChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
              <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Items Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3, 4, 5].map((i) => (
                <TableRow key={i}>
                  <TableCell className="font-mono text-sm">#{1000 + i}</TableCell>
                  <TableCell>Sample Item {i}</TableCell>
                  <TableCell className="text-primary">Active</TableCell>
                  <TableCell className="text-sm text-muted-foreground">2024-03-{10 + i}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
