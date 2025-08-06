import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/admin");
    }
  }, [isAuthenticated, setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Chào mừng Admin!</h1>
        <p className="text-gray-600 mb-6">Đang chuyển hướng đến trang quản lý...</p>
        <Button onClick={() => setLocation("/admin")}>
          Đi đến trang quản lý
        </Button>
      </div>
    </div>
  );
}
