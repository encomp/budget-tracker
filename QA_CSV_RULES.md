# QA Manual Verification — CSV Import & Rules Manager

**Feature branch merged:** `claude/strange-sanderson-4fdae7`  
**Date:** 2026-05-02  
**Scope:** CSV compatibility fixes (Pre-work), Pre-import rule saving (Phase 1), Import Rules Manager (Phase 2)  
**Tester:** _______________  
**Build / commit:** _______________

---

## How to use this document

Each test case follows this format:

| Field | Description |
|---|---|
| **ID** | Unique identifier — reference this in bug reports |
| **Priority** | P1 = must pass before ship · P2 = important · P3 = nice to have |
| **Preconditions** | State the app must be in before starting |
| **Steps** | Numbered, one action per step |
| **Expected result** | Exactly what you should see |
| **Pass / Fail** | Mark after testing |
| **Notes** | Bug link, screenshot path, or observations |

Mark each test **PASS ✅** or **FAIL ❌**. If FAIL, open a GitHub issue and record the link in Notes.

---

## Suite 1 — CSV Bank Detection & Amount Parsing

### TC-01 · AMEX 3-column detected correctly

**Priority:** P1  
**Preconditions:** App is open, onboarding is complete, no CSV has been uploaded yet.

**Steps:**
1. Click **Import** in the left sidebar.
2. Prepare a CSV file with exactly these three headers and at least two data rows:
   ```
   Date,Description,Amount
   01/15/2024,ANTHROPIC SAN FRANCISCO CA,24.00
   01/12/2024,ONLINE PAYMENT FROM CHK 1125,-150.00
   ```
3. Drag the file onto the upload drop zone, or click **click to browse** and select it.
4. Observe the banner that appears above the preview table.
5. Look at the Amount column for the first row (ANTHROPIC).
6. Look at the Amount column for the second row (ONLINE PAYMENT).

**Expected result:**
- A teal banner reads **"American Express detected. Mapping applied automatically."**
- The stepper jumps directly to **Step 3 · Review** (skipping the Map stage).
- ANTHROPIC row shows **-$24.00** in red (expense).
- ONLINE PAYMENT row shows **+$150.00** in green (income).

**Pass / Fail:** ___  
**Notes:** _______________

---

### TC-02 · AMEX 5-column detected correctly

**Priority:** P1  
**Preconditions:** App is open, onboarding complete.

**Steps:**
1. Click **Import** in the sidebar.
2. Prepare a CSV file with exactly these five headers:
   ```
   Date,Description,Card Member,Account #,Amount
   01/15/2024,ANTHROPIC SAN FRANCISCO CA,EDGAR MARTINEZ,12345,24.00
   01/12/2024,ONLINE PAYMENT FROM CHK 1125,EDGAR MARTINEZ,12345,-150.00
   ```
3. Upload the file.
4. Observe the bank detection banner and the review table.

**Expected result:**
- Banner reads **"American Express detected. Mapping applied automatically."**
- Skips to Step 3 · Review.
- ANTHROPIC row → **-$24.00** red (expense).
- ONLINE PAYMENT row → **+$150.00** green (income).

**Pass / Fail:** ___  
**Notes:** _______________

---

### TC-03 · Alliant-style CSV falls to manual mapping (not falsely detected as AMEX)

**Priority:** P1  
**Preconditions:** App is open, onboarding complete.

**Steps:**
1. Click **Import** in the sidebar.
2. Prepare a CSV with these four headers (same three as AMEX, plus Balance):
   ```
   Date,Description,Amount,Balance
   01/15/2024,WHOLEFDS MKT #10111,($52.34),3247.66
   01/13/2024,PAYROLL DIRECT DEPOSIT,$3500.00,3315.49
   ```
3. Upload the file.
4. Observe which stage the app navigates to.

**Expected result:**
- **No** bank detection banner appears.
- The app navigates to **Step 2 · Map Columns** (manual mapping stage).
- The three required fields (Date, Amount, Description) appear as dropdowns for the user to configure.

**Pass / Fail:** ___  
**Notes:** _______________

---

### TC-04 · Citi dual-column: purchases are expenses, payments are income

**Priority:** P1  
**Preconditions:** App is open, onboarding complete.

