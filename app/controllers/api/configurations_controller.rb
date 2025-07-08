class Api::ConfigurationsController < ApplicationController
  skip_before_action :verify_authenticity_token

  def create
    @configuration = ApiConfiguration.find_or_initialize_by(id: params[:id])
    @configuration.assign_attributes(configuration_params)
    @configuration.is_active = true

    if @configuration.save
      render json: {
        success: true,
        message: I18n.t("config.success"),
        id: @configuration.id
      }
    else
      render json: {
        success: false,
        errors: @configuration.errors.full_messages
      }, status: :unprocessable_entity
    end
  rescue => e
    Rails.logger.error "Configuration save failed: #{e.message}"
    Rails.logger.error e.backtrace.join("\n")
    render json: {
      success: false,
      message: "설정 저장 중 오류가 발생했습니다: #{e.message}"
    }, status: :internal_server_error
  end

  def validate
    @configuration = ApiConfiguration.find(params[:id])

    result = @configuration.validate_credentials

    if result[:valid]
      @configuration.update!(last_validated_at: Time.current)
      render json: {
        success: true,
        message: result[:message] || I18n.t("config.success")
      }
    else
      render json: {
        success: false,
        message: result[:error] || I18n.t("config.error", message: "Invalid credentials or API connection failed")
      }
    end
  rescue ActiveRecord::RecordNotFound
    render json: {
      success: false,
      message: "Configuration not found"
    }, status: :not_found
  rescue => e
    Rails.logger.error "Validation failed: #{e.message}"
    Rails.logger.error e.backtrace.join("\n")
    render json: {
      success: false,
      message: "검증 중 오류가 발생했습니다: #{e.message}"
    }, status: :internal_server_error
  end

  private

  def configuration_params
    params.require(:configuration).permit(:credential_path)
  end
end
