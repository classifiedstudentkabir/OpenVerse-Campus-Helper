import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SignupPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold">Create your account</h1>
        <p className="text-sm text-muted-foreground">
          Start generating polished certificates in minutes.
        </p>
      </div>
      <form className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Full name</label>
          <Input placeholder="Alex Chen" disabled />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <Input placeholder="alex@certifyneo.com" disabled />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Password</label>
          <Input type="password" placeholder="Create a password" disabled />
        </div>
        <Button className="w-full" disabled>
          Create account
        </Button>
      </form>
      <div className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link className="text-primary hover:underline" href="/login">
          Sign in
        </Link>
      </div>
    </div>
  );
}
