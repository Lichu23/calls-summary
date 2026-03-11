import { getUserCalls } from "@/actions/calls";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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

const statusColors: Record<string, string> = {
  completed: "bg-green-100 text-green-800",
  in_progress: "bg-blue-100 text-blue-800",
  processing: "bg-yellow-100 text-yellow-800",
  failed: "bg-red-100 text-red-800",
};

const sentimentColors: Record<string, string> = {
  positive: "bg-green-100 text-green-800",
  neutral: "bg-gray-100 text-gray-800",
  negative: "bg-red-100 text-red-800",
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
              <th className="text-left px-4 py-3 font-medium">Date</th>
              <th className="text-left px-4 py-3 font-medium">Duration</th>
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
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDate(call.startedAt)}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDuration(call.durationSeconds)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      statusColors[call.status] ?? "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {call.status.replace("_", " ")}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
