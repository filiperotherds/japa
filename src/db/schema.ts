import { relations, sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

const id = () => uuid("id").primaryKey().defaultRandom();
const createdAt = () =>
  timestamp("created_at", { withTimezone: true }).notNull().defaultNow();

export const roleEnum = pgEnum("member_role", ["owner", "barber"]);
export const appointmentKindEnum = pgEnum("appointment_kind", [
  "booking",
  "block",
]);
export const appointmentStatusEnum = pgEnum("appointment_status", [
  "confirmed",
  "cancelled",
]);

/* ---------- Contas ---------- */

export const users = pgTable("users", {
  id: id(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  passwordHash: text("password_hash").notNull(),
  createdAt: createdAt(),
});

export const sessions = pgTable(
  "sessions",
  {
    // sha256 do token do cookie: vazar o banco não vaza sessões válidas
    id: text("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

/* ---------- Tenant: barbearia ---------- */

export const organizations = pgTable("organizations", {
  id: id(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  address: text("address"),
  city: text("city"),
  phone: text("phone"),
  instagram: text("instagram"),
  timezone: text("timezone").notNull().default("America/Sao_Paulo"),
  // grade da agenda e regras de reserva
  slotMinutes: smallint("slot_minutes").notNull().default(30),
  minLeadMinutes: smallint("min_lead_minutes").notNull().default(30),
  bookingWindowDays: smallint("booking_window_days").notNull().default(30),
  cancelHours: smallint("cancel_hours").notNull().default(2),
  createdAt: createdAt(),
});

export const memberships = pgTable(
  "memberships",
  {
    id: id(),
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: roleEnum("role").notNull(),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("memberships_org_user_uq").on(t.orgId, t.userId)],
);

export const invites = pgTable("invites", {
  id: id(),
  orgId: uuid("org_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
  usedBy: uuid("used_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: createdAt(),
});

/* ---------- Barbeiros ---------- */

export const barbers = pgTable(
  "barbers",
  {
    id: id(),
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    handle: text("handle").notNull(),
    displayName: text("display_name").notNull(),
    avatarUrl: text("avatar_url"),
    bio: text("bio"),
    instagram: text("instagram"),
    specialties: text("specialties")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    since: smallint("since"),
    active: boolean("active").notNull().default(true),
    createdAt: createdAt(),
  },
  (t) => [
    uniqueIndex("barbers_org_handle_uq").on(t.orgId, t.handle),
    uniqueIndex("barbers_org_user_uq").on(t.orgId, t.userId),
  ],
);

export const barberPhotos = pgTable(
  "barber_photos",
  {
    id: id(),
    barberId: uuid("barber_id")
      .notNull()
      .references(() => barbers.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    caption: text("caption"),
    createdAt: createdAt(),
  },
  (t) => [index("barber_photos_barber_idx").on(t.barberId)],
);

// Expediente semanal em minutos desde a meia-noite (fuso da barbearia).
// Vários intervalos por dia permitem pausa de almoço.
export const workingHours = pgTable(
  "working_hours",
  {
    id: id(),
    barberId: uuid("barber_id")
      .notNull()
      .references(() => barbers.id, { onDelete: "cascade" }),
    weekday: smallint("weekday").notNull(),
    startMin: smallint("start_min").notNull(),
    endMin: smallint("end_min").notNull(),
  },
  (t) => [
    index("working_hours_barber_idx").on(t.barberId),
    check("working_hours_weekday_ck", sql`${t.weekday} between 0 and 6`),
    check(
      "working_hours_range_ck",
      sql`${t.startMin} >= 0 and ${t.endMin} <= 1440 and ${t.startMin} < ${t.endMin}`,
    ),
  ],
);

/* ---------- Serviços ---------- */

export const services = pgTable(
  "services",
  {
    id: id(),
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    durationMin: smallint("duration_min").notNull(),
    priceCents: integer("price_cents").notNull(),
    active: boolean("active").notNull().default(true),
    sort: smallint("sort").notNull().default(0),
    createdAt: createdAt(),
  },
  (t) => [index("services_org_idx").on(t.orgId)],
);

/* ---------- Agenda ---------- */

// Reservas de clientes e bloqueios do barbeiro vivem na mesma tabela:
// a constraint de exclusão (migração 0001) impede qualquer sobreposição.
export const appointments = pgTable(
  "appointments",
  {
    id: id(),
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    barberId: uuid("barber_id")
      .notNull()
      .references(() => barbers.id, { onDelete: "cascade" }),
    kind: appointmentKindEnum("kind").notNull().default("booking"),
    status: appointmentStatusEnum("status").notNull().default("confirmed"),
    clientId: uuid("client_id").references(() => users.id, {
      onDelete: "set null",
    }),
    serviceId: uuid("service_id").references(() => services.id, {
      onDelete: "set null",
    }),
    // cópia do serviço no momento da reserva (preço pode mudar depois)
    serviceName: text("service_name"),
    priceCents: integer("price_cents"),
    note: text("note"),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [
    index("appointments_barber_time_idx").on(t.barberId, t.startsAt),
    index("appointments_client_idx").on(t.clientId, t.startsAt),
    check("appointments_range_ck", sql`${t.startsAt} < ${t.endsAt}`),
  ],
);

/* ---------- Relações ---------- */

export const organizationsRelations = relations(organizations, ({ many }) => ({
  barbers: many(barbers),
  services: many(services),
  memberships: many(memberships),
}));

export const barbersRelations = relations(barbers, ({ one, many }) => ({
  org: one(organizations, {
    fields: [barbers.orgId],
    references: [organizations.id],
  }),
  user: one(users, { fields: [barbers.userId], references: [users.id] }),
  photos: many(barberPhotos),
  hours: many(workingHours),
}));

export const barberPhotosRelations = relations(barberPhotos, ({ one }) => ({
  barber: one(barbers, {
    fields: [barberPhotos.barberId],
    references: [barbers.id],
  }),
}));

export const workingHoursRelations = relations(workingHours, ({ one }) => ({
  barber: one(barbers, {
    fields: [workingHours.barberId],
    references: [barbers.id],
  }),
}));

export const servicesRelations = relations(services, ({ one }) => ({
  org: one(organizations, {
    fields: [services.orgId],
    references: [organizations.id],
  }),
}));

export const membershipsRelations = relations(memberships, ({ one }) => ({
  org: one(organizations, {
    fields: [memberships.orgId],
    references: [organizations.id],
  }),
  user: one(users, { fields: [memberships.userId], references: [users.id] }),
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  org: one(organizations, {
    fields: [appointments.orgId],
    references: [organizations.id],
  }),
  barber: one(barbers, {
    fields: [appointments.barberId],
    references: [barbers.id],
  }),
  client: one(users, {
    fields: [appointments.clientId],
    references: [users.id],
  }),
  service: one(services, {
    fields: [appointments.serviceId],
    references: [services.id],
  }),
}));

export type Organization = typeof organizations.$inferSelect;
export type Barber = typeof barbers.$inferSelect;
export type Service = typeof services.$inferSelect;
export type Appointment = typeof appointments.$inferSelect;
export type User = typeof users.$inferSelect;
