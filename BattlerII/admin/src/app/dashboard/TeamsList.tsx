"use client";
import React, { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateCoins } from "@/app/actions";
import { Coin, PencilSimple, Check, X } from "@phosphor-icons/react";

type TeamData = {
  id: string;
  team_name: string;
  email: string;
  coins: number;
};

export default function TeamsList({ initialTeams }: { initialTeams: TeamData[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCoins, setEditCoins] = useState<number>(0);
  const [isPending, startTransition] = useTransition();

  const handleEditClick = (teamId: string, currentCoins: number) => {
    setEditingId(teamId);
    setEditCoins(Number(currentCoins) || 0);
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  const handleSave = (teamId: string) => {
    startTransition(async () => {
      const res = await updateCoins(teamId, editCoins);
      if (res.success) {
        toast.success("Balance updated successfully.");
        setEditingId(null);
      } else {
        toast.error("Failed to update balance.");
      }
    });
  };

  if (initialTeams.length === 0) {
    return <div className="p-8 text-center text-slate-500">No teams found in database.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left text-slate-600">
        <thead className="text-xs uppercase bg-slate-50 text-slate-500 border-b border-slate-200">
          <tr>
            <th scope="col" className="px-6 py-4 font-semibold">Team Name</th>
            <th scope="col" className="px-6 py-4 font-semibold">Email Address</th>
            <th scope="col" className="px-6 py-4 font-semibold">Coins</th>
            <th scope="col" className="px-6 py-4 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {initialTeams.map((team) => {
            const isEditing = editingId === team.id;
            const coins = team.coins != null ? Number(team.coins) : 0;
            const teamName = team.team_name || "Unnamed Team";

            return (
              <tr key={team.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900">
                  {teamName}
                </td>
                <td className="px-6 py-4 text-slate-500">
                  {team.email}
                </td>
                <td className="px-6 py-4">
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <Coin size={16} weight="fill" className="text-amber-500" />
                      <input 
                        type="number"
                        value={editCoins}
                        onChange={(e) => setEditCoins(e.target.value === '' ? 0 : Number(e.target.value))}
                        className="w-24 px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                        autoFocus
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 font-semibold text-slate-700">
                      <Coin size={18} weight="fill" className="text-amber-500" />
                      {coins}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  {isEditing ? (
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleSave(team.id)}
                        disabled={isPending}
                        className="p-1.5 text-green-600 hover:bg-green-100 rounded transition-colors disabled:opacity-50"
                        title="Save"
                      >
                        <Check size={18} weight="bold" />
                      </button>
                      <button 
                        onClick={handleCancel}
                        disabled={isPending}
                        className="p-1.5 text-slate-400 hover:bg-slate-200 rounded transition-colors disabled:opacity-50"
                        title="Cancel"
                      >
                        <X size={18} weight="bold" />
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleEditClick(team.id, coins)}
                      className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                      title="Edit Coins"
                    >
                      <PencilSimple size={18} weight="bold" />
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
