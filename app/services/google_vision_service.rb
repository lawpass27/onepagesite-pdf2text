class GoogleVisionService
  attr_reader :errors

  DEFAULT_CREDENTIAL_PATH = ENV['GOOGLE_VISION_CREDENTIALS_PATH'] || Rails.root.join('ocr-436111-a9d8115b40c5.json').to_s

  def initialize
    @errors = []
    @config = ApiConfiguration.find_by(is_active: true)

    # Use default credential path if no config exists
    credential_path = @config&.credential_path || DEFAULT_CREDENTIAL_PATH

    unless File.exist?(credential_path)
      @errors << "Credential file not found at: #{credential_path}"
      return
    end

    Rails.logger.info "Using Google Vision API credentials from: #{credential_path}"

    begin
      # Set environment variable for Google credentials
      ENV['GOOGLE_APPLICATION_CREDENTIALS'] = credential_path
      
      # Create client using default credentials
      @client = Google::Cloud::Vision.image_annotator
    rescue => e
      @errors << "Failed to initialize Google Vision client: #{e.message}"
      Rails.logger.error "GoogleVisionService initialization error: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
    end
  end

  def process_image(image_path)
    Rails.logger.info "GoogleVisionService.process_image called with: #{image_path}"
    return nil unless valid?

    unless File.exist?(image_path)
      Rails.logger.error "Image file not found: #{image_path}"
      @errors << "Image file not found: #{image_path}"
      return nil
    end

    Rails.logger.info "Calling Google Vision API..."

    # Google Cloud Vision gem expects image path as first argument
    response = @client.document_text_detection(
      image: image_path,
      image_context: {
        language_hints: [ "ko" ]
      }
    )

    # The response structure has changed in newer versions
    # Extract text from the full text annotation
    text = response.responses.first.full_text_annotation&.text
    Rails.logger.info "Google Vision API response: #{text.present? ? "Got #{text.length} characters" : "No text found"}"

    # Preprocess the extracted text
    preprocess_text(text)
  rescue => e
    Rails.logger.error "OCR processing failed: #{e.message}"
    Rails.logger.error e.backtrace.join("\n")
    @errors << "OCR processing failed: #{e.message}"
    nil
  end

  def valid?
    @errors.empty? && @client.present?
  end

  private

  def preprocess_text(text)
    return nil if text.nil?

    # 1. 불필요한 공백 제거
    # 연속된 공백을 하나로
    text = text.gsub(/[ \t]+/, ' ')
    
    # 2. 줄바꿈 처리
    # 문장 중간의 불필요한 줄바꿈 제거 (한글 문장이 이어지는 경우)
    text = text.gsub(/([가-힣,])\n([가-힣])/, '\1 \2')
    
    # 3. 연속된 줄바꿈을 최대 2개로 제한
    text = text.gsub(/\n{3,}/, "\n\n")
    
    # 4. 특수문자 정리
    # 이상한 유니코드 문자 제거
    text = text.gsub(/[\u200B-\u200D\uFEFF]/, '')
    
    # 5. 문단 정리
    # 숫자나 특수문자로 시작하는 줄은 새 문단으로 유지
    text = text.gsub(/\n([0-9\-\[\(\{【〔])/, "\n\n\\1")
    
    # 6. 마침표, 물음표, 느낌표 뒤에 공백 확보
    text = text.gsub(/([.!?])([가-힣A-Za-z])/, '\1 \2')
    
    # 7. 괄호 앞뒤 공백 정리
    text = text.gsub(/\s*([(\[{])\s*/, ' \1')
    text = text.gsub(/\s*([)\]}])\s*/, '\1 ')
    
    # 8. 앞뒤 공백 제거
    text = text.strip
    
    # 9. 각 줄의 앞뒤 공백 제거
    text = text.split("\n").map(&:strip).join("\n")
    
    text
  end
end

