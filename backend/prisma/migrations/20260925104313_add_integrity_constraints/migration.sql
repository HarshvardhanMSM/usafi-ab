-- Add required polymorphic identity/sender integrity constraints.

ALTER TABLE "user_sessions"
ADD CONSTRAINT "chk_user_session_identity"
CHECK (
  (user_type = 'ADMIN' AND admin_user_id IS NOT NULL AND staff_id IS NULL)
  OR
  (user_type = 'STAFF' AND staff_id IS NOT NULL AND admin_user_id IS NULL)
);

ALTER TABLE "chat_messages"
ADD CONSTRAINT "chk_chat_message_sender"
CHECK (
  (sender_type = 'STAFF' AND sender_staff_id IS NOT NULL AND sender_admin_id IS NULL)
  OR
  (sender_type = 'ADMIN' AND sender_admin_id IS NOT NULL AND sender_staff_id IS NULL)
);

ALTER TABLE "ticket_messages"
ADD CONSTRAINT "chk_ticket_message_sender"
CHECK (
  (sender_type = 'STAFF' AND sender_staff_id IS NOT NULL AND sender_admin_id IS NULL)
  OR
  (sender_type = 'ADMIN' AND sender_admin_id IS NOT NULL AND sender_staff_id IS NULL)
);