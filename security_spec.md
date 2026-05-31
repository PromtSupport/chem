# Security Spec

1. Data Invariants:
- All users (anonymous) can read catalog and reference topics.
- Users can write to results.
- Teachers can update catalog and reference items. Because we lack verified teachers right now, we will allow any signed-in user to create/update if payload matches schema exactly.

2. "Dirty Dozen" Payloads
- TBD

3. Test Runner
- TBD
