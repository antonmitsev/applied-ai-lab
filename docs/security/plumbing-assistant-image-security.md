# Plumbing Assistant — Image Input Security and Lifecycle

| Field | Value |
| --- | --- |
| Specification ID | `PA-IMG-001` |
| Status | Approved design; implementation and verification pending |
| Date | 2026-09-22 |
| Owner | Anton Mitsev |
| Audit finding | `AUD-P1-007` |
| Applies to | User-supplied images in the Plumbing Assistant MVP |

## Purpose

This specification defines the complete lifecycle of a user image: browser
selection, authenticated upload, validation, decoding, metadata removal,
normalization, provider transfer, cleanup, recovery, and observability.

An image is untrusted user input and potentially sensitive content. A filename,
extension, browser MIME type, successful upload, or successful decode alone does
not make it safe or diagnostically reliable.

## MVP decisions

- Accept at most one image per chat request.
- Accept only JPEG, PNG, and non-animated WebP input after server-side format
  detection and complete strict decoding.
- Do not accept GIF, SVG, HEIC/HEIF, TIFF, BMP, PDF, archives, camera RAW, or
  video in the MVP.
- Normalize every accepted image to a metadata-free, orientation-corrected sRGB
  JPEG before any OpenAI request.
- Prefer an inline Base64 data URL in the current Responses API request. Do not
  create an OpenAI File during the normal path.
- Treat the image as current-request data. Never place bytes, Base64, hashes,
  thumbnails, or provider file IDs in the conversation envelope.
- Preserve only a bounded textual observation in the validated assistant
  response when later turns need context. Reinspection requires re-upload.

OpenAI supports image input by URL, Base64 data URL, or File ID. This application
does not send a browser-provided or application-hosted public URL because that
would add URL exposure, lifetime, authorization, and SSRF concerns. The
application uses only its deliberately smaller format and size profile, even if
the provider supports larger requests or additional formats.

## Hard input and processing limits

The following values are security and cost ceilings, not suggested targets:

| Control | MVP limit |
| --- | ---: |
| Image count per request | 1 |
| Encoded upload bytes | 8 MiB (`8,388,608`) |
| Total multipart body | 9 MiB (`9,437,184`) |
| Combined non-file fields | 256 KiB (`262,144`) |
| Minimum decoded width and height | 64 px each |
| Maximum decoded width or height | 8,192 px |
| Maximum decoded pixels | 25,000,000 |
| Maximum aspect ratio | 20:1 |
| Decoder wall-clock time | 5 seconds |
| Decoder memory budget | 256 MiB per worker |
| Concurrent decodes per worker | 1 |
| Normalized longest edge | 2,048 px |
| Normalized output bytes | 4 MiB (`4,194,304`) |
| Provider detail level | `high` |
| Abandoned local-artifact ceiling | 15 minutes |

The limits apply before cost reservation except that cheap authentication,
short-window throttling, and request framing checks run before the body is read.
Production configuration may lower these values but may not raise them without
updating this specification, the cost model, evaluation fixtures, privacy
notices, and tests.

Provider-advertised limits are not application defaults. The application must
also verify at startup that its normalized format, dimensions, detail setting,
and model snapshot are supported by the selected provider configuration.

## Browser behavior

The browser must:

- use a file picker/camera accept hint for JPEG, PNG, and WebP, while explaining
  that server validation is authoritative;
- display the one-image, 8 MiB, and privacy limits before submission;
- warn users not to include faces, addresses, documents, or unrelated personal
  information, and suggest a close photograph of the component or label;
- keep the selected image and preview only in memory or a revocable object URL;
- revoke the object URL on replacement, submission completion, new chat,
  component unmount, navigation, and error;
- never store image bytes or thumbnails in `localStorage`, `sessionStorage`,
  IndexedDB, Cache Storage, service workers, analytics, crash reports, or the
  conversation envelope.

Client-side checks improve feedback but do not authorize the server to skip any
validation. Browser-side resize is optional and its output remains untrusted.

## Request admission and streaming

The image route accepts a same-origin authenticated `multipart/form-data` POST
with exactly one expected image field. Visitor token, Origin, Fetch Metadata,
CSRF, short-window throttle, and content-type boundary checks run before body
processing.

The multipart parser must stream with a hard byte counter. It rejects:

- a declared `Content-Length` above the total request ceiling;
- a chunked body as soon as the streaming ceiling is crossed;
- duplicate image fields, unexpected file fields, or more than one file;
- overlong field names, filenames, headers, boundaries, or excessive field
  counts;
- truncated bodies and parser ambiguity.

The original client filename is ignored for storage and logging. The server
uses a cryptographically random request-local identifier. Admission to the paid
provider path occurs only after normalization and the atomic worst-case image
cost reservation from ADR-0002.

## Validation and normalization pipeline

Every stage has a bounded timeout and releases its input on failure:

1. **Signature inspection:** identify JPEG, PNG, or WebP from magic bytes and
   container structure; never trust extension or declared MIME type.
2. **Malware scan:** scan the complete bounded upload with the configured
   scanner. Scanner unavailability, timeout, or indeterminate output fails the
   image route closed.
