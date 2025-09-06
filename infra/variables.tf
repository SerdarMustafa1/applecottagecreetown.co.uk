variable "region" {
  type        = string
  description = "AWS region"
  default     = "eu-west-1"
}

variable "bucket_name" {
  type        = string
  description = "S3 bucket name (must be globally unique)"
}
