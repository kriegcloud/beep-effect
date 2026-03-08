# Ontology Skill Workspace - Task Runner
# Usage: just <recipe>
# Requires: https://github.com/casey/just

set dotenv-load

# Default recipe
default:
    @just --list

# ---------------------------------------------------------------------------
# Environment
# ---------------------------------------------------------------------------

# Install all dependencies (production + dev)
install:
    uv sync --group dev

# Update all dependencies
update:
    uv lock --upgrade
    uv sync --group dev

# ---------------------------------------------------------------------------
# Quality
# ---------------------------------------------------------------------------

# Run all checks (lint, typecheck, test, ontology validation)
check: lint typecheck test validate-energy-news validate-pao

# Lint with ruff
lint:
    uv run ruff check .

# Lint and auto-fix
fix:
    uv run ruff check --fix .
    uv run ruff format .

# Format code
fmt:
    uv run ruff format .

# Format check (no changes)
fmt-check:
    uv run ruff format --check .

# Type check with mypy
typecheck:
    uv run mypy src/

# ---------------------------------------------------------------------------
# Testing
# ---------------------------------------------------------------------------

# Run all tests
test *ARGS:
    uv run pytest {{ARGS}}

# Run tests with coverage
test-cov:
    uv run pytest --cov=src/ontology_skill --cov-report=html --cov-report=term

# Run only unit tests
test-unit:
    uv run pytest tests/unit/

# Run only integration tests
test-integration:
    uv run pytest tests/integration/ -m integration

# ---------------------------------------------------------------------------
# Pre-commit
# ---------------------------------------------------------------------------

# Install pre-commit hooks
hooks-install:
    uv run pre-commit install

# Run pre-commit on all files
hooks-run:
    uv run pre-commit run --all-files

# ---------------------------------------------------------------------------
# Ontology Tools
# ---------------------------------------------------------------------------

# Local ROBOT CLI path (project-local, not global)
robot_bin := justfile_directory() / ".local/bin/robot"

# Check ROBOT is available
robot-check:
    @test -x {{robot_bin}} && {{robot_bin}} --version || echo "ROBOT not installed. Run: just robot-install"

# Install ROBOT CLI (project-local, no global pollution)
robot-install:
    mkdir -p {{justfile_directory()}}/.local/bin {{justfile_directory()}}/.local/share
    curl -sL https://github.com/ontodev/robot/releases/latest/download/robot.jar \
        -o {{justfile_directory()}}/.local/share/robot.jar
    curl -sL https://raw.githubusercontent.com/ontodev/robot/master/bin/robot \
        -o {{justfile_directory()}}/.local/bin/robot
    chmod +x {{justfile_directory()}}/.local/bin/robot
    ln -sf {{justfile_directory()}}/.local/share/robot.jar {{justfile_directory()}}/.local/bin/robot.jar
    @echo "ROBOT installed to .local/bin/robot"

# Build Energy News Ontology from conceptual model artifacts
build-energy-news:
    uv run python ontologies/energy-news/scripts/build.py

# Validate Energy News Ontology (full pipeline: build + syntax + ROBOT + SHACL + CQ tests)
validate-energy-news: build-energy-news
    @test -x {{robot_bin}} || just robot-install
    uv run python scripts/validate_turtle.py \
        ontologies/energy-news/energy-news.ttl \
        ontologies/energy-news/energy-news-reference-individuals.ttl \
        ontologies/energy-news/energy-news-data.ttl \
        ontologies/energy-news/shapes/energy-news-shapes.ttl
    cd {{justfile_directory()}} && {{robot_bin}} merge \
        --catalog ontologies/energy-news/catalog-v001.xml \
        --input ontologies/energy-news/energy-news.ttl \
        --output /tmp/energy-news-merged.ttl
    {{robot_bin}} reason --reasoner HermiT \
        --input /tmp/energy-news-merged.ttl
    cd {{justfile_directory()}} && {{robot_bin}} report \
        --input /tmp/energy-news-merged.ttl \
        --profile ontologies/energy-news/robot-report-profile.txt \
        --base-iri "http://example.org/ontology/energy-news" \
        --fail-on ERROR \
        --output ontologies/energy-news/energy-news-report.tsv
    uv run pytest ontologies/energy-news/tests/test_ontology.py -v

# Build Personal Agent Ontology from conceptual model artifacts
build-pao:
    uv run python ontologies/personal_agent_ontology/scripts/build.py

# Validate Personal Agent Ontology (full pipeline: build + syntax + ROBOT + SHACL + CQ tests)
validate-pao: build-pao
    @test -x {{robot_bin}} || just robot-install
    uv run python scripts/validate_turtle.py \
        ontologies/personal_agent_ontology/personal_agent_ontology.ttl \
        ontologies/personal_agent_ontology/pao-reference-individuals.ttl \
        ontologies/personal_agent_ontology/pao-data.ttl \
        ontologies/personal_agent_ontology/shapes/pao-shapes.ttl
    cd {{justfile_directory()}} && {{robot_bin}} merge \
        --catalog ontologies/personal_agent_ontology/catalog-v001.xml \
        --input ontologies/personal_agent_ontology/personal_agent_ontology.ttl \
        --output /tmp/pao-merged.ttl
    {{robot_bin}} reason --reasoner HermiT \
        --input /tmp/pao-merged.ttl
    cd {{justfile_directory()}} && {{robot_bin}} report \
        --input /tmp/pao-merged.ttl \
        --base-iri "https://purl.org/pao" \
        --fail-on ERROR \
        --output ontologies/personal_agent_ontology/pao-report.tsv
    uv run pytest ontologies/personal_agent_ontology/tests/test_ontology.py -v

# Generate pyLODE HTML documentation for Energy News Ontology
doc-energy-news: build-energy-news
    @test -x {{robot_bin}} || just robot-install
    cd {{justfile_directory()}} && {{robot_bin}} merge \
        --catalog ontologies/energy-news/catalog-v001.xml \
        --input ontologies/energy-news/energy-news.ttl \
        --output /tmp/energy-news-pylode.ttl
    uv run pylode /tmp/energy-news-pylode.ttl \
        -o ontologies/energy-news/docs/energy-news.html -c true
    @echo "Documentation generated: ontologies/energy-news/docs/energy-news.html"

# ---------------------------------------------------------------------------
# Cleanup
# ---------------------------------------------------------------------------

# Remove all generated files
clean:
    rm -rf .mypy_cache .pytest_cache .ruff_cache htmlcov .coverage
    find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
