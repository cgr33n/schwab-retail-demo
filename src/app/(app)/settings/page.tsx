import { requireSession } from "@/lib/auth";
import { getStore } from "@/lib/db";
import SettingsForm from "@/components/SettingsForm";

export const instant = false

export default async function SettingsPage() {
  await requireSession();
  const user = getStore().user;

  return (
    <div>
      <div className="page-title">
        <h1>Settings</h1>
        <p className="page-sub">Profile and preferences for your demo account.</p>
      </div>
      <SettingsForm user={user} />
    </div>
  );
}
