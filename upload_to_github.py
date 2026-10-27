"""
Hotel Pro Management System - GitHub Direct Upload Script
This script uploads the entire project directory to GitHub directly via the GitHub REST API.
No local git installation is required!

Usage:
    python upload_to_github.py
    or
    python upload_to_github.py --token YOUR_GITHUB_PAT --repo hotel-pro-management --username pratiiiikk
"""

import os
import sys
import json
import base64
import argparse
import urllib.request
import urllib.error

IGNORE_DIRS = {
    'node_modules', '.git', '.vscode', '.idea', 'dist', 'build', '__pycache__'
}

IGNORE_FILES = {
    '.DS_Store', 'upload_to_github.py'
}

def is_ignored(rel_path):
    parts = rel_path.split(os.sep)
    for p in parts:
        if p in IGNORE_DIRS:
            return True
    filename = os.path.basename(rel_path)
    if filename in IGNORE_FILES:
        return True
    # Ignore real .env files with secrets, but keep .env.example
    if filename == '.env' or (filename.startswith('.env.') and not filename.endswith('.example')):
        return True
    return False

def make_request(url, method='GET', data=None, token=''):
    headers = {
        'User-Agent': 'SkillWallet-Project-Uploader',
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': f'Bearer {token}'
    }
    body = json.dumps(data).encode('utf-8') if data is not None else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            content = resp.read().decode('utf-8')
            return json.loads(content) if content else {}
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode('utf-8', errors='ignore')
        print(f"\n[HTTP Error {e.code}] {e.reason}: {err_msg}")
        raise

def get_or_create_repo(username, repo_name, token, is_private=False):
    # Check if repo already exists
    try:
        repo = make_request(f"https://api.github.com/repos/{username}/{repo_name}", token=token)
        print(f"[OK] Repository already exists: https://github.com/{username}/{repo_name}")
        return repo
    except urllib.error.HTTPError as e:
        if e.code != 404:
            raise
    
    # Create repo
    print(f"[*] Creating repository '{repo_name}' under account '{username}'...")
    create_payload = {
        "name": repo_name,
        "description": "Hotel Pro Management System - MERN Stack Hotel Booking Platform for SkillWallet",
        "private": is_private,
        "auto_init": True
    }
    repo = make_request("https://api.github.com/user/repos", method='POST', data=create_payload, token=token)
    print(f"[OK] Repository created successfully: https://github.com/{username}/{repo_name}")
    import time
    time.sleep(2)  # Give GitHub 2 seconds to initialize main branch
    return repo

def upload_project(project_dir, username, repo_name, token):
    print(f"[*] Scanning files in '{project_dir}'...")
    files_to_upload = []
    for root, dirs, files in os.walk(project_dir):
        # Prune ignored directories
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
        for f in files:
            full_path = os.path.join(root, f)
            rel_path = os.path.relpath(full_path, project_dir)
            if not is_ignored(rel_path):
                files_to_upload.append((rel_path, full_path))

    print(f"[OK] Found {len(files_to_upload)} files to upload.")

    # 1. Create blobs for each file
    tree_items = []
    print("[*] Uploading file blobs to GitHub...")
    for idx, (rel_path, full_path) in enumerate(files_to_upload, 1):
        try:
            with open(full_path, 'rb') as fp:
                file_bytes = fp.read()
            b64_content = base64.b64encode(file_bytes).decode('ascii')
            blob_resp = make_request(
                f"https://api.github.com/repos/{username}/{repo_name}/git/blobs",
                method='POST',
                data={"content": b64_content, "encoding": "base64"},
                token=token
            )
            blob_sha = blob_resp['sha']
            git_path = rel_path.replace(os.sep, '/')
            tree_items.append({
                "path": git_path,
                "mode": "100644",
                "type": "blob",
                "sha": blob_sha
            })
            if idx % 10 == 0 or idx == len(files_to_upload):
                print(f"    Progress: {idx}/{len(files_to_upload)} files uploaded...")
        except Exception as err:
            print(f"[Error] Failed to upload {rel_path}: {err}")
            raise

    # 2. Create Tree
    print("[*] Creating Git tree object...")
    tree_resp = make_request(
        f"https://api.github.com/repos/{username}/{repo_name}/git/trees",
        method='POST',
        data={"tree": tree_items},
        token=token
    )
    tree_sha = tree_resp['sha']
    print(f"[OK] Tree created with SHA: {tree_sha[:8]}")

    # Check for existing commit on main branch
    parent_commits = []
    has_ref = False
    try:
        ref_data = make_request(f"https://api.github.com/repos/{username}/{repo_name}/git/refs/heads/main", token=token)
        parent_commits = [ref_data['object']['sha']]
        has_ref = True
    except urllib.error.HTTPError as e:
        if e.code != 404:
            raise

    # 3. Create Commit
    print("[*] Creating commit...")
    commit_payload = {
        "message": "Initial commit: Hotel Pro Management System for SkillWallet",
        "tree": tree_sha,
        "parents": parent_commits
    }
    commit_resp = make_request(
        f"https://api.github.com/repos/{username}/{repo_name}/git/commits",
        method='POST',
        data=commit_payload,
        token=token
    )
    commit_sha = commit_resp['sha']
    print(f"[OK] Commit created: {commit_sha[:8]}")

    # 4. Update or Create Ref
    print("[*] Updating 'main' branch reference...")
    if has_ref:
        make_request(
            f"https://api.github.com/repos/{username}/{repo_name}/git/refs/heads/main",
            method='PATCH',
            data={"sha": commit_sha, "force": True},
            token=token
        )
    else:
        make_request(
            f"https://api.github.com/repos/{username}/{repo_name}/git/refs",
            method='POST',
            data={"ref": "refs/heads/main", "sha": commit_sha},
            token=token
        )

    print("\n" + "=" * 60)
    print(f"🎉 SUCCESS! Project uploaded to:")
    print(f"👉 https://github.com/{username}/{repo_name}")
    print("=" * 60 + "\n")

def main():
    parser = argparse.ArgumentParser(description="Upload Hotel Pro project to GitHub")
    parser.add_argument("--token", help="GitHub Personal Access Token (PAT)")
    parser.add_argument("--username", default="pratiiiikk", help="GitHub username")
    parser.add_argument("--repo", default="Hotel-Booking", help="GitHub repository name")
    parser.add_argument("--private", action="store_true", help="Make repository private")

    args = parser.parse_args()

    token = args.token or os.environ.get("GITHUB_TOKEN")
    username = args.username
    repo_name = args.repo

    if not token:
        print("=" * 60)
        print("  Hotel Pro Management System - GitHub Project Uploader")
        print("=" * 60)
        print("\nTo upload this project to your GitHub account without needing Git installed,")
        print("you just need a GitHub Personal Access Token (Fine-grained or Classic with 'repo' scope).")
        print("Generate one at: https://github.com/settings/tokens\n")
        try:
            token = input("Enter your GitHub Personal Access Token (PAT): ").strip()
        except EOFError:
            token = ""

    if not token:
        print("[!] No token provided. Exiting.")
        sys.exit(1)

    try:
        user_input = input(f"GitHub Username [{username}]: ").strip()
        if user_input:
            username = user_input
    except EOFError:
        pass

    try:
        repo_input = input(f"Repository Name [{repo_name}]: ").strip()
        if repo_input:
            repo_name = repo_input
    except EOFError:
        pass

    project_dir = os.path.dirname(os.path.abspath(__file__))
    get_or_create_repo(username, repo_name, token, is_private=args.private)
    upload_project(project_dir, username, repo_name, token)

if __name__ == "__main__":
    main()
