class ChangeCredentialPathToTextInApiConfigurations < ActiveRecord::Migration[8.0]
  def change
    change_column :api_configurations, :credential_path, :text
  end
end
