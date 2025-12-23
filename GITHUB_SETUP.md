# GitHub Repository Setup Guide

Your code has been committed locally. Follow these steps to push it to GitHub:

## Step 1: Create a GitHub Repository

1. Go to [GitHub](https://github.com) and sign in to your account
2. Click the "+" icon in the top right corner and select "New repository"
3. Fill in the repository details:
   - **Repository name**: `medical_tracker` (or any name you prefer)
   - **Description**: "A Next.js web application for tracking medical appointments, test results, bills, and medications"
   - **Visibility**: Choose Public or Private
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
4. Click "Create repository"

## Step 2: Push Your Code to GitHub

After creating the repository, GitHub will show you commands. Use these commands in your terminal:

```bash
cd "C:\Users\vicen\OneDrive - Universidad de Chile\Escritorio\Documents\Vicente\Proyectos Cursor.2\medical_tracker"

# Add the remote repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/medical_tracker.git

# Rename the branch to main (if needed)
git branch -M main

# Push your code
git push -u origin main
```

## Alternative: Using SSH (if you have SSH keys set up)

If you prefer using SSH instead of HTTPS:

```bash
git remote add origin git@github.com:YOUR_USERNAME/medical_tracker.git
git branch -M main
git push -u origin main
```

## Troubleshooting

### If you get authentication errors:
- GitHub no longer accepts passwords for HTTPS. You'll need to:
  1. Use a Personal Access Token (PAT) instead of your password
  2. Or set up SSH keys for authentication

### To create a Personal Access Token:
1. Go to GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a name and select scopes: `repo` (full control of private repositories)
4. Copy the token and use it as your password when pushing

### If you need to change the remote URL:
```bash
git remote set-url origin https://github.com/YOUR_USERNAME/medical_tracker.git
```

## Next Steps

Once your code is on GitHub, you can:
- Set up GitHub Actions for CI/CD
- Deploy to Vercel (which integrates seamlessly with GitHub)
- Collaborate with others
- Track issues and feature requests

