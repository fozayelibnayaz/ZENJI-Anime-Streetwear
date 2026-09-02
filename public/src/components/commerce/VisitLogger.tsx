"use client";

import { useEffect } from "react";
import { usePreferences } from "@/providers/PreferencesProvider";

/** Records a product visit for the "recently viewed" rail. Renders nothing. */
export function VisitLogger({ slug }: { slug: string }) {
  const { noteVisit } = usePreferences();

  useEffect(() => {
    noteVisit(slug);
  }, [slug, noteVisit]);

  return null;
}
