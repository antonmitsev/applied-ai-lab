# Security policy

## Sensitive data

The following must never be committed:

- OpenAI or deployment credentials;
- private administrative signing keys;
- raw IP addresses or browser fingerprints;
- user questions, answers, images, or uploads;
- runtime usage stores and application logs;
- third-party documents without confirmed redistribution rights.

Use `.env.example` only for variable names and non-secret placeholders. Runtime
secrets belong in the deployment platform's secret store.

## Reporting a vulnerability

Do not disclose a vulnerability, credential, or personal information in a
public issue. Contact the repository owner privately through the contact method
published on their GitHub profile.

## Before publishing a change

1. Run automated tests and static checks.
2. Review the staged diff for secrets and personal data.
3. Keep GitHub secret scanning and push protection enabled.
4. Revoke and rotate any secret that may have entered Git history.
