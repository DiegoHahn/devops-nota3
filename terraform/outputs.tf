output "service_url" {
  description = "URL of the deployed Cloud Run service"
  value       = google_cloud_run_service.strapi_app.status[0].url
}

output "service_name" {
  description = "Name of the Cloud Run service"
  value       = google_cloud_run_service.strapi_app.name
}

output "admin_url" {
  description = "Strapi Admin Panel URL"
  value       = "${google_cloud_run_service.strapi_app.status[0].url}/admin"
}
