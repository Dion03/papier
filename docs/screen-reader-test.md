# Screen reader test

The automated tests (axe, keyboard, Playwright) catch a lot, but not what a screen reader
actually says. I run this pass by hand on [papier.dionbm.nl](https://papier.dionbm.nl)
before every minor release. The docs site uses `englishLabels`, so the expected phrases below
are the English labels; with `dutchLabels` the same steps apply with the Dutch text.

| Combination | Why |
|---|---|
| NVDA + Firefox (Windows) | The most used combination on Windows |
| NVDA + Chrome (Windows) | A different accessibility tree from Firefox |
| VoiceOver + Safari (macOS) | Safari focuses buttons differently, see the focus fix in 0.4.0 |
| VoiceOver + Safari (iOS) | Touch instead of a keyboard |

For each step, note **ok**, or what was announced and what you expected.

## The docs site

- [ ] The heading structure (H in NVDA, the rotor in VoiceOver) follows the page: one h1, sections as h2.
- [ ] Landmarks: banner, "Main" navigation, "Documentation" navigation, main, "On this page", contentinfo, each with its name and none twice without a name.
- [ ] "Skip to content" moves focus to the page heading.
- [ ] Following a link in the sidebar announces the new page heading; the old page is not read again.
- [ ] Ctrl K (⌘K) opens "Search the documentation"; typing announces the number of results; Enter opens the page and focus lands on its heading.
- [ ] The filter on "All components" announces "12 pages" (or the new count) as you type.
- [ ] An old Dutch link such as `#/componenten/button/toegankelijkheid` opens the Button page at "Accessibility".
- [ ] On a phone, "Navigation" opens the menu as a dialog; closing it returns focus to the button.
- [ ] The theme switch reads "Theme, Light, radio button, 1 of 3"; "Reduce motion" reads as a toggle button with its pressed state.

## Per component

| Component | Do | Expect |
|---|---|---|
| Button (loading) | Press "Save" and stay on it | "Saving…, button, unavailable" or "busy"; focus stays on the button |
| IconButton | Tab to an icon button | Only the name, e.g. "Next record, button" |
| CopyButton | Press "Copy share link" | "Copied" is announced once; focus stays |
| Link, external | Tab to an external link | The name plus "(opens in a new tab)" |
| TextField with error | Tab to the email field with an error | Label, "invalid", then the error and the hint |
| TextField prefix/suffix | Tab to "Price in euros" | The label names the unit; the € sign is not read on its own |
| NumberField | Arrow up in "Quantity" | "Spin button" and the new value in the app’s format; "Increase" and "Decrease" are not tab stops |
| PasswordField | Press "Show password" | The toggle reads as pressed; the field is still announced as the same field |
| PinInput | Tab into "Sign-in code" | "Sign-in code, Character 1 of 6"; pasting a code fills every box |
| FileField | Tab to the drop zone | "Drop files here or choose them, button"; an error such as a file too large is announced |
| Select | Open with Alt+Down | The native list; the chosen option is named |
| Combobox | Type "bjork" | "1 result"; Down reads "Vespertine, Björk · 2001"; Enter chooses |
| Combobox, nothing found | Type "xyz" | "No results" |
| MultiCombobox | Choose two artists, then Backspace | Each choice is announced; "… removed" after Backspace; the tags are buttons named "Remove …" |
| Command | Ctrl K on the Command page | Dialog with its name; Down moves through items; the group name is read on entering a group |
| Checkbox, Switch | Space | "checked" or "on" is announced at once |
| CheckboxGroup | Space on "All formats" | Reads "mixed" when some are chosen; then all children change |
| ToggleGroup | Arrows, then Space | One tab stop; each toggle reads its pressed state |
| RadioGroup | Arrows in the group | The group name (legend) on entering; name and description per option |
| SegmentedControl | Arrows on "Period" | "Month, radio button, 2 of 3" |
| Slider | Right arrow on "Volume" | The value with its unit, e.g. "31%" |
| RangeSlider | Tab through "Released" | Two sliders, "Released, from" and "Released, to", each with its value |
| DatePicker | Type 15/3/2024, then open the calendar | The typed date is accepted; the calendar opens on "Friday 15 March 2024" |
| DateRangePicker | Choose a stay in the calendar | Start and end are announced; days in between read as part of the range |
| Tabs | Arrows | "Today, tab, 2 of 4, selected"; Tab moves to the panel |
| Accordion | Enter on a question | "Expanded"; the other question collapses and says so on focus |
| Disclosure | Enter | "Expanded" or "collapsed" |
| Steps | Read the checkout steps | "Step 2 of 4"; finished steps say "completed"; the current step is "current step" |
| Dialog | Open and close with Escape | Title and description on opening; focus back on the opener |
| AlertDialog | Open "Remove from collection" | "Alert dialog" with its title; focus on "Cancel" |
| Sheet | Open "Navigation" | The visually hidden title "Navigation" is still announced |
| Popover | Open "Filters" | A non-modal dialog with its title; Escape and Tab out both close it and return focus |
| Tooltip | Tab to a button with a tooltip | The name, then the description from the tooltip |
| Menu | Down arrow on "Actions" | "Menu", the first item focused; Escape returns to the button |
| Toast | Press "Add" on the Toast page | "Record added" is read once, without moving focus |
| Toast with progress | Press "Sync" | "Syncing with Discogs…", then the result, each read once |
| Notice | Read the error notice | Announced as an alert (role="alert"), the others as status |
| Progress | Read the progress bar | Name and value, e.g. "Fetching sleeves, 2 of 5" |
| Table | Table navigation (Ctrl+Alt+arrows) | Column headers are named with every cell |
| Sortable table | Sort by "Year" | The header reads "ascending" or "descending"; the row count is announced |
| EmptyState | Filter the sortable table to nothing | "No records found" as a heading; the action is a button |
| Breadcrumb | Read the breadcrumb | "Breadcrumb, navigation, list 3 items"; the last item is "current page" |
| Pagination | Tab through the pages | "Page 4, current page"; omitted pages (…) are skipped |

## Right to left

- [ ] With `dir="rtl"` on `<html>`: reading order and arrow direction in RadioGroup, Tabs, SegmentedControl, ToggleGroup and the sliders are right.
