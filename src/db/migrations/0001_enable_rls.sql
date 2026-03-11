-- Enable RLS on all tables
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "calls" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "transcriptions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "summaries" ENABLE ROW LEVEL SECURITY;

-- users: can only read/update their own row
CREATE POLICY "users_select_own" ON "users"
  FOR SELECT USING (id = current_setting('app.current_user_id', true));

CREATE POLICY "users_insert_own" ON "users"
  FOR INSERT WITH CHECK (id = current_setting('app.current_user_id', true));

CREATE POLICY "users_update_own" ON "users"
  FOR UPDATE USING (id = current_setting('app.current_user_id', true));

-- calls: can only access their own calls
CREATE POLICY "calls_select_own" ON "calls"
  FOR SELECT USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "calls_insert_own" ON "calls"
  FOR INSERT WITH CHECK (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "calls_update_own" ON "calls"
  FOR UPDATE USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "calls_delete_own" ON "calls"
  FOR DELETE USING (user_id = current_setting('app.current_user_id', true));

-- transcriptions: accessible if the related call belongs to the user
CREATE POLICY "transcriptions_select_own" ON "transcriptions"
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM "calls" WHERE "calls".id = call_id AND "calls".user_id = current_setting('app.current_user_id', true))
  );

CREATE POLICY "transcriptions_insert_own" ON "transcriptions"
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM "calls" WHERE "calls".id = call_id AND "calls".user_id = current_setting('app.current_user_id', true))
  );

-- summaries: accessible if the related call belongs to the user
CREATE POLICY "summaries_select_own" ON "summaries"
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM "calls" WHERE "calls".id = call_id AND "calls".user_id = current_setting('app.current_user_id', true))
  );

CREATE POLICY "summaries_insert_own" ON "summaries"
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM "calls" WHERE "calls".id = call_id AND "calls".user_id = current_setting('app.current_user_id', true))
  );
