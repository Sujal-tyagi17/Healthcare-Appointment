# CarePulse — System Design

## Healthcare Appointment & Follow-up Manager

CarePulse is designed around four backend reliability concerns: **double-booking prevention, temporary slot holds, doctor leave handling, and reliable notifications**.

The core principle is:

> **Use database constraints for consistency, durable records for reliability, and explicit states for workflows requiring human action.**

---

## 1. Double-Booking Prevention

A simple availability check is unsafe because two patients can check the same slot simultaneously.

CarePulse uses three layers of protection.

### Database Constraint

The `Appointment` table has a composite unique constraint on:

```text
(doctorId, date, startTime)
```

This is the **final guarantee** against concurrent conflicting inserts. If two requests attempt to create the same appointment, the database rejects the conflicting insert and the API returns `409 Conflict`.

### Transactional Booking

The booking workflow runs inside `prisma.$transaction(...)` and includes:

1. Doctor lookup
2. Leave check
3. Appointment conflict check
4. Appointment creation
5. Slot-hold cleanup

The transaction keeps the booking workflow consistent, while the database constraint provides the final concurrency guarantee.

### Status Filtering

Only `BOOKED` and `COMPLETED` appointments block a slot. `CANCELLED` and `REQUIRES_RESCHEDULE` appointments do not.

**Verified:** booking the same doctor/date/time twice succeeded once and rejected the second attempt with:

> This slot was just booked by another patient. Please choose another slot.

---

## 2. Slot Hold Mechanism

Patients may need several minutes to complete symptom details before confirming an appointment. To prevent another patient from taking the selected slot, CarePulse uses a temporary `SlotHold`.

When a patient selects a slot:

```http
POST /appointments/hold
```

a hold is created with:

* `holdToken`
* `doctorId`
* `date`
* `startTime`
* `expiresAt`

The hold lasts **10 minutes** and `holdToken` is uniquely indexed.

The availability endpoint:

```http
GET /doctors/:id/availability
```

ignores expired holds using:

```text
expiresAt <= currentTime
```

A hold can be removed when:

1. It expires.
2. The patient explicitly releases it using `DELETE /hold/:holdToken`.
3. The appointment is successfully booked, where the booking transaction removes the hold.

This provides temporary slot ownership without requiring permanent locks.

---

## 3. Doctor Leave & Rescheduling

When an administrator records doctor leave:

```http
POST /admin/doctors/:id/leave
```

the system upserts the leave record and finds affected `BOOKED` appointments for that doctor and date.

Affected appointments are changed to:

```text
REQUIRES_RESCHEDULE
```

rather than `CANCELLED`.

This distinction preserves the workflow: the appointment cannot proceed at the original time, but the patient still needs to select a replacement slot.

Each affected patient receives a rescheduling link such as:

```text
/reschedule/:appointmentId?doctorId=...
```

The API returns:

```json
{
  "affectedAppointmentsCount": 1,
  "patientsNotifiedCount": 1
}
```

**Verified:** an existing booking was correctly changed to `REQUIRES_RESCHEDULE`, with the affected appointment and notification counts reported.

---

## 4. Notification Failure Handling

Email and calendar services can fail because of network issues, expired credentials, SMTP errors, or rate limits.

CarePulse therefore uses a durable `NotificationLog` with:

```text
PENDING
SENT
FAILED
```

plus `retryCount` and error information.

The notification is persisted before delivery is attempted:

```text
Business Operation
       │
       ▼
NotificationLog (PENDING)
       │
       ▼
Attempt Delivery
    ┌──┴──┐
    ▼     ▼
  SENT   FAILED
           │
           ▼
      Retry Worker
```

If delivery fails, the error is recorded and the parent business operation is not rolled back. For example, a failed confirmation email does not cancel a successful appointment.

A background job retries `PENDING`/`FAILED` notifications until the configured retry limit is reached. The log also provides an administrative delivery audit trail and supports manual retry.

---

## 5. Overall Design

| Concern                  | Solution                                 |
| ------------------------ | ---------------------------------------- |
| Concurrent bookings      | Transaction + database unique constraint |
| Temporary slot ownership | 10-minute `SlotHold`                     |
| Doctor leave             | `REQUIRES_RESCHEDULE` workflow           |
| Notification failure     | Durable log + background retry           |
| Cancelled appointments   | Status-based availability filtering      |

### Key Design Principles

* **Database constraints** provide final concurrency protection.
* **Transactions** keep related booking operations consistent.
* **Expiring holds** provide temporary reservation without permanent locks.
* **Explicit workflow states** distinguish rescheduling from cancellation.
* **Durable notification logs** prevent external service failures from losing notification records.

Together, these mechanisms provide a relatively simple architecture that remains reliable under concurrent bookings, temporary slot reservations, doctor availability changes, and external notification failures.
