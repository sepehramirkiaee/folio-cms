import type { Metadata } from "next";
import { ProfileSettings } from "@/features/profile/components/profile-form";

export const metadata: Metadata = { title: "Profile" };

export default function ProfilePage() {
  return <ProfileSettings />;
}
