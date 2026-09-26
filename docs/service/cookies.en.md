# Cookie Policy

| Field | Value |
| --- | --- |
| Status | Pre-publication draft — verify against the real deployment |
| Version | `0.1.0-draft` |
| Last updated | 22 September 2026 |
| Contact | The channel will be published before public release |

## Approved MVP profile

The MVP uses only technologies needed for security, usage limits, and the short
conversation in the current tab. It uses no advertising, marketing, cross-site
tracking or analytics cookies and no high-entropy device fingerprinting.

## What is stored

| Technology | Purpose | Content | Maximum lifetime |
| --- | --- | --- | ---: |
| Necessary visitor cookie | Protect the paid API, enforce daily limits, and prevent abuse | Random identifier, version, expiry, key ID, and signature; no IP address or browser fingerprint | 30 days |
| `sessionStorage` | Continue the conversation in the current tab | Signed envelope containing visible text history; no image | 60 minutes idle, 4 hours total, or tab close |
| Page memory | CSRF protection and current interface | Short-lived security values and current state | Until reload/close |

The visitor cookie must be `HttpOnly`, `Secure`, `SameSite=Strict`, use a narrow
API `Path`, and have no `Domain` attribute. JavaScript cannot read it.

## Choice and consent

The approved profile contains no optional technology to switch on or off, so it
does not display a misleading “accept all” banner. This Policy remains available
from the footer.

If an optional cookie or similar technology is introduced, it must remain off
until an explicit choice. The interface must provide equally easy Accept and
Reject actions, later withdrawal/change, and current provider, purpose, and
duration information before activation.

## Control and deletion

You can delete cookies in your browser settings. “New chat” clears conversation
state; closing the tab removes its `sessionStorage`. Blocking the necessary
visitor cookie may stop the chat API, but the landing page and these information
pages must remain available.

See the [Privacy Notice](privacy.en.md) for the rest of the processing.
