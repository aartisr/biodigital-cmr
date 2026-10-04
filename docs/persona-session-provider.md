# Persona Session Provider Contract

## Purpose

The client uses this contract to obtain a presentation scope for the selected persona. It is not a substitute for server-side authorization. With no configured endpoint, the app uses a `DEMO` provider that is intentionally unsuitable for real data or actions.

Set `VITE_PERSONA_SESSION_ENDPOINT` only to an authenticated same-origin or approved policy endpoint. The browser sends cookies with the request; it must not store permissions, clinical data, or access tokens in local storage.

## Request

`POST $VITE_PERSONA_SESSION_ENDPOINT`

```json
{ "requestedRole": "ATTENDING_CARDIOLOGIST" }
```

`requestedRole` is a presentation preference, never an authorization claim. The service must derive the authenticated principal, permitted role(s), data scope, and every capability from its own verified identity and policy records.

## Successful response

Return `200` with only known capability and workspace identifiers:

```json
{
  "capabilities": ["VIEW_LIVE_TELEMETRY", "REVIEW_ALERTS"],
  "availableWorkspaces": ["OVERVIEW", "MONITORING", "REVIEW"],
  "defaultWorkspace": "OVERVIEW",
  "dataScope": "DE_IDENTIFIED",
  "expiresAt": "2026-10-04T16:00:00Z"
}
```

Supported `dataScope` values are `DE_IDENTIFIED` and `SCOPED_RESEARCH`. `defaultWorkspace` must be included in `availableWorkspaces`. Malformed responses are rejected as unavailable rather than widened by the client.

## Failure behavior

- Return `401` or `403` for unauthenticated or unauthorized access. The UI displays a denied state and does not render persona workspaces.
- Return other non-2xx responses for an unavailable policy service. The UI displays a retryable unavailable state and does not render persona workspaces.
- Do not return PHI, telemetry, credentials, or policy implementation details in this response.

## Required server controls

- Authenticate the user and enforce authorization independently for every protected data request, export, configuration change, and clinical action.
- Do not trust the browser-selected role, hidden controls, or this UI capability list.
- Apply minimum-necessary data scope, time limits, reason-for-access requirements where applicable, and immutable audit events at the server boundary.
- Re-evaluate authorization when a session expires, permissions change, a patient scope changes, or an export/action is requested.
- Keep this project’s research-only and non-diagnostic limitations until appropriate product validation, governance, and regulatory work has been completed.
