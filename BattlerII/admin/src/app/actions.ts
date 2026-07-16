"use server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function loginAdmin(email: string, pass: string) {
  if (email === process.env.ADMIN_EMAIL && pass === process.env.ADMIN_PASSWORD) {
    const cookieStore = await cookies();
    cookieStore.set("admin_session", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 8, // 8 hours
    });
    return { success: true };
  }
  return { success: false, error: "Authentication failed." };
}

export async function updateCoins(teamId: string, newCoins: number) {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_session")?.value !== "true") {
    return { success: false, error: "Authentication failed." };
  }

  const supabase = createAdminClient();
  
  const { error } = await supabase
    .from("teams")
    .update({ coins: newCoins })
    .eq("id", teamId);

  if (error) {
    console.error("updateCoins error:", error);
    return { success: false, error: "Failed to update balance." };
  }
  
  revalidatePath("/dashboard");
  return { success: true };
}

export async function createTeam(userId: string, teamName: string) {
  const supabase = createAdminClient();
  
  const { error } = await supabase
    .from("teams")
    .insert({
      id: userId,
      team_name: teamName,
      coins: 0
    });

  if (error) {
    console.error("createTeam error:", error);
    return { success: false, error: "Failed to sign up." };
  }
  
  return { success: true };
}
