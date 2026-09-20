import { PageHeading } from "@/components/ui/page-heading";
import { EmployeeRoster } from "@/components/manager/employee-roster";
import { listTeamAccounts } from "@/lib/data/employees";

export default async function EmployeesPage() {
  const accounts = await listTeamAccounts();
  return <><PageHeading eyebrow="Team" title="Team accounts" description="Create crew and manager accounts, then review their roles and scheduling details." /><EmployeeRoster initial={accounts} /></>;
}
