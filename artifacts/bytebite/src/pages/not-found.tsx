import { Link } from "wouter";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="bg-[#0C0C0C] min-h-screen flex flex-col items-center justify-center px-4 py-32 text-center">
      <div className="w-20 h-20 bg-[#E63946]/10 rounded-3xl flex items-center justify-center mb-6">
        <AlertCircle className="w-10 h-10 text-[#E63946]" />
      </div>
      <h1 className="text-5xl font-black tracking-tight text-white mb-2">404</h1>
      <p className="text-lg text-gray-500 mb-8 max-w-sm">The page you are looking for does not exist or has been moved.</p>
      <Link href="/">
        <Button className="bg-[#E63946] text-white hover:bg-[#d32f3c] font-bold px-6 rounded-full">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Button>
      </Link>
    </div>
  );
}
