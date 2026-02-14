"use client"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
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

import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@workspace/ui/components/select"

const registerSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm your password"),
    role: z.enum(["user", "admin"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type RegisterFormValues = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "user" },
  })

  const router = useRouter()
  const selectedRole = watch("role")

  const { mutate: registerUser } = useMutation({
    mutationFn: async (values: RegisterFormValues) => {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Registration failed")
      }
      return data
    },
    onSuccess: () => {
      toast.success("Account created successfully 🎉")
      router.push("/login")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const onSubmit = (data: RegisterFormValues) => registerUser(data)

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-muted/40 to-muted px-6">
      <Card className="w-full max-w-xl rounded-3xl border border-border/50 bg-background/90 backdrop-blur-xl shadow-2xl">
        {/* Header */}
        <CardHeader className="space-y-5 px-12 pt-14 pb-6 text-center">
          <CardTitle className="text-4xl font-extrabold tracking-tight">
            Create Account
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            Join Todo Tracker and start organizing your tasks.
          </CardDescription>
        </CardHeader>

   
        <CardContent className="px-12 pb-14">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

           
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Email</Label>
              <Input
                type="email"
                placeholder="Enter your email"
                className="h-12 rounded-xl text-base"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm font-medium text-red-500">
                  {errors.email.message}
                </p>
              )}
            </div>

           
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="h-12 rounded-xl pr-12 text-base"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm font-medium text-red-500">{errors.password.message}</p>
              )}
            </div>

            
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Confirm Password</Label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  className="h-12 rounded-xl pr-12 text-base"
                  {...register("confirmPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm font-medium text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>

           
            <div className="space-y-4">
              <Label className="text-sm font-semibold">Select Your Role</Label>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role"/>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              <p className="text-sm text-muted-foreground mt-4">
                Registering as <span className="font-semibold">{selectedRole}</span>
              </p>
            </div>

     
            <Button
              type="submit"
              className="h-12 w-full rounded-xl text-base font-semibold shadow-lg transition-all hover:scale-[1.02]"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          
          <div className="mt-10 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?
              <Link href="/login" className="font-semibold text-primary hover:underline">
                Login here
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
