-- Garante no banco que um barbeiro nunca tem dois compromissos sobrepostos
-- (reserva x reserva ou reserva x bloqueio), mesmo com cliques simultâneos.
CREATE EXTENSION IF NOT EXISTS btree_gist;
--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_no_overlap"
  EXCLUDE USING gist ("barber_id" WITH =, tstzrange("starts_at", "ends_at", '[)') WITH &&)
  WHERE ("status" = 'confirmed');
