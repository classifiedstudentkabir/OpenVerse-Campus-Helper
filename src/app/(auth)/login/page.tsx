import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to manage certificate batches and templates.
        </p>
      </div>
      <form className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <Input placeholder="you@certifyneo.com" disabled />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Password</label>
          <Input type="password" placeholder="••••••••" disabled />
        </div>
        <Button className="w-full" disabled>
          Sign in
        </Button>
      </form>
      <div className="text-center text-sm text-muted-foreground">
        New here?{" "}
        <Link className="text-primary hover:underline" href="/signup">
          Create an account
        </Link>
      </div>
    </div>
  );
}
