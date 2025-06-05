# GitHub Repository Secrets Setup

## Required Secrets

### 1. GITHUB_TOKEN
- **Purpose**: Branch protection setup and GitHub API access
- **How to get**: 
  1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
  2. Generate new token with these permissions:
     - `repo` (Full control of private repositories)
     - `admin:repo_hook` (Full control of repository hooks)
     - `admin:org` (Full control of orgs and teams, read and write org projects)
  3. Copy the token immediately (it won't be shown again)

### 2. LHCI_GITHUB_APP_TOKEN
- **Purpose**: Lighthouse CI GitHub integration
- **How to get**:
  1. Install Lighthouse CI GitHub App: https://github.com/apps/lighthouse-ci
  2. Configure it for your repository
  3. The token will be provided in the app configuration

### 3. Deployment Secrets (Optional for now)
- `STAGING_SERVER_HOST` - Staging server IP/hostname
- `STAGING_SERVER_USER` - SSH username for staging
- `STAGING_SSH_KEY` - Private SSH key for staging deployment
- `PRODUCTION_SERVER_HOST` - Production server IP/hostname
- `PRODUCTION_SERVER_USER` - SSH username for production
- `PRODUCTION_SSH_KEY` - Private SSH key for production deployment

## How to Add Secrets

1. Go to your GitHub repository
2. Click **Settings** tab
3. Click **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Add each secret with the exact name listed above

## Verification

After adding secrets, you can verify them in the repository settings. The values will be hidden for security.

## Next Steps

Once secrets are added, run the branch protection setup script:

```bash
# Set environment variables (replace with your values)
export GITHUB_TOKEN="your_github_token_here"
export GITHUB_REPOSITORY_OWNER="your-github-username"
export GITHUB_REPOSITORY_NAME="cardiolive"

# Run the setup script
node .github/scripts/setup-branch-protection.js
```
