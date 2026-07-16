create policy "Guests can join waiting lobby"
  on public.lobbies for update
  to authenticated
  using (status = 'waiting')
  with check (auth.uid() = guest_team_id);
