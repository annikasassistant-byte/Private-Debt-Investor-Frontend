"use client";

import { Timeline } from "@/components/timeline/timeline";
import { investorTimeline } from "@/mock-data/timeline";
import { PageHeader } from "@/components/shared/page-header";

export default function InvestorTimelinePage() {
  return (
    <div className="space-y-10">
      <PageHeader
        hero
        eyebrow="Cash flows"
        title="Payment timeline"
        description="A living history of your investment—from funding through every repayment."
      />
      <Timeline events={investorTimeline} />
    </div>
  );
}
