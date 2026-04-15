feat(frontend): implement Classrooms list page & fix sidebar layout glitches

- Created independent /classrooms Next.js generic route under Dashboard layout, applying the mapped global theme design system.
- Replaced raw static UI cards into reusable React iterations with local mock states.
- Fixed major Sidebar element layout shifting during selection changes by filling inactive elements with border-transparent to stabilize boundary dimensions.
- Enforced `type="button"` globally on all React `<button>` items to prevent unintended behavior / page reloads triggering DOM layout resets.
