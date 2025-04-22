# Testing CI Workflows Locally

This repository is configured to support local testing of GitHub Actions workflows using [act](https://github.com/nektos/act).

## Prerequisites

1. Install [act](https://github.com/nektos/act#installation)
2. Docker installed and running

## Setting Up Secrets

The workflow requires several secrets/environment variables to function properly. These are used for integration tests with third-party services.

1. Copy the `.secrets.example` file to `.secrets` in the root directory:

   ```bash
   cp .secrets.example .secrets
   ```

2. Edit `.secrets` and add your actual credentials:

   ```
   TWITTER_USERNAME=your_twitter_username
   TWITTER_PASSWORD=your_twitter_password
   TWITTER_EMAIL=your_twitter_email
   COINGECKO_API_KEY=your_coingecko_api_key
   GITHUB_TOKEN=your_github_token
   ```

3. Make sure your `.secrets` file is in `.gitignore` to prevent committing sensitive information.

## Running Workflows Locally

This repository includes an `.actrc` file that configures common options. The configuration includes:

- Using the proper Ubuntu container image
- Automatically loading secrets from the `.secrets` file

### Running the Entire CI Workflow

To run the complete CI workflow with all jobs in sequence:

```bash
act
```

Or explicitly specify the workflow file:

```bash
act -W .github/workflows/ci.yml
```

If you're using an Apple M-series chip, you may need to specify the container architecture:

```bash
act -W .github/workflows/ci.yml --container-architecture linux/arm64
```

### Running Specific Jobs

To run only a specific job from the workflow:

```bash
act -j build
```

To run only the docs job:

```bash
act -j docs
```

### Debugging Tips

1. **View more detailed output**:

   ```bash
   act -v
   ```

2. **Dry run (don't actually execute anything)**:

   ```bash
   act -n
   ```

3. **Keep containers after job runs** (useful for debugging):
   ```bash
   act --bind
   ```

## GitHub Actions Integration

When pushing to GitHub, make sure to add the following secrets to your repository:

1. Go to your GitHub repository
2. Navigate to Settings > Secrets and variables > Actions
3. Add the following repository secrets:
   - `TWITTER_USERNAME`
   - `TWITTER_PASSWORD`
   - `TWITTER_EMAIL`
   - `COINGECKO_API_KEY`

These secrets will be used by the GitHub Actions workflow when running in the cloud.
