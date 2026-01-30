"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";

interface ProfileData {
  name: string;
  email: string;
  avatar?: string;
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<ProfileData>({ name: "Kabir", email: "kabir@example.com" });
  const [savedMessage, setSavedMessage] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load profile from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("certifyneo-profile");
      if (saved) {
        const data = JSON.parse(saved);
        setProfile(data);
        if (data.avatar) {
          setAvatarPreview(data.avatar);
        }
      }
    }
  }, []);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, name: e.target.value });
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, email: e.target.value });
  };

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setAvatarPreview(dataUrl);
        setProfile({ ...profile, avatar: dataUrl });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("certifyneo-profile", JSON.stringify(profile));
      setSavedMessage(true);
      setTimeout(() => setSavedMessage(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Account settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your profile and preferences.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Update your name and email.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full name</label>
              <Input
                placeholder="Your name"
                value={profile.name}
                onChange={handleNameChange}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                placeholder="your@email.com"
                value={profile.email}
                onChange={handleEmailChange}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleSave} className="flex-1">
                {savedMessage ? "✓ Saved" : "Save changes"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profile picture</CardTitle>
            <CardDescription>Upload your avatar.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar preview"
                  className="h-24 w-24 rounded-full object-cover border-2 border-border/60"
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-muted border-2 border-border/60 flex items-center justify-center text-xs text-muted-foreground">
                  No image
                </div>
              )}
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarSelect}
                className="hidden"
              />
              <Button
                variant="outline"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Choose image
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
