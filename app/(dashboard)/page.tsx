import { getUserCalls } from "@/actions/calls";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const revalidate = 30; // cache calls list for 30 seconds

function formatDuration(seconds: number | null) {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  completed: "default",
  in_progress: "secondary",
  processing: "secondary",
  failed: "destructive",
};

export default async function DashboardPage() {
  const calls = await getUserCalls();

  if (calls.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <h2 className="text-2xl font-semibold mb-2">No recordings yet</h2>
        <p className="text-muted-foreground mb-6">
          Start your first recording to get a transcript and AI summary.
        </p>
        <Button asChild>
          <Link href="/calls/new">Start your first recording</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Your Calls</h1>
        <Button asChild size="sm">
          <Link href="/calls/new">New Recording</Link>
        </Button>
      </div>
      <div className="rounded-md border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Contact</th>
              <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Date</th>
              <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Duration</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {calls.map((call) => (
              <tr key={call.id} className="border-t hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <Link
                    href={`/calls/${call.id}`}
                    className="font-medium hover:underline"
                  >
                    {call.contactName ?? "Unknown"}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                  {formatDate(call.startedAt)}
                </td>
                <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                  {formatDuration(call.durationSeconds)}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={statusVariant[call.status] ?? "outline"}>
                    {call.status.replace("_", " ")}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
