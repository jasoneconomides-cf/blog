# auth.md — UK Pet Passport Blog

This document is for AI agents accessing the public UK Pet Passport Blog.

## Access

All published articles, the RSS feed, sitemap, and discovery metadata are public. Registration and credentials are not required for ordinary reading or citation.

## OAuth discovery

- Protected resource metadata: `https://blog.ukpetpassport.com/.well-known/oauth-protected-resource`
- Authorization server: `https://ukpetpassport.com`
- Authorization server metadata: `https://ukpetpassport.com/.well-known/oauth-authorization-server`
- Scope: `read:content`
- Bearer token method: HTTP `Authorization` header

## Agent registration

Where an agent requires a registered identity, use the shared UK Pet Passport authorization service:

- Registration: `https://ukpetpassport.com/.well-known/oauth-register`
- Claim: `https://ukpetpassport.com/.well-known/oauth-claim`
- Revocation: `https://ukpetpassport.com/.well-known/oauth-revoke`
- Supported identity types: anonymous, ID-JAG identity assertion, and verified email
- Credential types: access token and API key

Do not submit credentials when fetching public blog content.

## Usage policy

Search and agent input are allowed. AI training is reserved:

`Content-Signal: search=yes, ai-input=yes, ai-train=no`