3. **Header probe:** read dimensions, frame count, animation flags, color model,
   and orientation with resource limits. Reject unsupported, animated, extreme,
   or inconsistent containers before full decode.
4. **Strict isolated decode:** decode in a separate constrained worker process
   with CPU, wall-clock, memory, pixel, and concurrency limits. Reject malformed,
   truncated, polyglot, trailing-payload, or decompression-bomb candidates.
5. **Orientation:** apply the EXIF orientation to pixels; reject contradictory or
   invalid orientation data.
6. **Pixel normalization:** convert to sRGB, remove alpha by compositing on a
   neutral white background, preserve aspect ratio, never upscale, and reduce
   the longest edge to at most 2,048 px.
7. **Metadata-free encode:** encode a new JPEG at the reviewed quality setting
   without EXIF, GPS, XMP, IPTC, ICC payloads, comments, thumbnails, filenames,
   application markers, or original container bytes.
8. **Output verification:** re-open the normalized JPEG with an independent
   probe, enforce the normalized-byte and dimension limits, and prove the
   forbidden metadata fields are absent.
9. **Original disposal:** release and, when applicable, unlink the original from
   its exact verified temporary path before beginning the provider request.

Re-encoding is mandatory. Passing through an apparently valid original is
prohibited. The normalized JPEG is a new derivative and is the only image sent
to moderation or the main model.

The decoder/scanner dependencies must be pinned, represented in the software
bill of materials, scanned for known vulnerabilities, and updated through a
tested dependency process. A decoder crash, native-library error, out-of-memory
signal, or worker protocol violation returns a generic image-processing error
and never falls back to the original bytes.

## Temporary storage

Memory-only processing is preferred under the 8 MiB ingress limit. If the
decoder, scanner, platform, or SDK requires temporary files, all of the following
apply:

- use a dedicated ephemeral directory outside the application and public web
  roots;
- create the directory with owner-only access and each file with mode `0600`,
  exclusive creation, no symlink following, and a random generated name;
- mount with the strictest supported `noexec`, `nosuid`, and `nodev` controls and
  an explicit storage quota;
- exclude the directory from backups, snapshots, indexing, antivirus quarantine
  retention, and general log collection;
- never use the original filename or expose a local path in an error;
- delete artifacts in a `finally` path after success, rejection, timeout,
  disconnect, cancellation, decoder failure, provider failure, and response
  validation failure.

A startup and periodic janitor removes abandoned request directories older than
15 minutes. The maximum image request lifetime must remain below that ceiling so
the janitor cannot race a valid live request. Cleanup uses exact generated paths
under the validated image-temp root and must not follow links.

Deletion means unlinking the application artifact and releasing all in-process
references. The product must not promise physical erasure from storage media;
the privacy notice describes the actual ephemeral-storage and provider behavior.

## OpenAI transfer

The normal provider request contains the verified normalized JPEG as a Base64
data URL in one `input_image` item with `detail: high`. It must:

- use the same foreground Responses API request as the user's text;
- set `store: false` and omit `conversation` and `previous_response_id`;
- omit `message.input_image.image_url` from `include`;
- carry the required pseudonymous `safety_identifier`;
- use the configured output-token, tool, timeout, and monetary reservation
  limits;
- send no EXIF, client filename, local path, raw upload, or original MIME claim.

Base64 is transport encoding, not encryption or anonymization. The privacy
notice must state that the normalized visible pixels are sent to OpenAI for the
requested analysis and may still contain personal information visible in the
photograph.

## Exceptional provider File path

Provider File creation is disabled by default. It may be enabled only when a
documented SDK or request-size constraint makes inline input impossible and all
of these controls are implemented:

1. upload only the normalized JPEG using the currently documented compatible
   purpose and shortest supported `expires_after`;
2. use a random content-free managed filename and never the client filename;
3. record the provider file ID, random request correlation ID, creation time,
   deletion deadline, and attempt count in a dedicated content-free cleanup
   ledger;
4. issue explicit File deletion in the request `finally` path regardless of
   model success;
5. confirm the provider's `deleted: true` response before marking cleanup
   complete;
6. reconcile provider file listings at startup and periodically, deleting
   managed-prefix files not attached to an active in-flight request;
7. stop admitting new File-path image requests and alert when any object remains
   unconfirmed for more than 15 minutes;
8. retain the cleanup receipt for at most 24 hours after confirmed deletion,
   then remove it.

If upload may have succeeded but the response containing the file ID was lost,
the reconciler uses the random managed filename prefix and creation window to
find and delete the orphan. The provider expiry is defense in depth, not a
replacement for explicit deletion.

OpenAI documents a Files delete endpoint and notes that uploaded files outside
special default-expiry cases persist until manually deleted. Provider behavior
must be rechecked before enabling this exceptional path.

## Safety and diagnostic limitations

Image analysis assists identification; it does not establish installation
safety or exact compatibility by itself.

- Safety intake answers and deterministic hazard rules remain authoritative.
- The image cannot lower an existing urgency floor.
- If text, image, history, or retrieved evidence materially disagree, `HZ-013`
  raises the response to caution and blocks procedural steps.
