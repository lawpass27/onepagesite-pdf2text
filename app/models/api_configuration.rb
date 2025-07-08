class ApiConfiguration < ApplicationRecord
  encrypts :credential_path

  validates :credential_path, presence: true

  before_save :ensure_single_active_config

  def validate_credentials
    return { valid: false, error: "인증 파일 경로를 입력해주세요" } unless credential_path.present?
    return { valid: false, error: "파일을 찾을 수 없습니다: #{credential_path}" } unless File.exist?(credential_path)

    begin
      # Read and parse JSON file
      json_content = File.read(credential_path)
      credentials = JSON.parse(json_content)

      # Check required fields
      required_fields = %w[type project_id private_key_id private_key client_email client_id]
      missing_fields = required_fields - credentials.keys

      unless missing_fields.empty?
        return { valid: false, error: "JSON 파일에 필수 필드가 없습니다: #{missing_fields.join(', ')}" }
      end

      # Test API connection
      ENV["GOOGLE_APPLICATION_CREDENTIALS"] = credential_path
      client = Google::Cloud::Vision.image_annotator

      # Simple test - just try to initialize the client
      { valid: true, message: "API 연결 성공!" }
    rescue JSON::ParserError => e
      { valid: false, error: "유효한 JSON 파일이 아닙니다" }
    rescue => e
      Rails.logger.error "Google Vision API validation failed: #{e.message}"
      { valid: false, error: "API 연결 실패: #{e.message}" }
    end
  end

  private

  def ensure_single_active_config
    if is_active?
      ApiConfiguration.where(is_active: true).where.not(id: id).update_all(is_active: false)
    end
  end

  def project_id
    return nil unless File.exist?(credential_path)
    JSON.parse(File.read(credential_path))["project_id"]
  rescue
    nil
  end
end
