import { AuthForm } from "@/components/auth-form";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Create Account</h1>
        <p className="mt-2 text-muted-foreground">
          Sign up to get started with your learning journey
        </p>
      </div>
      <AuthForm mode="sign-up" />
    </div>
  );
}
