# CI/CD Workflow

This directory contains GitHub Actions workflows for continuous integration and deployment.

## CI Workflow

The `ci.yml` workflow handles continuous integration tasks:

- **Triggered by**: Pull requests and pushes to `main`
- **Node.js Version**: 20.x
- **Package Manager**: pnpm

### Key Steps

1. **Setup**: Checks out code, sets up Node.js and pnpm
2. **Install**: Installs dependencies with `pnpm install`
3. **Build**: Builds all packages in the monorepo
4. **Lint**: Runs linting checks
5. **Format Check**: Verifies code formatting
6. **Environment Setup**: Creates necessary `.env` files with credentials
7. **Test**: Runs tests across all packages
8. **Documentation**: Builds and verifies documentation

### Environment Variables and Secrets

This workflow requires the following repository secrets:

| Secret              | Purpose                                      |
| ------------------- | -------------------------------------------- |
| `TWITTER_USERNAME`  | Twitter authentication for integration tests |
| `TWITTER_PASSWORD`  | Twitter authentication for integration tests |
| `TWITTER_EMAIL`     | Twitter authentication for integration tests |
| `COINGECKO_API_KEY` | CoinGecko API access for integration tests   |

### Testing Locally

For local testing, see the instructions in `.github/README.md` for using the `act` tool.

## Workflow Customization

To modify the workflow:

1. Edit `.github/workflows/ci.yml`
2. For local testing, update the `.actrc` file and `.secrets` as needed
3. Test locally with `act` before pushing changes
