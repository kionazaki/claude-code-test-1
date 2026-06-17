# Base image with Node.js 22
FROM node:22-slim

# Install essential tools
RUN apt-get update && apt-get install -y \
    git \
    curl \
    bash \
    && rm -rf /var/lib/apt/lists/*

# Install Claude Code globally
RUN npm install -g @anthropic-ai/claude-code

# Create working directory
WORKDIR /workspace

# Default command — interactive Claude Code session
CMD ["claude"]
