require "test_helper"

class Api::OcrJobsControllerTest < ActionDispatch::IntegrationTest
  test "should get create" do
    get api_ocr_jobs_create_url
    assert_response :success
  end

  test "should get status" do
    get api_ocr_jobs_status_url
    assert_response :success
  end
end
