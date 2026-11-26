# Papier — Component Library Expansion & Documentation Website Overhaul

I want to continue improving my design system, **@dionbm/papier**, and significantly upgrade its documentation website.

Package: https://www.npmjs.com/package/@dionbm/papier

## 1. Analyze & Expand the Component Library

Research and compare Papier against established libraries such as shadcn/ui, Mantine, Chakra UI, Radix UI, HeroUI, and other relevant competitors.

- Analyze the current codebase and identify what's already implemented.
- Find missing components, functionality, variants, interactions, and customization options.
- Evaluate accessibility, animations, responsiveness, TypeScript APIs, and developer experience.
- Prioritize valuable additions rather than simply increasing the component count.
- **Actually implement improvements**, including documentation, tests, and exports.
- Don't duplicate anything already implemented during previous improvements.

The goal is to make Papier an increasingly complete, reliable, and competitive design system.

## 2. Completely Upgrade the Documentation Website

The current website displays components in one long vertical list. This works, but doesn't scale well as the library grows.

I want to transform it into a **beautiful, modern, well-organized documentation experience**.

Research excellent documentation websites, including:

- https://ui.shadcn.com/
- https://mantine.dev/
- https://www.radix-ui.com/
- https://www.heroui.com/

Use them as inspiration for functionality, navigation, and presentation, but create something with its own distinct visual identity.

### Navigation & Organization

- Create a proper documentation layout with a categorized sidebar.
- Group components logically (Inputs, Data Display, Navigation, Feedback, Layout, Overlays, etc.).
- Give components dedicated documentation pages or routes.
- Add fast, intuitive search across components and documentation, ideally with a keyboard shortcut.
- Provide clear navigation between related components.
- Ensure navigation works beautifully on mobile.
- Make browsing dozens or even hundreds of components effortless.

### Component Documentation

Each component should have a polished, useful documentation experience featuring:

- Interactive, working component previews.
- Clean code examples with copy-to-clipboard.
- Installation and import instructions.
- Usage examples, variants, sizes, and states.
- Existing API/props tables, presented clearly.
- Accessibility information where relevant.
- Examples of realistic, practical use cases.

**Important:** Reuse the actual Papier components for previews. Documentation should accurately reflect the real library, not mocked implementations.

### Homepage & Discovery

Create an appealing homepage that introduces Papier as a genuine design system rather than simply displaying a component list.

Consider:

- A distinctive hero section showcasing the library.
- An attractive, categorized component explorer.
- Visual component previews or overview cards.
- Quick access to installation, getting started, theming, and popular components.
- Clear navigation between getting started guides and component documentation.

### Design Quality

I want the website to feel like a premium developer tool.

- Strong typography, spacing, hierarchy, and visual consistency.
- Beautiful light and dark modes.
- Subtle, intentional animations and hover interactions.
- Excellent responsive design.
- Thoughtful empty states, loading states, and micro-interactions.
- Fast performance and accessible navigation.
- A distinct visual identity rather than a generic documentation template.

Don't sacrifice usability for visual effects. The website should be enjoyable to explore and genuinely useful for developers.

## 3. Implementation Requirements

- Inspect the existing architecture before making changes.
- Preserve Papier's design philosophy and existing functionality.
- Reuse existing design tokens and components wherever possible.
- Integrate existing documentation and API tables rather than recreating everything.
- Keep documentation maintainable as new components are added.
- Avoid unnecessary dependencies or architectural complexity.
- Update tests and verify builds, routing, responsiveness, and accessibility.
- Avoid breaking changes and don't publish to npm automatically.

## 4. Workflow

1. Audit the current library and documentation website.
2. Identify the most valuable improvements by comparing competitors.
3. Establish a cohesive direction for the documentation website.
4. **Implement the documentation redesign and component improvements.**
5. Verify everything works and summarize what was added or changed.

Don't stop after presenting a plan. Proceed with implementation.

**The ultimate goal:** Papier should feel like a serious, polished, thoughtfully engineered UI library, with a documentation website that is just as impressive as the components themselves.
