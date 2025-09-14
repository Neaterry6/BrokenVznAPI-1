import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface BackButtonProps {
  href?: string;
  onClick?: () => void;
  label?: string;
}

export function BackButton({ href = "/", onClick, label = "Back" }: BackButtonProps) {
  if (onClick) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={onClick}
        className="mb-6 hover:bg-muted"
        data-testid="button-back"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {label}
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      asChild
      className="mb-6 hover:bg-muted"
      data-testid="button-back"
    >
      <Link href={href}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        {label}
      </Link>
    </Button>
  );
}