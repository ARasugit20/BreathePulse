import { useRouteError } from "react-router-dom";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";

export function ErrorPage() {
  const error = useRouteError();
  const message = error instanceof Error ? error.message : "Something went wrong";

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h1 className="text-4xl font-bold text-destructive">Error</h1>
      <p className="mt-4 text-muted-foreground">{message}</p>
      <Button asChild className="mt-6">
        <Link to="/">Back to Home</Link>
      </Button>
    </div>
  );
}