**Steps:**
1. Click **Import** in the sidebar.
2. Prepare a Citi CSV:
   ```
   Date,Description,Debit,Credit
   01/15/2024,WHOLEFDS MKT #10111,52.34,
   01/13/2024,ONLINE PAYMENT - THANK YOU,,150.00
   ```
3. Upload the file.
4. Observe the Type for each row in the review table.

**Expected result:**
- Banner reads **"Citi detected."**
- WHOLEFDS row (has a Debit value) → **-$52.34** red (expense).
- ONLINE PAYMENT row (has a Credit value, no Debit) → **+$150.00** green (income).

**Pass / Fail:** ___  
**Notes:** _______________

---

### TC-05 · Parenthetical amount notation parsed correctly

**Priority:** P1  
**Preconditions:** App is open, onboarding complete. Have a CSV with parenthetical amounts ready (e.g. Alliant-style).

**Steps:**
1. Click **Import** in the sidebar.
2. Upload a CSV where the Amount column uses parenthetical notation:
   ```
   Date,Description,Amount,Balance
   01/15/2024,WHOLEFDS MKT #10111,($52.34),3247.66
   01/13/2024,PAYROLL DIRECT DEPOSIT,$3500.00,3315.49
   ```
3. On Step 2 · Map Columns, confirm Date, Amount, and Description are correctly mapped, then click **Confirm Mapping**.
4. Observe the Amount column in the review table.

**Expected result:**
- `($52.34)` → displays as **-$52.34** (expense, red).
- `$3,500.00` → displays as **+$3,500.00** (income, green).
- No row shows $0.00 or a wrong sign.

**Pass / Fail:** ___  
**Notes:** _______________

---

## Suite 2 — Assign Category Dropdown

### TC-06 · Dropdown is populated even when active month has no budget

**Priority:** P1  
**Preconditions:** Onboarding is complete. At least one budget month exists (e.g. the current month).

**Steps:**
1. Click **Budget** in the sidebar.
2. Click the **›** (right arrow) next to the month name to advance to a future month that has no budget yet. Confirm categories are not shown for this month.
3. Click **Import** in the sidebar.
4. Upload any valid CSV and proceed to Step 3 · Review.
5. Find any uncategorized row and click its **Assign…** dropdown.
6. Observe the list of options.

**Expected result:**
- The dropdown opens and displays the full list of categories from the most recent budget — it is **not empty**.
- All standard categories (Housing, Groceries, Dining Out, etc.) are visible.

**Pass / Fail:** ___  
**Notes:** _______________

---

### TC-07 · Newly added category immediately appears in the Import dropdown

**Priority:** P1  
**Preconditions:** Onboarding is complete, you are on the current month in Budget view.

**Steps:**
1. Click **Budget** in the sidebar.
2. Under the **Needs** column, click **+ Add Category**.
3. Click the new "New Category" label that appears and rename it to **Small Business**, then press **Enter** or click away to save.
4. Click **Import** in the sidebar.
5. Upload any valid CSV and proceed to Step 3 · Review.
6. Click the **Assign…** dropdown on any row.
7. Scroll through the options list.

**Expected result:**
- **Small Business** appears in the dropdown list.
- Selecting it applies it to the row immediately.

**Pass / Fail:** ___  
**Notes:** _______________

---

## Suite 3 — Save-as-Rule Toggle

### TC-08 · Toggle only appears after a category is manually assigned

**Priority:** P1  
**Preconditions:** Reach Import Step 3 · Review with at least one uncategorized row.

**Steps:**
1. Find an **Uncategorized** row in the review table.
2. Observe the area below the category column for that row.
3. Do **not** assign a category — just observe.
4. Now click the **Assign…** dropdown and select any category.
5. Observe the area below the category selector again.

**Expected result:**
- Before assigning: **no toggle** is visible below the row.
- After assigning: a checkbox line smoothly slides in (with a brief height transition) reading **Save "[keyword]" as a rule**.

**Pass / Fail:** ___  
**Notes:** _______________

---

### TC-09 · Rule key is auto-derived from the transaction description

**Priority:** P1  
**Preconditions:** Reach Import Step 3 · Review.

**Steps:**
1. Assign a category to a row whose description is **"ANTHROPIC SAN FRANCISCO CA"**.
2. Observe the rule key shown in the toggle line.

