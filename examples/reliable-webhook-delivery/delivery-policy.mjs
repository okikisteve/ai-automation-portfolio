/**
 * Synthetic, credential-free webhook outbox delivery decision engine.
 * This only PLANS next steps. It does not send requests, store state,
 * acquire locks, or implement persistent idempotency.
 */
export function planWebhookDelivery(input) {
  const p = input && typeof input === "object" && !Array.isArray(input) ? input : {};
  const errors = [];
  const eventId = typeof p.event_id === "string" ? p.event_id.trim() : "";
  const attempt = p.attempt;
  const state = p.existing_event_state;
  const networkError = p.network_error === true;
  const status = p.http_status === undefined ? null : p.http_status;
  const retryAfter = p.retry_after_seconds ?? null;

  if (!/^[A-Za-z0-9_-]{8,64}$/.test(eventId))
    errors.push("event_id must be 8–64 safe characters");
  if (!Number.isInteger(attempt) || attempt < 1 || attempt > 5)
    errors.push("attempt must be an integer from 1 through 5");
  if (!["unseen", "processing", "delivered", "failed"].includes(state))
    errors.push("existing_event_state must be unseen, processing, delivered or failed");
  if (p.network_error !== undefined && typeof p.network_error !== "boolean")
    errors.push("network_error must be a boolean");
  if (status !== null && (!Number.isInteger(status) || status < 100 || status > 599))
    errors.push("http_status must be an HTTP status integer between 100 and 599");
  if (networkError && status !== null)
    errors.push("network_error and http_status cannot both be present");
  if (!networkError && status === null && !["processing", "delivered"].includes(state))
    errors.push("provide http_status or network_error for a delivery attempt");
  if (retryAfter !== null && (!Number.isInteger(retryAfter) || retryAfter < 0 || retryAfter > 3600))
    errors.push("retry_after_seconds must be an integer from 0 to 3600");
  if (errors.length) return { ok: false, event_id: eventId || null, errors };

  const outcome = (decision, delaySeconds, reason) => ({
    ok: true, event_id: eventId, decision, delay_seconds: delaySeconds,
    reason, external_action_performed: false,
    note: "Simulation only. A real outbox needs durable atomic state, locking and delivery receipts."
  });

  // State comes from a trusted store in real systems; this demo receives
  // it as input for deterministic illustration. No actual lock is obtained.
  if (state === "delivered")
    return outcome("SUPPRESS_DUPLICATE", null, "Trusted store already marked event delivered");
  if (state === "processing")
    return outcome("WAIT_FOR_LOCK", null, "Another worker may own this event; review lease state");

  if (!networkError && status >= 200 && status <= 299)
    return outcome("MARK_DELIVERED", null, "Receiver returned a 2xx response");

  // A 409 can mean an already processed event or a real business conflict;
  // never blindly retry or mark delivered without confirmation.
  if (status === 409)
    return outcome("HUMAN_REVIEW", null, "409 conflict requires receiver-state reconciliation");

  const transient = networkError || [408, 425, 429].includes(status) || (status >= 500 && status <= 599);
  if (!transient)
    return outcome("HUMAN_REVIEW", null, "Non-transient or ambiguous response");

  if (attempt >= 5)
    return outcome("DEAD_LETTER_REVIEW", null, "Maximum five attempts reached");

  // Exponential backoff. Real systems should add jitter, rate limits,
  // Retry-After date parsing and DLQ persistence.
  const calculated = Math.min(900, 15 * (2 ** (attempt - 1)));
  const delay = (status === 429 || status === 503) && retryAfter !== null
    ? Math.max(calculated, retryAfter)
    : calculated;
  return outcome("RETRY_LATER", delay, "Transient failure; replay only with stable event ID and safe receiver semantics");
}
