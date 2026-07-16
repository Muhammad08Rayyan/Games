import { createAdminClient } from "@/lib/supabase/admin";
import TeamsList from "./TeamsList";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createAdminClient();
  
  // Fetch teams table
  const { data: teams, error: teamsError } = await supabase
    .from("teams")
    .select("*")
    .order("team_name", { ascending: true });
    
  // Fetch users to map emails
  const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();

  const mappedTeams = (teams || []).map((team) => {
    const user = users?.find((u) => u.id === team.id);
    return {
      id: team.id,
      team_name: team.team_name,
      coins: team.coins,
      email: user?.email || "Unknown"
    };
  });

  return (
    <div className="border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-200 bg-slate-50">
        <h2 className="text-xl font-semibold text-slate-800">All Teams</h2>
      </div>
      
      {(teamsError || authError) && (
        <div className="p-6 text-red-600 bg-red-50">
          Failed to load data: {teamsError?.message || authError?.message}
        </div>
      )}

      <TeamsList initialTeams={mappedTeams} />
    </div>
  );
}
