# Pronto.IA — Persona Prompts

Versioned system prompts for the Pronto.IA AI personas.

## Personas

| Persona | Role | Vertical | File |
|---------|------|----------|------|
| Maria | Host / Onboarding | All | `maria.md` |
| Bia | Specialist | Salão de Beleza & Estética | `bia.md` |
| Léo | Specialist | Food Service Local | `leo.md` |
| Tião | Specialist | Prestadores de Serviço | `tiao.md` |
| Evaluator | Exercise Grader | All | `evaluator.md` |

## Versioning

Each prompt file includes a version header. When updating a prompt:
1. Increment the version in the header
2. Add a changelog entry at the bottom
3. The system loads the latest version automatically

## Loading

The `@pronto-ia/llm` package reads prompts from this directory at runtime.
Prompts are loaded by persona slug and injected as the `system` message in
Anthropic Claude API calls.