**Expected result:**
- The toggle reads: **Save "anthropic san" as a rule**
- The key takes the first two meaningful words (longer than 2 characters), lowercased.

**Pass / Fail:** ___  
**Notes:** _______________

---

### TC-10 · Rule key can be edited inline

**Priority:** P1  
**Preconditions:** TC-09 is complete — a row has a category assigned and the toggle is visible.

**Steps:**
1. Click directly on the quoted keyword text (e.g. **"anthropic san"**) in the toggle line.
2. Observe whether the text becomes editable (cursor appears, input border shows).
3. Clear the text and type **anthropic**.
4. Click anywhere outside the input (blur).
5. Observe the toggle label.

**Expected result:**
- Clicking the keyword makes it an editable text input.
- After blurring, the toggle now reads: **Save "anthropic" as a rule**.
- The new key persists — it does not revert.

**Pass / Fail:** ___  
**Notes:** _______________

---

### TC-11 · Unchecking the toggle hides the key field and removes the row from the rule count

**Priority:** P1  
**Preconditions:** Reach Import Review, assign categories to **3 rows** so the summary counter shows "3 rules will be saved".

**Steps:**
1. Confirm the summary counter above the action buttons reads: **"N transactions · 3 rules will be saved"**.
2. Find the toggle on any one of the 3 assigned rows.
3. Uncheck the checkbox.
4. Observe the toggle and the summary counter.

**Expected result:**
- The key text input disappears (hides immediately when unchecked).
- The summary counter updates to **"2 rules will be saved"**.
- The unchecked row is still imported — only the rule is excluded.

**Pass / Fail:** ___  
**Notes:** _______________

---

### TC-12 · Rules are written to the database on Import confirm

**Priority:** P1  
**Preconditions:** Reach Import Review with at least one row that has a category assigned and the toggle checked.

**Steps:**
1. Assign a category to a row with description **"NETFLIX.COM"** — confirm the toggle shows `Save "netflix com" as a rule` and is checked.
2. Click **Import N Transactions**.
3. Wait for the success toast to appear and dismiss.
4. Click **Settings** in the sidebar.
5. Click the **Import Rules** row.
6. Look for the rule keyword in the list.

**Expected result:**
- The Import Rules list contains an entry with keyword **"netflix com"** mapped to the category you assigned.
- The entry appears at the top of the list (most recently created).

**Pass / Fail:** ___  
**Notes:** _______________

---

### TC-13 · Success toast displays the rule count suffix

**Priority:** P2  
**Preconditions:** Reach Import Review. Assign categories to exactly 2 rows with toggles checked.

**Steps:**
1. Confirm the summary counter reads "2 rules will be saved".
2. Click **Import N Transactions**.
3. Observe the toast notification that appears in the bottom-right corner.

**Expected result:**
- Toast reads: **"N transactions imported · 2 rules saved"**
- The "· 2 rules saved" suffix is present and accurate.

**Pass / Fail:** ___  
**Notes:** _______________

---

## Suite 4 — Conflict Detection

### TC-14 · Conflict fires when two rows share a rule key with different categories

**Priority:** P1  
**Preconditions:** Reach Import Review with at least 2 rows whose descriptions would produce the same rule key (or manually set the same key via TC-10).

**Steps:**
1. Assign **Groceries** to a row with description "WHOLEFDS MARKET #1".
2. Assign **Shopping** to a different row — then click its rule key and change it to match the first row's key (e.g. **"wholefds market"**).
3. Observe both rows and the Import button area.

**Expected result:**
- Both conflicting rows show an **amber left border**.
- The Import button is replaced by a conflict warning panel that reads:  
  *"⚠ 1 rule conflict detected: "wholefds market""*  
  *"Two rows map the same keyword to different categories."*
- Three buttons appear: **Review Conflicts**, **Import without saving rules**, **Cancel**.

**Pass / Fail:** ___  
**Notes:** _______________

---

### TC-15 · "Import without saving rules" bypasses conflict and imports cleanly

**Priority:** P1  
**Preconditions:** TC-14 conflict state is active.

**Steps:**
1. With the conflict warning visible, click **Import without saving rules**.
2. Wait for the success toast.
3. Navigate to Settings → Import Rules.

