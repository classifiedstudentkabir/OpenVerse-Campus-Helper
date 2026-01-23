# Functional Requirements

1. Purpose of This Document

This Functional Requirements Document (FRD) defines what the system must do from a functional perspective.

It serves to:

Freeze core functionality

Prevent scope creep

Ensure UI/UX changes do not alter behavior

Act as a reference in absence of a specific client

⚠️ Design and UI may change, but functionality defined here must not change without version updates.

2. System Overview

The Certificate Generator is a web-based SaaS application that allows users to:

Select or create certificate templates

Edit certificates using a visual editor

Generate certificates individually or in bulk

Export certificates as PDF

Track batch generation history

View usage and analytics (admin)

3. User Roles
3.1 End User

Can create, edit, and generate certificates

Can upload CSV/XLSX for bulk generation

Can download generated certificates

3.2 Admin

Can view system analytics

Can view batch statistics

Can monitor certificate generation activity

4. Functional Requirements (Module-wise)
4.1 Templates Gallery (Home)

FR-1: The system shall display a gallery of certificate templates.
FR-2: Templates shall be displayed as preview thumbnails.
FR-3: Users shall be able to select a template to start editing.
FR-4: The system shall allow filtering templates by category or type.
FR-5: The system shall allow creation of a new blank certificate.

Constraints:

Templates are certificate-only.

No other design formats are supported.

4.2 Certificate Design Editor

FR-6: The system shall provide a visual editor for certificate design.
FR-7: Users shall be able to add and edit text elements.
FR-8: Users shall be able to customize text properties (font, size, color, alignment).
FR-9: Users shall be able to add graphical elements (shapes, images, icons).
FR-10: Users shall be able to upload images (logos, signatures).
FR-11: The system shall support placeholder variables (e.g., {{Recipient_Name}}).
FR-12: The system shall allow users to reposition, resize, and layer elements.
FR-13: The system shall provide zoom controls.
FR-14: The system shall allow previewing the final certificate layout.

Constraints:

Editor functionality is fixed.

UI/UX improvements must not alter editing behavior.

4.3 Bulk Certificate Generator

FR-15: The system shall allow users to upload CSV or XLSX files.
FR-16: The system shall allow mapping of spreadsheet columns to certificate placeholders.
FR-17: The system shall validate uploaded files before processing.
FR-18: The system shall generate certificates for each valid row in the file.
FR-19: The system shall notify users of validation errors.
FR-20: The system shall allow re-uploading corrected files.

Constraints:

Bulk generation logic must remain unchanged.

UI changes must not affect data mapping logic.

4.4 Batch Generation History

FR-21: The system shall store batch generation records.
FR-22: The system shall display batch status (completed, failed, in progress).
FR-23: Users shall be able to view batch details.
FR-24: Users shall be able to download generated certificates from history.

4.5 Certificate Export

FR-25: The system shall export certificates in PDF format.
FR-26: Exported PDFs shall maintain layout consistency with the editor preview.
FR-27: Bulk-generated certificates shall be downloadable individually or as a set.

4.6 Admin Analytics Dashboard

FR-28: The system shall display total certificates generated.
FR-29: The system shall display batch statistics.
FR-30: The system shall display usage trends over time.

Constraints:

Admin panel is view-only.

No administrative data manipulation at this stage.

5. Non-Functional Constraints (Referenced)

UI/UX rules are governed by /docs/ui-ux-requirements.md

Performance, scalability, and security are addressed in later phases

Certificate-only scope must be maintained

6. Assumptions

Users have basic familiarity with web-based tools

Uploaded CSV/XLSX files follow basic formatting rules

Internet connectivity is required

7. Out of Scope

Social media designs

Posters or flyers

Advanced user roles and permissions

Template marketplace

Third-party integrations (for now)

8. Change Control

Any change to these functional requirements must:

Be documented

Be versioned

Be aligned with the product roadmap

9. Approval & Sign-Off

Since no external client exists, this document acts as:

Internal approval

Product owner reference

Development boundary