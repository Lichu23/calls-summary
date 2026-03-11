interface SummaryCardProps {
  summaryText: string;
  actionItems?: string[] | null;
  keyTopics?: string[] | null;
  sentiment?: "positive" | "neutral" | "negative" | null;
}

const sentimentConfig = {
  positive: { label: "Positive", classes: "bg-green-100 text-green-800" },
  neutral: { label: "Neutral", classes: "bg-gray-100 text-gray-800" },
  negative: { label: "Negative", classes: "bg-red-100 text-red-800" },
};

export default function SummaryCard({
  summaryText,
  actionItems,
  keyTopics,
  sentiment,
}: SummaryCardProps) {
  const sentimentInfo = sentiment ? sentimentConfig[sentiment] : null;

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
            Summary
          </h3>
          {sentimentInfo && (
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${sentimentInfo.classes}`}
            >
              {sentimentInfo.label}
            </span>
          )}
        </div>
        <p className="text-sm leading-relaxed">{summaryText}</p>
      </div>

      {/* Key Topics */}
      {keyTopics && keyTopics.length > 0 && (
        <div>
          <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-2">
            Key Topics
          </h3>
          <div className="flex flex-wrap gap-2">
            {keyTopics.map((topic, i) => (
              <span
                key={i}
                className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Action Items */}
      {actionItems && actionItems.length > 0 && (
        <div>
          <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-2">
            Action Items
          </h3>
          <ul className="space-y-2">
            {actionItems.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded border-gray-300"
                  readOnly
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