- A visually similar component is not exact model evidence. Compatibility still
  follows PA-SOURCE-001 and requires a matching approved source.
- Unreadable, occluded, distant, or ambiguous images produce a focused request
  for a safer/closer image or label text, not an invented identification.
- Visible or OCR-extracted text is untrusted evidence and never an instruction
  to the model or application. Full enforcement is completed by `AUD-P1-008`.
- Supported-image moderation is an independent content-abuse layer and does not
  replace plumbing urgency classification.

## Retention and observability

| Data | Location | Maximum application retention |
| --- | --- | ---: |
| Browser selection and preview | Browser memory/object URL | Until replacement, completion, navigation, or new chat |
| Original upload buffer | Server memory or ephemeral temp | Until normalization or rejection; never beyond request cleanup |
| Normalized JPEG | Server memory or ephemeral temp | Until provider completion/failure; never beyond request cleanup |
| Provider inline request content | OpenAI | Provider policy; disclosed and rechecked before release |
| Exceptional provider File | OpenAI | Explicit immediate deletion; 15-minute incident threshold; provider expiry as backstop |
| Provider cleanup receipt | Cleanup ledger | 24 hours after confirmed deletion |
| Textual image observation | Conversation envelope | ADR-0001 conversation lifetime |
| Content-free aggregate metrics | Metrics store | ADR-0001 aggregate retention |

Application, edge, proxy, tracing, APM, analytics, and error systems must not
record multipart bodies, Base64, thumbnails, pixels, client filenames, EXIF,
provider request bodies, local paths, or provider file IDs outside the temporary
cleanup ledger.

Permitted bounded categories include validation outcome, normalized format,
size/pixel buckets, processing stage, cleanup status, provider-path type,
latency, and categorical error code. Metrics labels must remain low-cardinality.
Do not persist an image hash because it can become a cross-request correlation
identifier.

## Failure behavior

An image-processing failure rejects the image before the main provider call and
returns a localized, non-technical message. It must not silently drop the image
and answer as though it had been inspected.

Scanner/decoder health, temp-storage health, cleanup backlog, provider-file
reconciliation, configuration, and model capability checks are image-route
readiness gates. Text-only chat may remain available when the image route is
disabled, provided the UI clearly reports that the image was not processed.

If a provider call may have incurred cost, ADR-0002 reconciliation remains
conservative. Cleanup failure opens the image-route circuit breaker but does not
erase accounting or cleanup evidence.

## Privacy and user notice

Bulgarian and English notices must explain:

- which image formats and limits are accepted;
- that metadata is removed but visible pixels may contain personal information;
- that a normalized derivative is sent to OpenAI for analysis;
- application temporary-storage and provider retention distinctions;
- that the image is not reused for advertising, profiling, or the curated
  knowledge base;
- how to report an unintended disclosure or request applicable assistance.

The UI must not claim that metadata stripping anonymizes the image or that
`store: false` eliminates all provider processing or abuse-monitoring retention.

## Verification required before closing AUD-P1-007

1. Boundary tests cover exact byte, dimension, pixel, aspect-ratio, count,
   multipart-header, and streaming limits.
2. Format tests cover fake MIME/extension, truncated JPEG, corrupt PNG/WebP,
   animated WebP, unsupported formats, polyglots, trailing payloads, and
   decompression bombs.
3. Scanner and decoder tests cover unavailable, timeout, crash, memory limit,
   malformed output, and known safe/malicious fixtures without fallback.
4. Metadata tests use EXIF GPS, orientation, XMP, IPTC, ICC, comment, thumbnail,
   alpha, and filename fixtures and prove only oriented normalized pixels remain.
5. SDK-boundary tests prove inline normalized JPEG use, `detail: high`,
   `store: false`, no image include echo, no provider File on the normal path,
   and no original bytes or metadata.
6. Cleanup tests cover success, validation rejection, client disconnect,
   cancellation, timeout, provider error, invalid model output, decoder crash,
   process termination, restart, and janitor execution.
7. Exceptional File-path tests cover expiry, explicit confirmed deletion, lost
   upload response, orphan reconciliation, backlog circuit breaker, and cleanup
   receipt expiry.
8. Capture tests inspect application/proxy logs, traces, metrics, usage storage,
   backups, browser stores, and conversation envelopes and find no image data or
   forbidden identifiers.
9. Load tests prove decoder worker, memory, temp-space, concurrency, timeout, and
   monetary limits under simultaneous uploads.
10. Reviewed Bulgarian and English notices and UI errors match deployed behavior.
11. Bilingual evaluation includes clear, unreadable, misleading, conflicting,
    safety-critical, label-detail, and exact-compatibility image cases.

## Official OpenAI references

Provider capabilities and limits can change and must be rechecked during
implementation:

- [Images and vision](https://developers.openai.com/api/docs/guides/images-vision)
- [Responses API](https://developers.openai.com/api/reference/cli/resources/responses/methods/create)
- [Files API](https://developers.openai.com/api/reference/cli/resources/files)
