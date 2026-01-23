---
name: frontend-design
description: Design system and architectural guidelines for building a Canva-style Certificate Generator SaaS. Use this skill when implementing UI components, layouts, editor interactions, or planning frontend architecture for the certificate generator application.
---

# Frontend Design Skill: Certificate Generator SaaS

This skill provides the comprehensive design system and architectural guidelines for building a high-fidelity, Canva-style certificate design tool.

## Core Design Principles

1.  **Editor-Centric UX**: The canvas is the stage. All UI elements (sidebars, toolbars) must serve the canvas without obscuring it.
2.  **Direct Manipulation**: Users should interact directly with elements on the certificate (drag, resize, rotate) rather than relying solely on forms.
3.  **Immediate Feedback**: Every action (hover, click, drag) must have visual feedback. Use distinct cursors for different actions (move vs. resize).
4.  **Premium Aesthetic**: Use a clean, modern interface with subtle shadows, rounded corners, and a constrained color palette to minimize cognitive load.

## Layout Architecture

The application follows a standard "graphic editor" layout:

*   **Top Bar**: Navigation, File Title, Undo/Redo, Zoom Controls, Download/Export/Share primary actions.
*   **Left Sidebar**: Asset Library (Templates, Text, Elements, Uploads, Backgrounds). Tabs should be vertical icons; clicking expands a drawer.
*   **Main Workspace**:
    *   **Canvas Area**: Infinite scrolling/panning background centering the certificate "paper".
    *   **Floating/Contextual Toolbar**: appears above selected elements for quick actions (Color, Delete, Duplicate, Layer Order).
*   **Right Panel (Optional)**: detailed property inspector (Dimensions, detailed typography settings) or Layers panel.

## Component Specifications

### 1. The Canvas
-   **Structure**: HTML5 Canvas or SVG wrapped in a container that handles zooming and panning.
-   **Interaction**: specific event listeners for `mousedown`, `mousemove`, `mouseup` to handle drag-and-drop and resizing handles.
-   **Grid/Guides**: Visual aids that appear during dragging to help alignment.

### 2. Asset Sidebar
-   **Category Tabs**: Vertical icon strip.
-   **Interactive Drawer**: Slide-out panel showing grid of drag-and-drop assets.
-   **Visual Hierarchy**: Thumbnails should be large enough to distinguish details.

### 3. Selection & Transformation
-   **Bounding Box**: A visual border around selected elements with 8 resize handles (corners + edges) and a rotation handle top-center.
-   **Multi-selection**: Shift+Click or drag-marquee to select multiple items.
-   **Snapping**: Elements should snap to grid lines or other elements when moving.

## State Management Patterns

-   **Selection State**: Track `selectedId` or `selectedIds`. The UI updates effectively based on what is selected.
-   **History Stack**: Implement strict `undo` and `redo` stacks for canvas operations.
-   **Dirty State**: visual indicator when unsaved changes exist.

## Typography & Styling System

-   **Font Stack**: Enable loading of Google Fonts dynamically.
-   **Color Palette**:
    -   **Primary Action**: `#7e22ce` (Purple - creative/premium feel) or per user preference.
    -   **Canvas Background**: `#f3f4f6` (Light Gray) to distinguish from the white certificate paper.
    -   **UI Background**: `#ffffff` (White glassmorphism for panels) or dark mode equivalent.
    -   **Text**: `#1f2937` (Gray-900) for readability.

## Implementation Workflow

When creating new features, follow this workflow:
1.  **Define State**: structure the data model for the feature (e.g., "What properties does a 'Shape' need?").
2.  **Create Visual Component**: build the UI representation using semantic HTML and CSS Grid/Flexbox.
3.  **Bind Interactions**: add event listeners for user input.
4.  **Connect Logic**: Refine the state updates to ensure history (undo/redo) captures the change.
