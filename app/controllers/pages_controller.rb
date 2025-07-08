class PagesController < ApplicationController
  def index
    @api_configured = ApiConfiguration.where(is_active: true).exists?
    @current_job = session[:ocr_job_id] ? OcrJob.find_by(id: session[:ocr_job_id]) : nil

    Rails.logger.info "Session OCR Job ID: #{session[:ocr_job_id]}"
    Rails.logger.info "Current Job: #{@current_job&.inspect}"
  end
end
