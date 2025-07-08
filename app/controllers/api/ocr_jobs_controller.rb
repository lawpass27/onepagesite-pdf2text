class Api::OcrJobsController < ApplicationController
  skip_before_action :verify_authenticity_token

  def create
    # In development, allow upload without API configuration (will use mock processor)
    if Rails.env.production? && !ApiConfiguration.where(is_active: true).exists?
      render json: {
        success: false,
        message: I18n.t("upload.error.api_not_configured")
      }, status: :unprocessable_entity
      return
    end

    unless params[:file].present?
      render json: {
        success: false,
        message: "No file provided"
      }, status: :unprocessable_entity
      return
    end

    file = params[:file]

    unless file.content_type == "application/pdf"
      render json: {
        success: false,
        message: I18n.t("upload.error.invalid_type")
      }, status: :unprocessable_entity
      return
    end

    if file.size > 50.megabytes
      render json: {
        success: false,
        message: I18n.t("upload.error.too_large")
      }, status: :unprocessable_entity
      return
    end

    ocr_job = OcrJob.create!(
      session_id: session.id,
      filename: file.original_filename,
      status: "pending",
      processed_pages: 0
    )

    ocr_job.pdf_file.attach(file)
    session[:ocr_job_id] = ocr_job.id

    # Process PDF in background (in real app, use Active Job)
    ProcessPdfJob.perform_later(ocr_job.id)

    render json: {
      success: true,
      job_id: ocr_job.id,
      message: "PDF uploaded successfully"
    }
  rescue => e
    render json: {
      success: false,
      message: "Upload failed: #{e.message}"
    }, status: :internal_server_error
  end

  def status
    ocr_job = OcrJob.find(params[:id])

    render json: {
      id: ocr_job.id,
      status: ocr_job.status,
      progress: ocr_job.progress_percentage,
      total_pages: ocr_job.total_pages,
      processed_pages: ocr_job.processed_pages,
      error_message: ocr_job.error_message,
      completed: ocr_job.status.in?([ "completed", "failed" ])
    }
  rescue ActiveRecord::RecordNotFound
    render json: {
      success: false,
      message: "Job not found"
    }, status: :not_found
  end

  def texts
    ocr_job = OcrJob.find(params[:id])

    if ocr_job.status == "completed"
      texts = Rails.cache.read("ocr_texts_#{ocr_job.id}") || {}
      render json: {
        success: true,
        texts: texts
      }
    else
      render json: {
        success: false,
        message: "OCR processing not completed"
      }, status: :unprocessable_entity
    end
  rescue ActiveRecord::RecordNotFound
    render json: {
      success: false,
      message: "Job not found"
    }, status: :not_found
  end

  def pdf
    ocr_job = OcrJob.find(params[:id])

    if ocr_job.pdf_file.attached?
      redirect_to rails_blob_url(ocr_job.pdf_file, disposition: "inline")
    else
      render json: {
        success: false,
        message: "No PDF file attached"
      }, status: :not_found
    end
  rescue ActiveRecord::RecordNotFound
    render json: {
      success: false,
      message: "Job not found"
    }, status: :not_found
  end
end
