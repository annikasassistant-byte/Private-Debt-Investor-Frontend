"use client";

import { motion } from "framer-motion";
import { FileText, Download, Eye } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface DocumentCardProps {
  title: string;
  meta: string;
  badge?: string;
  type?: string;
}

export function DocumentCard({ title, meta, badge, type }: DocumentCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="h-full"
    >
      <Card
        className="group flex h-full flex-col overflow-hidden rounded-2xl border-border/40 bg-card/80 backdrop-blur-sm transition-shadow duration-300 hover:shadow-lg"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/10 bg-gradient-to-br from-primary/15 to-transparent text-primary transition-transform duration-300 group-hover:scale-105">
              <FileText className="h-5 w-5" strokeWidth={1.75} />
            </div>
            {badge && (
              <Badge variant="secondary" className="rounded-lg capitalize">
                {badge}
              </Badge>
            )}
          </div>
          <CardTitle className="mt-4 text-base font-semibold leading-snug tracking-tight">
            {title}
          </CardTitle>
          {type && <p className="text-xs font-medium text-primary/80">{type}</p>}
        </CardHeader>
        <CardContent className="flex-1">
          <p className="text-sm leading-relaxed text-muted-foreground">{meta}</p>
        </CardContent>
        <CardFooter className="gap-2 border-t border-border/30 bg-muted/15 p-4">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 rounded-xl border-border/60"
            onClick={() => toast.message("Preview opened (demo)")}
          >
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button
            size="sm"
            className="flex-1 rounded-xl"
            onClick={() => toast.success("Download started (demo)")}
          >
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
