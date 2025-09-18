# Removing Large Media Files from Git History

If you accidentally committed a large file (e.g. `public/temp_video_1758185781860.mov`) and want to remove it from all history:

## 1. Install git-filter-repo

```sh
brew install git-filter-repo # macOS
# or
pip3 install git-filter-repo
```

## 2. Remove the file from all history

```sh
git filter-repo --path public/temp_video_1758185781860.mov --invert-paths
```

## 3. Force-push the cleaned history

```sh
git push --force origin main
```

## 4. Ask collaborators to re-clone

Anyone with a clone must re-clone or run `git fetch --all && git reset --hard origin/main` (data loss warning).

## 5. (Optional) Add to .gitignore

Add `public/temp_video_*.mov` to `.gitignore` to prevent future accidental commits.

---
**Note:** This operation rewrites history. Only do this if you understand the risks and have coordinated with all collaborators.
