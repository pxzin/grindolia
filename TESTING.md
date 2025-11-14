# Testing Guide

Este guia explica como testar os diferentes aspectos do projeto Grindolia.

## Design System

O Design System pode ser visualizado através de uma página dedicada no próprio SvelteKit.

### Visualizar componentes

```bash
pnpm dev
```

Acesse `http://localhost:5173/design-system` no navegador.

A página mostra:
- **Button**: Todas as variantes (primary, secondary, danger, ghost) e tamanhos (sm, md, lg)
- **Card**: Variantes (default, elevated, outlined) e exemplos de uso
- **Input**: Tipos diferentes (text, email, password) e estados (normal, error, disabled)
- **Paleta de Cores**: Todos os tons de cores disponíveis (primary, gray, green, red, etc)
- **Tipografia**: Hierarquia de texto e classes utilitárias

Cada seção inclui:
- Demonstração visual dos componentes
- Exemplos de código para uso
- Casos de uso reais (character cards, login forms, etc)

## Testes Unitários (Vitest)

Vitest é usado para testes unitários de funções, stores e lógica de negócio.

### Executar testes

```bash
pnpm test
```

### Executar testes em modo watch

```bash
pnpm test:watch
```

### Executar testes com UI

```bash
pnpm test:ui
```

### Exemplo de teste

```typescript
// src/lib/utils/example.test.ts
import { describe, it, expect } from 'vitest';
import { calculateCombatPower } from '$lib/types/character';

describe('calculateCombatPower', () => {
  it('should calculate combat power correctly', () => {
    const stats = {
      strength: 10,
      intelligence: 5,
      dexterity: 8,
      vitality: 12
    };

    const power = calculateCombatPower(stats);
    expect(power).toBe(35);
  });
});
```

## Testes E2E (Playwright)

Playwright é usado para testes end-to-end que simulam interações reais do usuário.

### Executar testes E2E

```bash
pnpm test:e2e
```

### Executar testes em modo UI

```bash
pnpm test:e2e:ui
```

### Exemplo de teste E2E

```typescript
// tests/auth.spec.ts
import { test, expect } from '@playwright/test';

test('user can register and login', async ({ page }) => {
  await page.goto('/');

  // Register
  await page.click('text=Register');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="username"]', 'testuser');
  await page.fill('[name="password"]', 'SecurePass123');
  await page.click('button:has-text("Create Account")');

  // Should redirect to character creation
  await expect(page).toHaveURL('/character/create');
});
```

## Estrutura de Testes

```
tests/
├── unit/              # Testes unitários (Vitest)
│   ├── utils/         # Testes de utilitários
│   ├── stores/        # Testes de stores
│   └── types/         # Testes de funções de tipos
├── integration/       # Testes de integração (Vitest)
│   ├── api/           # Testes de API
│   └── database/      # Testes de repositórios
└── e2e/              # Testes end-to-end (Playwright)
    ├── auth.spec.ts
    ├── character.spec.ts
    └── gameplay.spec.ts
```

## Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `pnpm dev` | Inicia servidor de desenvolvimento (inclui /design-system) |
| `pnpm test` | Executa testes unitários (Vitest) |
| `pnpm test:watch` | Testes unitários em modo watch |
| `pnpm test:ui` | Testes unitários com interface gráfica |
| `pnpm test:coverage` | Gera relatório de cobertura |
| `pnpm test:e2e` | Executa testes E2E (Playwright) |
| `pnpm test:e2e:ui` | Testes E2E com interface gráfica |

## Cobertura de Testes

Para gerar relatório de cobertura:

```bash
pnpm test -- --coverage
```

O relatório será gerado em `coverage/index.html`.

## Boas Práticas

### Design System
- Mantenha a página /design-system atualizada com novos componentes
- Documente todas as props e variantes
- Inclua exemplos de código para cada componente
- Mostre casos de uso reais

### Testes Unitários
- Teste uma coisa por vez
- Use nomes descritivos para os testes
- Organize com `describe` e `it`
- Teste casos de sucesso e falha
- Mock dependências externas

### Testes E2E
- Teste fluxos completos do usuário
- Use seletores estáveis (data-testid)
- Evite timeouts arbitrários
- Teste em diferentes viewports quando necessário

## CI/CD

Os testes rodam automaticamente no CI em pull requests:

1. Lint (ESLint + Prettier)
2. Type checking (TypeScript)
3. Unit tests (Vitest)
4. E2E tests (Playwright)
5. Build verification

## Debugging

### Vitest
```bash
# Com breakpoints
pnpm test --inspect-brk
```

### Playwright
```bash
# Com headed browser
pnpm test:e2e --headed

# Com debug mode
pnpm test:e2e --debug
```

## Recursos Adicionais

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [SvelteKit Documentation](https://kit.svelte.dev/)
- [Testing Library](https://testing-library.com/)
