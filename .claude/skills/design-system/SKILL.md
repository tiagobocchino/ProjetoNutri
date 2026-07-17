---
name: design-system
description: Design system do ProjetoNutri — paleta (verde floresta + creme + dourado), tipografia (Playfair/Inter/IBM Plex Mono), tokens Tailwind v4, utilitários e kit de efeitos portado do BocchinoTecConsult (Silk, SpotlightCard, Magnet, DecryptedText, glass, glare, noise). Use ao criar qualquer UI.
---

# Design System — ProjetoNutri

Base visual: **NutrimaxLP** (Soft Forest & Warm Cream). Efeitos: **BocchinoTecConsult**. Tudo definido em `src/app/globals.css` via Tailwind v4 `@theme`.

## Paleta (tokens já disponíveis como `var(--color-*)`)
| Token | Valor | Uso |
|---|---|---|
| `--color-primary` | `hsl(158 42% 28%)` #2A6350 | verde floresta, marca |
| `--color-primary-dark` | `hsl(160 50% 18%)` | hero, hover |
| `--color-primary-light` | `hsl(155 28% 40%)` | gradientes |
| `--color-accent` | `hsl(36 62% 52%)` #D5972F | dourado, CTAs/destaques |
| `--color-background` | `hsl(45 30% 97%)` #FAF8F1 | fundo creme |
| `--color-foreground` | `hsl(160 35% 12%)` | texto |
| `--color-secondary` | `hsl(150 18% 93%)` | sage claro |
| `--color-muted-foreground` | `hsl(155 12% 48%)` | texto secundário |
| `--color-border` | `hsl(150 14% 88%)` | bordas |
| `--color-success/warning/destructive` | — | estados |

## Tipografia (next/font, já no layout root)
- **Playfair Display** → `--font-display` (títulos h1–h6, `letter-spacing -0.025em`).
- **Inter** → `--font-sans` (corpo).
- **IBM Plex Mono** → `--font-mono` (dados, tabelas clínicas, números — usar `.data-number` com `tabular-nums`).

## Forma e sombra
- Radius base `1rem` (`rounded-2xl` nos cards). Tokens `--radius-sm/md/lg/xl`.
- Sombras esverdeadas: `--shadow-card`, `--shadow-hover` (usadas por `.card-surface`).

## Utilitários prontos (globals.css)
- `.container-max`, `.section-padding` — layout.
- `.section-label` — rótulo mono com traço dourado.
- `.card-surface` — card branco com sombra + lift no hover.
- `.text-gradient-green`, `.bg-hero-pattern` — gradientes de marca.
- `.glass-panel` — glassmorphism (blur 20px).
- `.btn-relay` — botão com glare que segue o cursor (setar `--mx/--my` no onMouseMove).
- `.noise-overlay` — textura de ruído sutil (4%).
- `.data-number` — números tabulares em mono.

## Kit de efeitos (portar do BocchinoTecConsult → `src/components/effects/`)
Referência (somente leitura): `C:\Users\Tiago\Desktop\BocchinoTecConsult\src\components\ui\`
- `Silk.tsx` — fundo shader WebGL (@react-three/fiber). Lazy-load, opacity baixa.
- `SpotlightCard.tsx` — glow radial seguindo o cursor.
- `Magnet.tsx` — hover magnético (translate em direção ao cursor). Envolver CTA do hero.
- `DecryptedText.tsx` — revelação "decrypt" de texto (IntersectionObserver + Framer Motion).

## Regras de uso
- **Efeitos pesados (Silk, Magnet, Decrypt) só na landing e momentos-chave.** Dashboard e portal priorizam densidade e legibilidade — nada de shader no CRUD.
- Nunca cor crua: sempre `var(--color-*)`.
- Framer Motion `whileInView` + `viewport={{ once: true }}` para scroll-reveal; easing `--ease-out-expo`.
- Mobile-first (375px) e contraste AA.
