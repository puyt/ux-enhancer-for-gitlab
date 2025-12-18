# Changelog

## ⚠️ Notice

GitLab is gradually updating its UI as part of the "work items" overhaul. Since this extension heavily depends on the DOM, some features might not function properly with the new UI.
I only have access to the GitLab version used at our company, so I might not catch every change. I'm working on fixing the broken features one by one, while trying to make it backwards compatible which I cannot verify.

## 4.7.2 - 2025.12 (18/12/2025)

### 🪲 Bug Fixes

- **issue-boards**: fix project path display in issue boards for new GitLab UI by @tomerramk in [#49](https://github.com/puyt/ux-enhancer-for-gitlab/pull/49).
- **preferences**: enforce minimum value for project name parts in preferences by @tomerramk in [#49](https://github.com/puyt/ux-enhancer-for-gitlab/pull/49).

## 4.7.1 - 2025.11.1 (27/11/2025)

### 🪲 Bug Fixes

- **preferences**: fix position of the preferences button with new GitLab UI.

## 4.7.0 - 2025.11 (09/11/2025)

### ✨ Features

- **mr**: add remove source branch button for closed MRs

### 🪲 Bug Fixes

- **mr-dashboard**: fix repeated unresolved badges
- **preferences**: fix offset with new duo chat button
- **avatar**: fix double avatars for initials

## 4.6.1 - 2025.09 (08/09/2025)

### 🪲 Bug Fixes

- **unresolved-threads**: fix missing badges in new MR dashboard.

## 4.6.0 - 2025.08 (18/08/2025)

### ✨ Features

- **starred-boards**: add remove starred board from command panel.

### 🪲 Bug Fixes

- **todo**: align labels correctly for GitLab 18.x.
- **issue-detail**: render "validation" status in GitLab 18.x
- **unresolved-threads**: adapt the badges to GitLab 18.x

## 4.5.0 - 2025.07 (10/07/2025)

### 🚀 Performance

- Cached project avatars and labels in local storage to reduce API calls. Use the clear cache button in the preferences menu to clear the cache.

### 🪲 Bug Fixes

- Fix alignment of the preferences button in projects dashboard. ([#39](https://github.com/puyt/ux-enhancer-for-gitlab/issues/39))
- Fix scoped labels dropdown in issue detail.
- Fix project avatars in the todo page and MR group page.
- Fix issue & MR labels in the todo page.

## 4.4.0 - 2025.5.2 (25/05/2025)

### ✨ Features

- Add the ability to show the project path on the issue card in the boards. By @yonatand-rain in [#38](https://github.com/puyt/ux-enhancer-for-gitlab/pull/38)

## 4.3.3 - 2025.5.1 (18/05/2025)

### 🪲 Bug Fixes

- Fix alignment preferences button with GitLab Duo Chat. ([#37](https://github.com/puyt/ux-enhancer-for-gitlab/issues/37))

## 4.3.2 - 2025.5 (18/05/2025)

### 🪲 Bug Fixes

- Fix overlap preferences button with GitLab Duo Chat. ([#37](https://github.com/puyt/ux-enhancer-for-gitlab/issues/37))

## 4.3.1 - 2025.3.1 (24/03/2025)

### 🪲 Bug Fixes

- Fix highlight the correct badge for approved MRs by yourself in MR overview.  ([#36](https://github.com/puyt/ux-enhancer-for-gitlab/issues/36))

## 4.3.0 - 2025.3 (23/03/2025)

### ✨ Features

- Add (un)assign button in MR detail.
- Highlight approved MRs by yourself in MR overview. ([#36](https://github.com/puyt/ux-enhancer-for-gitlab/issues/36))

## 4.2.0 - 2025.2 (06/02/2025)

### ✨ Features

- add persistent filters to pipelines page. ([#33](https://github.com/puyt/ux-enhancer-for-gitlab/issues/33))

## 4.1.2 - 2025.1 (12/01/2025)

### 🪲 Bug Fixes

- **hotkey**: fix hotkey "mark as viewed & open next file".

## 4.1.1 - 2024.12 (13/12/2024)

### 🪲 Bug Fixes

- **ui**: fix position preferences dropdown. ([#32](https://github.com/puyt/ux-enhancer-for-gitlab/issues/32))

## 4.1.0 - 2024.10 Build 3 (28/10/2024)

### ✨ Features

- **issue, mr**: add badge for unresolved threads created by yourself which received responses. ([#30](https://github.com/puyt/ux-enhancer-for-gitlab/issues/30))

## 4.0.0 - 2024.10 Build 2 (27/10/2024)

### ♻️ Enhancements

- rename & update logo for compliance.

### 🪲 Bug Fixes

- fix height starred items in command panel.

## 3.0.0 - 2024.10 (10/10/2024)

### ♻️ Enhancements

- rename from GitLab Enhancer to GLab Enhancer for compliance.

### 💥 BREAKING CHANGES

- local storage key has been renamed from `chrome-gitlab-enhancer` to `glab-enhancer-browser-extension`.

## 2.8.9 - 2024.10 (07/10/2024)

### 🪲 Bug Fixes

- **ui, issue**: fix alignment total unresolved threads button.
- **permission**: remove trailing slashes from instances when requesting permissions.
- **permission**: allow permission requests for http. issue #25
- **persistent-filters**: apply filters only on issues, boards & MR pages.
- **ui**: fix alignment stats favorite projects in command panel.
- disable MR hotkeys when using the rich text editor. issue #27

## 2.8.8 - 2024.9 (30/09/2024)

### 🪲 Bug Fixes

- **css**: replace removed utility classes with style.

## 2.8.7 (03/07/2024)

### 🪲 Bug Fixes

- fix color issue validate button.
- fix color starred projects in command panel.
- fix "my unresolved threads" badge in MR detail.
- fix unresolved threads badges in MR overview.
- fix highlight my issues & MRs with for GitLab 17.x.

## 2.8.6 (03/07/2024)

### 🪲 Bug Fixes

- fix position preferences button with new GitLab update.

## 2.8.5 (02/07/2024)

### 🪲 Bug Fixes

- position preferences dropdown with new GitLab Duo chat button.

## 2.8.4 (14/05/2024)

### 🪲 Bug Fixes

- **issue-boards**: correct redirect for starred boards using board ID.

## 2.8.3 (03/04/2024)

### 🪲 Bug Fixes

- **persistent-filters**: allow update filters after applying persistent ones.

## 2.8.2 (02/04/2024)

### 🪲 Bug Fixes

- **persistent-filters**: fix infinite page refreshes + make it work for "dashboards/merge_requests".

## 2.8.1 (31/03/2024)

### 🪲 Bug Fixes

- **general**: disable persistent filters for dashboard MR views to stop continuous refreshes.

## 2.8.0 (30/03/2024)

### ✨ Features

- **issue**: add ability to star issue boards.
- **general**: add persistent filters for overviews.

### 🪲 Bug Fixes

- **command-panel**: fix re-order "My Places" with new GitLab update.

## 2.7.1 (05/03/2024)

### 🪲 Bug Fixes

- **command-panel**: fix re-order "Places".

## 2.7.0 (25/02/2024)

### ✨ Features

- **mr**: render project logo in MR group overview.

### 🪲 Bug Fixes

- **config**: ignore whitespace in multiple gitlab instances definition.

## 2.6.2 (07/02/2024)

### 🪲 Bug Fixes

- **scoped-labels-dropdown**: resolve label update in issue boards.

## 2.6.1 (06/02/2024)

### ✨ Features

- **scoped-labels-dropdown**: enable for group issue boards.

### 🪲 Bug Fixes

- **issue**: fix validation by fetching all discussions.

## 2.6.0 (05/02/2024)

### ✨ Features

- **background**: add web notifications for new to dos ([docs](https://github.com/puyt/ux-enhancer-for-gitlab?tab=readme-ov-file#-web-notifications)).
- add changelog in the dropdown.

### ♻️ Enhancements

- **scoped-labels-dropdown**: include chevron in click area.

### 🪲 Bug Fixes

- **scoped-labels-dropdown**: adjust z-index and visibility in dark mode.
- make icons visible in dark mode.

## 2.5.0 (26/01/2024)

### ✨ Features

- **issue, mr**: add dropdown for scoped labels
- **command-panel**: increase height to fill screen

## 2.4.0 (18/01/2024)

### ✨ Features

- **todos**: add render labels for issues & mrs

### 🪲 Bug Fixes

- **mr, issue**: fix favor thread over comment when textarea is not empty

## 2.3.1 (17/01/2024)

### ✨ Features

- add tooltip on version badge for changelog info

## 2.3.0 (16/01/2024)

### ✨ Features

- **todos**: render project logo
- **mr**: add hotkey "v" to mark file as viewed
- **popup**: render the changelog
- show current version in the dropdown
- **issue, mr**: use threads over comments by default

### ♻️ Enhancements

- **permission**: request optional permissions for content scripts

### 🗒️ Other

- **refactor**: split highlight my issues & mrs into 2 settings

## 2.2.0 (15/01/2024)

### ✨ Features

- **preference**: add mark as viewed & next file
- **preference**: add tooltip my issues & mrs

### ♻️ Enhancements

- **issue**: hide validate if validation is disabled
- **store**: rename the local storage key

### 🪲 Bug Fixes

- **mr**: fix badge alignment

### 🗒️ Other

- **refactor**: remove need for universal site access

## 2.1.0 (13/01/2024)

### ✨ Features

- show unresolved threads in issue overview
- add Dim "Draft" Mrs

### ♻️ Enhancements

- add arrow nav support in starred projects
- increase avatar size project

## 2.0.0 (12/01/2024)

- 🚀 Initial release in the Chrome Web Store