**Expected result:**
- The conflict warning closes and the import proceeds immediately.
- The success toast does **not** include a "rules saved" suffix.
- The Import Rules list does **not** contain the conflicting keyword.
- All transactions are still imported correctly.

**Pass / Fail:** ___  
**Notes:** _______________

---

### TC-16 · "Review Conflicts" scrolls to the conflicting row

**Priority:** P2  
**Preconditions:** TC-14 conflict state is active and the conflicting rows are below the visible scroll area of the table (scroll down to verify they are out of view).

**Steps:**
1. With the conflict warning visible, click **Review Conflicts**.
2. Observe the scroll position of the review table.
3. Observe the visual state of the conflicting rows.

**Expected result:**
- The page scrolls so that the first conflicting row is centered in the viewport.
- That row has a visible **amber left border**.
- The conflict warning panel closes.

**Pass / Fail:** ___  
**Notes:** _______________

---

### TC-17 · Start Over resets all rule state completely

**Priority:** P1  
**Preconditions:** Reach Import Review. Assign categories to multiple rows, edit rule keys, and trigger a conflict (TC-14).

**Steps:**
1. With assignments, edited keys, and a conflict active, click **Start Over**.
2. Observe the app state.
3. Re-upload the same CSV and reach the Review stage again.
4. Observe the rows — check that no previous overrides or keys are pre-filled.

**Expected result:**
- Clicking Start Over returns immediately to **Step 1 · Upload** with an empty drop zone.
- No bank banner is shown.
- After re-uploading, all rows are fresh — no category overrides, no custom rule keys, no conflict warning, no summary counter.

**Pass / Fail:** ___  
**Notes:** _______________

---

## Suite 5 — Import Rules Manager

### TC-18 · "Import Rules" entry appears in Settings

**Priority:** P1  
**Preconditions:** Onboarding is complete.

**Steps:**
1. Click **Settings** in the sidebar.
2. Scan the Settings page for an "Import Rules" item.

**Expected result:**
- A row labelled **Import Rules** is visible, with the subtext "Manage category rules applied automatically during CSV import".
- A **›** chevron appears on the right side of the row.
- Clicking the row navigates to the Import Rules view (not a new browser tab).

**Pass / Fail:** ___  
**Notes:** _______________

---

### TC-19 · Add Rule from empty state works

**Priority:** P1  
**Preconditions:** No import rules exist yet (fresh install or all rules deleted).

**Steps:**
1. Navigate to Settings → Import Rules.
2. Observe the empty state message.
3. Click **+ Add your first rule**.
4. Observe the page content.

**Expected result:**
- Empty state shows: *"No import rules yet"* with the subtext and the "+ Add your first rule" button.
- Clicking the button makes the **inline add form appear** — a Keyword text input, a Category dropdown, and Save / Cancel buttons.
- The empty state message is replaced by the table/form; it does not stay on screen blocking the form.

**Pass / Fail:** ___  
**Notes:** _______________

---

### TC-20 · "Add Rule" button in the header also opens the add form

**Priority:** P1  
**Preconditions:** On the Import Rules page (any state — empty or with existing rules).

**Steps:**
1. Click the **+ Add Rule** button in the top-right corner of the Import Rules view.
2. Observe whether the add form appears.

**Expected result:**
- The inline add form appears at the top of the list (or table) with a focused Keyword input, Category dropdown, and Save / Cancel buttons.

**Pass / Fail:** ___  
**Notes:** _______________

---

### TC-21 · Save is disabled until both keyword and category are filled

**Priority:** P1  
**Preconditions:** Add form is open.

**Steps:**
1. Leave the Keyword field empty and leave the Category on "Select category…".
2. Observe the Save button state.
3. Type a single character (e.g. "a") in the Keyword field.
4. Observe the Save button state.
5. Select a category from the dropdown.
6. Observe the Save button state.

**Expected result:**
- Save is **disabled** (greyed out) when either field is empty.
- Save remains disabled after typing just 1 character with no category.
- Save becomes **enabled** only when both a keyword (≥ 2 characters) and a category are provided.

**Pass / Fail:** ___  
**Notes:** _______________

---

### TC-22 · Duplicate keyword shows an overwrite warning

**Priority:** P1  
**Preconditions:** At least one rule exists with keyword "netflix".

