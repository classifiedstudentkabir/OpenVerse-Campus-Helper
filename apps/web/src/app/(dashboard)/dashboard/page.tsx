"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Bell, Plus, UploadCloud } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const quickActions = [
  { title: "Design new", description: "Start from a blank canvas", icon: "✍️" },
  { title: "Explore templates", description: "Browse certificate designs", icon: "🗂️" },
  { title: "Integrations", description: "Connect with your apps", icon: "🧩" },
];

const activityItems = [
  {
    title: "120 certificates sent for TechFest",
    subtitle: "Participants • Batch 2024",
    time: "2h ago",
    icon: "🎉",
  },
  {
    title: "Winner certificates for Hackathon 3",
    subtitle: "Rank 1-3 awards generated",
    time: "5h ago",
    icon: "🏆",
  },
];

export default function DashboardPage() {
  const [stats, setStats] = useState({ issued: 0, drafts: 0, success: 0, credits: 0 });

  const targetStats = useMemo(
    () => ({ issued: 12840, drafts: 24, success: 99.8, credits: 1240 }),
    []
  );

  useEffect(() => {
    const start = Date.now();
    const duration = 900;
    const tick = () => {
      const progress = Math.min((Date.now() - start) / duration, 1);
      setStats({
        issued: Math.round(targetStats.issued * progress),
        drafts: Math.round(targetStats.drafts * progress),
        success: Number((targetStats.success * progress).toFixed(1)),
        credits: Math.round(targetStats.credits * progress),
      });
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [targetStats]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <div className="rounded-3xl bg-gradient-to-br from-violet-500/90 via-indigo-500/90 to-purple-500/90 p-8 text-white shadow-lg">
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-sm opacity-90">Welcome back</p>
              <h1 className="text-3xl font-semibold">Welcome back, Binod! 👋</h1>
              <p className="mt-2 max-w-md text-sm opacity-90">
                Your workspace is looking great. What would you like to create today?
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/editor">
                <Button className="bg-white/15 text-white hover:bg-white/25" variant="secondary">
                  <Plus className="h-4 w-4" />
                  Create certificate
                </Button>
              </Link>
              <Link href="/batches/new/upload">
                <Button className="bg-white/15 text-white hover:bg-white/25" variant="secondary">
                  <UploadCloud className="h-4 w-4" />
                  Bulk upload
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Quick actions</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {quickActions.map((item) => (
              <Card key={item.title}>
                <CardHeader>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-muted text-lg">
                    {item.icon}
                  </div>
                  <CardTitle className="text-base">{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent activity</h2>
            <button className="text-sm text-muted-foreground" disabled>
              View all
            </button>
          </div>
          <div className="space-y-3">
            {activityItems.map((item) => (
              <Card key={item.title}>
                <CardContent className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-lg">
                      {item.icon}
                    </div>
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{item.time}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>

      <aside className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Workspace stats</CardTitle>
            <CardDescription>Overview of your activity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/40 p-3">
              <div>
                <p className="text-xs text-muted-foreground">Total issued</p>
                <p className="text-lg font-semibold">{stats.issued.toLocaleString()}</p>
              </div>
              <span className="text-xs text-emerald-500">+12%</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/40 p-3">
              <div>
                <p className="text-xs text-muted-foreground">Active drafts</p>
                <p className="text-lg font-semibold">{stats.drafts}</p>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/40 p-3">
              <div>
                <p className="text-xs text-muted-foreground">Success rate</p>
                <p className="text-lg font-semibold">{stats.success}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Available credits</CardTitle>
            <CardDescription>Workspace plan usage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-semibold">{stats.credits.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Credits remaining</p>
              </div>
              <Bell className="h-5 w-5 text-muted-foreground" />
            </div>
            <Button className="w-full" variant="secondary" disabled>
              Top up
            </Button>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
