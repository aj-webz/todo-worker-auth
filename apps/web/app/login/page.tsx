"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@workspace/ui/components/card"
import { Label } from "@workspace/ui/components/label"
import Link from "next/link"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const router = useRouter()

  const { mutate: loginUser } = useMutation({
    mutationFn: async (values: LoginFormValues) => {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Login failed")
      }

      return data
    },
    onSuccess: () => {
      toast.success("Welcome back 🎉")
      router.push("/dashboard")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const onSubmit = (data: LoginFormValues) => loginUser(data)

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-muted/40 to-muted px-8">
      <Card className="w-full max-w-2xl rounded-3xl border border-border/50 bg-background/90 backdrop-blur-xl shadow-2xl">
        
        {/* Header */}
        <CardHeader className="space-y-6 px-16 pt-16 pb-8 text-center">
          <CardTitle className="text-5xl font-extrabold tracking-tight">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Login to your account and continue managing your tasks.
          </CardDescription>
        </CardHeader>

        {/* Content */}
        <CardContent className="px-16 pb-16">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
            
            {/* Email */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Email</Label>
              <Input
                type="email"
                placeholder="you@example.com"
                className="h-14 rounded-xl text-base"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm font-medium text-red-500">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Password</Label>

              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="h-14 rounded-xl pr-14 text-base"
                  {...register("password")}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                >
                  {showPassword ? (
                    <EyeOff className="h-6 w-6" />
                  ) : (
                    <Eye className="h-6 w-6" />
                  )}
                </button>
              </div>

              {errors.password && (
                <p className="text-sm font-medium text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Button */}
            <Button
              type="submit"
              className="h-14 w-full rounded-xl text-lg font-semibold shadow-lg transition-all hover:scale-[1.02]"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-12 text-center">
            <p className="text-base text-muted-foreground">
              Don’t have an account?{" "}
              <Link
                href="/register"
                className="font-semibold text-primary hover:underline"
              >
                Register here
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