**Steps:**
1. Click **+ Add Rule**.
2. Type **netflix** in the Keyword field.
3. Observe the area below the input.

**Expected result:**
- An inline warning appears in amber text:  
  *"Already maps to [CategoryName]. Saving will overwrite it."*
- The warning names the specific category the existing rule uses.
- Save is still enabled — the user can proceed and overwrite if they choose.

**Pass / Fail:** ___  
**Notes:** _______________

---

### TC-23 · Inline edit saves updated keyword and category

**Priority:** P1  
**Preconditions:** At least one rule exists in the list.

**Steps:**
1. Click **Edit** on any rule row.
2. Observe that the row switches to an editable state (Keyword input replaces the text, Category dropdown replaces the static label).
3. Change the keyword to something new (e.g. append " 2").
4. Change the category to a different one.
5. Click **Save**.
6. Observe the row.

**Expected result:**
- The row updates immediately to show the new keyword and new category.
- No page refresh is required.
- The other rows remain unchanged.

**Pass / Fail:** ___  
**Notes:** _______________

---

### TC-24 · Single delete uses a 3-second confirm state (no modal)

**Priority:** P1  
**Preconditions:** At least one rule exists.

**Steps:**
1. Click **Delete** (or the trash icon) on any rule row.
2. Observe the button immediately after clicking.
3. Do **not** click anything — wait 3 full seconds and observe again.
4. Repeat step 1, then this time click **Confirm?** immediately.

**Expected result:**
- On first click: the button changes to **"Confirm?"** with a **Cancel** option beside it. No modal dialog appears.
- After 3 seconds without confirming: the button reverts back to **"Delete"** on its own.
- When **Confirm?** is clicked promptly: the rule is removed from the list immediately.

**Pass / Fail:** ___  
**Notes:** _______________

---

### TC-25 · Bulk delete with undo within 10 seconds

**Priority:** P1  
**Preconditions:** At least 3 rules exist in the list.

**Steps:**
1. Check the checkbox next to **2 or more** rules.
2. Observe the **Delete N** button that appears near the search bar.
3. Click **Delete N**.
4. Observe the list and the toast notification.
5. Within 10 seconds, click **Undo** in the toast.
6. Observe the list.

**Expected result:**
- After clicking Delete N: the selected rules **disappear immediately** from the list.
- A toast appears: *"Deleted N rules. [Undo]"*
- After clicking Undo: all deleted rules **reappear** in the list.
- A new toast appears: *"Rules restored."*

**Pass / Fail:** ___  
**Notes:** _______________

---

### TC-26 · Navigating away before 10 seconds commits the delete permanently

**Priority:** P1  
**Preconditions:** At least 2 rules exist.

**Steps:**
1. Bulk delete 2 rules (TC-25 steps 1–4).
2. Do **not** click Undo — immediately click **← Settings** (back button) to leave the Import Rules view.
3. Wait a moment, then return to Settings → Import Rules.

**Expected result:**
- The deleted rules are **gone** — they are not restored.
- No Undo option is available after returning.

**Pass / Fail:** ___  
**Notes:** _______________

---

### TC-27 · Search filters the rules list in real time

**Priority:** P1  
**Preconditions:** At least 3 rules exist with different keywords (e.g. "netflix", "amazon", "starbucks").

**Steps:**
1. Click into the **Search rules…** input.
2. Type **net**.
3. Observe the list.
4. Clear the search field.
5. Observe the list again.

**Expected result:**
- While "net" is typed: only rules whose keyword contains "net" are shown (e.g. "netflix"). Other rules disappear.
- After clearing: all rules return immediately.

**Pass / Fail:** ___  
**Notes:** _______________

---

### TC-28 · Empty search state shows a helpful message

**Priority:** P2  
**Preconditions:** Rules exist in the list.

**Steps:**
1. Type a search term that matches none of the existing rule keywords (e.g. "zzzzz").
2. Observe the content area below the search bar.

**Expected result:**
- The list is empty and a message appears: *"No rules matching "zzzzz""* with subtext *"Try a different keyword."*
- The add form and table headers are not shown — only the no-results empty state.

**Pass / Fail:** ___  
**Notes:** _______________

---

### TC-29 · Deleting a budget category cascades and removes its rules

