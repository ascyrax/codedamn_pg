# Use the official Ubuntu base image
# FROM ubuntu:latest
FROM node:18

# Install nginx to serve the content, and curl to download any utilities or files
RUN apt-get update && apt-get install -y nginx curl
# Update and install basic utilities
RUN apt-get update && apt-get install -y \
  curl \
  wget \
  git \
  vim \
  nano \
  htop \
  sudo \
  unzip \
  && apt-get clean

# Create the working directory
RUN mkdir -p /home/codedamn

# Set the working directory
WORKDIR /home/codedamn

# COPY index.html index.html
# COPY style.css style.css
# COPY script.js script.js

# Copy the entire project directory to the working directory
# COPY . .

# Set the default command for the container
# CMD ["nginx", "-g", "daemon off;"]
