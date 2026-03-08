# Process building blocks
docker run --pull=always --rm --workdir /workspace -v "$(pwd):/workspace" ghcr.io/opengeospatial/bblocks-postprocess  --clean true --base-url http://localhost:9090/register/