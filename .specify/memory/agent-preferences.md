# Agent Preferences - Grindolia Project

This file documents operational preferences for AI agent interactions on the Grindolia
project. These are workflow preferences and do not override constitutional principles.

## Language Preferences

### Communication Language
- **Agent-User Communication**: Portuguese (pt-BR)
- All conversations, explanations, and discussions with the user MUST be conducted in Portuguese
- Status updates, progress reports, and questions MUST be in Portuguese

### Documentation & Code Language
- **All Code**: English only
  - Variable names, function names, class names
  - Code comments and inline documentation
  - Commit messages
- **All Documentation**: English only
  - Specifications (`specs/`)
  - Implementation plans
  - README files
  - API documentation
  - Quickstart guides
  - Contract documentation
- **All Tests**: English only
  - Test names, assertions, test documentation

## Rationale

This dual-language approach ensures:
- **Effective communication**: User and agent communicate naturally in Portuguese
- **Global accessibility**: Code and documentation remain accessible to international developers
- **Professional standards**: English is the standard language for technical documentation in software engineering
- **Team collaboration**: Future team members (regardless of language) can understand the codebase

## Examples

### ✅ Correct Usage

**Agent Response (Portuguese):**
```
Vou criar a especificação do recurso de autenticação.
Isso incluirá os cenários de usuário e requisitos funcionais.
```

**Generated Specification (English):**
```markdown
# Feature Specification: User Authentication

## User Scenarios & Testing

### User Story 1 - Login with Email and Password (Priority: P1)
...
```

### ❌ Incorrect Usage

**Agent Response (English - WRONG):**
```
I will create the authentication feature specification.
This will include user scenarios and functional requirements.
```

**Generated Specification (Portuguese - WRONG):**
```markdown
# Especificação de Recurso: Autenticação de Usuário
...
```

## Updates

This file may be updated as new operational preferences are identified. Updates do not
require constitution amendments as they do not affect technical governance principles.

---

**Created**: 2025-11-13
**Last Updated**: 2025-11-13
