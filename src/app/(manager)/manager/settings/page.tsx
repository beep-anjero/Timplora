import { PageHeading } from "@/components/ui/page-heading";
import { SettingsForm } from "@/components/manager/settings-form";
import { getSchedulingSettings } from "@/lib/data/settings";
import { PasswordForm } from "@/components/employee/password-form";
export default async function SettingsPage(){const settings=await getSchedulingSettings();return <><PageHeading eyebrow="Configuration" title="Scheduling settings" description="Control minimum daily coverage and the shift times used by automatic scheduling."/><SettingsForm initial={settings}/><PasswordForm/></>}
