class OcrJob < ApplicationRecord
  has_one_attached :pdf_file

  STATUSES = %w[pending processing completed failed].freeze

  validates :session_id, presence: true
  validates :filename, presence: true
  validates :status, inclusion: { in: STATUSES }

  scope :active, -> { where(status: %w[pending processing]) }
  scope :completed, -> { where(status: "completed") }
  scope :failed, -> { where(status: "failed") }

  def progress_percentage
    return 0 unless total_pages&.positive?
    ((processed_pages.to_f / total_pages) * 100).round
  end

  def mark_as_processing!
    update!(status: "processing")
  end

  def mark_as_completed!
    update!(status: "completed", completed_at: Time.current)
  end

  def mark_as_failed!(error_message)
    update!(status: "failed", error_message: error_message, completed_at: Time.current)
  end

  def increment_processed_pages!
    increment!(:processed_pages)
  end
end
