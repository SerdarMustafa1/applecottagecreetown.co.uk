Usage
- `remediation.csv` contains suggested actions to reconcile `site.config.ts` with CDN keys.
- `s3_dryrun_copy.sh` is a safe copy-only script (no deletes) which you can review before running. Edit `BUCKET` and run with `bash s3_dryrun_copy.sh --dry-run`.
