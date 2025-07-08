class ProcessPdfJob < ApplicationJob
  queue_as :default

  def perform(ocr_job_id)
    ocr_job = OcrJob.find(ocr_job_id)

    # Always use real PdfProcessorService since we have default credentials
    Rails.logger.info "ProcessPdfJob: Using PdfProcessorService with Google Vision API"
    processor = PdfProcessorService.new(ocr_job)

    result = processor.process
    Rails.logger.info "ProcessPdfJob: process result = #{result.inspect}"

    if result
      # Store extracted texts in cache or database
      extracted_text = processor.extracted_text
      Rails.logger.info "ProcessPdfJob: Storing #{extracted_text.keys.size} pages of text in cache"
      Rails.logger.info "ProcessPdfJob: Text samples: #{extracted_text.inspect[0..200]}..."
      Rails.cache.write("ocr_texts_#{ocr_job.id}", extracted_text, expires_in: 24.hours)
    end
  rescue ActiveRecord::RecordNotFound
    Rails.logger.error "OcrJob #{ocr_job_id} not found"
  rescue => e
    Rails.logger.error "ProcessPdfJob failed for OcrJob #{ocr_job_id}: #{e.message}"
    Rails.logger.error e.backtrace.join("\n")
    ocr_job&.mark_as_failed!(e.message)
  end
end
