# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-04-21

### Added
- SSE transport support via express server (Version 1.1.0 equivalent).

### Changed
- Migrated from `SSEServerTransport` to `StreamableHTTPServerTransport`.
- Modularized tool registration and updated SSE transport to support multiple concurrent sessions.
- Consolidated docker build and push operations into a single multi-tag buildx command for linux/amd64.
- Removed requirement to ask for valid prescriptions in system prompt.

### Removed
- Pagination parameters from the product search tool.

[1.2.0]: https://github.com/shawon1fb/Mr-Dokan-MCP/compare/abd2f5a...f814ea5
