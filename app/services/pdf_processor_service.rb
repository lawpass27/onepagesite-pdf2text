require "mini_magick"

class PdfProcessorService
  attr_reader :ocr_job, :errors

  def initialize(ocr_job)
    @ocr_job = ocr_job
    @errors = []
    @extracted_texts = {}
  end

  def process
    return false unless validate_prerequisites

    @ocr_job.mark_as_processing!

    begin
      pdf_path = ActiveStorage::Blob.service.path_for(@ocr_job.pdf_file.blob.key)
      pdf = PDF::Reader.new(pdf_path)
      @ocr_job.update!(total_pages: pdf.page_count)

      pdf.page_count.times do |page_index|
        process_page(pdf_path, page_index)
        @ocr_job.increment_processed_pages!
      end

      @ocr_job.mark_as_completed!
      @extracted_texts
    rescue => e
      error_message = "PDF processing failed: #{e.message}"
      @errors << error_message
      @ocr_job.mark_as_failed!(error_message)
      false
    end
  end

  def extracted_text
    @extracted_texts
  end

  private

  def validate_prerequisites
    unless @ocr_job.pdf_file.attached?
      @errors << "No PDF file attached"
      return false
    end

    vision_service = GoogleVisionService.new
    unless vision_service.valid?
      Rails.logger.error "GoogleVisionService validation failed: #{vision_service.errors}"
      @errors.concat(vision_service.errors)
      return false
    end

    Rails.logger.info "GoogleVisionService validation passed"
    true
  end

  def process_page(pdf_path, page_index)
    image_path = convert_pdf_page_to_image(pdf_path, page_index)
    Rails.logger.info "Processing page #{page_index + 1}, image path: #{image_path}"

    vision_service = GoogleVisionService.new
    Rails.logger.info "Vision service valid: #{vision_service.valid?}"
    Rails.logger.info "Vision service errors: #{vision_service.errors}" unless vision_service.valid?

    text = vision_service.process_image(image_path)
    Rails.logger.info "Extracted text for page #{page_index + 1}: #{text.present? ? "#{text.length} characters" : "EMPTY"}"

    @extracted_texts[page_index + 1] = text || ""

    File.delete(image_path) if File.exist?(image_path)
  rescue => e
    Rails.logger.error "Failed to process page #{page_index + 1}: #{e.message}"
    Rails.logger.error e.backtrace.join("\n")
    @errors << "Failed to process page #{page_index + 1}: #{e.message}"
    @extracted_texts[page_index + 1] = ""
  end

  def convert_pdf_page_to_image(pdf_path, page_index)
    output_path = Rails.root.join("tmp", "page_#{@ocr_job.id}_#{page_index}.jpg")

    # Create the tmp directory if it doesn't exist
    FileUtils.mkdir_p(Rails.root.join("tmp"))

    # Use ImageMagick directly with proper settings for PDF conversion
    command = [
      "magick",
      "-density", "300",
      "#{pdf_path}[#{page_index}]",
      "-background", "white",
      "-alpha", "remove",
      "-quality", "100",
      output_path.to_s
    ]

    Rails.logger.info "Executing command: #{command.join(' ')}"

    result = system(*command)
    unless result
      raise "Failed to convert PDF page #{page_index + 1} to image"
    end

    unless File.exist?(output_path)
      raise "Image file not created at #{output_path}"
    end

    Rails.logger.info "Successfully created image at #{output_path} (size: #{File.size(output_path)} bytes)"

    output_path.to_s
  end
end

