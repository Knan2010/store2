import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { loginSchema, type LoginForm } from "@shared/schema";
import { ShoppingCart, Users, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function AuthPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginForm) => {
      const response = await apiRequest("POST", "/api/auth/login", data);
      return response.json();
    },
    onSuccess: (admin) => {
      queryClient.setQueryData(["/api/auth/user"], admin);
      toast({
        title: "Đăng nhập thành công",
        description: `Chào mừng ${admin.fullName || admin.username}!`,
      });
      setLocation("/admin");
    },
    onError: (error: any) => {
      toast({
        title: "Đăng nhập thất bại",
        description: error.message || "Tên đăng nhập hoặc mật khẩu không đúng",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LoginForm) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Back to Home Button */}
      <Button
        variant="ghost"
        className="absolute top-6 left-6 text-gray-600 hover:text-gray-900"
        onClick={() => setLocation("/")}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Về trang chủ
      </Button>

      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left side - Login Form */}
        <div className="flex flex-col justify-center">
          <Card className="w-full max-w-md mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Đăng nhập Admin
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="username">Tên đăng nhập</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Nhập tên đăng nhập"
                    {...form.register("username")}
                    className="mt-1"
                  />
                  {form.formState.errors.username && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.username.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="password">Mật khẩu</Label>
                  <div className="relative mt-1">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Nhập mật khẩu"
                      {...form.register("password")}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {form.formState.errors.password && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? "Đang đăng nhập..." : "Đăng nhập"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right side - Hero Section */}
        <div className="flex flex-col justify-center text-center lg:text-left">
          <div className="mb-8">
            <div className="flex items-center justify-center lg:justify-start mb-6">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mr-4">
                <ShoppingCart className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-primary">Tạp Hóa Online</h1>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Hệ thống quản lý sản phẩm
            </h2>
            
            <p className="text-lg text-gray-600 mb-6">
              Quản lý danh sách sản phẩm tạp hóa một cách dễ dàng và hiệu quả. 
              Cập nhật giá cả, tồn kho và thông tin sản phẩm theo thời gian thực.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">Quản lý sản phẩm</h3>
                <p className="text-sm text-gray-600">
                  Thêm, sửa, xóa sản phẩm với hình ảnh và thông tin chi tiết
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">Theo dõi tồn kho</h3>
                <p className="text-sm text-gray-600">
                  Cập nhật số lượng và trạng thái hàng hóa trong kho
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">Danh mục sản phẩm</h3>
                <p className="text-sm text-gray-600">
                  Phân loại sản phẩm theo các danh mục khác nhau
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">Giao diện thân thiện</h3>
                <p className="text-sm text-gray-600">
                  Sử dụng dễ dàng trên cả máy tính và điện thoại
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}