**Priority:** P1  
**Preconditions:** A rule exists that maps a keyword to a category (e.g. keyword "netflix" → "Entertainment").

**Steps:**
1. Navigate to **Settings → Import Rules** and confirm the "netflix" → "Entertainment" rule is present.
2. Navigate to **Budget**.
3. Find the **Entertainment** category under Wants and click the **🗑 Delete** icon.
4. Confirm the deletion in the confirmation dialog.
5. Navigate back to **Settings → Import Rules**.

**Expected result:**
- The rule with keyword "netflix" that pointed to "Entertainment" is **no longer in the list**.
- Rules pointing to other categories are unaffected.

**Pass / Fail:** ___  
**Notes:** _______________

---

## Suite 6 — Responsive Layout

### TC-30 · Desktop layout — table with full text action buttons

**Priority:** P2  
**Preconditions:** At least 2 rules exist. Browser window is at least 900px wide.

**Steps:**
1. Navigate to Settings → Import Rules.
2. Observe the layout of the rules list.
3. Observe the action controls on each row.

**Expected result:**
- Rules are displayed in a **table** with columns: checkbox · KEYWORD · CATEGORY · actions.
- Action buttons show full text labels: **Edit** and **Del** (or **Confirm?** / **Cancel** when in delete-confirm state).
- A "Select all" checkbox is in the table header.

**Pass / Fail:** ___  
**Notes:** _______________

---

### TC-31 · Tablet layout — icon-only action buttons with tooltips

**Priority:** P2  
**Preconditions:** At least 2 rules exist. Resize browser to 600–899px wide (or use DevTools device emulation).

**Steps:**
1. Navigate to Settings → Import Rules.
2. Observe the action controls on each rule row.
3. Hover over the edit icon.
4. Hover over the delete icon.

**Expected result:**
- The table layout is preserved (same columns as desktop).
- Action buttons show **icon only** — pencil icon for Edit, trash icon for Delete.
- Hovering each icon shows a **tooltip** with the action label.

**Pass / Fail:** ___  
**Notes:** _______________

---

### TC-32 · Mobile layout — card list with long-press selection mode

**Priority:** P2  
**Preconditions:** At least 3 rules exist. Resize browser to under 600px wide (or use DevTools mobile emulation, e.g. iPhone 14).

**Steps:**
1. Navigate to Settings → Import Rules.
2. Observe the layout of the rules.
3. Press and hold (long-press, ~0.5 seconds) on any rule card.
4. Observe the card list and any new UI that appears.
5. Tap a second card.
6. Observe the bottom of the screen.

**Expected result:**
- Rules are displayed as **cards** (not a table) — each showing keyword, category, Edit and Delete buttons.
- After long-pressing: all cards show a **checkbox**; the pressed card is pre-checked; selection mode is active.
- Tapping a second card checks it too.
- A **bottom action bar** slides up from the bottom of the screen with a red **"Delete N rules"** button and a **Cancel** button.

**Pass / Fail:** ___  
**Notes:** _______________

---

## Regression Checks

Run these briefly after all suites above to confirm existing features were not broken.

| ID | Check | Pass / Fail |
|---|---|---|
| REG-01 | Chase CSV imported correctly — expenses negative, income positive | ___ |
| REG-02 | Bank of America CSV detected and imported correctly | ___ |
| REG-03 | Previously uncategorized import still navigates to Transactions after confirm | ___ |
| REG-04 | Settings → Profile save still works | ___ |
| REG-05 | Settings → Clear All Data still works (shows confirmation dialog) | ___ |
| REG-06 | Budget → Add / Rename / Delete category still works | ___ |
| REG-07 | Transactions list still loads and displays correctly | ___ |
| REG-08 | Dashboard still loads without errors | ___ |

---

## Bug Report Template

When a test case fails, open a GitHub issue using this template:

```
**TC ID:** TC-XX
**Title:** Short description of what failed
**Environment:** Browser + version, OS, viewport size
**Commit:** (paste commit hash)

**Steps to reproduce:**
1. 
2. 
3. 

**Expected:** (copy from test case)
**Actual:** (what actually happened)

**Screenshot / recording:** (attach)
```

---

*Document generated: 2026-05-02 · BudgetPilot QA*
