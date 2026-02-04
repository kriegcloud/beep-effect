# PostgreSQL on Free-Tier Compute Engine
#
# Provisions an e2-micro instance (free tier eligible) running PostgreSQL
# for @effect/workflow persistence via @effect/cluster's ClusterWorkflowEngine.
#
# Architecture:
# - Single e2-micro (0.25 vCPU, 1GB RAM) - free tier in us-central1
# - PostgreSQL 15 via Docker
# - Persistent disk for data durability
# - Internal VPC access only (Cloud Run via VPC connector)

# -----------------------------------------------------------------------------
# Network
# -----------------------------------------------------------------------------

resource "google_compute_network" "workflow_vpc" {
  name                    = "workflow-vpc-${var.environment}"
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "workflow_subnet" {
  name          = "workflow-subnet-${var.environment}"
  ip_cidr_range = "10.0.1.0/24"
  region        = var.region
  network       = google_compute_network.workflow_vpc.id

  private_ip_google_access = true
}

# VPC Connector for Cloud Run to access Compute Engine
resource "google_vpc_access_connector" "workflow_connector" {
  name          = "workflow-connector-${var.environment}"
  region        = var.region
  ip_cidr_range = "10.8.0.0/28"
  network       = google_compute_network.workflow_vpc.name

  min_instances = 2
  max_instances = 3
}

# Cloud NAT for private VMs to access internet (pull Docker images)
resource "google_compute_router" "workflow_router" {
  name    = "workflow-router-${var.environment}"
  region  = var.region
  network = google_compute_network.workflow_vpc.id
}

resource "google_compute_router_nat" "workflow_nat" {
  name                               = "workflow-nat-${var.environment}"
  router                             = google_compute_router.workflow_router.name
  region                             = var.region
  nat_ip_allocate_option            = "AUTO_ONLY"
  source_subnetwork_ip_ranges_to_nat = "ALL_SUBNETWORKS_ALL_IP_RANGES"

  log_config {
    enable = false
    filter = "ERRORS_ONLY"
  }
}

# Firewall: Allow internal traffic on PostgreSQL port
resource "google_compute_firewall" "allow_postgres" {
  name    = "allow-postgres-${var.environment}"
  network = google_compute_network.workflow_vpc.name

  allow {
    protocol = "tcp"
    ports    = ["5432"]
  }

  source_ranges = ["10.0.0.0/8"]
  target_tags   = ["postgres"]
}

# Firewall: Allow SSH for maintenance (optional, from IAP)
resource "google_compute_firewall" "allow_ssh_iap" {
  name    = "allow-ssh-iap-${var.environment}"
  network = google_compute_network.workflow_vpc.name

  allow {
    protocol = "tcp"
    ports    = ["22"]
  }

  # IAP's IP range for secure SSH tunneling
  source_ranges = ["35.235.240.0/20"]
  target_tags   = ["postgres"]
}

# -----------------------------------------------------------------------------
# Compute Engine Instance
# -----------------------------------------------------------------------------

resource "google_compute_instance" "postgres" {
  name         = "workflow-postgres-${var.environment}"
  machine_type = "e2-micro" # Free tier eligible
  zone         = "${var.region}-a"

  tags = ["postgres"]

  boot_disk {
    initialize_params {
      image = "cos-cloud/cos-stable" # Container-Optimized OS
      size  = 30                     # 30GB standard persistent disk (free tier)
      type  = "pd-standard"
    }
  }

  # Attach persistent disk for PostgreSQL data
  attached_disk {
    source      = google_compute_disk.postgres_data.self_link
    device_name = "postgres-data-${var.environment}"
    mode        = "READ_WRITE"
  }

  network_interface {
    subnetwork = google_compute_subnetwork.workflow_subnet.self_link
    network_ip = google_compute_address.postgres_internal.address

    # No external IP - access via IAP or VPC only
    # Uncomment for debugging:
    # access_config {}
  }

  metadata = {
    # Cloud-init script to start PostgreSQL container with pgvector
    # Using pgvector/pgvector image for vector similarity search support
    # Required for cross-batch entity resolution with embedding similarity
    # Note: Using env var for password as COS doesn't support secret volumes like K8s
    # The VM is on internal VPC only, so this is reasonably secure
    gce-container-declaration = yamlencode({
      spec = {
        containers = [{
          name  = "postgres"
          image = "pgvector/pgvector:pg15"  # PostgreSQL 15 with pgvector extension
          env = [
            { name = "POSTGRES_USER", value = "workflow" },
            { name = "POSTGRES_DB", value = "workflow" },
            { name = "POSTGRES_PASSWORD", value = var.postgres_password },
            { name = "PGDATA", value = "/var/lib/postgresql/data/pgdata" }
          ]
          volumeMounts = [
            { name = "postgres-data", mountPath = "/var/lib/postgresql/data" }
          ]
          ports = [{ containerPort = 5432 }]
        }]
        volumes = [
          { name = "postgres-data", gcePersistentDisk = { pdName = "postgres-data-${var.environment}", fsType = "ext4" } }
        ]
        restartPolicy = "Always"
      }
    })

    # Enable container-optimized OS logging
    google-logging-enabled = "true"
  }

  service_account {
    email  = var.service_account_email
    scopes = ["cloud-platform"]
  }

  scheduling {
    preemptible       = false
    automatic_restart = true
  }

  allow_stopping_for_update = true

  lifecycle {
    ignore_changes = [metadata["ssh-keys"]]
  }
}

# Persistent disk for PostgreSQL data
resource "google_compute_disk" "postgres_data" {
  name = "postgres-data-${var.environment}"
  type = "pd-standard"
  zone = "${var.region}-a"
  size = 10 # 10GB for workflow data

  labels = {
    environment = var.environment
    purpose     = "workflow-persistence"
  }
}

# -----------------------------------------------------------------------------
# Backup: Automated Disk Snapshots
# -----------------------------------------------------------------------------

# Snapshot schedule: Daily at 3 AM UTC, 7-day retention
resource "google_compute_resource_policy" "postgres_backup" {
  name   = "postgres-backup-${var.environment}"
  region = var.region

  snapshot_schedule_policy {
    schedule {
      daily_schedule {
        days_in_cycle = 1
        start_time    = "03:00" # 3 AM UTC
      }
    }

    retention_policy {
      max_retention_days    = 7
      on_source_disk_delete = "KEEP_AUTO_SNAPSHOTS"
    }

    snapshot_properties {
      labels = {
        environment = var.environment
        backup_type = "automated"
      }
      storage_locations = [var.region]
    }
  }
}

# Attach snapshot schedule to PostgreSQL data disk
resource "google_compute_disk_resource_policy_attachment" "postgres_backup_attachment" {
  name = google_compute_resource_policy.postgres_backup.name
  disk = google_compute_disk.postgres_data.name
  zone = "${var.region}-a"
}

# Static internal IP for consistent DNS
resource "google_compute_address" "postgres_internal" {
  name         = "postgres-internal-${var.environment}"
  subnetwork   = google_compute_subnetwork.workflow_subnet.id
  address_type = "INTERNAL"
  region       = var.region
  purpose      = "GCE_ENDPOINT"
}
