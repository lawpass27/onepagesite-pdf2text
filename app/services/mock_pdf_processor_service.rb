# Mock service for development/testing without Google Vision API
class MockPdfProcessorService
  attr_reader :ocr_job, :errors

  def initialize(ocr_job)
    @ocr_job = ocr_job
    @errors = []
    @extracted_texts = {}
  end

  def process
    @ocr_job.mark_as_processing!

    begin
      # Simulate PDF processing
      total_pages = 3 # Mock 3 pages
      @ocr_job.update!(total_pages: total_pages)

      total_pages.times do |page_index|
        sleep(1) # Simulate processing time

        @extracted_texts[page_index + 1] = generate_mock_text(page_index + 1)
        @ocr_job.increment_processed_pages!
      end

      @ocr_job.mark_as_completed!
      @extracted_texts
    rescue => e
      error_message = "Mock processing failed: #{e.message}"
      @errors << error_message
      @ocr_job.mark_as_failed!(error_message)
      false
    end
  end

  def extracted_text
    @extracted_texts
  end

  private

  def generate_mock_text(page_number)
    <<~TEXT
      [페이지 #{page_number} - 전자소송 문서]

      사건번호: 2024가합12345

      원고: 홍길동
      주소: 서울특별시 강남구 테헤란로 123

      피고: 주식회사 ABC
      주소: 서울특별시 서초구 서초대로 456

      소장

      청구취지
      1. 피고는 원고에게 금 50,000,000원 및 이에 대하여 이 사건 소장 부본 송달 다음날부터 다 갚는 날까지 연 12%의 비율로 계산한 돈을 지급하라.
      2. 소송비용은 피고가 부담한다.
      라는 판결을 구합니다.

      청구원인
      1. 원고는 2023년 1월 1일 피고와 물품공급계약을 체결하였습니다.
      2. 원고는 계약에 따라 2023년 2월 1일 피고에게 물품을 공급하였습니다.
      3. 그러나 피고는 현재까지 대금을 지급하지 않고 있습니다.

      입증방법
      1. 갑 제1호증: 물품공급계약서
      2. 갑 제2호증: 세금계산서
      3. 갑 제3호증: 납품확인서

      첨부서류
      1. 위 입증방법
      2. 소장부본 1통
      3. 송달료납부서 1통

      2024년 3월 15일

      원고 홍길동 (인)

      서울중앙지방법원 귀중
    TEXT
  end
end
