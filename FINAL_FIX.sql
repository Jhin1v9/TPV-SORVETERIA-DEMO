-- Última tentativa: limpar fila de notificações do Postgres (bug conhecido Supabase)
SELECT pg_notification_queue_usage();
