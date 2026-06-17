# Base image with Node.js 22
FROM node:22-slim

# Install essential tools (unzip is needed by the bun installer)
RUN apt-get update && apt-get install -y \
    git \
    curl \
    bash \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Install Claude Code and Bun globally.
# Bun is required by the app itself (it depends on the bun:sqlite built-in),
# so the container must ship with it rather than installing it at runtime.
RUN npm install -g @anthropic-ai/claude-code bun

# Create working directory
WORKDIR /workspace

# Default command — interactive Claude Code session
CMD ["claude"]
