terraform {
  required_version = ">= 1.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# Cloud Run service
resource "google_cloud_run_service" "strapi_app" {
  name     = var.app_name
  location = var.region

  template {
    spec {
      containers {
        image = var.container_image
        
        ports {
          container_port = 1337
        }
        
        env {
          name  = "NODE_ENV"
          value = "production"
        }
        
        env {
          name  = "HOST"
          value = "0.0.0.0"
        }
        
        env {
          name  = "APP_KEYS"
          value = var.app_keys
        }
        
        env {
          name  = "API_TOKEN_SALT"
          value = var.api_token_salt
        }
        
        env {
          name  = "ADMIN_JWT_SECRET"
          value = var.admin_jwt_secret
        }
        
        env {
          name  = "TRANSFER_TOKEN_SALT"
          value = var.transfer_token_salt
        }
        
        env {
          name  = "JWT_SECRET"
          value = var.jwt_secret
        }
        
        env {
          name  = "DATABASE_CLIENT"
          value = "sqlite"
        }
        
        env {
          name  = "DATABASE_FILENAME"
          value = ".tmp/data.db"
        }

        resources {
          limits = {
            cpu    = "1000m"
            memory = "512Mi"
          }
        }
      }
    }
    
    metadata {
      annotations = {
        "autoscaling.knative.dev/maxScale" = "10"
        "run.googleapis.com/cpu-throttling" = "false"
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }
}

# Make the service publicly accessible
resource "google_cloud_run_service_iam_member" "public_access" {
  service  = google_cloud_run_service.strapi_app.name
  location = google_cloud_run_service.strapi_app.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}
