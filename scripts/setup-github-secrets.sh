#!/bin/bash

# Setup GitHub Secrets for Cloudflare Deployment
# This script helps you securely configure GitHub repository secrets

set -e

echo "🔐 GitHub Secrets Setup for Panopticlick"
echo "========================================"
echo ""
echo "This script will guide you through setting up GitHub Secrets."
echo "Make sure you have GitHub CLI (gh) installed."
echo ""

# Check if gh is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed."
    echo ""
    echo "Install it from: https://cli.github.com/"
    echo ""
    echo "Or use Homebrew: brew install gh"
    echo ""
    exit 1
fi

# Check if logged in
if ! gh auth status &> /dev/null; then
    echo "📝 You need to login to GitHub first."
    echo ""
    gh auth login
fi

echo "✅ GitHub CLI is ready!"
echo ""

# Get repository info
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
echo "📦 Repository: $REPO"
echo ""

# Function to set secret
set_secret() {
    local name=$1
    local description=$2
    local example=$3

    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Setting: $name"
    echo "$description"
    echo ""
    echo "Example: $example"
    echo ""

    # Check if secret already exists
    if gh secret list | grep -q "^$name"; then
        read -p "⚠️  Secret '$name' already exists. Overwrite? (y/N): " overwrite
        if [[ ! $overwrite =~ ^[Yy]$ ]]; then
            echo "⏭️  Skipped $name"
            echo ""
            return
        fi
    fi

    read -sp "Enter value for $name: " value
    echo ""

    if [ -z "$value" ]; then
        echo "❌ No value entered. Skipped."
        echo ""
        return
    fi

    # Set the secret
    echo "$value" | gh secret set "$name"

    if [ $? -eq 0 ]; then
        echo "✅ Successfully set $name"
    else
        echo "❌ Failed to set $name"
    fi

    echo ""
}

# Cloudflare Account ID
set_secret \
    "CLOUDFLARE_ACCOUNT_ID" \
    "Your Cloudflare Account ID (find in Dashboard > Workers & Pages)" \
    "your-cloudflare-account-id-here"

# Cloudflare API Token
set_secret \
    "CLOUDFLARE_API_TOKEN" \
    "Cloudflare API Token with Pages and Workers permissions" \
    "your-cloudflare-api-token-here"

# OpenRouter API Key
set_secret \
    "OPENROUTER_API_KEY" \
    "OpenRouter API Key for AI chat feature (get from https://openrouter.ai/keys)" \
    "sk-or-v1-your-key-here"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎉 Setup Complete!"
echo ""
echo "Configured secrets:"
gh secret list
echo ""
echo "Next steps:"
echo "1. Push to main branch to trigger deployment"
echo "2. Monitor deployment: https://github.com/$REPO/actions"
echo "3. Check Cloudflare dashboard for deployed apps"
echo ""
echo "For more details, see docs/DEPLOYMENT.md"
echo ""
