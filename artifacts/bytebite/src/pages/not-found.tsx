import { Link } from "wouter";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-32 text-center">
      <div className="w-20 h-20 bg-primary/10 rounded-3xl border border-primary/20 flex items-center justify-center mb-6">
        <AlertCircle className="w-10 h-10 text-primary" />
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">404</h1>
      <p className="text-lg text-zinc-400 mb-8 max-w-sm">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link href="/">
        <Button className="bg-primary text-white hover:bg-[#FF6B6B] font-bold px-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
      </Link>
    </div>
  );
}
