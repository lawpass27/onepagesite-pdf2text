require "test_helper"

class Api::ConfigurationsControllerTest < ActionDispatch::IntegrationTest
  test "should get create" do
    get api_configurations_create_url
    assert_response :success
  end

  test "should get validate" do
    get api_configurations_validate_url
    assert_response :success
  end
end
