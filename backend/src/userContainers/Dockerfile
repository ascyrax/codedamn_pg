# Use the official Ubuntu base image
FROM ubuntu:latest

# Install nginx to serve the content, and curl to download any utilities or files
RUN apt-get update && apt-get install -y nginx curl

# Create the working directory
RUN mkdir -p /home/codedamn

# Set the working directory
WORKDIR /home/codedamn

# Copy files from your host machine into the Docker image
COPY index.html index.html
COPY style.css style.css
COPY script.js script.js

# Set the default command for the container
# CMD ["nginx", "-g", "daemon off;"]
