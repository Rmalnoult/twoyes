-- Partner invite system

CREATE TABLE partner_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  invitee_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  invite_code VARCHAR(100) NOT NULL UNIQUE,
  status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, expired
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ
);

CREATE INDEX idx_partner_invites_code ON partner_invites(invite_code);
CREATE INDEX idx_partner_invites_inviter ON partner_invites(inviter_id);
CREATE INDEX idx_partner_invites_invitee ON partner_invites(invitee_id);

-- Row Level Security
ALTER TABLE partner_invites ENABLE ROW LEVEL SECURITY;

-- Users can view their own invites
CREATE POLICY "Users can view own invites"
  ON partner_invites FOR SELECT
  USING (auth.uid() = inviter_id OR auth.uid() = invitee_id);

-- Users can create invites
CREATE POLICY "Users can create invites"
  ON partner_invites FOR INSERT
  WITH CHECK (auth.uid() = inviter_id);

-- Function to accept partner invite
CREATE OR REPLACE FUNCTION accept_partner_invite(p_invite_code VARCHAR)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_invite partner_invites;
  v_inviter_id UUID;
  v_invitee_id UUID;
BEGIN
  v_invitee_id := auth.uid();

  -- Get invite
  SELECT * INTO v_invite
  FROM partner_invites
  WHERE invite_code = p_invite_code
    AND status = 'pending'
    AND expires_at > NOW()
  LIMIT 1;

  IF v_invite IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid or expired invite code');
  END IF;

  v_inviter_id := v_invite.inviter_id;

  -- Update invite status
  UPDATE partner_invites
  SET status = 'accepted',
      invitee_id = v_invitee_id,
      accepted_at = NOW()
  WHERE id = v_invite.id;

  -- Link partners in profiles
  UPDATE profiles
  SET partner_id = v_inviter_id
  WHERE id = v_invitee_id;

  UPDATE profiles
  SET partner_id = v_invitee_id
  WHERE id = v_inviter_id;

  RETURN jsonb_build_object(
    'success', true,
    'partner_id', v_inviter_id
  );
END;
$$;

GRANT EXECUTE ON FUNCTION accept_partner_invite TO authenticated;
